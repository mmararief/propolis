<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'product_variant_id',
        'product_variant_pack_id',
        'order_id',
        'user_id',
        'change_qty',
        'type',
        'reference_type',
        'reference_id',
        'note',
    ];

    protected $casts = [
        'change_qty' => 'integer',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function productVariant()
    {
        return $this->belongsTo(ProductVariant::class);
    }

    public function productVariantPack()
    {
        return $this->belongsTo(ProductVariantPack::class);
    }
}
