-- ==========================================================
-- Project      : ShopSphere
-- File         : indexes.sql
-- Description  : Performance Indexes
-- ==========================================================


-- ==========================================================
-- ADMINS
-- ==========================================================

CREATE INDEX idx_admin_role
ON admins(role);

CREATE INDEX idx_admin_active
ON admins(is_active);


-- ==========================================================
-- CUSTOMERS
-- ==========================================================

CREATE INDEX idx_customer_phone
ON customers(phone);

CREATE INDEX idx_customer_city
ON customers(city);

CREATE INDEX idx_customer_state
ON customers(state);

CREATE INDEX idx_customer_active
ON customers(is_active);

CREATE INDEX idx_customer_created
ON customers(created_at);


-- ==========================================================
-- CATEGORIES
-- ==========================================================

CREATE INDEX idx_category_name
ON categories(category_name);

CREATE INDEX idx_category_createdby
ON categories(created_by);


-- ==========================================================
-- PRODUCTS
-- ==========================================================

CREATE INDEX idx_product_name
ON products(product_name);

CREATE INDEX idx_product_brand
ON products(brand);

CREATE INDEX idx_product_category
ON products(category_id);

CREATE INDEX idx_product_featured
ON products(is_featured);

CREATE INDEX idx_product_active
ON products(is_active);

CREATE INDEX idx_product_rating
ON products(rating);

CREATE INDEX idx_product_price
ON products(price);


-- ==========================================================
-- PRODUCT_IMAGES
-- ==========================================================

CREATE INDEX idx_productimage_product
ON product_images(product_id);

CREATE INDEX idx_productimage_primary
ON product_images(is_primary);


-- ==========================================================
-- INVENTORY
-- ==========================================================

CREATE INDEX idx_inventory_stock
ON inventory(stock_quantity);

CREATE INDEX idx_inventory_reorder
ON inventory(reorder_level);

CREATE INDEX idx_inventory_updatedby
ON inventory(updated_by);


-- ==========================================================
-- CART
-- ==========================================================

CREATE INDEX idx_cart_created
ON cart(created_at);


-- ==========================================================
-- CART_ITEMS
-- ==========================================================

CREATE INDEX idx_cartitems_product
ON cart_items(product_id);

CREATE INDEX idx_cartitems_quantity
ON cart_items(quantity);


-- ==========================================================
-- WISHLIST
-- ==========================================================

CREATE INDEX idx_wishlist_created
ON wishlist(created_at);


-- ==========================================================
-- WISHLIST_ITEMS
-- ==========================================================

CREATE INDEX idx_wishlistitems_product
ON wishlist_items(product_id);


-- ==========================================================
-- ORDERS
-- ==========================================================

CREATE INDEX idx_orders_customer
ON orders(customer_id);

CREATE INDEX idx_orders_admin
ON orders(processed_by);

CREATE INDEX idx_orders_date
ON orders(order_date);

CREATE INDEX idx_orders_status
ON orders(order_status);

CREATE INDEX idx_orders_amount
ON orders(total_amount);


-- ==========================================================
-- ORDER_ITEMS
-- ==========================================================

CREATE INDEX idx_orderitems_product
ON order_items(product_id);

CREATE INDEX idx_orderitems_quantity
ON order_items(quantity);


-- ==========================================================
-- PAYMENTS
-- ==========================================================

CREATE INDEX idx_payment_method
ON payments(payment_method);

CREATE INDEX idx_payment_status
ON payments(payment_status);

CREATE INDEX idx_payment_date
ON payments(payment_date);

CREATE INDEX idx_payment_amount
ON payments(amount);


-- ==========================================================
-- INVOICES
-- ==========================================================

CREATE INDEX idx_invoice_date
ON invoices(invoice_date);

CREATE INDEX idx_invoice_amount
ON invoices(total_amount);


-- ==========================================================
-- NOTIFICATIONS
-- ==========================================================

CREATE INDEX idx_notification_customer
ON notifications(customer_id);

CREATE INDEX idx_notification_type
ON notifications(notification_type);

CREATE INDEX idx_notification_read
ON notifications(is_read);

CREATE INDEX idx_notification_date
ON notifications(created_at);


-- ==========================================================
-- RECENTLY_VIEWED
-- ==========================================================

CREATE INDEX idx_recent_customer
ON recently_viewed(customer_id);

CREATE INDEX idx_recent_product
ON recently_viewed(product_id);

CREATE INDEX idx_recent_viewedat
ON recently_viewed(viewed_at);