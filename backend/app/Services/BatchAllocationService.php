<?php

namespace App\Services;

use App\Exceptions\InsufficientStockException;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class BatchAllocationService
{
    public function reserveForOrder(Order $order, int $ttlMinutes = 30): Order
    {
        return DB::transaction(function () use ($order, $ttlMinutes) {
            $order->loadMissing(['items.product', 'items.productCodes']);

            foreach ($order->items as $item) {
                $this->reserveItemStock($item);
            }

            $order->reservation_expires_at = now()->addMinutes($ttlMinutes);
            $order->save();

            return $order->fresh(['items.product', 'items.productCodes']);
        });
    }

    public function allocate(int $orderId): Order
    {
        $order = Order::with(['items.product'])->findOrFail($orderId);

        DB::transaction(function () use ($order) {
            foreach ($order->items as $item) {
                $this->allocateOrderItem($item);
            }

            $order->reservation_expires_at = null;
            $order->save();
        });

        return $order->fresh(['items.product', 'items.productCodes']);
    }

    public function allocateOrderItem(OrderItem $orderItem): void
    {
        DB::transaction(function () use ($orderItem) {
            $orderItem->loadMissing(['product']);

            if ($orderItem->allocated) {
                return;
            }

            $product = Product::where('id', $orderItem->product_id)
                ->lockForUpdate()
                ->firstOrFail();

            // Hitung stok yang tersedia (stok total - stok yang sudah di-reserve)
            $available = $product->stok - $product->stok_reserved;

            // Validasi: stok tersedia harus cukup
            // Untuk order yang sudah di-reserve, stok_reserved akan dikurangi setelah allocate
            // Untuk order yang belum di-reserve (order manual langsung allocate), kita cek stok tersedia
            if ($available < $orderItem->jumlah) {
                throw InsufficientStockException::forProduct($orderItem->product_id);
            }

            // Pastikan stok total juga cukup (safety check)
            if ($product->stok < $orderItem->jumlah) {
                throw InsufficientStockException::forProduct($orderItem->product_id);
            }

            $product->stok -= $orderItem->jumlah;
            $product->stok_reserved = max(0, $product->stok_reserved - $orderItem->jumlah);
            $product->save();

            $orderItem->allocated = true;
            $orderItem->save();
        });
    }

    public function releaseReservation(Order $order): void
    {
        DB::transaction(function () use ($order) {
            $order->loadMissing('items.product');

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
            $order->loadMissing('items.product');

            foreach ($order->items as $item) {
                $this->restoreAllocatedStock($item);
            }

            $order->reservation_expires_at = null;
            $order->save();
        });
    }

    private function reserveItemStock(OrderItem $orderItem): void
    {
        $orderItem->loadMissing('product');

        $product = Product::where('id', $orderItem->product_id)
            ->lockForUpdate()
            ->firstOrFail();

        $available = $product->stok - $product->stok_reserved;

        if ($available < $orderItem->jumlah) {
            throw InsufficientStockException::forProduct($orderItem->product_id);
        }

        $product->stok_reserved += $orderItem->jumlah;
        $product->save();
    }

    private function releaseReservedStock(OrderItem $orderItem): void
    {
        $product = Product::where('id', $orderItem->product_id)
            ->lockForUpdate()
            ->firstOrFail();

        $product->stok_reserved = max(0, $product->stok_reserved - $orderItem->jumlah);
        $product->save();
    }

    private function restoreAllocatedStock(OrderItem $orderItem): void
    {
        $product = Product::where('id', $orderItem->product_id)
            ->lockForUpdate()
            ->firstOrFail();

        if ($orderItem->allocated) {
            $product->stok += $orderItem->jumlah;
        } else {
            $product->stok_reserved = max(0, $product->stok_reserved - $orderItem->jumlah);
        }

        $product->save();

        $orderItem->allocated = false;
        $orderItem->save();
    }
}
