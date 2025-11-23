<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    use HasFactory;

    protected $table = 'keranjang';

    protected $fillable = [
        'user_id',
        'product_id',
        'product_variant_id',
        'product_variant_pack_id',
        'jumlah',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
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
