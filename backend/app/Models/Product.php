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
