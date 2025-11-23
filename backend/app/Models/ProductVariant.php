<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductVariant extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'product_id',
        'tipe',
        'sku_variant',
        'stok',
        'stok_reserved',
        'harga_ecer',
        'gambar',
        'status',
    ];

    protected $casts = [
        'harga_ecer' => 'decimal:2',
        'gambar' => 'array',
    ];

    protected $appends = [
        'stok_available',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function packs()
    {
        return $this->hasMany(ProductVariantPack::class, 'product_variant_id');
    }

    public function activePacks()
    {
        return $this->hasMany(ProductVariantPack::class, 'product_variant_id')->where('status', 'aktif');
    }

    public function getStokAvailableAttribute(): int
    {
        // Stok variant adalah sumber stok (bukan dihitung dari packs)
        // Pack dari variant menghitung berapa pack yang bisa dibuat dari stok variant
        $stok = (int) ($this->attributes['stok'] ?? 0);
        $reserved = (int) ($this->attributes['stok_reserved'] ?? 0);

        return max(0, $stok - $reserved);
    }

    /**
     * Get effective price (use variant price if available, otherwise use product price)
     */
    public function getEffectivePrice(): float
    {
        if ($this->harga_ecer !== null) {
            return (float) $this->harga_ecer;
        }

        return (float) ($this->product->harga_ecer ?? 0);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'aktif');
    }
}
