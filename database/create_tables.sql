-- ==========================================================
-- Project      : ShopSphere
-- File         : create_tables.sql
-- Database     : PostgreSQL
-- Author       : Ramya Ramadoss
-- Description  : Creates all database tables for ShopSphere
-- ==========================================================

-- ==========================================================
-- TABLE 1 : ADMINS
-- ==========================================================

CREATE TABLE admins (
    admin_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    role VARCHAR(30) NOT NULL DEFAULT 'Admin',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ==========================================================
-- TABLE 2 : CUSTOMERS
-- ==========================================================

CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(15) UNIQUE,
    address_line1 VARCHAR(150),
    address_line2 VARCHAR(150),
    city VARCHAR(50),
    state VARCHAR(50),
    postal_code VARCHAR(10),
    country VARCHAR(50) DEFAULT 'India',
    profile_image VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- TABLE 3 : CATEGORIES
-- ==========================================================

CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_category_admin
    FOREIGN KEY (created_by)
    REFERENCES admins(admin_id)
);


-- ==========================================================
-- TABLE 4 : PRODUCTS
-- ==========================================================

CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    category_id INT NOT NULL,
    created_by INT,

    product_name VARCHAR(150) NOT NULL,
    brand VARCHAR(100),
    sku VARCHAR(50) UNIQUE NOT NULL,

    description TEXT,

    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    discount_percent DECIMAL(5,2) DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),

    rating DECIMAL(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),

    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_product_category
        FOREIGN KEY (category_id)
        REFERENCES categories(category_id),

    CONSTRAINT fk_product_admin
        FOREIGN KEY (created_by)
        REFERENCES admins(admin_id)
);


-- ==========================================================
-- TABLE 5 : PRODUCT_IMAGES
-- ==========================================================

CREATE TABLE product_images (
    image_id SERIAL PRIMARY KEY,

    product_id INT NOT NULL,

    image_url VARCHAR(500) NOT NULL,

    is_primary BOOLEAN DEFAULT FALSE,

    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_image_product
        FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE CASCADE
);


-- ==========================================================
-- TABLE 6 : INVENTORY
-- ==========================================================

CREATE TABLE inventory (
    inventory_id SERIAL PRIMARY KEY,

    product_id INT UNIQUE NOT NULL,

    stock_quantity INT NOT NULL DEFAULT 0
        CHECK (stock_quantity >= 0),

    reorder_level INT DEFAULT 10
        CHECK (reorder_level >= 0),

    updated_by INT,

    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_inventory_product
        FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_inventory_admin
        FOREIGN KEY (updated_by)
	
        REFERENCES admins(admin_id)
);

-- ==========================================================
-- TABLE 7 : CART
-- ==========================================================

CREATE TABLE cart (
    cart_id SERIAL PRIMARY KEY,

    customer_id INT UNIQUE NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_cart_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id)
        ON DELETE CASCADE
);


-- ==========================================================
-- TABLE 8 : WISHLIST
-- ==========================================================

CREATE TABLE wishlist (
    wishlist_id SERIAL PRIMARY KEY,

    customer_id INT UNIQUE NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_wishlist_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id)
        ON DELETE CASCADE
);

-- ==========================================================
-- TABLE 9 : ORDERS
-- ==========================================================

CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,

    customer_id INT NOT NULL,

    processed_by INT,

    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    total_amount DECIMAL(10,2)
        NOT NULL CHECK (total_amount >= 0),

    shipping_address TEXT NOT NULL,

    order_status VARCHAR(30)
        DEFAULT 'Pending'
        CHECK (order_status IN
        ('Pending','Confirmed','Packed','Shipped','Delivered','Cancelled')),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_order_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id),

    CONSTRAINT fk_order_admin
        FOREIGN KEY (processed_by)
        REFERENCES admins(admin_id)
);

-- ==========================================================
-- TABLE 10 : NOTIFICATIONS
-- ==========================================================

CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,

    customer_id INT NOT NULL,

    title VARCHAR(150) NOT NULL,

    message TEXT NOT NULL,

    notification_type VARCHAR(30)
        DEFAULT 'Info'
        CHECK (notification_type IN
        ('Info','Success','Warning','Error')),

    is_read BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notification_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id)
        ON DELETE CASCADE
);

-- ==========================================================
-- TABLE 11 : CART_ITEMS
-- ==========================================================

CREATE TABLE cart_items (
    cart_item_id SERIAL PRIMARY KEY,

    cart_id INT NOT NULL,
    product_id INT NOT NULL,

    quantity INT NOT NULL
        CHECK (quantity > 0),

    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_cartitem_cart
        FOREIGN KEY (cart_id)
        REFERENCES cart(cart_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_cartitem_product
        FOREIGN KEY (product_id)
        REFERENCES products(product_id),

    CONSTRAINT uq_cart_product
        UNIQUE(cart_id, product_id)
);

-- ==========================================================
-- TABLE 12 : WISHLIST_ITEMS
-- ==========================================================

CREATE TABLE wishlist_items (
    wishlist_item_id SERIAL PRIMARY KEY,

    wishlist_id INT NOT NULL,
    product_id INT NOT NULL,

    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_wishlistitem_wishlist
        FOREIGN KEY (wishlist_id)
        REFERENCES wishlist(wishlist_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_wishlistitem_product
        FOREIGN KEY (product_id)
        REFERENCES products(product_id),

    CONSTRAINT uq_wishlist_product
        UNIQUE(wishlist_id, product_id)
);

-- ==========================================================
-- TABLE 13 : ORDER_ITEMS
-- ==========================================================

CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,

    order_id INT NOT NULL,
    product_id INT NOT NULL,

    quantity INT NOT NULL
        CHECK (quantity > 0),

    unit_price DECIMAL(10,2) NOT NULL
        CHECK (unit_price > 0),

    subtotal DECIMAL(10,2) NOT NULL
        CHECK (subtotal >= 0),

    CONSTRAINT fk_orderitem_order
        FOREIGN KEY (order_id)
        REFERENCES orders(order_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_orderitem_product
        FOREIGN KEY (product_id)
        REFERENCES products(product_id)
);


-- ==========================================================
-- TABLE 14 : PAYMENTS
-- ==========================================================

CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,

    order_id INT UNIQUE NOT NULL,

    payment_method VARCHAR(30)
        CHECK (payment_method IN
        ('UPI','Credit Card','Debit Card','Net Banking','Cash on Delivery')),

    payment_status VARCHAR(30)
        DEFAULT 'Pending'
        CHECK (payment_status IN
        ('Pending','Success','Failed','Refunded')),

    transaction_id VARCHAR(100) UNIQUE,

    amount DECIMAL(10,2) NOT NULL
        CHECK (amount >= 0),

    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_payment_order
        FOREIGN KEY (order_id)
        REFERENCES orders(order_id)
);

-- ==========================================================
-- TABLE 15 : INVOICES
-- ==========================================================

CREATE TABLE invoices (
    invoice_id SERIAL PRIMARY KEY,

    order_id INT UNIQUE NOT NULL,

    invoice_number VARCHAR(50) UNIQUE NOT NULL,

    invoice_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    total_amount DECIMAL(10,2)
        CHECK (total_amount >= 0),

    CONSTRAINT fk_invoice_order
        FOREIGN KEY (order_id)
        REFERENCES orders(order_id)
);


-- ==========================================================
-- TABLE 16 : RECENTLY_VIEWED
-- ==========================================================

CREATE TABLE recently_viewed (
    viewed_id SERIAL PRIMARY KEY,

    customer_id INT NOT NULL,
    product_id INT NOT NULL,

    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_recent_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_recent_product
        FOREIGN KEY (product_id)
        REFERENCES products(product_id)
);