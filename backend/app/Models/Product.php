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
        'gambar',
        'berat',
        'status',
    ];

    protected $casts = [
        'harga_ecer' => 'decimal:2',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class, 'kategori_id');
    }

    public function batches()
    {
        return $this->hasMany(ProductBatch::class);
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

    public function refreshStockCache(): void
    {
        $total = $this->batches()->sum('qty_remaining');
        $this->forceFill(['stok' => $total])->save();
    }
}
