-- ==========================================
-- DATABASE BELAJARYUK
-- ==========================================

CREATE DATABASE IF NOT EXISTS belajaryuk;

USE belajaryuk;


-- ==========================================
-- 1. TABEL USERS
-- ==========================================

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ==========================================
-- 2. TABEL PRODUCTS
-- ==========================================

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_produk VARCHAR(150) NOT NULL,
    kategori ENUM('E-Learning', 'Bootcamp') NOT NULL,
    deskripsi TEXT,
    harga DECIMAL(15,2) NOT NULL DEFAULT 0,
    gambar VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ==========================================
-- 3. TABEL ORDERS
-- ==========================================

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_harga DECIMAL(15,2) NOT NULL DEFAULT 0,
    tanggal_order DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM(
        'pending',
        'processing',
        'completed',
        'cancelled'
    ) DEFAULT 'pending',

    CONSTRAINT fk_orders_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


-- ==========================================
-- 4. TABEL ORDER DETAILS
-- ==========================================

CREATE TABLE IF NOT EXISTS order_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    jumlah INT NOT NULL DEFAULT 1,
    harga DECIMAL(15,2) NOT NULL DEFAULT 0,

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
-- INDEX
-- ==========================================

CREATE INDEX idx_orders_user
ON orders(user_id);

CREATE INDEX idx_orders_tanggal
ON orders(tanggal_order);

CREATE INDEX idx_orders_status
ON orders(status);

CREATE INDEX idx_products_kategori
ON products(kategori);

CREATE INDEX idx_order_details_order
ON order_details(order_id);

CREATE INDEX idx_order_details_product
ON order_details(product_id);


--tambahan admin user
ALTER TABLE users
ADD COLUMN role ENUM('user', 'admin') NOT NULL DEFAULT 'user';