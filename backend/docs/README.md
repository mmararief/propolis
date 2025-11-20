# Dokumentasi Diagram Sistem E-Commerce Propolis

Dokumentasi ini berisi diagram ERD (Entity Relationship Diagram) dan DFD (Data Flow Diagram) untuk sistem E-Commerce Propolis.

## File Dokumentasi

1. **ERD.md** - Entity Relationship Diagram yang menunjukkan struktur database dan relasi antar tabel
2. **DFD.md** - Data Flow Diagram yang menunjukkan alur data dalam sistem

## Cara Membaca Diagram

### ERD (Entity Relationship Diagram)

ERD menunjukkan:
- **Entities (Tabel)**: Semua tabel dalam database
- **Attributes (Kolom)**: Field-field dalam setiap tabel
- **Relationships**: Relasi antar tabel (One-to-Many, Many-to-One)
- **Constraints**: Primary Key (PK), Foreign Key (FK), Unique Key (UK)

**Notasi:**
- `||--o{` = One-to-Many (satu ke banyak)
- `}o--||` = Many-to-One (banyak ke satu)
- `PK` = Primary Key
- `FK` = Foreign Key
- `UK` = Unique Key

### DFD (Data Flow Diagram)

DFD menunjukkan alur data dari input hingga output dalam sistem.

**Level Diagram:**
- **Level 0 (Context Diagram)**: Gambaran umum sistem dan entitas eksternal
- **Level 1**: Proses utama dalam sistem
- **Level 2**: Detail proses untuk setiap fungsi utama
- **Level 3**: Detail proses untuk operasi spesifik

**Simbol:**
- `[Process]` = Proses/Function
- `{Decision}` = Keputusan/Condition
- `[(Data Store)]` = Database/Storage
- `([External Entity])` = Entitas Eksternal

## Cara Menampilkan Diagram

### Menggunakan VS Code

1. Install extension **Markdown Preview Mermaid Support** atau **Mermaid Preview**
2. Buka file `.md` yang berisi diagram
3. Tekan `Ctrl+Shift+V` untuk preview atau klik ikon preview

### Menggunakan Online Editor

1. Buka [Mermaid Live Editor](https://mermaid.live/)
2. Copy kode mermaid dari file `.md`
3. Paste ke editor
4. Diagram akan otomatis dirender

### Menggunakan GitHub/GitLab

GitHub dan GitLab secara native mendukung Mermaid. Diagram akan otomatis dirender saat file `.md` dibuka di repository.

## Struktur Database

### Tabel Utama

1. **users** - Data pengguna (admin dan pelanggan)
2. **kategori** - Kategori produk
3. **products** - Data produk
4. **harga_tingkat** - Harga berdasarkan jumlah (price tiers)
5. **keranjang** - Item di keranjang belanja
6. **addresses** - Alamat pengiriman pengguna
7. **orders** - Data pesanan
8. **order_items** - Item dalam pesanan
9. **order_item_product_codes** - Kode produk unik untuk setiap unit

### Relasi Penting

- **User → Orders**: Satu user dapat memiliki banyak order
- **Order → Order Items**: Satu order dapat memiliki banyak item
- **Order Item → Product Codes**: Satu order item dapat memiliki banyak kode produk
- **Product → Price Tiers**: Satu produk dapat memiliki banyak price tier
- **User → Cart Items**: Satu user dapat memiliki banyak item di keranjang

## Alur Proses Utama

### 1. Customer Flow (Alur Pelanggan)

1. **Browse Products** - Melihat daftar produk
2. **Add to Cart** - Menambahkan produk ke keranjang
3. **Checkout** - Proses checkout dengan pemilihan alamat dan shipping
4. **Payment** - Upload bukti pembayaran
5. **Track Order** - Melacak status pesanan

### 2. Admin Flow (Alur Admin)

1. **Product Management** - CRUD produk, kategori, dan price tiers
2. **Order Management** - Verifikasi pembayaran, input kode produk, pengiriman
3. **User Management** - CRUD pengguna
4. **Reports** - Generate laporan penjualan

### 3. Order Processing (Proses Pesanan)

1. **Order Created** - Pesanan dibuat dengan status "belum_dibayar"
2. **Payment Upload** - Customer upload bukti pembayaran
3. **Admin Verification** - Admin verifikasi pembayaran
4. **Stock Allocation** - Alokasi stok dan input kode produk
5. **Shipping** - Admin input resi dan update status
6. **Delivery** - Customer konfirmasi penerimaan

## Stock Management

Sistem menggunakan stock management langsung di tabel `products`:
- **stok**: Total stok tersedia
- **stok_reserved**: Stok yang sudah di-reserve untuk order yang belum dibayar
- **stok_available**: Stok yang benar-benar tersedia (stok - stok_reserved)

**Alur Stock:**
1. **Reserve**: Saat order dibuat, stok di-reserve (stok_reserved++)
2. **Allocate**: Saat order dikonfirmasi, stok dialokasikan (stok--, stok_reserved--)
3. **Release**: Saat order expired/dibatalkan, stok di-release (stok_reserved--)

## Update Diagram

Jika ada perubahan struktur database atau alur proses, update file:
- `ERD.md` untuk perubahan struktur database
- `DFD.md` untuk perubahan alur proses

Pastikan kode Mermaid tetap valid dengan mengecek di [Mermaid Live Editor](https://mermaid.live/).

