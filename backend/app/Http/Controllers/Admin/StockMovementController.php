<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use OpenApi\Annotations as OA;

class StockMovementController extends Controller
{
    /**
     * @OA\Get(
     *     path="/admin/stock-movements",
     *     tags={"Admin"},
     *     summary="Riwayat pergerakan stok",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="product_id", in="query", @OA\Schema(type="integer")),
     *     @OA\Parameter(name="type", in="query", @OA\Schema(type="string")),
     *     @OA\Parameter(name="date_from", in="query", @OA\Schema(type="string", format="date")),
     *     @OA\Parameter(name="date_to", in="query", @OA\Schema(type="string", format="date")),
     *     @OA\Parameter(name="per_page", in="query", @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Daftar pergerakan stok")
     * )
     */
    public function index(Request $request)
    {
        $this->authorize('admin');

        $movements = StockMovement::with([
                'product:id,nama_produk,sku',
                'productVariant:id,tipe,sku_variant',
                'productVariantPack:id,label,pack_size',
                'order:id,external_order_id,status',
                'user:id,nama_lengkap,email'
            ])
            ->when($request->filled('product_id'), fn($query) => $query->where('product_id', $request->integer('product_id')))
            ->when($request->filled('type'), fn($query) => $query->where('type', $request->string('type')))
            ->when($request->filled('date_from'), fn($query) => $query->whereDate('created_at', '>=', $request->date('date_from')))
            ->when($request->filled('date_to'), fn($query) => $query->whereDate('created_at', '<=', $request->date('date_to')))
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 20));

        return $this->success($movements);
    }
}
