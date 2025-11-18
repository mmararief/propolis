<?php

namespace App\Http\Controllers;

use App\Services\GeminiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use OpenApi\Annotations as OA;

class BatchExtractController extends Controller
{
    public function __construct(private readonly GeminiService $geminiService) {}

    /**
     * @OA\Post(
     *     path="/extract-batch",
     *     tags={"Batch"},
     *     summary="Extract nomor batch dan tanggal kadaluarsa dari gambar",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(
     *                     property="file",
     *                     type="string",
     *                     format="binary",
     *                     description="Gambar kemasan produk"
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Data berhasil diekstrak",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="batch", type="string", nullable=true),
     *                 @OA\Property(property="exp", type="string", nullable=true)
     *             )
     *         )
     *     ),
     *     @OA\Response(response=400, description="File tidak valid"),
     *     @OA\Response(response=500, description="Gagal memproses gambar")
     * )
     */
    public function extract(Request $request)
    {
        $this->authorize('admin');

        $request->validate([
            'file' => 'required|image|mimes:jpeg,jpg,png,webp|max:5120', // 5MB max
        ]);

        try {
            $file = $request->file('file');
            $mimeType = $file->getMimeType();

            // Convert image to base64
            $imageContent = file_get_contents($file->getRealPath());
            $imageBase64 = base64_encode($imageContent);

            // Extract data using Gemini
            $extractedData = $this->geminiService->extractBatchData($imageBase64, $mimeType);

            return $this->success($extractedData, 'Data berhasil diekstrak dari gambar');
        } catch (\Exception $e) {
            Log::error('Batch Extract Error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->fail(
                $e->getMessage() ?? 'Gagal mengekstrak data dari gambar',
                500
            );
        }
    }
}
