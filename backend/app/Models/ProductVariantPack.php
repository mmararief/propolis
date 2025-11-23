<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductVariantPack extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'product_id',
        'product_variant_id',
        'label',
        'pack_size',
        'sku_pack',
        'harga_pack',
        'stok',
        'stok_reserved',
        'status',
    ];

    protected $casts = [
        'harga_pack' => 'decimal:2',
    ];

    protected $appends = [
        'stok_available',
    ];

    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    public function product()
    {
        // Jika pack langsung dari produk (tanpa variant)
        if ($this->product_id) {
            return $this->belongsTo(Product::class, 'product_id');
        }

        // Jika pack dari variant
        return $this->variant?->product();
    }

    public function getStokAvailableAttribute(): int
    {
        // Jika pack langsung dari produk (tanpa variant), gunakan stok produk
        if ($this->product_id && !$this->product_variant_id) {
            $product = $this->product;
            if ($product) {
                $stok = (int) ($product->stok ?? 0);
                $reserved = (int) ($product->stok_reserved ?? 0);
                return max(0, $stok - $reserved);
            }
        }

        // Jika pack dari variant, gunakan stok variant (bukan stok pack sendiri)
        // Stok pack = berapa pack yang bisa dibuat dari stok variant
        if ($this->product_variant_id) {
            $variant = $this->variant;
            if ($variant) {
                $variantStok = (int) ($variant->stok ?? 0);
                $variantReserved = (int) ($variant->stok_reserved ?? 0);
                $availableVariantStok = max(0, $variantStok - $variantReserved);

                // Hitung berapa pack yang bisa dibuat dari stok variant
                $packSize = max(1, (int) $this->pack_size);
                return (int) floor($availableVariantStok / $packSize);
            }
        }

        return 0;
    }

    public function getEffectivePriceAttribute(): float
    {
        if ($this->harga_pack !== null) {
            return (float) $this->harga_pack;
        }

        // Jika pack langsung dari produk (tanpa variant)
        if ($this->product_id) {
            $productPrice = $this->product?->harga_ecer ?? 0;
            return (float) $productPrice * max(1, (int) $this->pack_size);
        }

        // Jika pack dari variant
        $variantPrice = $this->variant?->harga_ecer ?? $this->variant?->product?->harga_ecer ?? 0;
        return (float) $variantPrice * max(1, (int) $this->pack_size);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'aktif');
    }
}
