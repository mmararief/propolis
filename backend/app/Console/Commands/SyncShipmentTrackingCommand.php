<?php

namespace App\Console\Commands;

use App\Jobs\SyncShipmentTrackingJob;
use App\Models\Order;
use Illuminate\Console\Command;

class SyncShipmentTrackingCommand extends Command
{
    protected $signature = 'tracking:sync {--limit= : Maximum orders to sync per run}';

    protected $description = 'Dispatch tracking sync jobs for orders that need shipment updates';

    public function handle(): int
    {
        $intervalHours = (int) config('services.tracking.refresh_interval_hours', 12);
        $limit = (int) ($this->option('limit') ?? config('services.tracking.sync_batch_limit', 50));

        $orders = Order::query()
            ->whereNotNull('resi')
            ->whereIn('status', ['dikirim', 'diproses'])
            ->where(function ($query) use ($intervalHours) {
                $query
                    ->whereNull('tracking_last_checked_at')
                    ->orWhere('tracking_last_checked_at', '<=', now()->subHours($intervalHours));
            })
            ->orderByRaw('COALESCE(tracking_last_checked_at, "1970-01-01") asc')
            ->limit($limit)
            ->get();

        if ($orders->isEmpty()) {
            $this->info('No orders need tracking refresh.');

            return self::SUCCESS;
        }

        foreach ($orders as $order) {
            SyncShipmentTrackingJob::dispatch($order->id);
        }

        $this->info(sprintf('Dispatched tracking sync for %d orders.', $orders->count()));

        return self::SUCCESS;
    }
}
