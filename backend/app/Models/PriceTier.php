<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PriceTier extends Model
{
    use HasFactory;

    protected $table = 'harga_tingkat';

    protected $fillable = [
        'product_id',
        'min_jumlah',
        'max_jumlah',
        'harga_total',
        'label',
    ];

    protected $casts = [
        'harga_total' => 'decimal:2',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Scope to get only global price tiers (where product_id is NULL)
     */
    public function scopeGlobal($query)
    {
        return $query->whereNull('product_id');
    }

    /**
     * Scope to get only product-specific price tiers
     */
    public function scopeForProduct($query, $productId)
    {
        return $query->where('product_id', $productId);
    }

    /**
     * Check if this is a global tier
     */
    public function isGlobal(): bool
    {
        return is_null($this->product_id);
    }
}
