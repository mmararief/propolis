<?php

namespace App\Services;

use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    private string $apiKey;
    private string $baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

    public function __construct()
    {
        $this->apiKey = (string) config('services.gemini.api_key');
    }

    /**
     * Extract batch number and expiry date from image
     *
     * @param string $imageBase64 Base64 encoded image
     * @param string $mimeType Image MIME type (e.g., image/jpeg)
     * @return array{batch: string|null, exp: string|null}
     * @throws \Exception
     */
    public function extractBatchData(string $imageBase64, string $mimeType = 'image/jpeg'): array
    {
        if (empty($this->apiKey)) {
            throw new \Exception('GEMINI_API_KEY tidak ditemukan. Pastikan sudah diatur di file .env');
        }

        try {
            $prompt = "Dari gambar kemasan produk, ekstrak nomor batch dan tanggal kedaluwarsa (EXP). "
                . "Berikan respons hanya dalam format JSON seperti ini: "
                . "{\"batch\": \"NOMOR_BATCH\", \"exp\": \"TANGGAL_EXP\"}. "
                . "Jika tidak ditemukan, gunakan null untuk field yang tidak ada.";

            // Use gemini-1.5-flash or gemini-1.5-pro model
            $model = 'gemini-2.5-flash';
            $url = "{$this->baseUrl}/models/{$model}:generateContent?key={$this->apiKey}";

            $payload = [
                'contents' => [
                    [
                        'parts' => [
                            [
                                'text' => $prompt,
                            ],
                            [
                                'inline_data' => [
                                    'mime_type' => $mimeType,
                                    'data' => $imageBase64,
                                ],
                            ],
                        ],
                    ],
                ],
                'generationConfig' => [
                    'response_mime_type' => 'application/json',
                ],
            ];

            $response = Http::timeout(30)
                ->retry(2, 1000)
                ->post($url, $payload);

            if ($response->failed()) {
                $errorBody = $response->body();
                Log::error('Gemini API Error', [
                    'status' => $response->status(),
                    'body' => $errorBody,
                ]);
                throw new \Exception('Gagal memproses gambar dengan Gemini API: ' . $errorBody);
            }

            $responseData = $response->json();

            // Extract text from response
            $text = $responseData['candidates'][0]['content']['parts'][0]['text'] ?? null;

            if (!$text) {
                throw new \Exception('Tidak ada data yang diekstrak dari gambar');
            }

            // Parse JSON response
            $extracted = json_decode($text, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                // Try to extract JSON from text if it's wrapped in markdown code blocks
                $text = preg_replace('/```json\s*/', '', $text);
                $text = preg_replace('/```\s*/', '', $text);
                $text = trim($text);

                // Try to find JSON object in text
                if (preg_match('/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/', $text, $matches)) {
                    $extracted = json_decode($matches[0], true);
                } else {
                    $extracted = json_decode($text, true);
                }

                if (json_last_error() !== JSON_ERROR_NONE) {
                    Log::warning('Failed to parse Gemini response', [
                        'text' => $text,
                        'error' => json_last_error_msg(),
                    ]);
                    throw new \Exception('Gagal memparse respons dari Gemini: ' . json_last_error_msg());
                }
            }

            return [
                'batch' => $extracted['batch'] ?? null,
                'exp' => $extracted['exp'] ?? null,
            ];
        } catch (RequestException $e) {
            Log::error('Gemini API Request Exception', [
                'message' => $e->getMessage(),
            ]);
            throw new \Exception('Gagal menghubungi Gemini API: ' . $e->getMessage());
        } catch (\Exception $e) {
            Log::error('Gemini Service Error', [
                'message' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}
