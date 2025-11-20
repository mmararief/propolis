<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItemProductCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_item_id',
        'kode_produk',
        'sequence',
    ];

    public function orderItem()
    {
        return $this->belongsTo(OrderItem::class);
    }
}
