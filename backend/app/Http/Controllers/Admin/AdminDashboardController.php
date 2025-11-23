<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use OpenApi\Annotations as OA;

class AdminDashboardController extends Controller
{
    /**
     * @OA\Get(
     *     path="/admin/dashboard/stats",
     *     tags={"Admin"},
     *     summary="Get admin dashboard statistics",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Dashboard statistics")
     * )
     */
    public function index()
    {
        $this->authorize('admin');

        $today = now()->startOfDay();

        // Basic Counts
        $totalProducts = Product::count();
        $totalOrders = Order::count();
        $totalUsers = User::where('role', 'pelanggan')->count();

        // Order Stats
        $pendingOrders = Order::whereIn('status', ['menunggu_konfirmasi', 'belum_dibayar'])->count();
        $todayOrders = Order::where('created_at', '>=', $today)->count();

        // Revenue (Today) - Only count valid orders (not cancelled, not unpaid if you prefer, but usually 'paid' or 'confirmed')
        // Assuming 'belum_dibayar' and 'dibatalkan' should not count towards revenue
        $todayRevenue = Order::where('created_at', '>=', $today)
            ->whereNotIn('status', ['dibatalkan', 'belum_dibayar'])
            ->sum('total');

        // Recent Activities (Latest 5 orders)
        $recentActivities = Order::with('user')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'type' => 'order',
                    'message' => "Pesanan #{$order->id} masuk dari " . ($order->customer_name ?? $order->user?->nama_lengkap ?? 'Guest'),
                    'amount' => $order->total,
                    'status' => $order->status,
                    'time' => $order->created_at->diffForHumans(),
                    'timestamp' => $order->created_at,
                ];
            });

        return $this->success([
            'total_products' => $totalProducts,
            'total_orders' => $totalOrders,
            'total_users' => $totalUsers,
            'pending_orders' => $pendingOrders,
            'today_orders' => $todayOrders,
            'today_revenue' => $todayRevenue,
            'recent_activities' => $recentActivities,
        ]);
    }
}
