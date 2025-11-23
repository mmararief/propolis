<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\PriceTier;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ProductVariantPack;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'nama_lengkap' => 'Administrator',
                'username' => 'admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'no_hp' => '628123456789',
                'alamat_lengkap' => 'Jl. Propolis No. 1 Jakarta',
            ]
        );

        $categories = collect(['Propolis', 'Perawatan', 'Bundling'])
            ->map(fn($name) => Category::firstOrCreate(['nama_kategori' => $name]));

        $products = collect([
            ['sku' => 'PRP-001', 'nama' => 'Propolis 10ml', 'variants' => ['BP REGULER (dewasa)', 'BP KIDS (anak)', 'BP BLUE for woman']],
            ['sku' => 'PRP-002', 'nama' => 'Propolis 20ml', 'variants' => ['BP REGULER (dewasa)', 'BP KIDS (anak)']],
            ['sku' => 'PRP-003', 'nama' => 'Face Serum', 'variants' => []],
            ['sku' => 'PRP-004', 'nama' => 'Bundling Hemat', 'variants' => []],
            ['sku' => 'PRP-005', 'nama' => 'Honey Boost', 'variants' => []],
        ])->map(function ($item, $index) use ($categories) {
            $product = Product::updateOrCreate(
                ['sku' => $item['sku']],
                [
                    'kategori_id' => $categories[$index % $categories->count()]->id,
                    'nama_produk' => $item['nama'],
                    'tipe' => null, // Field tipe di product tidak digunakan lagi jika pakai variants
                    'deskripsi' => 'Produk sampel untuk pengujian backend.',
                    'harga_ecer' => 250000,
                    'stok' => 0, // Stok di product tidak digunakan jika pakai variants
                    'status' => 'aktif',
                ]
            );

            // Buat variants untuk produk ini
            foreach ($item['variants'] as $variantTipe) {
                $variant = ProductVariant::updateOrCreate(
                    [
                        'product_id' => $product->id,
                        'tipe' => $variantTipe,
                    ],
                    [
                        'sku_variant' => $product->sku . '-' . strtoupper(str_replace([' ', '(', ')'], ['-', '', ''], $variantTipe)),
                        'stok' => 100,
                        'stok_reserved' => 0,
                        'harga_ecer' => null, // Gunakan harga produk
                        'status' => 'aktif',
                    ]
                );

                // Buat varian jumlah default (1, 3, 5 botol)
                $defaultPacks = [
                    ['size' => 1, 'label' => '1 Botol', 'price' => 250000, 'stok' => 50],
                    ['size' => 3, 'label' => '3 Botol', 'price' => 700000, 'stok' => 30],
                    ['size' => 5, 'label' => '5 Botol', 'price' => 1100000, 'stok' => 20],
                ];

                foreach ($defaultPacks as $pack) {
                    ProductVariantPack::updateOrCreate(
                        [
                            'product_variant_id' => $variant->id,
                            'pack_size' => $pack['size'],
                        ],
                        [
                            'label' => $pack['label'],
                            'harga_pack' => $pack['price'],
                            'stok' => $pack['stok'],
                            'status' => 'aktif',
                        ]
                    );
                }
            }

            return $product;
        });

        // Create global price tiers (berlaku untuk semua produk)
        // Harga untuk 1 botol (harga normal)
        PriceTier::updateOrCreate(
            ['product_id' => null, 'min_jumlah' => 1],
            ['max_jumlah' => 2, 'harga_total' => 250000, 'label' => '1 Botol']
        );

        // Harga untuk 3 botol (lebih murah per botol)
        PriceTier::updateOrCreate(
            ['product_id' => null, 'min_jumlah' => 3],
            ['max_jumlah' => 4, 'harga_total' => 700000, 'label' => '3 Botol']
        );

        // Harga untuk 5 botol (lebih murah lagi per botol)
        PriceTier::updateOrCreate(
            ['product_id' => null, 'min_jumlah' => 5],
            ['max_jumlah' => 9, 'harga_total' => 1100000, 'label' => '5 Botol']
        );

        // Harga untuk 10+ botol
        PriceTier::updateOrCreate(
            ['product_id' => null, 'min_jumlah' => 10],
            ['max_jumlah' => null, 'harga_total' => 2000000, 'label' => '10+ Botol']
        );

        foreach ($products as $product) {
            $product->forceFill([
                'stok' => 100,
                'stok_reserved' => 0,
            ])->save();
        }

        // Cache::put('rajaongkir:provinces', [
        //     ['province_id' => 1, 'province' => 'NUSA TENGGARA BARAT (NTB)'],
        //     ['province_id' => 2, 'province' => 'NUSA TENGGARA BARAT'],
        //     ['province_id' => 3, 'province' => 'MALUKU'],
        //     ['province_id' => 4, 'province' => 'KALIMANTAN SELATAN'],
        //     ['province_id' => 5, 'province' => 'KALIMANTAN TENGAH'],
        //     ['province_id' => 6, 'province' => 'JAWA BARAT'],
        //     ['province_id' => 7, 'province' => 'BENGKULU'],
        //     ['province_id' => 8, 'province' => 'KALIMANTAN TIMUR'],
        //     ['province_id' => 9, 'province' => 'KEPULAUAN RIAU'],
        //     ['province_id' => 10, 'province' => 'NANGGROE ACEH DARUSSALAM (NAD)'],
        //     ['province_id' => 11, 'province' => 'DKI JAKARTA'],
        //     ['province_id' => 12, 'province' => 'BANTEN'],
        //     ['province_id' => 13, 'province' => 'JAWA TENGAH'],
        //     ['province_id' => 14, 'province' => 'JAMBI'],
        //     ['province_id' => 15, 'province' => 'PAPUA'],
        //     ['province_id' => 16, 'province' => 'BALI'],
        //     ['province_id' => 17, 'province' => 'SUMATERA UTARA'],
        //     ['province_id' => 18, 'province' => 'GORONTALO'],
        //     ['province_id' => 19, 'province' => 'JAWA TIMUR'],
        //     ['province_id' => 20, 'province' => 'DI YOGYAKARTA'],
        //     ['province_id' => 21, 'province' => 'SULAWESI TENGGARA'],
        //     ['province_id' => 22, 'province' => 'NUSA TENGGARA TIMUR (NTT)'],
        //     ['province_id' => 23, 'province' => 'SULAWESI UTARA'],
        //     ['province_id' => 24, 'province' => 'SUMATERA BARAT'],
        //     ['province_id' => 25, 'province' => 'BANGKA BELITUNG'],
        //     ['province_id' => 26, 'province' => 'RIAU'],
        //     ['province_id' => 27, 'province' => 'SUMATERA SELATAN'],
        //     ['province_id' => 28, 'province' => 'SULAWESI TENGAH'],
        //     ['province_id' => 29, 'province' => 'KALIMANTAN BARAT'],
        //     ['province_id' => 30, 'province' => 'PAPUA BARAT'],
        //     ['province_id' => 31, 'province' => 'LAMPUNG'],
        //     ['province_id' => 32, 'province' => 'KALIMANTAN UTARA'],
        //     ['province_id' => 33, 'province' => 'MALUKU UTARA'],
        //     ['province_id' => 34, 'province' => 'SULAWESI SELATAN'],
        //     ['province_id' => 35, 'province' => 'SULAWESI BARAT'],
        // ], now()->addDay());
    }
}
