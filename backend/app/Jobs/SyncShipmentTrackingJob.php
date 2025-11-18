<?php

namespace App\Jobs;

use App\Models\Order;
use App\Services\Tracking\BinderByteTrackingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;

class SyncShipmentTrackingJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function __construct(private readonly int $orderId) {}

    public function handle(BinderByteTrackingService $trackingService): void
    {
        /** @var Order|null $order */
        $order = Order::find($this->orderId);

        if (! $order || empty($order->resi)) {
            return;
        }

        $payload = $trackingService->track($order->courier ?? 'jne', $order->resi);

        if (! $payload) {
            $order->tracking_last_checked_at = now();
            $order->save();

            return;
        }

        $status = strtoupper((string) Arr::get($payload, 'summary.status', ''));

        $order->fill([
            'tracking_status' => $status,
            'tracking_payload' => $payload,
            'tracking_last_checked_at' => now(),
        ]);

        if ($status === 'DELIVERED' && $order->status !== 'selesai') {
            $order->status = 'selesai';
            $order->tracking_completed_at = now();
        }

        $order->save();

        Log::info('Shipment tracking refreshed', [
            'order_id' => $order->id,
            'status' => $status,
        ]);
    }
}
