<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use OpenApi\Annotations as OA;

class PaymentController extends Controller
{
    /**
     * @OA\Post(
     *     path="/orders/{id}/upload-proof",
     *     tags={"Orders"},
     *     summary="Upload bukti pembayaran",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"bukti"},
     *                 @OA\Property(property="bukti", type="string", format="binary")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=200, description="Bukti pembayaran tersimpan"),
     *     @OA\Response(response=404, description="Order tidak ditemukan"),
     *     @OA\Response(response=422, description="Order sudah expired/dibatalkan atau tidak dapat menerima bukti pembayaran")
     * )
     */
    public function uploadProof(Request $request, int $orderId)
    {
        $order = Order::with('user')->findOrFail($orderId);

        $this->authorize('view', $order);

        // Cegah upload jika order sudah expired atau dibatalkan
        if ($order->status === 'expired' || $order->status === 'dibatalkan') {
            return $this->fail('Tidak dapat mengunggah bukti pembayaran untuk pesanan yang sudah ' . ($order->status === 'expired' ? 'kedaluwarsa' : 'dibatalkan'), 422);
        }

        // Cegah upload jika order sudah selesai atau dikirim
        if (in_array($order->status, ['selesai', 'dikirim', 'menunggu_konfirmasi', 'diproses'])) {
            return $this->fail('Pesanan ini sudah tidak memerlukan bukti pembayaran', 422);
        }

        $data = $request->validate([
            'bukti' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:2048'],
        ]);

        $path = $data['bukti']->store('bukti-pembayaran', 'public');

        $order->bukti_pembayaran = $path;
        $order->status = 'menunggu_konfirmasi';
        $order->save();

        return $this->success($order->fresh(), 'Bukti pembayaran berhasil diunggah');
    }
}
