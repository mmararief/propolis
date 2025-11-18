<?php

namespace App\Services;

use App\Exceptions\InsufficientStockException;
use App\Models\BatchStockMovement;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderItemBatch;
use App\Models\ProductBatch;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class BatchAllocationService
{
    public function reserveForOrder(Order $order, int $ttlMinutes = 30): Order
    {
        return DB::transaction(function () use ($order, $ttlMinutes) {
            $order->loadMissing(['items.product', 'items.batches']);

            foreach ($order->items as $item) {
                $this->reserveItemBatches($item, $order->id);
            }

            $order->reservation_expires_at = now()->addMinutes($ttlMinutes);
            $order->save();

            return $order->fresh(['items.batches.batch']);
        });
    }

    public function allocate(int $orderId): Order
    {
        $order = Order::with(['items.batches'])->findOrFail($orderId);

        DB::transaction(function () use ($order) {
            foreach ($order->items as $item) {
                $this->allocateOrderItem($item);
            }

            $order->reservation_expires_at = null;
            $order->save();
        });

        return $order->fresh(['items.batches.batch']);
    }

    public function allocateOrderItem(OrderItem $orderItem): void
    {
        DB::transaction(function () use ($orderItem) {
            $orderItem = $orderItem->fresh(['order', 'product', 'batches']);

            if ($orderItem->allocated) {
                return;
            }

            if ($orderItem->batches->isEmpty()) {
                $this->reserveItemBatches($orderItem, $orderItem->order_id);
                $orderItem->load('batches');
            }

            if ($orderItem->batches->isEmpty()) {
                throw InsufficientStockException::forProduct($orderItem->product_id);
            }

            $batchIds = $orderItem->batches->pluck('batch_id')->unique();
            $lockedBatches = ProductBatch::whereIn('id', $batchIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            foreach ($orderItem->batches as $allocation) {
                /** @var ProductBatch $batch */
                $batch = $lockedBatches->get($allocation->batch_id);

                if (! $batch) {
                    throw InsufficientStockException::forProduct($orderItem->product_id);
                }

                if ($batch->qty_remaining < $allocation->qty) {
                    throw InsufficientStockException::forProduct($orderItem->product_id);
                }

                if ($batch->reserved_qty < $allocation->qty) {
                    throw InsufficientStockException::forProduct($orderItem->product_id);
                }

                $batch->reserved_qty -= $allocation->qty;
                $batch->qty_remaining -= $allocation->qty;
                $batch->save();

                $this->logMovement($batch->id, -1 * $allocation->qty, 'sold', $orderItem->order_id);
            }

            $orderItem->allocated = true;
            $orderItem->save();

            $orderItem->product?->refreshStockCache();
        });
    }

    public function releaseReservation(Order $order): void
    {
        DB::transaction(function () use ($order) {
            $order->loadMissing('items.batches');

            foreach ($order->items as $item) {
                $this->releaseItemReservation($item, true);
            }

            $order->reservation_expires_at = null;
            $order->save();
        });
    }

    public function releaseAllocation(Order $order): void
    {
        DB::transaction(function () use ($order) {
            $order->loadMissing('items.batches');

            foreach ($order->items as $item) {
                $this->releaseItemAllocation($item, true);
            }

            $order->reservation_expires_at = null;
            $order->save();
        });
    }

    private function reserveItemBatches(OrderItem $orderItem, int $referenceOrderId): void
    {
        $orderItem = $orderItem->fresh(['batches', 'product']);
        $this->releaseItemReservation($orderItem, true);

        $needed = $orderItem->jumlah;

        $batches = $this->availableBatchQuery($orderItem->product_id)
            ->lockForUpdate()
            ->get();

        foreach ($batches as $batch) {
            $available = max(0, $batch->qty_remaining - $batch->reserved_qty);

            if ($available <= 0) {
                continue;
            }

            $take = min($available, $needed);
            $batch->reserved_qty += $take;
            $batch->save();

            OrderItemBatch::create([
                'order_item_id' => $orderItem->id,
                'batch_id' => $batch->id,
                'qty' => $take,
            ]);

            $this->logMovement($batch->id, -1 * $take, 'reserve', $referenceOrderId);

            $needed -= $take;

            if ($needed <= 0) {
                break;
            }
        }

        if ($needed > 0) {
            throw InsufficientStockException::forProduct($orderItem->product_id);
        }
    }

    private function releaseItemReservation(OrderItem $orderItem, bool $deleteRows): void
    {
        $orderItem = $orderItem->fresh(['batches']);
        if ($orderItem->batches->isEmpty()) {
            return;
        }

        $batchIds = $orderItem->batches->pluck('batch_id')->unique();
        $batches = ProductBatch::whereIn('id', $batchIds)
            ->lockForUpdate()
            ->get()
            ->keyBy('id');

        foreach ($orderItem->batches as $allocation) {
            $batch = $batches->get($allocation->batch_id);

            if (! $batch) {
                continue;
            }

            $batch->reserved_qty = max(0, $batch->reserved_qty - $allocation->qty);
            $batch->save();

            $this->logMovement($batch->id, $allocation->qty, 'release', $orderItem->order_id);
        }

        if ($deleteRows) {
            OrderItemBatch::where('order_item_id', $orderItem->id)->delete();
        }
    }

    private function releaseItemAllocation(OrderItem $orderItem, bool $deleteRows): void
    {
        $orderItem = $orderItem->fresh(['batches']);
        if ($orderItem->batches->isEmpty()) {
            return;
        }

        $batchIds = $orderItem->batches->pluck('batch_id')->unique();
        $batches = ProductBatch::whereIn('id', $batchIds)
            ->lockForUpdate()
            ->get()
            ->keyBy('id');

        foreach ($orderItem->batches as $allocation) {
            $batch = $batches->get($allocation->batch_id);

            if (! $batch) {
                continue;
            }

            // Jika sudah dialokasikan, kembalikan qty_remaining juga
            if ($orderItem->allocated) {
                $batch->qty_remaining += $allocation->qty;
            }

            // Kembalikan reserved_qty jika masih ada
            $batch->reserved_qty = max(0, $batch->reserved_qty - $allocation->qty);
            $batch->save();

            $this->logMovement($batch->id, $allocation->qty, 'cancel', $orderItem->order_id);
        }

        if ($deleteRows) {
            OrderItemBatch::where('order_item_id', $orderItem->id)->delete();
            $orderItem->allocated = false;
            $orderItem->save();
        }
    }

    private function logMovement(int $batchId, int $qty, string $reason, int $orderId): void
    {
        BatchStockMovement::create([
            'batch_id' => $batchId,
            'change_qty' => $qty,
            'reason' => $reason,
            'reference_table' => 'orders',
            'reference_id' => $orderId,
            'note' => null,
        ]);
    }

    private function availableBatchQuery(int $productId)
    {
        return ProductBatch::where('product_id', $productId)
            ->whereNull('deleted_at')
            ->whereRaw('(qty_remaining - reserved_qty) > 0')
            ->orderByRaw('CASE WHEN expiry_date IS NULL THEN 1 ELSE 0 END')
            ->orderBy('expiry_date')
            ->orderBy('created_at');
    }

    public function allocateSpecificBatches(OrderItem $orderItem, array $batchAllocations, bool $withinTransaction = false): void
    {
        $callback = function () use ($orderItem, $batchAllocations) {
            if (empty($batchAllocations)) {
                throw new InvalidArgumentException('Batch allocation tidak boleh kosong');
            }

            $orderItem = $orderItem->fresh(['product', 'batches']);
            $this->releaseItemReservation($orderItem, true);

            $totalQty = 0;
            $batchIds = collect($batchAllocations)->pluck('batch_id')->all();
            $batches = ProductBatch::whereIn('id', $batchIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            foreach ($batchAllocations as $allocation) {
                $batchId = (int) ($allocation['batch_id'] ?? 0);
                $qty = (int) ($allocation['qty'] ?? 0);

                if ($batchId <= 0 || $qty <= 0) {
                    throw new InvalidArgumentException('Batch ID dan qty harus valid');
                }

                /** @var ProductBatch|null $batch */
                $batch = $batches->get($batchId);

                if (! $batch || $batch->product_id !== $orderItem->product_id) {
                    throw new InvalidArgumentException("Batch {$batchId} tidak sesuai dengan produk");
                }

                $available = max(0, $batch->qty_remaining - $batch->reserved_qty);
                if ($available < $qty) {
                    throw InsufficientStockException::forProduct($orderItem->product_id);
                }

                OrderItemBatch::create([
                    'order_item_id' => $orderItem->id,
                    'batch_id' => $batch->id,
                    'qty' => $qty,
                ]);

                $batch->qty_remaining -= $qty;
                $batch->save();

                $this->logMovement($batch->id, -1 * $qty, 'sold', $orderItem->order_id);
                $totalQty += $qty;
            }

            if ($totalQty !== $orderItem->jumlah) {
                throw new InvalidArgumentException('Total qty batch tidak sama dengan jumlah item');
            }

            $orderItem->allocated = true;
            $orderItem->save();

            $orderItem->product?->refreshStockCache();
        };

        if ($withinTransaction) {
            $callback();
        } else {
            DB::transaction($callback);
        }
    }
}
