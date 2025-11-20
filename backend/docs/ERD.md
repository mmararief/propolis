# Entity Relationship Diagram (ERD)

## ERD - Sistem E-Commerce Propolis

```mermaid
erDiagram
    USERS ||--o{ ORDERS : "places"
    USERS ||--o{ ADDRESSES : "has"
    USERS ||--o{ CART_ITEMS : "has"

    CATEGORIES ||--o{ PRODUCTS : "contains"
    PRODUCTS ||--o{ ORDER_ITEMS : "ordered_in"
    PRODUCTS ||--o{ CART_ITEMS : "added_to"
    PRODUCTS ||--o{ PRICE_TIERS : "has"

    ORDERS ||--o{ ORDER_ITEMS : "contains"
    ORDER_ITEMS ||--o{ ORDER_ITEM_PRODUCT_CODES : "has"
    ORDER_ITEMS }o--|| PRICE_TIERS : "uses"
    CART_ITEMS }o--|| PRICE_TIERS : "uses"

    USERS {
        bigint id PK
        string nama_lengkap
        string username UK
        string email UK
        string password
        string no_hp
        enum role "admin, pelanggan"
        string provinsi
        string kabupaten_kota
        string kecamatan
        string kelurahan
        string kode_pos
        string alamat_lengkap
        timestamp created_at
        timestamp updated_at
    }

    CATEGORIES {
        bigint id PK
        string nama_kategori UK
        timestamp created_at
        timestamp updated_at
    }

    PRODUCTS {
        bigint id PK
        bigint kategori_id FK
        string sku UK
        string nama_produk
        text deskripsi
        decimal harga_ecer
        integer stok
        integer stok_reserved
        json gambar
        decimal berat
        enum status "aktif, nonaktif"
        timestamp deleted_at
        timestamp created_at
        timestamp updated_at
    }

    PRICE_TIERS {
        bigint id PK
        bigint product_id FK "nullable"
        integer min_jumlah
        integer max_jumlah "nullable"
        decimal harga_total
        string label "nullable"
        timestamp created_at
        timestamp updated_at
    }

    CART_ITEMS {
        bigint id PK
        bigint user_id FK
        bigint product_id FK
        bigint harga_tingkat_id FK "nullable"
        integer jumlah
        timestamp created_at
        timestamp updated_at
    }

    ADDRESSES {
        bigint id PK
        bigint user_id FK
        string label
        integer provinsi_id "nullable"
        string provinsi_name "nullable"
        integer city_id "nullable"
        string city_name "nullable"
        integer district_id "nullable"
        string district_name "nullable"
        integer subdistrict_id "nullable"
        string subdistrict_name "nullable"
        text address
        string postal_code "nullable"
        string phone "nullable"
        timestamp created_at
        timestamp updated_at
    }

    ORDERS {
        bigint id PK
        bigint user_id FK
        string customer_name
        string customer_email
        decimal subtotal
        decimal ongkos_kirim
        decimal total
        string courier "nullable"
        string courier_service "nullable"
        integer destination_province_id "nullable"
        string destination_province_name "nullable"
        integer destination_city_id "nullable"
        string destination_city_name "nullable"
        integer destination_district_id "nullable"
        string destination_district_name "nullable"
        integer destination_subdistrict_id "nullable"
        string destination_subdistrict_name "nullable"
        string destination_postal_code "nullable"
        text address
        string phone
        enum status "belum_dibayar, menunggu_konfirmasi, diproses, dikirim, selesai, dibatalkan, expired"
        enum channel "website, manual"
        string external_order_id "nullable"
        string metode_pembayaran "nullable"
        string bukti_pembayaran "nullable"
        string resi "nullable"
        string tracking_status "nullable"
        json tracking_payload "nullable"
        timestamp tracking_last_checked_at "nullable"
        timestamp tracking_completed_at "nullable"
        timestamp reservation_expires_at "nullable"
        timestamp ordered_at "nullable"
        timestamp created_at
        timestamp updated_at
    }

    ORDER_ITEMS {
        bigint id PK
        bigint order_id FK
        bigint product_id FK
        decimal harga_satuan
        integer jumlah
        decimal total_harga
        text catatan "nullable"
        boolean allocated
        bigint harga_tingkat_id FK "nullable"
        timestamp created_at
        timestamp updated_at
    }

    ORDER_ITEM_PRODUCT_CODES {
        bigint id PK
        bigint order_item_id FK
        string kode_produk UK
        integer sequence
        timestamp created_at
        timestamp updated_at
    }
```

## Keterangan Relasi

### One-to-Many Relationships:

-   **USERS → ORDERS**: Satu user dapat memiliki banyak order
-   **USERS → ADDRESSES**: Satu user dapat memiliki banyak alamat
-   **USERS → CART_ITEMS**: Satu user dapat memiliki banyak item di keranjang
-   **CATEGORIES → PRODUCTS**: Satu kategori dapat memiliki banyak produk
-   **PRODUCTS → ORDER_ITEMS**: Satu produk dapat dipesan dalam banyak order item
-   **PRODUCTS → CART_ITEMS**: Satu produk dapat ditambahkan ke banyak keranjang
-   **ORDERS → ORDER_ITEMS**: Satu order dapat memiliki banyak order item
-   **ORDER_ITEMS → ORDER_ITEM_PRODUCT_CODES**: Satu order item dapat memiliki banyak kode produk

### Many-to-One Relationships:

-   **ORDER_ITEMS → PRICE_TIERS**: Banyak order item dapat menggunakan satu price tier
-   **CART_ITEMS → PRICE_TIERS**: Banyak cart item dapat menggunakan satu price tier
-   **PRICE_TIERS → PRODUCTS**: Price tier dapat dikaitkan dengan produk tertentu (nullable untuk global tier)

## Constraints Penting

1. **Unique Constraints:**

    - `users.username` - Unique
    - `users.email` - Unique
    - `products.sku` - Unique
    - `kategori.nama_kategori` - Unique
    - `order_item_product_codes.kode_produk` - Unique

2. **Foreign Key Constraints:**

    - Semua foreign key memiliki referential integrity
    - `order_item_product_codes.order_item_id` - CASCADE on delete

3. **Indexes:**
    - Foreign keys otomatis ter-index
    - Unique constraints otomatis ter-index
