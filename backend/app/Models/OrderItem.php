<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'harga_satuan',
        'jumlah',
        'total_harga',
        'catatan',
        'allocated',
        'harga_tingkat_id',
    ];

    protected $casts = [
        'harga_satuan' => 'decimal:2',
        'total_harga' => 'decimal:2',
        'allocated' => 'boolean',
    ];

    protected $appends = [
        'batches',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function priceTier()
    {
        return $this->belongsTo(PriceTier::class, 'harga_tingkat_id');
    }

    public function productCodes(): HasMany
    {
        return $this->hasMany(OrderItemProductCode::class)->orderBy('sequence');
    }

    public function getBatchesAttribute(): array
    {
        return [];
    }
}
