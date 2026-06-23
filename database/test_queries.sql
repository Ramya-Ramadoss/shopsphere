-- ==========================================================
-- Project      : ShopSphere
-- File         : test_queries.sql
-- Description  : SQL queries for testing ShopSphere database
-- ==========================================================

-- ==========================================================
-- TEST 1 : Display All Customers
-- ==========================================================
SELECT *
FROM customers;


-- ==========================================================
-- TEST 2 : Display All Products
-- ==========================================================
SELECT *
FROM products;


-- ==========================================================
-- TEST 3 : Products Costing More Than ₹5000
-- ==========================================================
SELECT product_name,
       price
FROM products
WHERE price > 5000;


-- ==========================================================
-- TEST 4 : Display Electronics Products
-- ==========================================================
SELECT
    p.product_name,
    c.category_name
FROM products p
INNER JOIN categories c
ON p.category_id = c.category_id
WHERE c.category_name = 'Electronics';


-- ==========================================================
-- TEST 5 : Customer Order History
-- ==========================================================
SELECT
    c.first_name,
    c.last_name,
    o.order_id,
    o.total_amount,
    o.order_status,
    o.order_date
FROM customers c
INNER JOIN orders o
ON c.customer_id = o.customer_id
ORDER BY o.order_date DESC;


-- ==========================================================
-- TEST 6 : Product Search
-- ==========================================================
SELECT *
FROM products
WHERE product_name ILIKE '%iphone%';


-- ==========================================================
-- TEST 7 : Customer Cart Details
-- ==========================================================
SELECT
    c.first_name,
    c.last_name,
    p.product_name,
    ci.quantity
FROM customers c
INNER JOIN cart ca
ON c.customer_id = ca.customer_id
INNER JOIN cart_items ci
ON ca.cart_id = ci.cart_id
INNER JOIN products p
ON ci.product_id = p.product_id;


-- ==========================================================
-- TEST 8 : Customer Wishlist
-- ==========================================================
SELECT
    c.first_name,
    c.last_name,
    p.product_name
FROM customers c
INNER JOIN wishlist w
ON c.customer_id = w.customer_id
INNER JOIN wishlist_items wi
ON w.wishlist_id = wi.wishlist_id
INNER JOIN products p
ON wi.product_id = p.product_id;


-- ==========================================================
-- TEST 9 : Low Stock Products
-- ==========================================================
SELECT
    p.product_name,
    i.stock_quantity
FROM products p
INNER JOIN inventory i
ON p.product_id = i.product_id
WHERE i.stock_quantity < 20;


-- ==========================================================
-- TEST 10 : Best Selling Products
-- ==========================================================
SELECT
    p.product_name,
    SUM(oi.quantity) AS total_sold
FROM order_items oi
INNER JOIN products p
ON oi.product_id = p.product_id
GROUP BY p.product_name
ORDER BY total_sold DESC;


-- ==========================================================
-- TEST 11 : Total Revenue
-- ==========================================================
SELECT
    SUM(total_amount) AS total_revenue
FROM orders;


-- ==========================================================
-- TEST 12 : Average Product Price
-- ==========================================================
SELECT
    AVG(price) AS average_price
FROM products;


-- ==========================================================
-- TEST 13 : Most Expensive Product
-- ==========================================================
SELECT
    product_name,
    price
FROM products
ORDER BY price DESC
LIMIT 1;


-- ==========================================================
-- TEST 14 : Total Number of Orders
-- ==========================================================
SELECT
    COUNT(*) AS total_orders
FROM orders;


-- ==========================================================
-- TEST 15 : Payment History
-- ==========================================================
SELECT
    o.order_id,
    p.payment_method,
    p.payment_status,
    p.amount
FROM payments p
INNER JOIN orders o
ON p.order_id = o.order_id;


-- ==========================================================
-- TEST 16 : Recently Viewed Products
-- ==========================================================
SELECT
    c.first_name,
    c.last_name,
    p.product_name,
    rv.viewed_at
FROM recently_viewed rv
INNER JOIN customers c
ON rv.customer_id = c.customer_id
INNER JOIN products p
ON rv.product_id = p.product_id
ORDER BY rv.viewed_at DESC;


-- ==========================================================
-- TEST 17 : Update Inventory Stock
-- ==========================================================
UPDATE inventory
SET stock_quantity = 75
WHERE product_id = 5;

-- Verify Update
SELECT *
FROM inventory
WHERE product_id = 5;


-- ==========================================================
-- TEST 18 : Delete Wishlist Item
-- ==========================================================
DELETE FROM wishlist_items
WHERE wishlist_item_id = 12;

-- Verify Deletion
SELECT *
FROM wishlist_items;


-- ==========================================================
-- TEST 19 : Unread Notifications
-- ==========================================================
SELECT *
FROM notifications
WHERE is_read = FALSE;


-- ==========================================================
-- TEST 20 : Products Sorted by Price (High to Low)
-- ==========================================================
SELECT
    product_name,
    price
FROM products
ORDER BY price DESC;


-- ==========================================================
-- TEST 21 : Number of Products in Each Category
-- ==========================================================
SELECT
    c.category_name,
    COUNT(p.product_id) AS total_products
FROM categories c
LEFT JOIN products p
ON c.category_id = p.category_id
GROUP BY c.category_name
ORDER BY total_products DESC;


-- ==========================================================
-- TEST 22 : Customer-wise Total Spending
-- ==========================================================
SELECT
    c.first_name,
    c.last_name,
    SUM(o.total_amount) AS total_spent
FROM customers c
INNER JOIN orders o
ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.first_name, c.last_name
ORDER BY total_spent DESC;


-- ==========================================================
-- TEST 23 : Delivered Orders Only
-- ==========================================================
SELECT *
FROM orders
WHERE order_status = 'Delivered';


-- ==========================================================
-- TEST 24 : Products with Their Stock Quantity
-- ==========================================================
SELECT
    p.product_name,
    i.stock_quantity
FROM products p
INNER JOIN inventory i
ON p.product_id = i.product_id
ORDER BY i.stock_quantity DESC;


-- ==========================================================
-- TEST 25 : Complete Order Summary
-- ==========================================================
SELECT
    o.order_id,
    c.first_name,
    c.last_name,
    p.product_name,
    oi.quantity,
    oi.subtotal,
    pay.payment_status
FROM orders o
INNER JOIN customers c
ON o.customer_id = c.customer_id
INNER JOIN order_items oi
ON o.order_id = oi.order_id
INNER JOIN products p
ON oi.product_id = p.product_id
INNER JOIN payments pay
ON o.order_id = pay.order_id
ORDER BY o.order_id;