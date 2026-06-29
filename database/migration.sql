-- ==========================================================
-- Project      : ShopSphere
-- File         : migration.sql
-- Database     : PostgreSQL
-- Author       : Antigravity
-- Description  : SQL updates to support ShopSphere enhancements
-- ==========================================================

-- 1. Google OAuth columns for Customers
ALTER TABLE customers ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS profile_image VARCHAR(255);

-- 2. Trash, Premium, and Review verification columns for Products
ALTER TABLE products ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE products ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT TRUE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS premium BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS review_verified BOOLEAN DEFAULT FALSE;

-- 3. Sorting order for product images
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;

-- 4. Delivery charges and order tracking columns for Orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_method VARCHAR(30) DEFAULT 'STANDARD';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_charge DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_id VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier_partner VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS expected_delivery_date TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_arrival_time VARCHAR(100);
