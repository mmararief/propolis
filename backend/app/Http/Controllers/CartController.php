<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ProductVariantPack;
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
        $cartItems = CartItem::with(['product', 'productVariant', 'productVariantPack'])
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
        $data = $request->validate([
            'product_id' => 'required|exists:products,id',
            'product_variant_id' => ['nullable', 'exists:product_variants,id'],
            'product_variant_pack_id' => ['nullable', 'exists:product_variant_packs,id'],
            'qty' => 'required|integer|min:1',
        ]);

        $userId = Auth::id();
        $productId = (int) $data['product_id'];
        $variantId = $data['product_variant_id'] ?? null;
        $packId = $data['product_variant_pack_id'] ?? null;
        $qty = (int) $data['qty'];

        $product = Product::findOrFail($productId);
        $variant = null;
        $pack = null;

        if ($variantId) {
            $variant = ProductVariant::where('product_id', $product->id)->findOrFail($variantId);
        }

        if ($packId) {
            $pack = ProductVariantPack::findOrFail($packId);

            // Case 1: Pack is directly from product (no variant)
            if ($pack->product_id && !$pack->product_variant_id) {
                // Validate pack belongs to the product
                if ((int) $pack->product_id !== (int) $product->id) {
                    \Illuminate\Support\Facades\Log::error("Cart Mismatch: Pack ID {$pack->id} (Product {$pack->product_id}) does not match Request Product ID {$product->id}");
                    return $this->fail('Paket tidak sesuai dengan produk yang dipilih', 422);
                }
                // For product-based packs, variant should be null
                $variant = null;
                $variantId = null;
            }
            // Case 2: Pack is from a variant
            else if ($pack->product_variant_id) {
                if ($variant && (int) $pack->product_variant_id !== (int) $variant->id) {
                    \Illuminate\Support\Facades\Log::error("Cart Mismatch: Pack ID {$pack->id} (Variant {$pack->product_variant_id}) does not match Request Variant ID {$variant->id}");
                    return $this->fail('Paket tidak sesuai dengan varian yang dipilih', 422);
                }
                if (!$variant) {
                    // Load variant from pack
                    $packVariant = $pack->variant()->first();
                    if (!$packVariant || (int) $packVariant->product_id !== (int) $product->id) {
                        \Illuminate\Support\Facades\Log::error("Cart Mismatch: Pack ID {$pack->id} variant belongs to different product");
                        return $this->fail('Paket tidak sesuai dengan produk yang dipilih', 422);
                    }
                    $variant = $packVariant;
                    $variantId = $variant->id;
                }
            }
        }

        // Check if item already exists in cart with same variant/pack
        $cartItem = CartItem::where('user_id', $userId)
            ->where('product_id', $productId)
            ->when($variantId, fn($q) => $q->where('product_variant_id', $variantId), fn($q) => $q->whereNull('product_variant_id'))
            ->when($packId, fn($q) => $q->where('product_variant_pack_id', $packId), fn($q) => $q->whereNull('product_variant_pack_id'))
            ->first();

        if ($cartItem) {
            $cartItem->jumlah += $qty;
            $cartItem->save();
        } else {
            $cartItem = CartItem::create([
                'user_id' => $userId,
                'product_id' => $productId,
                'product_variant_id' => $variantId,
                'product_variant_pack_id' => $packId,
                'jumlah' => $qty,
            ]);
        }

        return response()->json($cartItem->load(['product', 'productVariant', 'productVariantPack']));
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

        return response()->json($cartItem->load(['product', 'productVariant', 'productVariantPack']));
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
