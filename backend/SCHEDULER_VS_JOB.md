# Perbedaan Scheduler vs Job

## Konsep Dasar

### 📅 **Scheduler (Task Scheduler)**

-   **Apa itu?** Sistem untuk menjalankan task **pada waktu tertentu secara otomatis**
-   **Kapan dijalankan?** Berdasarkan jadwal (schedule) yang ditentukan
-   **Contoh:** Setiap 5 menit, setiap jam, setiap hari, dll
-   **Trigger:** Cron job memanggil `php artisan schedule:run` setiap menit

### 🔧 **Job (Queue Job)**

-   **Apa itu?** Unit kerja yang bisa dijalankan **kapan saja** (bisa async atau sync)
-   **Kapan dijalankan?** Saat dipanggil (dispatch) dari kode
-   **Contoh:** Setelah checkout, setelah upload bukti, dll
-   **Trigger:** Dipanggil secara manual dari kode aplikasi

---

## Contoh dari Codebase

### 1. **Scheduler** - Menjalankan Command Berdasarkan Jadwal

**File:** `bootstrap/app.php`

```php
->withSchedule(function (Schedule $schedule) {
    // Command ini akan dijalankan OTOMATIS setiap 5 menit
    $schedule->command('orders:release-expired-reservations')
             ->everyFiveMinutes()
             ->withoutOverlapping();

    // Command ini akan dijalankan OTOMATIS setiap 6 jam
    $schedule->command('tracking:sync')
             ->everySixHours()
             ->withoutOverlapping();
})
```

**Cara Kerja:**

1. Cron job memanggil `php artisan schedule:run` setiap menit
2. Laravel cek apakah ada command yang waktunya sudah tiba
3. Jika ya, jalankan command tersebut
4. Jika belum, skip

**Command yang dijalankan:** `OrdersReleaseExpiredReservations` (Command class)

---

### 2. **Job** - Unit Kerja yang Bisa Dipanggil Kapan Saja

**File:** `app/Jobs/ReleaseExpiredReservationJob.php`

```php
class ReleaseExpiredReservationJob implements ShouldQueue
{
    public function handle(BatchAllocationService $allocationService): void
    {
        // Logic untuk release reservasi
        $orders = Order::needReservationRelease()->get();
        // ... proses release
    }
}
```

**Cara Dipanggil:**

**Opsi A: Dari Controller (Manual Trigger)**

```php
// File: app/Http/Controllers/Admin/AdminOrderController.php
public function runReservationRelease()
{
    // Job dipanggil secara MANUAL dari endpoint
    ReleaseExpiredReservationJob::dispatch();
}
```

**Opsi B: Dari Scheduler (Otomatis)**

```php
// Bisa juga dijadwalkan via scheduler
$schedule->job(new ReleaseExpiredReservationJob())->everyFiveMinutes();
```

---

## Perbandingan

| Aspek               | **Scheduler**                        | **Job**                                   |
| ------------------- | ------------------------------------ | ----------------------------------------- |
| **Tujuan**          | Menjalankan task pada waktu tertentu | Unit kerja yang bisa dipanggil kapan saja |
| **Trigger**         | Otomatis (berdasarkan jadwal)        | Manual (dipanggil dari kode)              |
| **Kapan digunakan** | Task rutin/periodik                  | Task yang dipicu oleh event/action        |
| **Contoh**          | Release reservasi setiap 5 menit     | Send email setelah checkout               |
| **Implementasi**    | Command class                        | Job class                                 |
| **Fleksibilitas**   | ⚠️ Harus menunggu jadwal             | ✅ Bisa dipanggil kapan saja              |

---

## Contoh Penggunaan

### Skenario 1: Release Reservasi Expired

**Menggunakan Scheduler (Saat Ini):**

```php
// bootstrap/app.php
$schedule->command('orders:release-expired-reservations')
         ->everyFiveMinutes();
```

✅ **Keuntungan:** Otomatis, tidak perlu trigger manual

**Menggunakan Job (Alternatif):**

```php
// bootstrap/app.php
$schedule->job(new ReleaseExpiredReservationJob())
         ->everyFiveMinutes();
```

✅ **Keuntungan:** Bisa juga dipanggil manual dari controller

---

### Skenario 2: Send Email Setelah Checkout

**Menggunakan Job (Direkomendasikan):**

```php
// Di CheckoutController setelah order dibuat
SendOrderConfirmationJob::dispatch($order);
```

✅ **Keuntungan:** Langsung dipanggil saat event terjadi, tidak perlu menunggu jadwal

**Tidak Cocok untuk Scheduler:**
❌ Karena email harus dikirim segera setelah checkout, bukan menunggu jadwal

---

## Kombinasi: Scheduler + Job

**Best Practice:** Bisa menggunakan keduanya bersama-sama!

**Contoh:**

```php
// Scheduler menjalankan Job
$schedule->job(new ReleaseExpiredReservationJob())
         ->everyFiveMinutes();
```

**Keuntungan:**

-   ✅ Scheduler: Otomatis berjalan setiap 5 menit
-   ✅ Job: Bisa juga dipanggil manual dari controller
-   ✅ Fleksibel: Bisa dipanggil kapan saja, tapi juga otomatis

---

## Di Codebase Saat Ini

### Yang Menggunakan Scheduler:

1. ✅ `orders:release-expired-reservations` → Setiap 5 menit (Command)
2. ✅ `tracking:sync` → Setiap 6 jam (Command)

### Yang Menggunakan Job:

1. ✅ `ReleaseExpiredReservationJob` → Bisa dipanggil manual dari endpoint `/admin/run-reservation-release`

### Kombinasi:

-   Scheduler menjalankan **Command** (bukan Job)
-   Tapi ada **Job** yang bisa dipanggil manual
-   Keduanya melakukan hal yang sama (release reservasi)

---

## Kapan Menggunakan Apa?

### ✅ Gunakan **Scheduler** untuk:

-   Task yang harus berjalan secara periodik
-   Task yang tidak perlu trigger langsung
-   Contoh: Cleanup data, sync data, generate report harian

### ✅ Gunakan **Job** untuk:

-   Task yang dipicu oleh event/action user
-   Task yang harus berjalan segera
-   Contoh: Send email, process payment, generate PDF

### ✅ Gunakan **Kombinasi** untuk:

-   Task yang perlu otomatis TAPI juga bisa dipanggil manual
-   Contoh: Release reservasi (otomatis setiap 5 menit, tapi admin bisa trigger manual)

---

## Kesimpulan

**Scheduler:**

-   📅 Menjalankan task **pada waktu tertentu** secara otomatis
-   ⏰ Berdasarkan jadwal (schedule)
-   🔄 Cocok untuk task rutin/periodik

**Job:**

-   🔧 Unit kerja yang bisa dipanggil **kapan saja**
-   🎯 Dipanggil dari kode (dispatch)
-   ⚡ Cocok untuk task yang dipicu event

**Keduanya bisa digunakan bersama-sama untuk fleksibilitas maksimal!**
