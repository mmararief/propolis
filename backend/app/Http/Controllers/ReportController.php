<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\StockMovement;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use OpenApi\Annotations as OA;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Validation\ValidationException;

class ReportController extends Controller
{

    /**
     * @OA\Get(
     *     path="/admin/low-stock-products",
     *     tags={"Admin"},
     *     summary="Produk dengan stok rendah",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="threshold", in="query", @OA\Schema(type="integer", default=10)),
     *     @OA\Response(response=200, description="Daftar produk stok rendah")
     * )
     */
    public function lowStockProducts(Request $request)
    {
        $this->authorize('admin');

        $threshold = $request->integer('threshold', 10);

        $products = Product::query()
            ->select(['id', 'nama_produk', 'sku', 'stok', 'stok_reserved', 'status'])
            ->where('status', 'aktif')
            ->havingRaw('(stok - COALESCE(stok_reserved, 0)) <= ?', [$threshold])
            ->havingRaw('(stok - COALESCE(stok_reserved, 0)) > 0')
            ->orderByRaw('(stok - COALESCE(stok_reserved, 0)) ASC')
            ->limit(20)
            ->get()
            ->map(function (Product $product) {
                return [
                    'id' => $product->id,
                    'nama_produk' => $product->nama_produk,
                    'sku' => $product->sku,
                    'stok_available' => $product->stok_available,
                    'status' => $product->status,
                ];
            });

        return $this->success($products);
    }

    /**
     * @OA\Get(
     *     path="/reports/stock",
     *     tags={"Reports"},
     *     summary="Laporan stok produk",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="search", in="query", @OA\Schema(type="string")),
     *     @OA\Parameter(name="status", in="query", @OA\Schema(type="string")),
     *     @OA\Parameter(name="per_page", in="query", @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Daftar stok produk")
     * )
     */
    public function stockReport(Request $request)
    {
        $this->authorize('admin');

        $perPage = min($request->integer('per_page', 50), 200);
        $sortable = ['nama_produk', 'sku', 'stok', 'stok_available'];
        $sort = $request->input('sort', 'nama_produk');
        if (! in_array($sort, $sortable, true)) {
            $sort = 'nama_produk';
        }
        $direction = $request->input('direction', 'asc') === 'desc' ? 'desc' : 'asc';

        $query = Product::query()
            ->select(['id', 'nama_produk', 'sku', 'stok', 'stok_reserved', 'status', 'updated_at'])
            ->when($request->filled('status'), fn($q) => $q->where('status', $request->string('status')))
            ->when($search = $request->string('search')->toString(), function ($q) use ($search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('nama_produk', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                });
            })
            ->orderBy($sort === 'stok_available' ? DB::raw('(stok - COALESCE(stok_reserved,0))') : $sort, $direction);

        $products = $query->paginate($perPage)->through(function (Product $product) {
            return [
                'id' => $product->id,
                'nama_produk' => $product->nama_produk,
                'sku' => $product->sku,
                'stok' => (int) $product->stok,
                'stok_reserved' => (int) $product->stok_reserved,
                'stok_available' => $product->stok_available,
                'status' => $product->status,
                'updated_at' => $product->updated_at,
            ];
        });

