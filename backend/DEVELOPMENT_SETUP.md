# Panduan Setup untuk Development

## Konfigurasi Development

### ✅ Rekomendasi: Queue Sync + Scheduler Manual

Untuk Development, gunakan konfigurasi yang **paling sederhana**:

---

## Langkah Setup

### 1. Konfigurasi `.env`

Set queue connection ke `sync` (sama seperti production, tapi untuk kemudahan):

```env
QUEUE_CONNECTION=sync
```

**Kenapa `sync` untuk Development?**

-   ✅ Job berjalan langsung saat dipanggil (tidak perlu queue worker)
-   ✅ Lebih sederhana, tidak perlu setup database queue atau Redis
-   ✅ Debug lebih mudah (error langsung terlihat)
-   ✅ Cocok untuk development lokal

### 2. Menjalankan Scheduler

Ada 2 cara untuk menjalankan scheduler di development:

#### Opsi A: Manual (Paling Sederhana)

Jalankan command secara manual saat diperlukan:

```bash
# Release reservasi expired
php artisan orders:release-expired-reservations

# Sync tracking
php artisan tracking:sync
```

#### Opsi B: Scheduler Otomatis (Lebih Praktis)

Setup scheduler agar berjalan otomatis:

**Windows (PowerShell/CMD):**

```bash
# Jalankan sekali, akan berjalan terus
php artisan schedule:work
```

**Linux/Mac:**

```bash
# Via cron lokal (jika tersedia)
* * * * * cd /path/to/backend && php artisan schedule:run >> /dev/null 2>&1

# Atau gunakan Laravel scheduler (Laravel 11+)
php artisan schedule:work
```

**Atau gunakan task scheduler Windows:**

-   Buka Task Scheduler
-   Create Basic Task
-   Trigger: Daily atau saat login
-   Action: Start a program
-   Program: `php`
-   Arguments: `artisan schedule:work`
-   Start in: `D:\dante-propolis\backend`

---

## Alternatif: Queue Database (Opsional)

Jika ingin test queue system (untuk development lebih advanced):

### 1. Setup Queue Database

```bash
# Generate migration untuk queue
php artisan queue:table

# Run migration
php artisan migrate
```

### 2. Set `.env`

```env
QUEUE_CONNECTION=database
```

### 3. Jalankan Queue Worker

```bash
# Terminal baru, jalankan:
php artisan queue:work

# Atau dengan auto-restart (jika ada perubahan code):
php artisan queue:work --watch
```

**Catatan**: Queue worker harus berjalan di terminal terpisah dan tetap aktif.

---

## Perbandingan: Sync vs Database Queue

| Aspek            | Sync (`QUEUE_CONNECTION=sync`) | Database Queue           |
| ---------------- | ------------------------------ | ------------------------ |
| **Setup**        | ✅ Sangat mudah                | ⚠️ Perlu migration       |
| **Queue Worker** | ❌ Tidak perlu                 | ✅ Harus berjalan        |
| **Debug**        | ✅ Error langsung terlihat     | ⚠️ Error di queue worker |
| **Performansi**  | ⚠️ Blocking (tunggu selesai)   | ✅ Async (non-blocking)  |
| **Development**  | ✅ **Direkomendasikan**        | ⚠️ Untuk test queue      |

---

## Rekomendasi untuk Development

### ✅ **Gunakan `QUEUE_CONNECTION=sync`**

**Alasan:**

1. **Lebih Sederhana**: Tidak perlu setup tambahan
2. **Debug Mudah**: Error langsung terlihat di response
3. **Cukup untuk Development**: Tidak perlu async processing
4. **Konsisten dengan Production**: Sama seperti cPanel setup

**Cara Kerja:**

-   Saat checkout → job langsung dieksekusi
-   Saat admin trigger release → langsung dieksekusi
-   Tidak ada delay, semua langsung berjalan

### 📝 **Scheduler: Manual atau Otomatis**

**Untuk Development:**

-   **Manual**: Jalankan command saat diperlukan (paling sederhana)
-   **Otomatis**: Gunakan `php artisan schedule:work` (lebih praktis)

---

## Testing di Development

### Test Release Reservasi

1. Buat order baru (checkout)
2. Tunggu 30 menit (atau ubah `reservation_expires_at` di database)
3. Jalankan:
    ```bash
    php artisan orders:release-expired-reservations
    ```
4. Cek apakah stok kembali tersedia

### Test Scheduler

```bash
# Lihat jadwal
php artisan schedule:list

# Test run scheduler
php artisan schedule:run

# Jalankan scheduler terus-menerus (untuk development)
php artisan schedule:work
```

---

## Troubleshooting

### Command Tidak Ditemukan

Pastikan berada di folder backend:

```bash
cd D:\dante-propolis\backend
php artisan schedule:list
```

### Scheduler Tidak Berjalan

1. Pastikan `bootstrap/app.php` sudah dikonfigurasi dengan benar
2. Clear config cache:
    ```bash
    php artisan config:clear
    ```
3. Test manual:
    ```bash
    php artisan schedule:run -v
    ```

### Queue Worker Error

Jika menggunakan `QUEUE_CONNECTION=database`:

1. Pastikan migration sudah dijalankan:
    ```bash
    php artisan migrate
    ```
2. Pastikan queue worker berjalan:
    ```bash
    php artisan queue:work
    ```

---

## Kesimpulan

✅ **Untuk Development, gunakan:**

-   `QUEUE_CONNECTION=sync` di `.env`
-   Jalankan command manual atau `php artisan schedule:work`
-   **TIDAK PERLU** `php artisan queue:work` (kecuali ingin test queue system)

✅ **Keuntungan:**

-   Setup sangat sederhana
-   Debug mudah
-   Tidak perlu process tambahan
-   Konsisten dengan production (cPanel)
