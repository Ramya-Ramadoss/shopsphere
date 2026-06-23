-- ==========================================================
-- Project      : ShopSphere
-- File         : validation_queries.sql
-- Description  : Validation and Integrity Check Queries
-- ==========================================================

-- ==========================================================
-- VALIDATION 1 : Verify Total Records in Each Table
-- ==========================================================

SELECT 'admins' AS table_name, COUNT(*) FROM admins
UNION ALL
SELECT 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'product_images', COUNT(*) FROM product_images
UNION ALL
SELECT 'inventory', COUNT(*) FROM inventory
UNION ALL
SELECT 'cart', COUNT(*) FROM cart
UNION ALL
SELECT 'cart_items', COUNT(*) FROM cart_items
UNION ALL
SELECT 'wishlist', COUNT(*) FROM wishlist
UNION ALL
SELECT 'wishlist_items', COUNT(*) FROM wishlist_items
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'invoices', COUNT(*) FROM invoices
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'recently_viewed', COUNT(*) FROM recently_viewed;


-- ==========================================================
-- VALIDATION 2 : Check for Duplicate Customer Emails
-- ==========================================================

SELECT
email,
COUNT(*)
FROM customers
GROUP BY email
HAVING COUNT(*) > 1;


-- ==========================================================
-- VALIDATION 3 : Check for Duplicate Product SKU
-- ==========================================================

SELECT
sku,
COUNT(*)
FROM products
GROUP BY sku
HAVING COUNT(*) > 1;


-- ==========================================================
-- VALIDATION 4 : Check Products with Negative Price
-- ==========================================================

SELECT *
FROM products
WHERE price < 0;


-- ==========================================================
-- VALIDATION 5 : Check Inventory with Negative Stock
-- ==========================================================

SELECT *
FROM inventory
WHERE stock_quantity < 0;


-- ==========================================================
-- VALIDATION 6 : Check Invalid Ratings
-- ==========================================================

SELECT *
FROM products
WHERE rating < 0
OR rating > 5;


-- ==========================================================
-- VALIDATION 7 : Check Orders without Customers
-- ==========================================================

SELECT *
FROM orders o
LEFT JOIN customers c
ON o.customer_id = c.customer_id
WHERE c.customer_id IS NULL;


-- ==========================================================
-- VALIDATION 8 : Check Order Items without Products
-- ==========================================================

SELECT *
FROM order_items oi
LEFT JOIN products p
ON oi.product_id = p.product_id
WHERE p.product_id IS NULL;


-- ==========================================================
-- VALIDATION 9 : Check Payments without Orders
-- ==========================================================

SELECT *
FROM payments p
LEFT JOIN orders o
ON p.order_id = o.order_id
WHERE o.order_id IS NULL;


-- ==========================================================
-- VALIDATION 10 : Check Invoices without Orders
-- ==========================================================

SELECT *
FROM invoices i
LEFT JOIN orders o
ON i.order_id = o.order_id
WHERE o.order_id IS NULL;


-- ==========================================================
-- VALIDATION 11 : Check Recently Viewed without Customers
-- ==========================================================

SELECT *
FROM recently_viewed rv
LEFT JOIN customers c
ON rv.customer_id = c.customer_id
WHERE c.customer_id IS NULL;


-- ==========================================================
-- VALIDATION 12 : Check Recently Viewed without Products
-- ==========================================================

SELECT *
FROM recently_viewed rv
LEFT JOIN products p
ON rv.product_id = p.product_id
WHERE p.product_id IS NULL;


-- ==========================================================
-- VALIDATION 13 : Check Cart Items without Cart
-- ==========================================================

SELECT *
FROM cart_items ci
LEFT JOIN cart c
ON ci.cart_id = c.cart_id
WHERE c.cart_id IS NULL;


-- ==========================================================
-- VALIDATION 14 : Check Wishlist Items without Wishlist
-- ==========================================================

SELECT *
FROM wishlist_items wi
LEFT JOIN wishlist w
ON wi.wishlist_id = w.wishlist_id
WHERE w.wishlist_id IS NULL;


-- ==========================================================
-- VALIDATION 15 : Check NULL Product Names
-- ==========================================================

SELECT *
FROM products
WHERE product_name IS NULL;


-- ==========================================================
-- VALIDATION 16 : Check NULL Customer Names
-- ==========================================================

SELECT *
FROM customers
WHERE first_name IS NULL
OR last_name IS NULL;


-- ==========================================================
-- VALIDATION 17 : Check Low Stock Products
-- ==========================================================

SELECT
p.product_name,
i.stock_quantity
FROM products p
JOIN inventory i
ON p.product_id = i.product_id
WHERE i.stock_quantity <= i.reorder_level;


-- ==========================================================
-- VALIDATION 18 : Verify Total Revenue
-- ==========================================================

SELECT
SUM(total_amount) AS total_revenue
FROM orders;


-- ==========================================================
-- VALIDATION 19 : Verify Payment Status Distribution
-- ==========================================================

SELECT
payment_status,
COUNT(*)
FROM payments
GROUP BY payment_status;


-- ==========================================================
-- VALIDATION 20 : Database Integrity Check Completed
-- ==========================================================

SELECT
'All validation queries executed successfully.' AS status;