-- ==========================================
-- UPDATE DATABASE BELAJARYUK
-- TANPA MENGHAPUS DATA
-- ==========================================

USE belajaryuk;


-- ==========================================
-- 1. TABEL USERS
-- ==========================================

-- Tambahkan role jika belum tersedia
-- Jalankan hanya jika kolom role belum ada

ALTER TABLE users
ADD COLUMN role ENUM('user', 'admin')
NOT NULL DEFAULT 'user';


-- ==========================================
-- 2. TABEL PRODUCTS
-- ==========================================

-- Tambahkan subkategori
ALTER TABLE products
ADD COLUMN subkategori VARCHAR(100) NULL
AFTER kategori;


-- Tambahkan benefit
ALTER TABLE products
ADD COLUMN benefit TEXT NULL
AFTER deskripsi;


-- Tambahkan harga promo dan status promo
ALTER TABLE products
ADD COLUMN harga_promo DECIMAL(15,2) NULL
AFTER harga,

ADD COLUMN promo_aktif TINYINT(1)
NOT NULL DEFAULT 0
AFTER harga_promo;


-- Tambahkan durasi dan jadwal
ALTER TABLE products
ADD COLUMN durasi VARCHAR(50) NULL
AFTER harga,

ADD COLUMN jadwal VARCHAR(100) NULL
AFTER durasi;


-- ==========================================
-- 3. TABEL BOOTCAMP
-- ==========================================

CREATE TABLE IF NOT EXISTS bootcamp (

    id INT AUTO_INCREMENT PRIMARY KEY,

    judul VARCHAR(255) NOT NULL,

    kategori VARCHAR(100) NOT NULL,

    mentor VARCHAR(255) NOT NULL,

    harga DECIMAL(12,2)
    NOT NULL DEFAULT 0,

    tanggal_mulai DATE NOT NULL,

    tanggal_berakhir DATE NOT NULL,

    kuota INT
    NOT NULL DEFAULT 0,

    gambar TEXT NULL,

    deskripsi TEXT NULL,

    created_at TIMESTAMP
    DEFAULT CURRENT_TIMESTAMP

);


-- Tambahkan harga promo Bootcamp
ALTER TABLE bootcamp
ADD COLUMN harga_promo DECIMAL(12,2)
DEFAULT 0
AFTER harga,

ADD COLUMN promo_aktif TINYINT(1)
DEFAULT 0
AFTER harga_promo;


-- ==========================================
-- 4. TABEL ORDERS
-- ==========================================

-- Pastikan tabel orders tersedia

CREATE TABLE IF NOT EXISTS orders (

    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    total_harga DECIMAL(15,2)
    NOT NULL DEFAULT 0,

    tanggal_order DATETIME
    DEFAULT CURRENT_TIMESTAMP,

    status ENUM(
        'pending',
        'processing',
        'completed',
        'cancelled'
    )
    DEFAULT 'pending',

    CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)

    ON DELETE CASCADE
    ON UPDATE CASCADE

);


-- ==========================================
-- 5. TABEL ORDER DETAILS
-- ==========================================

CREATE TABLE IF NOT EXISTS order_details (

    id INT AUTO_INCREMENT PRIMARY KEY,

    order_id INT NOT NULL,

    product_id INT NOT NULL,

    jumlah INT
    NOT NULL DEFAULT 1,

    harga DECIMAL(15,2)
    NOT NULL DEFAULT 0,

    CONSTRAINT fk_order_details_order
    FOREIGN KEY (order_id)
    REFERENCES orders(id)

    ON DELETE CASCADE
    ON UPDATE CASCADE,

    CONSTRAINT fk_order_details_product
    FOREIGN KEY (product_id)
    REFERENCES products(id)

    ON DELETE CASCADE
    ON UPDATE CASCADE

);


-- ==========================================
-- 6. TABEL TRANSAKSI
-- PEMBAYARAN MIDTRANS
-- ==========================================

CREATE TABLE IF NOT EXISTS transaksi (

    id INT AUTO_INCREMENT PRIMARY KEY,

    order_id VARCHAR(100)
    NOT NULL UNIQUE,

    user_id INT NULL,

    jenis_produk ENUM(
        'elearning',
        'bootcamp'
    )
    NOT NULL,

    produk_id INT NOT NULL,

    nama_produk VARCHAR(255)
    NOT NULL,

    gross_amount DECIMAL(12,2)
    NOT NULL DEFAULT 0,

    payment_type VARCHAR(100) NULL,

    transaction_id VARCHAR(100) NULL,

    transaction_status VARCHAR(50)
    NOT NULL DEFAULT 'pending',

    fraud_status VARCHAR(50) NULL,

    snap_token TEXT NULL,

    transaction_time DATETIME NULL,

    settlement_time DATETIME NULL,

    created_at TIMESTAMP
    DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
    DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_transaksi_user (user_id),

    INDEX idx_transaksi_produk (
        jenis_produk,
        produk_id
    ),

    INDEX idx_transaksi_status (
        transaction_status
    )

);


-- ==========================================
-- SELESAI
-- ==========================================