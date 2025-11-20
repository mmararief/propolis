## Backend Propolis Fulfillment (Laravel 11 + Sanctum)

Implementasi backend lengkap sesuai SDD + integrasi RajaOngkir.

### 1. Prasyarat

-   PHP 8.2+, Composer
-   MySQL 8, Redis (Predis client)
-   Eksternal API key RajaOngkir (`https://rajaongkir.komerce.id/api/v1`)

### 2. Setup Cepat

```bash
cp .env.example .env        # sesuaikan DB & RAJAONGKIR_KEY
composer install
php artisan key:generate
php artisan migrate --seed  # membuat struktur + data contoh
php artisan storage:link
```

> Seeder membuat 1 user admin (`admin@example.com` / `password`), 3 kategori, 5 produk dengan stok sample, dan cache provinsi.

### 3. Menjalankan Aplikasi

#### Development

**Konfigurasi Sederhana untuk Development:**

1. **Set Queue Connection ke Sync** (di `.env`):

    ```env
    QUEUE_CONNECTION=sync
    ```

    Ini membuat job berjalan langsung tanpa perlu queue worker.

2. **Menjalankan Scheduler** (pilih salah satu):

    - **Manual**: Jalankan command saat diperlukan:
        ```bash
        php artisan orders:release-expired-reservations
        ```
    - **Otomatis**: Jalankan scheduler terus-menerus:
        ```bash
        php artisan schedule:work
        ```
    - **Via Cron**: Setup cron lokal untuk `php artisan schedule:run` setiap menit

3. **HTTP Server**:
    ```bash
    php artisan serve
    ```

**Catatan**: Untuk detail lengkap, lihat `DEVELOPMENT_SETUP.md`

#### Production (cPanel - Recommended)

**Konfigurasi yang Aman untuk cPanel:**

1. **Set Queue Connection ke Sync** (di `.env`):

    ```env
    QUEUE_CONNECTION=sync
    ```

    Ini membuat job berjalan langsung tanpa perlu queue worker.

2. **Setup Cron Job di cPanel**:

    - Login ke cPanel → Cron Jobs
    - Tambahkan cron job baru:
    - **Minute**: `*`
    - **Hour**: `*`
    - **Day**: `*`
    - **Month**: `*`
    - **Weekday**: `*`
    - **Command**:
        ```bash
        cd /home/username/public_html/backend && /usr/bin/php artisan schedule:run >> /dev/null 2>&1
        ```
        _(Ganti `/home/username/public_html/backend` dengan path aktual ke folder backend)_

3. **Verifikasi Scheduler**:
    - Scheduler akan otomatis menjalankan:
        - `orders:release-expired-reservations` setiap 5 menit
        - `tracking:sync` setiap 6 jam

**Catatan**: Dengan `QUEUE_CONNECTION=sync`, tidak perlu menjalankan `php artisan queue:work` karena semua job berjalan langsung (synchronous).

### 4. Struktur Fitur Inti

-   **Autentikasi**: Laravel Sanctum (token bearer).
-   **Stok produk**: kolom `products.stok` dan `products.stok_reserved` dengan service `BatchAllocationService`.
    -   Reservasi ketika checkout → `stok_reserved` bertambah.
    -   Finalisasi saat admin verifikasi pembayaran → `stok` berkurang, `stok_reserved` turun.
-   **Integrasi RajaOngkir**: `App\Services\RajaOngkirService` (caching provinsi/kota).
-   **Jobs & Commands**:
    -   `ReleaseExpiredReservationJob` + command `orders:release-expired-reservations`.
    -   `SendOrderShippedNotificationJob` (placeholder log).
-   **Reports**: `GET /api/reports/batch-stock`, `GET /api/reports/batch-sales?from=&to=` memakai query SQL pada doc.

### 5. API Overview

Semua response mengikuti format `{ success, data, message }`.

Public / umum:

| Method | Endpoint                                | Deskripsi                                                  |
| ------ | --------------------------------------- | ---------------------------------------------------------- |
| GET    | `/api/products`                         | List produk + ringkasan stok                               |
| GET    | `/api/products/{id}`                    | Detail produk + harga tingkat                              |
| GET    | `/api/shipping/provinces`               | Proxy RajaOngkir (cache)                                   |
| GET    | `/api/shipping/cities/{province}`       | 〃                                                         |
| GET    | `/api/shipping/districts/{city}`        | 〃                                                         |
| GET    | `/api/shipping/subdistricts/{district}` | 〃                                                         |
| POST   | `/api/shipping/cost`                    | Hitung ongkir (body: origin, destination, weight, courier) |

