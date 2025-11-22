<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'kategori_id',
        'sku',
        'nama_produk',
        'tipe',
        'deskripsi',
        'harga_ecer',
        'stok',
        'stok_reserved',
        'gambar',
        'berat',
        'status',
    ];

    protected $casts = [
        'harga_ecer' => 'decimal:2',
        'gambar' => 'array',
    ];

    protected $appends = [
        'stok_available',
        'batches',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class, 'kategori_id');
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function activeVariants()
    {
        return $this->hasMany(ProductVariant::class)->where('status', 'aktif');
    }

    /**
     * Packs langsung dari produk (tanpa variant)
     */
    public function packs()
    {
        return $this->hasMany(ProductVariantPack::class, 'product_id')->whereNull('product_variant_id');
    }

    public function activePacks()
    {
        return $this->hasMany(ProductVariantPack::class, 'product_id')
            ->whereNull('product_variant_id')
            ->where('status', 'aktif');
    }

    /**
     * Get product-specific price tiers (deprecated - now using global price tiers)
     * This method is kept for backward compatibility but will return empty for products without specific tiers.
     * Use PriceTier::global() or Product::getAllPriceTiers() instead.
     */
    public function priceTiers()
    {
        return $this->hasMany(PriceTier::class);
    }

    /**
     * Get all applicable price tiers for this product (global tiers only)
     * All products now use the same global price tiers.
     */
    public function getAllPriceTiers()
    {
        return PriceTier::global()->orderBy('min_jumlah')->get();
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'aktif');
    }

    public function getStokAvailableAttribute(): int
    {
        // Cek apakah produk punya variants
        // Jika variants sudah di-load, cek apakah tidak kosong
        if ($this->relationLoaded('variants')) {
            // Jika variants kosong, cek apakah ada direct packs
            if ($this->variants->isEmpty()) {
                // Jika ada direct packs, stok pack dihitung dari stok produk
                // Tapi stok produk tetap dikembalikan sebagai stok_available
                // (karena pack menggunakan stok produk, bukan stok pack sendiri)
                $stok = (int) ($this->attributes['stok'] ?? 0);
                $reserved = (int) ($this->attributes['stok_reserved'] ?? 0);
                return max(0, $stok - $reserved);
            }

            // Jika ada variants, hitung total stok dari semua variants
            return $this->variants->sum(function ($variant) {
                // Variant dengan packs: stok pack dihitung dari stok variant
                // Jadi gunakan stok variant langsung
                return max(0, ($variant->stok ?? 0) - ($variant->stok_reserved ?? 0));
            });
        }

        // Jika variants belum di-load, cek di database
        if ($this->variants()->exists()) {
            // Load variants dan hitung stok
            $this->load('variants');
            return $this->variants->sum(function ($variant) {
                return max(0, ($variant->stok ?? 0) - ($variant->stok_reserved ?? 0));
            });
        }

        // Jika tidak punya variants, gunakan stok produk langsung
        // (baik produk dengan direct packs maupun tanpa packs, stok dikelola di level produk)
        $stok = (int) ($this->attributes['stok'] ?? 0);
        $reserved = (int) ($this->attributes['stok_reserved'] ?? 0);

        return max(0, $stok - $reserved);
    }

    public function refreshStockCache(): void
    {
        $this->forceFill([
            'stok' => max(0, (int) $this->stok),
            'stok_reserved' => max(0, (int) $this->stok_reserved),
        ])->save();
    }

    public function getBatchesAttribute(): array
    {
        return [[
            'id' => $this->id,
            'product_id' => $this->id,
            'batch_number' => $this->sku,
            'qty_initial' => (int) $this->stok,
            'qty_remaining' => $this->stok_available,
            'reserved_qty' => (int) $this->stok_reserved,
            'expiry_date' => null,
            'purchase_price' => null,
        ]];
    }
}
