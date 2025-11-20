# Panduan Setup untuk cPanel

## Konfigurasi yang Aman untuk cPanel

### ✅ Rekomendasi: Gunakan Scheduler (Cron) + Queue Sync

Untuk cPanel, **TIDAK PERLU** menjalankan `php artisan queue:work` karena:

-   cPanel tidak mendukung process yang berjalan terus-menerus
-   Lebih mudah dan aman menggunakan scheduler + queue sync

---

## Langkah Setup

### 1. Konfigurasi `.env`

Set queue connection ke `sync` (berjalan langsung, tidak perlu queue worker):

```env
QUEUE_CONNECTION=sync
```

**Kenapa `sync`?**

-   Job berjalan langsung saat dipanggil (synchronous)
-   Tidak perlu queue worker yang berjalan terus-menerus
-   Cocok untuk cPanel yang tidak support long-running processes

### 2. Setup Cron Job di cPanel

1. Login ke **cPanel**
2. Buka menu **Cron Jobs** (biasanya di bagian Advanced)
3. Klik **Add New Cron Job** atau **Standard (cPanel v92)**
4. Isi form:

    - **Minute**: `*` (setiap menit)
    - **Hour**: `*` (setiap jam)
    - **Day**: `*` (setiap hari)
    - **Month**: `*` (setiap bulan)
    - **Weekday**: `*` (setiap hari dalam seminggu)
    - **Command**:
        ```bash
        cd /home/username/public_html/backend && /usr/bin/php artisan schedule:run >> /dev/null 2>&1
        ```

    **Penting**: Ganti path sesuai struktur folder Anda:

    - `/home/username/public_html/backend` → path ke folder backend
    - `/usr/bin/php` → path PHP di server (cek dengan `which php` di terminal)

5. Klik **Add New Cron Job**

### 3. Verifikasi Cron Job

Setelah setup, scheduler akan otomatis menjalankan:

-   ✅ `orders:release-expired-reservations` → **setiap 5 menit** (melepas reservasi stok yang expired)
-   ✅ `tracking:sync` → **setiap 6 jam** (sync tracking shipment)

### 4. Test Manual (Opsional)

Untuk test apakah cron job berjalan, bisa jalankan manual via SSH:

```bash
cd /home/username/public_html/backend
php artisan schedule:run
```

Atau test command spesifik:

```bash
php artisan orders:release-expired-reservations
```

---

## Alternatif: Jika Ingin Menggunakan Queue Worker

**⚠️ Tidak Direkomendasikan untuk cPanel**

Jika tetap ingin menggunakan queue worker (misalnya untuk performa lebih baik):

1. Set `.env`:

    ```env
    QUEUE_CONNECTION=database
    ```

2. Jalankan migration untuk queue:

    ```bash
    php artisan queue:table
    php artisan migrate
    ```

3. Setup cron job untuk queue worker (lebih kompleks):

    ```bash
    cd /home/username/public_html/backend && /usr/bin/php artisan queue:work --stop-when-empty
    ```

    **Masalah**: Queue worker perlu berjalan terus-menerus, yang sulit di cPanel.

---

## Troubleshooting

### Cron Job Tidak Berjalan

1. **Cek path PHP**: Pastikan path PHP benar

    ```bash
    which php
    # atau
    /usr/local/bin/php -v
    ```

2. **Cek path backend**: Pastikan path ke folder backend benar

    ```bash
    pwd  # di folder backend
    ```

3. **Cek log**: Lihat log cron di cPanel atau:

    ```bash
    tail -f /home/username/public_html/backend/storage/logs/laravel.log
    ```

4. **Test manual**: Jalankan command secara manual untuk debug:
    ```bash
    cd /home/username/public_html/backend
    php artisan schedule:run -v
    ```

### Job Tidak Dieksekusi

1. Pastikan `QUEUE_CONNECTION=sync` di `.env`
2. Restart web server (jika perlu)
3. Clear cache:
    ```bash
    php artisan config:clear
    php artisan cache:clear
    ```

---

## Kesimpulan

✅ **Untuk cPanel, gunakan:**

-   `QUEUE_CONNECTION=sync` di `.env`
-   Setup 1 cron job untuk `schedule:run` (setiap menit)
-   **TIDAK PERLU** `php artisan queue:work`

✅ **Keuntungan:**

-   Lebih sederhana
-   Tidak perlu process yang berjalan terus-menerus
-   Cocok untuk shared hosting/cPanel
-   Scheduler otomatis menjalankan semua task yang diperlukan
