<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderItemBatch;
use App\Models\ProductBatch;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;
use OpenApi\Annotations as OA;

class ReportController extends Controller
{
    /**
     * @OA\Get(
     *     path="/reports/batch-stock",
     *     tags={"Reports"},
     *     summary="Laporan stok per batch",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Berhasil memuat laporan")
     * )
     */
    public function batchStock()
    {
        $this->authorize('admin');

        $rows = ProductBatch::with('product')
            ->orderBy('product_id')
            ->orderBy('expiry_date')
            ->get()
            ->map(fn($batch) => [
                'product_id' => $batch->product_id,
                'nama_produk' => $batch->product?->nama_produk,
                'batch_number' => $batch->batch_number,
                'qty_initial' => $batch->qty_initial,
                'qty_remaining' => $batch->qty_remaining,
                'reserved_qty' => $batch->reserved_qty,
                'expiry_date' => optional($batch->expiry_date)->toDateString(),
            ]);

        return $this->success($rows);
    }

    /**
     * @OA\Get(
     *     path="/reports/batch-sales",
     *     tags={"Reports"},
     *     summary="Laporan penjualan per batch",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="from", in="query", description="Tanggal awal (Y-m-d)", @OA\Schema(type="string", format="date")),
     *     @OA\Parameter(name="to", in="query", description="Tanggal akhir (Y-m-d)", @OA\Schema(type="string", format="date")),
     *     @OA\Response(response=200, description="Berhasil memuat laporan")
     * )
     */
    public function batchSales(Request $request)
    {
        $this->authorize('admin');

        $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
        ]);

        $query = OrderItemBatch::query()
            ->select([
                'products.id as product_id',
                'products.nama_produk',
                'product_batches.batch_number',
                DB::raw('SUM(order_item_batches.qty) as qty_sold'),
            ])
            ->join('order_items', 'order_items.id', '=', 'order_item_batches.order_item_id')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->join('product_batches', 'product_batches.id', '=', 'order_item_batches.batch_id')
            ->whereIn('orders.status', ['diproses', 'dikirim', 'selesai'])
            ->groupBy('products.id', 'products.nama_produk', 'product_batches.batch_number');

        if ($request->filled('from')) {
            $query->whereDate('orders.created_at', '>=', $request->date('from'));
        }

        if ($request->filled('to')) {
            $query->whereDate('orders.created_at', '<=', $request->date('to'));
        }

        return $this->success($query->orderBy('products.nama_produk')->get());
    }

    public function summary(Request $request)
    {
        $this->authorize('admin');

        [$from, $to] = $this->resolveDateRange($request);

        $orderDateExpr = DB::raw('COALESCE(orders.ordered_at, orders.created_at)');
        $baseOrders = Order::query()
            ->whereBetween($orderDateExpr, [$from, $to]);

        $completedOrders = (clone $baseOrders)->whereIn('status', ['diproses', 'dikirim', 'selesai']);

        $summary = [
            'total_orders' => (clone $baseOrders)->count(),
            'completed_orders' => (clone $completedOrders)->count(),
            'pending_orders' => (clone $baseOrders)->where('status', 'menunggu_konfirmasi')->count(),
            'gross_revenue' => (clone $completedOrders)->sum(DB::raw('COALESCE(gross_revenue, subtotal)')),
            'net_revenue' => (clone $completedOrders)->sum(DB::raw('COALESCE(net_revenue, total)')),
        ];

        $topProducts = OrderItem::query()
            ->select([
                'products.id as product_id',
                'products.nama_produk',
                'products.sku',
                DB::raw('SUM(order_items.jumlah) as qty_sold'),
                DB::raw('SUM(order_items.total_harga) as revenue'),
            ])
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->whereIn('orders.status', ['diproses', 'dikirim', 'selesai'])
            ->whereBetween($orderDateExpr, [$from, $to])
            ->groupBy('products.id', 'products.nama_produk', 'products.sku')
            ->orderByDesc('qty_sold')
            ->limit(5)
            ->get();

        $lowStock = ProductBatch::query()
            ->with('product:id,nama_produk,sku')
            ->whereRaw('(qty_remaining - reserved_qty) <= ?', [20])
            ->orderByRaw('(qty_remaining - reserved_qty)')
            ->limit(5)
            ->get()
            ->map(fn($batch) => [
                'product_id' => $batch->product_id,
                'nama_produk' => $batch->product?->nama_produk,
                'sku' => $batch->product?->sku,
                'batch_number' => $batch->batch_number,
                'available' => max(0, ($batch->qty_remaining ?? 0) - ($batch->reserved_qty ?? 0)),
                'expiry_date' => optional($batch->expiry_date)->toDateString(),
            ]);

        return $this->success([
            'summary' => $summary,
            'top_products' => $topProducts,
            'low_stock_batches' => $lowStock,
        ]);
    }

    public function salesTrend(Request $request)
    {
        $this->authorize('admin');

        $interval = $request->input('interval', 'daily');
        [$from, $to] = $this->resolveDateRange($request);
        $dateExpr = DB::raw('DATE(COALESCE(orders.ordered_at, orders.created_at))');

        $query = Order::query()
            ->select([
                DB::raw($interval === 'weekly'
                    ? "DATE_FORMAT(COALESCE(ordered_at, created_at), '%x-%v') as label"
                    : "DATE(COALESCE(ordered_at, created_at)) as label"),
                DB::raw('SUM(total) as revenue'),
                DB::raw('COUNT(*) as orders_count'),
            ])
            ->whereBetween(DB::raw('COALESCE(ordered_at, created_at)'), [$from, $to])
            ->whereIn('status', ['diproses', 'dikirim', 'selesai'])
            ->groupBy('label')
            ->orderBy('label');

        return $this->success($query->get());
    }

    public function productSales(Request $request)
    {
        $this->authorize('admin');

        [$from, $to] = $this->resolveDateRange($request);
        $perPage = min($request->integer('per_page', 25), 100);
        $orderDateExpr = DB::raw('COALESCE(orders.ordered_at, orders.created_at)');

        $query = OrderItem::query()
            ->select([
                'products.id as product_id',
                'products.nama_produk',
                'products.sku',
                DB::raw('SUM(order_items.jumlah) as qty_sold'),
                DB::raw('SUM(order_items.total_harga) as revenue'),
            ])
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->whereIn('orders.status', ['diproses', 'dikirim', 'selesai'])
            ->whereBetween($orderDateExpr, [$from, $to])
            ->groupBy('products.id', 'products.nama_produk', 'products.sku');

        if ($search = $request->string('search')->toString()) {
            $query->where(function ($q) use ($search) {
                $q->where('products.nama_produk', 'like', "%{$search}%")
                    ->orWhere('products.sku', 'like', "%{$search}%");
            });
        }

        $query->orderByDesc('revenue');

        return $this->success($query->paginate($perPage));
    }

    public function channelPerformance(Request $request)
    {
        $this->authorize('admin');

        [$from, $to] = $this->resolveDateRange($request);
        $orderDateExpr = DB::raw('COALESCE(ordered_at, created_at)');

        $data = Order::query()
            ->select([
                DB::raw("COALESCE(channel, 'online') as channel"),
                DB::raw('COUNT(*) as orders_count'),
                DB::raw('SUM(total) as revenue'),
            ])
            ->whereBetween($orderDateExpr, [$from, $to])
            ->groupBy('channel')
            ->orderByDesc('revenue')
            ->get();

        return $this->success($data);
    }

    public function exportProductSales(Request $request): StreamedResponse
    {
        $this->authorize('admin');

        [$from, $to] = $this->resolveDateRange($request);
        $orderDateExpr = DB::raw('COALESCE(orders.ordered_at, orders.created_at)');

        $rows = OrderItem::query()
            ->select([
                'products.nama_produk',
                'products.sku',
                DB::raw('SUM(order_items.jumlah) as qty_sold'),
                DB::raw('SUM(order_items.total_harga) as revenue'),
            ])
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->whereIn('orders.status', ['diproses', 'dikirim', 'selesai'])
            ->whereBetween($orderDateExpr, [$from, $to])
            ->groupBy('products.nama_produk', 'products.sku')
            ->orderByDesc('revenue')
            ->get();

        return response()->streamDownload(function () use ($rows) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Produk', 'SKU', 'Qty Terjual', 'Revenue']);
            foreach ($rows as $row) {
                fputcsv($handle, [
                    $row->nama_produk,
                    $row->sku,
                    $row->qty_sold,
                    $row->revenue,
                ]);
            }
            fclose($handle);
        }, 'product-sales.csv', ['Content-Type' => 'text/csv']);
    }

    private function resolveDateRange(Request $request): array
    {
        $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
        ]);

        $from = $request->filled('from')
            ? Carbon::parse($request->input('from'))->startOfDay()
            : Carbon::now()->subDays(30)->startOfDay();

        $to = $request->filled('to')
            ? Carbon::parse($request->input('to'))->endOfDay()
            : Carbon::now()->endOfDay();

        return [$from, $to];
    }
}
