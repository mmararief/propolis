<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Services\BatchAllocationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class BatchAllocationServiceTest extends TestCase
{
    use RefreshDatabase;

    private BatchAllocationService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = app(BatchAllocationService::class);
    }

    public function test_reserve_for_order_sets_reserved_qty_and_expiration(): void
    {
        $order = $this->prepareOrderWithStock(4, 10);

        $this->service->reserveForOrder($order, 30);

        $order->refresh()->load('items.product');
        $product = $order->items->first()->product->fresh();

        $this->assertNotNull($order->reservation_expires_at);
        $this->assertEquals(4, $product->stok_reserved);
        $this->assertEquals(6, $product->stok_available);
    }

    public function test_allocate_reduces_stock_and_marks_items_allocated(): void
    {
        $order = $this->prepareOrderWithStock(3, 5);

        $this->service->reserveForOrder($order);
        $this->service->allocate($order->id);

        $order->refresh()->load('items.product');
        $product = $order->items->first()->product->fresh();
        $item = $order->items->first();

        $this->assertTrue($item->allocated);
        $this->assertEquals(2, $product->stok);
        $this->assertEquals(0, $product->stok_reserved);
        $this->assertNull($order->reservation_expires_at);
    }

    public function test_release_expired_reservations_returns_stock(): void
    {
        $order = $this->prepareOrderWithStock(2, 5);
        $this->service->reserveForOrder($order);

        $order->update([
            'reservation_expires_at' => now()->subMinutes(5),
            'status' => 'belum_dibayar',
        ]);

        $this->artisan('orders:release-expired-reservations');

        $order->refresh()->load('items.product');
        $product = $order->items->first()->product->fresh();

        $this->assertEquals('expired', $order->status);
        $this->assertEquals(0, $product->stok_reserved);
    }

    private function prepareOrderWithStock(int $itemQty, int $stock): Order
    {
        $user = User::factory()->create();
        $category = Category::firstOrCreate(['nama_kategori' => 'Test']);
        $product = Product::create([
            'kategori_id' => $category->id,
            'sku' => (string) Str::uuid(),
            'nama_produk' => 'Produk Test',
            'deskripsi' => 'Digunakan untuk pengujian.',
            'harga_ecer' => 50000,
            'stok' => $stock,
            'stok_reserved' => 0,
            'status' => 'aktif',
        ]);

        $order = Order::create([
            'user_id' => $user->id,
            'subtotal' => $itemQty * 50000,
            'ongkos_kirim' => 0,
            'total' => $itemQty * 50000,
            'address' => 'Jl. Test 123',
            'phone' => '628123456789',
            'status' => 'belum_dibayar',
            'metode_pembayaran' => 'BCA',
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'harga_satuan' => 50000,
            'jumlah' => $itemQty,
            'total_harga' => $itemQty * 50000,
        ]);

        return $order->fresh('items');
    }
}
