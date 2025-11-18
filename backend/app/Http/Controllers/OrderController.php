<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use OpenApi\Annotations as OA;

class OrderController extends Controller
{
    /**
     * @OA\Get(
     *     path="/orders/me",
     *     tags={"Orders"},
     *     summary="Daftar order milik pengguna saat ini",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Daftar order")
     * )
     */
    public function index(Request $request)
    {
        $orders = $request->user()->orders()
            ->with('items.product')
            ->orderByDesc('created_at')
            ->paginate(10);

        return $this->success($orders);
    }

    /**
     * @OA\Get(
     *     path="/orders/{id}",
     *     tags={"Orders"},
     *     summary="Detail order milik pelanggan",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Detail order beserta alokasi batch"),
     *     @OA\Response(response=403, description="Tidak berhak mengakses order ini"),
     *     @OA\Response(response=404, description="Order tidak ditemukan")
     * )
     */
    public function show(Request $request, $orderId)
    {
        $id = (int) $orderId;
        if ($id <= 0) {
            return $this->fail('ID pesanan tidak valid', 422);
        }

        $order = Order::with(['items.product', 'items.batches.batch'])->find($id);

        if (!$order) {
            return $this->fail('Pesanan tidak ditemukan', 404);
        }

        $this->authorize('view', $order);

        return $this->success($order);
    }
}
