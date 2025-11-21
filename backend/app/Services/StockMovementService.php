<?php

namespace App\Services;

use App\Models\Product;
use App\Models\StockMovement;

class StockMovementService
{
    /**
     * Catat perubahan stok produk.
     *
     * @param  array<string, mixed>  $meta
     */
    public static function record(Product $product, int $changeQty, string $type, array $meta = []): ?StockMovement
    {
        if ($changeQty === 0) {
            return null;
        }

        return StockMovement::create([
            'product_id' => $product->id,
            'order_id' => $meta['order_id'] ?? null,
            'user_id' => $meta['user_id'] ?? ($meta['actor_id'] ?? auth()->id()),
            'change_qty' => $changeQty,
            'type' => $type,
            'reference_type' => $meta['reference_type'] ?? null,
            'reference_id' => $meta['reference_id'] ?? null,
            'note' => $meta['note'] ?? null,
        ]);
    }
}
