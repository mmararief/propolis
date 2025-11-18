<?php

namespace App\Services\Tracking;

use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BinderByteTrackingService
{
    public function __construct(private ?string $apiKey = null)
    {
        $this->apiKey ??= config('services.tracking.binderbyte_api_key');
    }

    public function enabled(): bool
    {
        return filled($this->apiKey);
    }

    public function track(string $courier, string $awb): ?array
    {
        if (! $this->enabled()) {
            Log::warning('BinderByteTrackingService: API key missing, skip tracking call.');

            return null;
        }

        try {
            $response = Http::acceptJson()
                ->timeout(15)
                ->get('https://api.binderbyte.com/v1/track', [
                    'api_key' => $this->apiKey,
                    'courier' => strtolower($courier ?: config('services.tracking.default_courier', 'jne')),
                    'awb' => $awb,
                ]);

            if (! $response->successful()) {
                Log::warning('BinderByteTrackingService: API call failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return null;
            }

            $payload = $response->json();

            if (Arr::get($payload, 'status') !== 200 || empty($payload['data'])) {
                Log::info('BinderByteTrackingService: unexpected response payload', ['payload' => $payload]);

                return null;
            }

            return $payload['data'];
        } catch (\Throwable $e) {
            Log::warning('BinderByteTrackingService: exception thrown', [
                'message' => $e->getMessage(),
            ]);

            return null;
        }
    }
}