        return $this->success($products);
    }

    /**
     * @OA\Get(
     *     path="/reports/sales-detail",
     *     tags={"Reports"},
     *     summary="Laporan detail penjualan",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="from", in="query", @OA\Schema(type="string", format="date")),
     *     @OA\Parameter(name="to", in="query", @OA\Schema(type="string", format="date")),
     *     @OA\Parameter(name="status", in="query", @OA\Schema(type="string")),
     *     @OA\Parameter(name="channel", in="query", @OA\Schema(type="string")),
     *     @OA\Parameter(name="search", in="query", @OA\Schema(type="string")),
     *     @OA\Parameter(name="per_page", in="query", @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Daftar penjualan detail")
     * )
     */
    public function salesDetail(Request $request)
    {
        $this->authorize('admin');

        [$from, $to] = $this->resolveDateRange($request);
        $perPage = min($request->integer('per_page', 20), 100);
        $orderDateExpr = DB::raw('COALESCE(orders.ordered_at, orders.created_at)');

        $query = Order::with([
            'user:id,nama_lengkap',
            'items.product:id,nama_produk,sku',
            'items.productCodes:id,order_item_id,kode_produk',
        ])
            ->whereBetween($orderDateExpr, [$from, $to])
            ->when($request->filled('status'), fn($q) => $q->where('status', $request->string('status')))
            ->when($request->filled('channel'), fn($q) => $q->where('channel', $request->string('channel')))
            ->when($search = $request->string('search')->toString(), function ($q) use ($search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('customer_name', 'like', "%{$search}%")
                        ->orWhere('external_order_id', 'like', "%{$search}%")
                        ->orWhere('orders.id', $search);
                });
            })
            ->orderByDesc($orderDateExpr);

        $orders = $query->paginate($perPage)->through(function (Order $order) {
            return [
                'id' => $order->id,
                'external_order_id' => $order->external_order_id,
                'customer_name' => $order->customer_name ?? $order->user?->nama_lengkap,
                'status' => $order->status,
                'channel' => $order->channel,
                'ordered_at' => $order->ordered_at ?? $order->created_at,
                'total' => $order->total,
                'total_items' => $order->items->sum('jumlah'),
                'items' => $order->items->map(function ($item) {
                    return [
                        'product_name' => $item->product->nama_produk ?? 'Produk dihapus',
                        'product_sku' => $item->product->sku ?? null,
                        'qty' => $item->jumlah,
                        'unit_price' => $item->harga_satuan,
                        'total_price' => $item->total_harga,
                        'codes' => $item->productCodes->pluck('kode_produk')->filter()->values(),
                    ];
                }),
            ];
        });

        return $this->success($orders);
    }

    /**
     * @OA\Get(
     *     path="/reports/sales-trend",
     *     tags={"Reports"},
     *     summary="Ringkasan tren penjualan",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="from", in="query", @OA\Schema(type="string", format="date")),
     *     @OA\Parameter(name="to", in="query", @OA\Schema(type="string", format="date")),
     *     @OA\Parameter(name="interval", in="query", @OA\Schema(type="string", enum={"daily","weekly"})),
     *     @OA\Parameter(name="status", in="query", @OA\Schema(type="string")),
     *     @OA\Parameter(name="channel", in="query", @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="Daftar titik tren")
     * )
     */
    public function salesTrend(Request $request)
    {
        $this->authorize('admin');

        [$from, $to] = $this->resolveDateRange($request);
        $interval = $request->input('interval', 'daily');
        $interval = in_array($interval, ['daily', 'weekly'], true) ? $interval : 'daily';

        $orderDateExprSql = 'COALESCE(orders.ordered_at, orders.created_at)';
        $orderDateExpr = DB::raw($orderDateExprSql);

        $daily = Order::query()
            ->selectRaw("DATE({$orderDateExprSql}) as day")
            ->selectRaw('COUNT(*) as orders_count')
            ->selectRaw('SUM(total) as revenue')
            ->whereBetween($orderDateExpr, [$from, $to])
            ->when($request->filled('status'), fn($q) => $q->where('status', $request->string('status')))
            ->when($request->filled('channel'), fn($q) => $q->where('channel', $request->string('channel')))
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->map(function ($row) {
                return [
                    'date' => Carbon::parse($row->day)->startOfDay(),
                    'orders_count' => (int) $row->orders_count,
                    'revenue' => (int) $row->revenue,
                ];
            });

        if ($interval === 'weekly') {
            $grouped = [];
            foreach ($daily as $entry) {
                $weekLabel = $entry['date']->copy()->startOfWeek()->format('Y-m-d');
                if (! isset($grouped[$weekLabel])) {
                    $grouped[$weekLabel] = [
                        'date' => Carbon::parse($weekLabel),
                        'orders_count' => 0,
                        'revenue' => 0,
                    ];
                }
                $grouped[$weekLabel]['orders_count'] += $entry['orders_count'];
                $grouped[$weekLabel]['revenue'] += $entry['revenue'];
            }

            $trend = collect($grouped)
                ->sortBy('date')
                ->values()
                ->map(function ($entry) {
                    return [
                        'label' => $entry['date']->format('d M Y'),
                        'orders_count' => $entry['orders_count'],
                        'revenue' => $entry['revenue'],
                    ];
                });
        } else {
            $trend = $daily->map(function ($entry) {
                return [
                    'label' => $entry['date']->format('d M'),
                    'orders_count' => $entry['orders_count'],
                    'revenue' => $entry['revenue'],
                ];
            });
        }

        return $this->success($trend);
    }

    /**
     * @OA\Get(
     *     path="/reports/export/stock-movements",
     *     tags={"Reports"},
     *     summary="Ekspor riwayat stok (CSV)",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="month", in="query", description="Format Y-m, misal 2025-08", @OA\Schema(type="string")),
     *     @OA\Parameter(name="start_date", in="query", @OA\Schema(type="string", format="date")),
     *     @OA\Parameter(name="end_date", in="query", @OA\Schema(type="string", format="date")),
     *     @OA\Parameter(name="product_ids[]", in="query", @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="File CSV berisi ringkasan stok")
     * )
     */
    public function exportStockMovements(Request $request): StreamedResponse
    {
        $this->authorize('admin');

        $validated = $request->validate([
            'month' => ['nullable', 'date_format:Y-m'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'product_ids' => ['nullable', 'array'],
            'product_ids.*' => ['integer', 'exists:products,id'],
        ]);

        if (! empty($validated['month'])) {
            $startDate = Carbon::createFromFormat('Y-m', $validated['month'])->startOfMonth();
            $endDate = (clone $startDate)->endOfMonth();
        } else {
            $startDate = ! empty($validated['start_date'])
                ? Carbon::parse($validated['start_date'])->startOfDay()
                : Carbon::now()->startOfMonth();

            $endDate = ! empty($validated['end_date'])
                ? Carbon::parse($validated['end_date'])->endOfDay()
                : (clone $startDate)->endOfMonth();
        }

        if ($startDate->gt($endDate)) {
            throw ValidationException::withMessages([
                'end_date' => ['Tanggal mulai tidak boleh lebih besar dari tanggal akhir'],
            ]);
        }

        $productQuery = Product::query()->orderBy('nama_produk');
        $productIds = $validated['product_ids'] ?? null;
        if (! empty($productIds)) {
            $productQuery->whereIn('id', $productIds);
        }

        $products = $productQuery->get();

        $movementQuery = StockMovement::query()
            ->select('product_id')
            ->selectRaw("
                SUM(CASE WHEN created_at < ? THEN change_qty ELSE 0 END) as opening_stock,
                SUM(CASE WHEN created_at BETWEEN ? AND ? AND change_qty > 0 THEN change_qty ELSE 0 END) as stock_in,
                SUM(CASE WHEN created_at BETWEEN ? AND ? AND change_qty < 0 THEN change_qty ELSE 0 END) as stock_out
            ", [
                $startDate,
                $startDate,
                $endDate,
                $startDate,
                $endDate,
            ])
            ->groupBy('product_id');

        if (! empty($productIds)) {
            $movementQuery->whereIn('product_id', $productIds);
        }

        $aggregates = $movementQuery->get()->keyBy('product_id');
        $filename = sprintf('stock-movements-%s.csv', $startDate->format('Y-m'));

        return response()->streamDownload(function () use ($products, $aggregates, $startDate, $endDate) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Periode', $startDate->format('d M Y') . ' - ' . $endDate->format('d M Y')]);
            fputcsv($handle, ['Produk', 'SKU', 'Stok Awal', 'Stok Masuk', 'Stok Keluar', 'Stok Akhir']);

            foreach ($products as $product) {
                $data = $aggregates->get($product->id);
                $opening = (int) ($data->opening_stock ?? 0);
                $stockIn = (int) ($data->stock_in ?? 0);
                $stockOut = (int) ($data->stock_out ?? 0);
                $closing = $opening + $stockIn + $stockOut;

                fputcsv($handle, [
                    $product->nama_produk,
                    $product->sku,
                    $opening,
                    $stockIn,
                    abs($stockOut),
                    $closing,
                ]);
            }

            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv']);
    }

    /**
     * @OA\Get(
     *     path="/reports/stock-history",
     *     tags={"Reports"},
     *     summary="Riwayat stok per produk per periode",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="start_date", in="query", @OA\Schema(type="string", format="date")),
     *     @OA\Parameter(name="end_date", in="query", @OA\Schema(type="string", format="date")),
     *     @OA\Parameter(name="interval", in="query", @OA\Schema(type="string", enum={"daily","weekly","monthly"})),
     *     @OA\Parameter(name="product_ids[]", in="query", @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Matriks stok per tanggal")
     * )
     */
    public function stockHistory(Request $request)
    {
        $this->authorize('admin');

        $validated = $request->validate([
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'interval' => ['nullable', 'in:daily,weekly,monthly'],
            'product_ids' => ['nullable', 'array'],
            'product_ids.*' => ['integer', 'exists:products,id'],
        ]);

        [$startDate, $endDate] = $this->resolveHistoryRange($validated);
        $interval = $validated['interval'] ?? 'monthly';
        $productIds = $validated['product_ids'] ?? null;

        $history = $this->buildStockHistoryData($startDate, $endDate, $interval, $productIds);

        return $this->success($history);
    }

    /**
     * @OA\Get(
     *     path="/reports/export/stock-history",
     *     tags={"Reports"},
     *     summary="Ekspor riwayat stok seperti spreadsheet (CSV)",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="start_date", in="query", @OA\Schema(type="string", format="date")),
     *     @OA\Parameter(name="end_date", in="query", @OA\Schema(type="string", format="date")),
     *     @OA\Parameter(name="interval", in="query", @OA\Schema(type="string", enum={"daily","weekly","monthly"})),
     *     @OA\Parameter(name="product_ids[]", in="query", @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="File CSV riwayat stok")
     * )
     */
    public function exportStockHistory(Request $request): StreamedResponse
    {
        $this->authorize('admin');

        $validated = $request->validate([
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'interval' => ['nullable', 'in:daily,weekly,monthly'],
            'product_ids' => ['nullable', 'array'],
            'product_ids.*' => ['integer', 'exists:products,id'],
        ]);

        [$startDate, $endDate] = $this->resolveHistoryRange($validated);
        $interval = $validated['interval'] ?? 'monthly';
        $productIds = $validated['product_ids'] ?? null;
        $history = $this->buildStockHistoryData($startDate, $endDate, $interval, $productIds);

        $filename = sprintf(
            'stock-history-%s-sampai-%s.csv',
            $startDate->format('Ymd'),
            $endDate->format('Ymd')
        );

        return response()->streamDownload(function () use ($history) {
            $handle = fopen('php://output', 'w');
            $headers = ['Tanggal'];
            foreach ($history['products'] as $product) {
                $label = $product['nama_produk'] . ($product['sku'] ? " ({$product['sku']})" : '');
                $headers[] = trim($label) !== '' ? $label : 'Produk';
            }
            $headers = array_merge($headers, ['Terjual', 'Beli Stock', 'Total Stock']);
            fputcsv($handle, $headers);

            foreach ($history['segments'] as $segment) {
                $row = [
                    Carbon::parse($segment['date'])->format('d/m/Y'),
                ];

                foreach ($history['products'] as $product) {
                    $row[] = $segment['products'][$product['id']] ?? 0;
                }

                $row[] = $segment['notes']['sold'] ?? 0;
                $row[] = $segment['notes']['restock'] ?? 0;
                $row[] = $segment['notes']['total_stock'] ?? 0;

                fputcsv($handle, $row);
            }

            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv']);
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

    private function resolveHistoryRange(array $validated): array
    {
        $startDate = ! empty($validated['start_date'])
            ? Carbon::parse($validated['start_date'])->startOfDay()
            : Carbon::now()->subDays(30)->startOfDay();

        $endDate = ! empty($validated['end_date'])
            ? Carbon::parse($validated['end_date'])->endOfDay()
            : Carbon::now()->endOfDay();

        if ($startDate->gt($endDate)) {
            throw ValidationException::withMessages([
                'end_date' => ['Tanggal mulai tidak boleh lebih besar dari tanggal akhir'],
            ]);
        }

        return [$startDate, $endDate];
    }

    private function buildStockHistoryData(Carbon $startDate, Carbon $endDate, string $interval, ?array $productIds = null): array
    {
        $segments = $this->buildHistorySegments($startDate, $endDate, $interval);
        if (empty($segments)) {
            return ['products' => [], 'segments' => []];
        }

        $productQuery = Product::query()->orderBy('nama_produk');
        if (! empty($productIds)) {
            $productQuery->whereIn('id', $productIds);
        }

        $products = $productQuery->get(['id', 'nama_produk', 'sku']);
        if ($products->isEmpty()) {
            return ['products' => [], 'segments' => []];
        }

        $firstStart = $segments[0]['start'];
        $lastEnd = $segments[array_key_last($segments)]['end'];

        $openingBalances = StockMovement::query()
            ->select('product_id')
            ->selectRaw('SUM(change_qty) as opening_stock')
            ->where('created_at', '<', $firstStart)
            ->when(! empty($productIds), fn($q) => $q->whereIn('product_id', $productIds))
            ->groupBy('product_id')
            ->pluck('opening_stock', 'product_id');

        $dailyMovements = StockMovement::query()
            ->select('product_id')
            ->selectRaw('DATE(created_at) as movement_date')
            ->selectRaw('SUM(change_qty) as net_change')
            ->selectRaw('SUM(CASE WHEN change_qty > 0 THEN change_qty ELSE 0 END) as stock_in')
            ->selectRaw('SUM(CASE WHEN change_qty < 0 THEN ABS(change_qty) ELSE 0 END) as stock_out')
            ->whereBetween('created_at', [$firstStart, $lastEnd])
            ->when(! empty($productIds), fn($q) => $q->whereIn('product_id', $productIds))
            ->groupBy('product_id', 'movement_date')
            ->orderBy('product_id')
            ->orderBy('movement_date')
            ->get()
            ->groupBy('product_id')
            ->map(function ($items) {
                return $items->map(function ($item) {
                    return [
                        'date' => Carbon::parse($item->movement_date)->startOfDay(),
                        'net' => (int) $item->net_change,
                        'in' => (int) $item->stock_in,
                        'out' => (int) $item->stock_out,
                    ];
                })->values()->all();
            });

        $productStates = [];
        $movementPointers = [];
        foreach ($products as $product) {
            $productStates[$product->id] = (int) ($openingBalances[$product->id] ?? 0);
            $movementPointers[$product->id] = 0;
        }

        $historyRows = [];
        foreach ($segments as $segment) {
            $rowProducts = [];
            $segmentSold = 0;
            $segmentRestock = 0;

            foreach ($products as $product) {
                $movements = $dailyMovements->get($product->id, []);
                $pointer = $movementPointers[$product->id];

                while ($pointer < count($movements) && $movements[$pointer]['date']->lte($segment['end'])) {
                    $productStates[$product->id] += $movements[$pointer]['net'];
                    $segmentRestock += $movements[$pointer]['in'];
                    $segmentSold += $movements[$pointer]['out'];
                    $pointer++;
                }

                $movementPointers[$product->id] = $pointer;
                $rowProducts[$product->id] = $productStates[$product->id];
            }

            $historyRows[] = [
                'date' => $segment['label'],
                'products' => $rowProducts,
                'notes' => [
                    'sold' => $segmentSold,
                    'restock' => $segmentRestock,
                    'total_stock' => array_sum($rowProducts),
                ],
            ];
        }

        return [
            'products' => $products->map(fn($product) => [
                'id' => $product->id,
                'nama_produk' => $product->nama_produk,
                'sku' => $product->sku,
            ])->values()->all(),
            'segments' => $historyRows,
        ];
    }

    private function buildHistorySegments(Carbon $startDate, Carbon $endDate, string $interval): array
    {
        $interval = in_array($interval, ['daily', 'weekly', 'monthly'], true) ? $interval : 'monthly';
        $segments = [];
        $cursor = $startDate->copy()->startOfDay();

        while ($cursor->lte($endDate)) {
            $segmentStart = $cursor->copy();
            $segmentEnd = match ($interval) {
                'weekly' => $cursor->copy()->endOfWeek(),
                'monthly' => $cursor->copy()->endOfMonth(),
                default => $cursor->copy(),
            };

            if ($segmentEnd->gt($endDate)) {
                $segmentEnd = $endDate->copy();
            }

            $segments[] = [
                'label' => $segmentEnd->toDateString(),
                'start' => $segmentStart->copy()->startOfDay(),
                'end' => $segmentEnd->copy()->endOfDay(),
            ];

            $cursor = $segmentEnd->copy()->addDay()->startOfDay();
        }

        return $segments;
    }
}
