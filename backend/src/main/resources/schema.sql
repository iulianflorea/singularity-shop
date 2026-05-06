CREATE DATABASE IF NOT EXISTS singularity_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE singularity_shop;

CREATE TABLE IF NOT EXISTS categories (
    id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    name      VARCHAR(100) NOT NULL UNIQUE,
    slug      VARCHAR(100) NOT NULL UNIQUE,
    parent_id BIGINT NULL
);

CREATE TABLE IF NOT EXISTS products (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    description   TEXT,
    price         DECIMAL(10, 2) NOT NULL,
    stock         INT NOT NULL DEFAULT 0,
    category      VARCHAR(100) NOT NULL,
    image_url     VARCHAR(500),
    product_code  VARCHAR(100) UNIQUE,
    purchase_price DECIMAL(10, 2),
    product_type  VARCHAR(20) NOT NULL DEFAULT 'PHYSICAL',
    active        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_active (active)
);

CREATE TABLE IF NOT EXISTS product_specifications (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    spec_name  VARCHAR(255) NOT NULL,
    spec_value TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_description_images (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    image_url  VARCHAR(500) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS customers (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    external_payment_id VARCHAR(255) UNIQUE,
    email               VARCHAR(255) NOT NULL UNIQUE,
    name                VARCHAR(255) NOT NULL,
    address             TEXT,
    password_hash       VARCHAR(255) NOT NULL,
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id       BIGINT NULL,
    guest_email       VARCHAR(255),
    guest_name        VARCHAR(255),
    status            VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    total_amount      DECIMAL(10, 2) NOT NULL,
    currency          VARCHAR(10) NOT NULL DEFAULT 'RON',
    payment_intent_id VARCHAR(255),
    transaction_id    VARCHAR(255),
    shipping_address  TEXT,
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_customer_id (customer_id),
    INDEX idx_status (status)
);

CREATE TABLE IF NOT EXISTS order_items (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id   BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity   INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS settings (
    setting_key VARCHAR(100) NOT NULL PRIMARY KEY,
    value       VARCHAR(255) NOT NULL
);
