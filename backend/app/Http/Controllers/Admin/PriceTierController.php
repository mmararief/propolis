<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PriceTier;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use OpenApi\Annotations as OA;

class PriceTierController extends Controller
{
    /**
     * @OA\Get(
     *     path="/admin/price-tiers",
     *     tags={"Admin"},
     *     summary="Daftar harga tingkat global",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Daftar harga tingkat global")
     * )
     */
    public function index()
    {
        // Public access - no auth required for viewing global price tiers
        $tiers = PriceTier::global()
            ->orderBy('min_jumlah')
            ->get();

        return $this->success($tiers);
    }

    /**
     * @OA\Post(
     *     path="/admin/price-tiers",
     *     tags={"Admin"},
     *     summary="Tambah harga tingkat global baru",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"min_jumlah","harga_total"},
     *             @OA\Property(property="min_jumlah", type="integer"),
     *             @OA\Property(property="max_jumlah", type="integer", nullable=true),
     *             @OA\Property(property="harga_total", type="number", format="float"),
     *             @OA\Property(property="label", type="string", nullable=true)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Harga tingkat global berhasil ditambahkan")
     * )
     */
    public function store(Request $request)
    {
        $this->authorize('admin');

        $data = $request->validate([
            'min_jumlah' => ['required', 'integer', 'min:1'],
            'max_jumlah' => ['nullable', 'integer', 'gte:min_jumlah'],
            'harga_total' => ['required', 'numeric', 'min:0'],
            'label' => ['nullable', 'string', 'max:50'],
        ]);

        // Check for overlapping ranges with existing global tiers
        $this->validateNoOverlap($data['min_jumlah'], $data['max_jumlah'], null);

        $tier = PriceTier::create([
            ...$data,
            'product_id' => null, // Global tier
        ]);

        return $this->success($tier, 'Harga tingkat global berhasil ditambahkan', 201);
    }

    /**
     * @OA\Put(
     *     path="/admin/price-tiers/{id}",
     *     tags={"Admin"},
     *     summary="Perbarui harga tingkat global",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"min_jumlah","harga_total"},
     *             @OA\Property(property="min_jumlah", type="integer"),
     *             @OA\Property(property="max_jumlah", type="integer", nullable=true),
     *             @OA\Property(property="harga_total", type="number", format="float"),
     *             @OA\Property(property="label", type="string", nullable=true)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Harga tingkat global berhasil diperbarui")
     * )
     */
    public function update(Request $request, int $id)
    {
        $this->authorize('admin');

        $tier = PriceTier::global()->findOrFail($id);

        $data = $request->validate([
            'min_jumlah' => ['required', 'integer', 'min:1'],
            'max_jumlah' => ['nullable', 'integer', 'gte:min_jumlah'],
            'harga_total' => ['required', 'numeric', 'min:0'],
            'label' => ['nullable', 'string', 'max:50'],
        ]);

        // Check for overlapping ranges with existing global tiers (excluding current)
        $this->validateNoOverlap($data['min_jumlah'], $data['max_jumlah'], $id);

        $tier->update($data);

        return $this->success($tier->fresh(), 'Harga tingkat global berhasil diperbarui');
    }

    /**
     * @OA\Delete(
     *     path="/admin/price-tiers/{id}",
     *     tags={"Admin"},
     *     summary="Hapus harga tingkat global",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Harga tingkat global berhasil dihapus")
     * )
     */
    public function destroy(int $id)
    {
        $this->authorize('admin');

        $tier = PriceTier::global()->findOrFail($id);
        $tier->delete();

        return $this->success(null, 'Harga tingkat global berhasil dihapus');
    }

    /**
     * Validate that the given range doesn't overlap with existing global tiers
     */
    private function validateNoOverlap(int $minJumlah, ?int $maxJumlah, ?int $excludeId = null): void
    {
        $query = PriceTier::global();

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        $overlapping = $query->where(function ($q) use ($minJumlah, $maxJumlah) {
            // Check if new range overlaps with existing ranges
            $q->where(function ($subQ) use ($minJumlah, $maxJumlah) {
                // Case 1: Existing tier starts before new tier ends
                $subQ->where('min_jumlah', '<=', $maxJumlah ?? PHP_INT_MAX);
                // Case 2: Existing tier ends after new tier starts (or has no max)
                $subQ->where(function ($subSubQ) use ($minJumlah) {
                    $subSubQ->where('max_jumlah', '>=', $minJumlah)
                        ->orWhereNull('max_jumlah');
                });
            });
        })->exists();

        if ($overlapping) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'min_jumlah' => 'Rentang jumlah ini tumpang tindih dengan harga tingkat yang sudah ada.',
            ]);
        }
    }
}
