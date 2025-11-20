<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use OpenApi\Annotations as OA;

class CartController extends Controller
{
    /**
     * @OA\Get(
     *     path="/cart",
     *     tags={"Cart"},
     *     summary="Daftar item di keranjang",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Daftar item keranjang")
     * )
     */
    public function index()
    {
        $cartItems = CartItem::with(['product', 'priceTier'])
            ->where('user_id', Auth::id())
            ->get();

        return response()->json($cartItems);
    }

    /**
     * @OA\Post(
     *     path="/cart",
     *     tags={"Cart"},
     *     summary="Tambah item ke keranjang",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"product_id","qty"},
     *             @OA\Property(property="product_id", type="integer", example=1),
     *             @OA\Property(property="qty", type="integer", example=2, minimum=1)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Item berhasil ditambahkan ke keranjang"),
     *     @OA\Response(response=422, description="Validasi gagal")
     * )
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'qty' => 'required|integer|min:1',
        ]);

        $userId = Auth::id();
        $productId = $request->product_id;
        $qty = $request->qty;

        // Check if item already exists in cart
        $cartItem = CartItem::where('user_id', $userId)
            ->where('product_id', $productId)
            ->first();

        if ($cartItem) {
            $cartItem->jumlah += $qty;
            $cartItem->save();
        } else {
            $cartItem = CartItem::create([
                'user_id' => $userId,
                'product_id' => $productId,
                'jumlah' => $qty,
            ]);
        }

        return response()->json($cartItem->load(['product', 'priceTier']));
    }

    /**
     * @OA\Put(
     *     path="/cart/{id}",
     *     tags={"Cart"},
     *     summary="Update jumlah item di keranjang",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"qty"},
     *             @OA\Property(property="qty", type="integer", example=3, minimum=1)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Item berhasil diupdate"),
     *     @OA\Response(response=404, description="Item tidak ditemukan"),
     *     @OA\Response(response=422, description="Validasi gagal")
     * )
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'qty' => 'required|integer|min:1',
        ]);

        $cartItem = CartItem::where('user_id', Auth::id())
            ->where('id', $id)
            ->firstOrFail();

        $cartItem->jumlah = $request->qty;
        $cartItem->save();

        return response()->json($cartItem->load(['product', 'priceTier']));
    }

    /**
     * @OA\Delete(
     *     path="/cart/{id}",
     *     tags={"Cart"},
     *     summary="Hapus item dari keranjang",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Item berhasil dihapus"),
     *     @OA\Response(response=404, description="Item tidak ditemukan")
     * )
     */
    public function destroy($id)
    {
        $cartItem = CartItem::where('user_id', Auth::id())
            ->where('id', $id)
            ->firstOrFail();

        $cartItem->delete();

        return response()->json(['message' => 'Item removed from cart']);
    }

    /**
     * @OA\Delete(
     *     path="/cart",
     *     tags={"Cart"},
     *     summary="Kosongkan keranjang",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Keranjang berhasil dikosongkan")
     * )
     */
    public function clear()
    {
        CartItem::where('user_id', Auth::id())->delete();

        return response()->json(['message' => 'Cart cleared']);
    }
}
