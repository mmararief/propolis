<?php

namespace App\Services;

use App\Exceptions\InsufficientStockException;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ProductVariantPack;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use App\Services\StockMovementService;

class BatchAllocationService
{
    public function reserveForOrder(Order $order, int $ttlMinutes = 30): Order
    {
        return DB::transaction(function () use ($order, $ttlMinutes) {
            $order->loadMissing(['items.product', 'items.productVariant', 'items.productVariantPack', 'items.productCodes']);

            foreach ($order->items as $item) {
                $this->reserveItemStock($item);
            }

            $order->reservation_expires_at = now()->addMinutes($ttlMinutes);
            $order->save();

            return $order->fresh(['items.product', 'items.productVariant', 'items.productVariantPack', 'items.productCodes']);
        });
    }

    public function allocate(int $orderId): Order
    {
        $order = Order::with(['items.product', 'items.productVariant', 'items.productVariantPack'])->findOrFail($orderId);

        DB::transaction(function () use ($order) {
            foreach ($order->items as $item) {
                $this->allocateOrderItem($item);
            }

            $order->reservation_expires_at = null;
            $order->save();
        });

        return $order->fresh(['items.product', 'items.productVariant', 'items.productVariantPack', 'items.productCodes']);
    }

    public function allocateOrderItem(OrderItem $orderItem): void
    {
        DB::transaction(function () use ($orderItem) {
            $orderItem->loadMissing(['product', 'productVariant', 'productVariantPack']);

            if ($orderItem->allocated) {
                return;
            }

            $stockTarget = $this->resolveStockTarget($orderItem);

            $available = (int) $stockTarget->stok - (int) ($stockTarget->stok_reserved ?? 0);

            if ($available < $orderItem->jumlah || (int) $stockTarget->stok < $orderItem->jumlah) {
                throw InsufficientStockException::forProduct($orderItem->product_id);
            }

            $stockTarget->stok -= $orderItem->jumlah;
            $stockTarget->stok_reserved = max(0, (int) ($stockTarget->stok_reserved ?? 0) - $orderItem->jumlah);
            $stockTarget->save();

            $orderItem->allocated = true;
            $orderItem->save();

            StockMovementService::record(
                $orderItem->product,
                -1 * (int) $orderItem->jumlah,
                'order_allocation',
                $this->buildStockMovementMeta($orderItem, 'Alokasi stok untuk pesanan')
            );
        });
    }

    public function releaseReservation(Order $order): void
    {
        DB::transaction(function () use ($order) {
            $order->loadMissing(['items.productVariant', 'items.productVariantPack']);

            foreach ($order->items as $item) {
                $this->releaseReservedStock($item);
            }

            $order->reservation_expires_at = null;
            $order->save();
        });
    }

    public function releaseAllocation(Order $order): void
    {
        DB::transaction(function () use ($order) {
            $order->loadMissing(['items.productVariant', 'items.productVariantPack']);

            foreach ($order->items as $item) {
                $this->restoreAllocatedStock($item);
            }

            $order->reservation_expires_at = null;
            $order->save();
        });
    }

    private function reserveItemStock(OrderItem $orderItem): void
    {
        $stockTarget = $this->resolveStockTarget($orderItem);

        $available = (int) $stockTarget->stok - (int) ($stockTarget->stok_reserved ?? 0);

        if ($available < $orderItem->jumlah) {
            throw InsufficientStockException::forProduct($orderItem->product_id);
        }

        $stockTarget->stok_reserved = (int) ($stockTarget->stok_reserved ?? 0) + $orderItem->jumlah;
        $stockTarget->save();
    }

    private function releaseReservedStock(OrderItem $orderItem): void
    {
        $stockTarget = $this->resolveStockTarget($orderItem);

        $stockTarget->stok_reserved = max(0, (int) ($stockTarget->stok_reserved ?? 0) - $orderItem->jumlah);
        $stockTarget->save();
    }

    private function restoreAllocatedStock(OrderItem $orderItem): void
    {
        $stockTarget = $this->resolveStockTarget($orderItem);
        $orderItem->loadMissing('product');

        $wasAllocated = (bool) $orderItem->allocated;

        if ($wasAllocated) {
            $stockTarget->stok = (int) $stockTarget->stok + $orderItem->jumlah;
        } else {
            $stockTarget->stok_reserved = max(0, (int) ($stockTarget->stok_reserved ?? 0) - $orderItem->jumlah);
        }

        $stockTarget->save();

        $orderItem->allocated = false;
        $orderItem->save();

        if ($wasAllocated) {
            StockMovementService::record(
                $orderItem->product,
                (int) $orderItem->jumlah,
                'order_release',
                $this->buildStockMovementMeta($orderItem, 'Pengembalian stok dari pembatalan order')
            );
        }
    }

    private function resolveStockTarget(OrderItem $orderItem, bool $lock = true): Model
    {
        // Priority: 
        // - ProductVariantPack langsung dari product (tanpa variant) > Product
        // - ProductVariant (untuk pack dari variant, gunakan variant sebagai stock target) > Product
        if ($orderItem->product_variant_pack_id) {
            $pack = ProductVariantPack::findOrFail($orderItem->product_variant_pack_id);

            // Jika pack langsung dari product (tanpa variant), gunakan product sebagai stock target
            if ($pack->product_id && !$pack->product_variant_id) {
                $query = Product::where('id', $pack->product_id);
                if ($lock) {
                    $query->lockForUpdate();
                }
                return $query->firstOrFail();
            }

            // Jika pack dari variant, gunakan variant sebagai stock target (bukan pack sendiri)
            if ($pack->product_variant_id) {
                $query = ProductVariant::where('id', $pack->product_variant_id);
                if ($lock) {
                    $query->lockForUpdate();
                }
                return $query->firstOrFail();
            }
        }

        if ($orderItem->product_variant_id) {
            $query = ProductVariant::where('id', $orderItem->product_variant_id);
            if ($lock) {
                $query->lockForUpdate();
            }

            return $query->firstOrFail();
        }

        $query = Product::where('id', $orderItem->product_id);
        if ($lock) {
            $query->lockForUpdate();
        }

        return $query->firstOrFail();
    }

    private function buildStockMovementMeta(OrderItem $orderItem, string $note): array
    {
        $meta = [
            'order_id' => $orderItem->order_id,
            'reference_type' => 'order_items',
            'reference_id' => $orderItem->id,
            'note' => $note,
        ];

        if ($orderItem->product_variant_id) {
            $meta['product_variant_id'] = $orderItem->product_variant_id;
        }

        if ($orderItem->product_variant_pack_id) {
            $meta['product_variant_pack_id'] = $orderItem->product_variant_pack_id;
        }

        return $meta;
    }
}