Auth (Sanctum):

| Method | Endpoint                        | Deskripsi                         |
| ------ | ------------------------------- | --------------------------------- |
| POST   | `/api/checkout`                 | Buat order + reserve stok         |
| POST   | `/api/orders/{id}/upload-proof` | Upload bukti (pelanggan)          |
| GET    | `/api/orders/{id}`              | Detail order (policy owner/admin) |

Admin (Sanctum + Gate `admin`):

| Method | Endpoint                                | Deskripsi                     |
| ------ | --------------------------------------- | ----------------------------- |
| POST   | `/api/products`                         | Tambah produk                 |
| PUT    | `/api/products/{id}`                    | Ubah produk                   |
| POST   | `/api/products/{id}/price-tiers`        | Kelola harga tingkat          |
| GET    | `/api/admin/orders`                     | List order + filter status    |
| GET    | `/api/admin/orders/{id}`                | Detail order lengkap          |
| POST   | `/api/admin/orders/{id}/verify-payment` | Finalisasi + alokasi stok     |
| POST   | `/api/admin/orders/{id}/ship`           | Input resi + kirim notifikasi |
| POST   | `/api/admin/run-reservation-release`    | Trigger job rilis reservasi   |
| GET    | `/api/reports/batch-stock`              | Laporan stok produk           |
| GET    | `/api/reports/batch-sales`              | Laporan penjualan per produk  |

### 6. Contoh Curl

```bash
# Ambil provinsi via RajaOngkir proxy
curl -H "Accept: application/json" \
     -H "Authorization: Bearer {TOKEN}" \
     http://localhost:8000/api/shipping/provinces

# Checkout (token user)
curl -X POST http://localhost:8000/api/checkout \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{ "destination_city_id": 501, "address":"Jl. Mawar 1", "phone":"62812",
        "metode_pembayaran":"BCA", "items":[{ "product_id":1,"jumlah":3 }] }'

# Upload bukti pembayaran
curl -X POST http://localhost:8000/api/orders/1/upload-proof \
  -H "Authorization: Bearer {TOKEN}" \
  -F "bukti=@/path/bukti-transfer.jpg"

# Admin verifikasi pembayaran
curl -X POST http://localhost:8000/api/admin/orders/1/verify-payment \
  -H "Authorization: Bearer {ADMIN_TOKEN}"
```

### 7. SQL Referensi

```sql
-- Laporan stok produk
SELECT id, nama_produk, sku, stok, stok_reserved, (stok - stok_reserved) AS stok_available
FROM products
ORDER BY nama_produk;

-- Penjualan per produk
SELECT p.id, p.nama_produk, p.sku, SUM(oi.jumlah) AS qty_sold
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
JOIN products p ON p.id = oi.product_id
WHERE o.status IN ('diproses','dikirim','selesai')
GROUP BY p.id, p.nama_produk, p.sku;
```

### 8. Testing

```
php artisan test --filter=BatchAllocationServiceTest
```

Test meliputi:

1. Reservasi menambah `products.stok_reserved` dan mengatur `reservation_expires_at`.
2. Final allocate mengurangi `products.stok` dan menandai `order_items.allocated`.
3. Command `orders:release-expired-reservations` mengembalikan stok yang diresevasi dan menandai order `expired`.

### 9. Dokumentasi API

-   Halaman ringkas manual: `http://localhost:8000/docs/api` (ringkasan endpoint + curl).
-   Swagger UI interaktif: `http://localhost:8000/docs/openapi`
    -   Regenerasi spesifikasi: `php artisan l5-swagger:generate`
    -   File JSON tersimpan di `storage/api-docs/api-docs.json`

### 10. Catatan Tambahan

-   **Untuk cPanel**: Gunakan `QUEUE_CONNECTION=sync` di `.env` dan setup cron job untuk scheduler. Tidak perlu queue worker.
-   **Untuk VPS/Dedicated**: Bisa menggunakan `QUEUE_CONNECTION=database` atau `redis` dengan `php artisan queue:work` untuk performa lebih baik.
-   Simpan `RAJAONGKIR_KEY` di `.env`, jangan hardcode.
