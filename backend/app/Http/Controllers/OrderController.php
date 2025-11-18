<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\BatchAllocationService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use OpenApi\Annotations as OA;

class OrderController extends Controller
{
    public function __construct(private readonly BatchAllocationService $allocationService) {}

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

    /**
     * @OA\Post(
     *     path="/orders/{id}/confirm-delivery",
     *     tags={"Orders"},
     *     summary="Konfirmasi pesanan sudah diterima pelanggan",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Pesanan ditandai selesai"),
     *     @OA\Response(response=403, description="Tidak berhak mengubah order ini"),
     *     @OA\Response(response=422, description="Status order tidak valid"),
     *     @OA\Response(response=404, description="Order tidak ditemukan")
     * )
     */
    public function confirmDelivery(Request $request, int $orderId)
    {
        if ($orderId <= 0) {
            return $this->fail('ID pesanan tidak valid', 422);
        }

        /** @var Order|null $order */
        $order = Order::find($orderId);

        if (! $order) {
            return $this->fail('Pesanan tidak ditemukan', 404);
        }

        if ($order->user_id !== $request->user()->id) {
            return $this->fail('Anda tidak berhak mengubah pesanan ini', 403);
        }

        if ($order->status === 'selesai') {
            return $this->success($order, 'Pesanan sudah berstatus selesai');
        }

        if ($order->status !== 'dikirim') {
            return $this->fail('Pesanan belum dalam status pengiriman', 422);
        }

        $order->status = 'selesai';
        $order->tracking_status = $order->tracking_status ?? 'CUSTOMER_CONFIRMED';
        $order->tracking_last_checked_at = now();
        $order->tracking_completed_at = now();
        $order->save();

        return $this->success($order, 'Terima kasih! Pesanan sudah ditandai selesai.');
    }

    /**
     * @OA\Post(
     *     path="/orders/{id}/expire",
     *     tags={"Orders"},
     *     summary="Tandai pesanan sebagai expired",
     *     description="Mengubah status pesanan menjadi 'expired' jika sudah lebih dari 1 jam dari waktu order dibuat. Hanya untuk pesanan dengan status 'belum_dibayar'.",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID pesanan yang akan ditandai expired",
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Pesanan ditandai expired",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object", description="Data pesanan yang telah expired"),
     *             @OA\Property(property="message", type="string", example="Pesanan telah ditandai sebagai kadaluwarsa.")
     *         )
     *     ),
     *     @OA\Response(response=403, description="Tidak berhak mengubah order ini"),
     *     @OA\Response(response=422, description="Status order tidak valid atau waktu pembayaran belum habis"),
     *     @OA\Response(response=404, description="Order tidak ditemukan")
     * )
     */
    public function expire(Request $request, int $orderId)
    {
        if ($orderId <= 0) {
            return $this->fail('ID pesanan tidak valid', 422);
        }

        /** @var Order|null $order */
        $order = Order::find($orderId);

        if (! $order) {
            return $this->fail('Pesanan tidak ditemukan', 404);
        }

        if ($order->user_id !== $request->user()->id) {
            return $this->fail('Anda tidak berhak mengubah pesanan ini', 403);
        }

        if ($order->status !== 'belum_dibayar') {
            return $this->success($order, 'Status pesanan tidak dapat diubah menjadi expired');
        }

        // Cek apakah sudah lebih dari 1 jam dari waktu order
        $orderDate = $order->ordered_at ? Carbon::parse($order->ordered_at) : Carbon::parse($order->created_at);
        $expiryDate = $orderDate->copy()->addHour();

        if (Carbon::now()->lt($expiryDate)) {
            return $this->fail('Waktu pembayaran belum habis', 422);
        }

        $order->status = 'expired';
        $order->save();

        return $this->success($order, 'Pesanan telah ditandai sebagai kadaluwarsa.');
    }

    /**
     * @OA\Post(
     *     path="/orders/{id}/cancel",
     *     tags={"Orders"},
     *     summary="Batalkan pesanan",
     *     description="Membatalkan pesanan dengan status 'belum_dibayar', 'menunggu_konfirmasi', atau 'expired'. Otomatis melepas reservasi/allokasi batch dan mengembalikan stok.",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID pesanan yang akan dibatalkan",
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Pesanan berhasil dibatalkan",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object", description="Data pesanan yang telah dibatalkan"),
     *             @OA\Property(property="message", type="string", example="Pesanan berhasil dibatalkan.")
     *         )
     *     ),
     *     @OA\Response(response=403, description="Tidak berhak mengubah order ini"),
     *     @OA\Response(response=422, description="Status order tidak dapat dibatalkan atau ID pesanan tidak valid"),
     *     @OA\Response(response=404, description="Order tidak ditemukan")
     * )
     */
    public function cancel(Request $request, int $orderId)
    {
        if ($orderId <= 0) {
            return $this->fail('ID pesanan tidak valid', 422);
        }

        /** @var Order|null $order */
        $order = Order::with(['items.batches', 'items'])->find($orderId);

        if (! $order) {
            return $this->fail('Pesanan tidak ditemukan', 404);
        }

        if ($order->user_id !== $request->user()->id) {
            return $this->fail('Anda tidak berhak mengubah pesanan ini', 403);
        }

        // Status yang bisa dibatalkan
        $cancellableStatuses = ['belum_dibayar', 'menunggu_konfirmasi', 'expired'];

        if (! in_array($order->status, $cancellableStatuses)) {
            return $this->fail('Pesanan dengan status ini tidak dapat dibatalkan', 422);
        }

        // Jika order sudah dialokasikan batch, lepas allokasi (kembalikan qty_remaining)
        // Jika masih reservasi, lepas reservasi saja
        if ($order->items->isNotEmpty() && $order->items->first()->batches->isNotEmpty()) {
            $hasAllocatedItems = $order->items->some(fn($item) => $item->allocated);

            if ($hasAllocatedItems) {
                $this->allocationService->releaseAllocation($order);
            } else {
                $this->allocationService->releaseReservation($order);
            }
        }

        $order->status = 'dibatalkan';
        $order->save();

        return $this->success($order, 'Pesanan berhasil dibatalkan.');
    }
}
