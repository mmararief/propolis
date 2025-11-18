<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'customer_id',
        'customer_name',
        'customer_email',
        'subtotal',
        'ongkos_kirim',
        'total',
        'courier',
        'courier_service',
        'destination_province_id',
        'destination_province_name',
        'destination_city_id',
        'destination_city_name',
        'destination_district_id',
        'destination_district_name',
        'destination_subdistrict_id',
        'destination_subdistrict_name',
        'destination_postal_code',
        'address',
        'phone',
        'status',
        'channel',
        'external_order_id',
        'metode_pembayaran',
        'bukti_pembayaran',
        'resi',
        'tracking_status',
        'tracking_payload',
        'tracking_last_checked_at',
        'tracking_completed_at',
        'reservation_expires_at',
        'ordered_at',
        'gross_revenue',
        'net_revenue',
        'discount',
    ];

    protected $appends = [
        'bukti_pembayaran_url',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'ongkos_kirim' => 'decimal:2',
        'total' => 'decimal:2',
        'reservation_expires_at' => 'datetime',
        'ordered_at' => 'datetime',
        'gross_revenue' => 'decimal:2',
        'net_revenue' => 'decimal:2',
        'discount' => 'decimal:2',
        'tracking_payload' => 'array',
        'tracking_last_checked_at' => 'datetime',
        'tracking_completed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class)->withDefault();
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function scopeNeedReservationRelease($query)
    {
        return $query->whereIn('status', ['belum_dibayar', 'menunggu_konfirmasi'])
            ->whereNotNull('reservation_expires_at')
            ->where('reservation_expires_at', '<', now());
    }

    public function getBuktiPembayaranUrlAttribute(): ?string
    {
        if (! $this->bukti_pembayaran) {
            return null;
        }

        /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
        $disk = Storage::disk('public');

        return $disk->url($this->bukti_pembayaran);
    }
}
