-- ==========================================================
-- ShopSphere Sample Data
-- Database : shopsphere_db
-- Author   : Ramya Ramadoss
-- ==========================================================


-- ==========================================================
-- TABLE 1 : ADMINS
-- ==========================================================

INSERT INTO admins
(first_name,last_name,email,password_hash,phone,role)
VALUES
('Ramya','Sharma','ramya.admin@shopsphere.com','admin123hash','9876543210','Super Admin'),

('Shyam','Nair','shyam.admin@shopsphere.com','admin456hash','9876543211','Inventory Manager');


-- ==========================================================
-- TABLE 2 : CUSTOMERS
-- ==========================================================

INSERT INTO customers
(first_name,last_name,email,password_hash,phone,address_line1,city,state,postal_code)
VALUES

('Aarav','Patel','aarav@gmail.com','hash101','9876500001','12 MG Road','Bangalore','Karnataka','560001'),

('Diya','Reddy','diya@gmail.com','hash102','9876500002','45 Anna Nagar','Chennai','Tamil Nadu','600040'),

('Arjun','Kumar','arjun@gmail.com','hash103','9876500003','21 Banjara Hills','Hyderabad','Telangana','500034'),

('Meera','Joshi','meera@gmail.com','hash104','9876500004','Sector 15','Noida','Uttar Pradesh','201301'),

('Rohan','Singh','rohan@gmail.com','hash105','9876500005','Park Street','Kolkata','West Bengal','700016'),

('Sneha','Iyer','sneha@gmail.com','hash106','9876500006','Marine Drive','Mumbai','Maharashtra','400001'),

('Karthik','Menon','karthik@gmail.com','hash107','9876500007','Vyttila','Kochi','Kerala','682019'),

('Ananya','Gupta','ananya@gmail.com','hash108','9876500008','Civil Lines','Delhi','Delhi','110054'),

('Vikram','Das','vikram@gmail.com','hash109','9876500009','Lalbagh','Lucknow','Uttar Pradesh','226001'),

('Pooja','Verma','pooja@gmail.com','hash110','9876500010','Salt Lake','Kolkata','West Bengal','700091');


-- ==========================================================
-- TABLE 3 : CATEGORIES
-- ==========================================================

INSERT INTO categories
(category_name,description,created_by)
VALUES

('Electronics','Electronic gadgets and devices',1),

('Fashion','Clothing and accessories',1),

('Home & Kitchen','Kitchen and home essentials',2),

('Books','Educational and story books',1),

('Sports','Sports equipment',2),

('Beauty','Beauty and skincare products',2),

('Toys','Kids toys and games',1),

('Groceries','Daily grocery items',2);

-- ==========================================================
-- TABLE 4 : PRODUCTS
-- ==========================================================

INSERT INTO products
(category_id, created_by, product_name, brand, sku, description, price, discount_percent, rating, is_featured)
VALUES

(1,1,'iPhone 15','Apple','ELEC001','Apple iPhone 15 128GB',79999,5,4.8,TRUE),

(1,1,'Galaxy S24','Samsung','ELEC002','Samsung Galaxy S24 256GB',74999,10,4.7,TRUE),

(1,2,'MacBook Air M3','Apple','ELEC003','13-inch Apple laptop',124999,8,4.9,TRUE),

(1,2,'Dell Inspiron 15','Dell','ELEC004','15-inch Laptop',65999,12,4.5,FALSE),

(1,1,'Sony WH-1000XM5','Sony','ELEC005','Noise Cancelling Headphones',28999,15,4.8,FALSE),

(2,1,'Men''s Casual Shirt','Levis','FASH001','Cotton casual shirt',1999,20,4.3,FALSE),

(2,2,'Women''s Kurti','Biba','FASH002','Printed cotton kurti',1499,18,4.4,FALSE),

(2,1,'Running Shoes','Nike','FASH003','Nike Air Running Shoes',5999,10,4.6,TRUE),

(2,2,'Leather Wallet','Woodland','FASH004','Genuine leather wallet',1299,15,4.2,FALSE),

(3,1,'Mixer Grinder','Prestige','HOME001','750W Mixer Grinder',3499,12,4.5,FALSE),

(3,2,'Non Stick Cookware Set','Pigeon','HOME002','7-piece cookware',4299,18,4.4,FALSE),

(3,1,'Vacuum Cleaner','Philips','HOME003','Dry vacuum cleaner',7999,10,4.6,FALSE),

(4,2,'Clean Code','Pearson','BOOK001','Programming Book',799,5,4.9,TRUE),

(4,1,'Atomic Habits','Random House','BOOK002','Self Improvement Book',599,8,4.8,TRUE),

(4,2,'Data Structures in C','McGraw Hill','BOOK003','DSA textbook',699,10,4.7,FALSE),

(5,1,'Cricket Bat','SG','SPORT001','English Willow Bat',5999,10,4.6,FALSE),

(5,2,'Football','Nivia','SPORT002','Size 5 Football',899,15,4.4,FALSE),

(5,1,'Yoga Mat','Boldfit','SPORT003','Anti-slip yoga mat',999,12,4.5,FALSE),

(6,2,'Face Wash','Himalaya','BEAUTY001','Neem Face Wash',249,5,4.4,FALSE),

(6,1,'Moisturizer','Nivea','BEAUTY002','Body Moisturizer',349,8,4.5,FALSE),

(7,2,'LEGO Classic','LEGO','TOY001','Creative Building Blocks',2499,10,4.9,TRUE),

(7,1,'Remote Control Car','Hot Wheels','TOY002','Rechargeable RC Car',1899,15,4.5,FALSE),

(8,2,'Basmati Rice 5kg','India Gate','GROC001','Premium Basmati Rice',699,5,4.7,FALSE),

(8,1,'Sunflower Oil 1L','Fortune','GROC002','Refined Sunflower Oil',189,3,4.6,FALSE),

(8,2,'Toor Dal 1kg','Tata Sampann','GROC003','Premium Toor Dal',169,2,4.5,FALSE);

-- ==========================================================
-- TABLE 5 : PRODUCT_IMAGES
-- ==========================================================

INSERT INTO product_images (product_id, image_url, is_primary)
VALUES
(1,'images/products/iphone15_1.jpg',TRUE),
(1,'images/products/iphone15_2.jpg',FALSE),

(2,'images/products/galaxys24_1.jpg',TRUE),
(2,'images/products/galaxys24_2.jpg',FALSE),

(3,'images/products/macbookm3_1.jpg',TRUE),
(3,'images/products/macbookm3_2.jpg',FALSE),

(4,'images/products/dell15_1.jpg',TRUE),
(4,'images/products/dell15_2.jpg',FALSE),

(5,'images/products/sonyheadphones_1.jpg',TRUE),
(5,'images/products/sonyheadphones_2.jpg',FALSE),

(6,'images/products/shirt_1.jpg',TRUE),
(6,'images/products/shirt_2.jpg',FALSE),

(7,'images/products/kurti_1.jpg',TRUE),
(7,'images/products/kurti_2.jpg',FALSE),

(8,'images/products/nikeshoes_1.jpg',TRUE),
(8,'images/products/nikeshoes_2.jpg',FALSE),

(9,'images/products/wallet_1.jpg',TRUE),
(9,'images/products/wallet_2.jpg',FALSE),

(10,'images/products/mixer_1.jpg',TRUE),
(10,'images/products/mixer_2.jpg',FALSE),

(11,'images/products/cookware_1.jpg',TRUE),
(11,'images/products/cookware_2.jpg',FALSE),

(12,'images/products/vacuum_1.jpg',TRUE),
(12,'images/products/vacuum_2.jpg',FALSE),

(13,'images/products/cleancode_1.jpg',TRUE),
(13,'images/products/cleancode_2.jpg',FALSE),

(14,'images/products/atomichabits_1.jpg',TRUE),
(14,'images/products/atomichabits_2.jpg',FALSE),

(15,'images/products/dsa_1.jpg',TRUE),
(15,'images/products/dsa_2.jpg',FALSE),

(16,'images/products/cricketbat_1.jpg',TRUE),
(16,'images/products/cricketbat_2.jpg',FALSE),

(17,'images/products/football_1.jpg',TRUE),
(17,'images/products/football_2.jpg',FALSE),

(18,'images/products/yogamat_1.jpg',TRUE),
(18,'images/products/yogamat_2.jpg',FALSE),

(19,'images/products/facewash_1.jpg',TRUE),
(19,'images/products/facewash_2.jpg',FALSE),

(20,'images/products/moisturizer_1.jpg',TRUE),
(20,'images/products/moisturizer_2.jpg',FALSE),

(21,'images/products/lego_1.jpg',TRUE),
(21,'images/products/lego_2.jpg',FALSE),

(22,'images/products/rccar_1.jpg',TRUE),
(22,'images/products/rccar_2.jpg',FALSE),

(23,'images/products/rice_1.jpg',TRUE),
(23,'images/products/rice_2.jpg',FALSE),

(24,'images/products/oil_1.jpg',TRUE),
(24,'images/products/oil_2.jpg',FALSE),

(25,'images/products/dal_1.jpg',TRUE),
(25,'images/products/dal_2.jpg',FALSE);

-- ==========================================================
-- TABLE 6 : INVENTORY
-- ==========================================================

INSERT INTO inventory
(product_id, stock_quantity, reorder_level, updated_by)
VALUES
(1,45,10,1),
(2,38,10,2),
(3,15,5,1),
(4,22,5,2),
(5,30,8,1),
(6,75,20,2),
(7,60,20,1),
(8,40,10,2),
(9,55,15,1),
(10,28,10,2),
(11,32,10,1),
(12,18,5,2),
(13,120,30,1),
(14,95,25,2),
(15,80,20,1),
(16,20,5,2),
(17,42,10,1),
(18,65,15,2),
(19,150,40,1),
(20,130,35,2),
(21,24,5,1),
(22,19,5,2),
(23,85,20,1),
(24,100,25,2),
(25,90,20,1);

-- ==========================================================
-- TABLE 7 : CART
-- ==========================================================

INSERT INTO cart
(customer_id)
VALUES
(1),
(2),
(3),
(4),
(5);

-- ==========================================================
-- TABLE 8 : WISHLIST
-- ==========================================================

INSERT INTO wishlist
(customer_id)
VALUES
(1),
(2),
(3),
(4),
(5);

-- ==========================================================
-- TABLE 9 : ORDERS
-- ==========================================================

INSERT INTO orders
(customer_id, processed_by, total_amount, shipping_address, order_status)
VALUES

(1,1,79999.00,'12 MG Road, Bangalore','Delivered'),

(2,2,74999.00,'45 Anna Nagar, Chennai','Delivered'),

(3,1,5999.00,'21 Banjara Hills, Hyderabad','Shipped'),

(4,2,3499.00,'Sector 15, Noida','Confirmed'),

(5,1,1299.00,'Park Street, Kolkata','Pending'),

(6,2,699.00,'Marine Drive, Mumbai','Delivered'),

(7,1,2499.00,'Vyttila, Kochi','Delivered'),

(8,2,999.00,'Civil Lines, Delhi','Cancelled'),

(9,1,189.00,'Lalbagh, Lucknow','Pending'),

(10,2,4299.00,'Salt Lake, Kolkata','Shipped');


-- ==========================================================
-- TABLE 10 : NOTIFICATIONS
-- ==========================================================

INSERT INTO notifications
(customer_id,title,message,notification_type)
VALUES

(1,'Order Delivered','Your iPhone 15 has been delivered.','Success'),

(2,'Payment Successful','Payment received successfully.','Success'),

(3,'Order Shipped','Your order is on the way.','Info'),

(4,'Order Confirmed','Your order has been confirmed.','Success'),

(5,'Cart Reminder','Items are waiting in your cart.','Info'),

(6,'Special Offer','Flat 20% discount this weekend!','Info'),

(7,'Wishlist Reminder','Your wishlist item is on sale.','Info'),

(8,'Order Cancelled','Your order has been cancelled.','Warning'),

(9,'Low Stock Alert','Item in your wishlist is almost sold out.','Warning'),

(10,'Welcome','Thank you for joining ShopSphere.','Success'),

(1,'Flash Sale','Electronics sale starts tomorrow.','Info'),

(2,'New Arrival','Check out our latest smartphones.','Info'),

(3,'Discount Coupon','You received a ₹500 coupon.','Success'),

(4,'Payment Pending','Complete payment to confirm your order.','Warning'),

(5,'Price Drop','A product in your wishlist is cheaper now.','Success'),

(6,'Delivery Update','Your package is out for delivery.','Info'),

(7,'Review Request','Please review your recent purchase.','Info'),

(8,'Festival Sale','Exclusive festive discounts available.','Info'),

(9,'Order Received','Your order has been placed successfully.','Success'),

(10,'Inventory Update','A previously unavailable item is back in stock.','Success');

-- ==========================================================
-- TABLE 11 : CART_ITEMS
-- ==========================================================

INSERT INTO cart_items (cart_id, product_id, quantity)
VALUES
(1,2,1),
(1,6,2),
(1,14,1),

(2,5,1),
(2,18,2),
(2,23,3),

(3,8,1),
(3,21,1),
(3,24,2),

(4,3,1),
(4,12,1),
(4,20,2),

(5,9,1),
(5,17,2),
(5,25,4);

-- ==========================================================
-- TABLE 12 : WISHLIST_ITEMS
-- ==========================================================

INSERT INTO wishlist_items (wishlist_id, product_id)
VALUES
(1,1),
(1,5),

(2,3),
(2,8),

(3,10),
(3,13),

(4,16),
(4,21),

(5,22),
(5,24),
(5,25),
(2,14);

-- ==========================================================
-- TABLE 13 : ORDER_ITEMS
-- ==========================================================

INSERT INTO order_items
(order_id, product_id, quantity, unit_price, subtotal)
VALUES

(1,1,1,79999,79999),

(2,2,1,74999,74999),

(3,8,1,5999,5999),

(4,10,1,3499,3499),

(5,9,1,1299,1299),

(6,15,1,699,699),

(7,21,1,2499,2499),

(8,18,1,999,999),

(9,24,1,189,189),

(10,11,1,4299,4299),

(1,19,2,249,498),

(2,20,2,349,698),

(3,17,1,899,899),

(4,16,1,5999,5999),

(5,23,2,699,1398),

(6,6,2,1999,3998),

(7,7,1,1499,1499),

(8,13,1,799,799),

(9,14,1,599,599),

(10,12,1,7999,7999),

(1,22,1,1899,1899),

(2,18,1,999,999),

(3,24,3,189,567),

(4,25,2,169,338),

(5,5,1,28999,28999);

-- ==========================================================
-- TABLE 14 : PAYMENTS
-- ==========================================================

INSERT INTO payments
(order_id,payment_method,payment_status,transaction_id,amount)
VALUES

(1,'UPI','Success','TXN10001',79999),

(2,'Credit Card','Success','TXN10002',74999),

(3,'Debit Card','Success','TXN10003',5999),

(4,'UPI','Pending','TXN10004',3499),

(5,'Cash on Delivery','Pending','TXN10005',1299),

(6,'Net Banking','Success','TXN10006',699),

(7,'Credit Card','Success','TXN10007',2499),

(8,'UPI','Failed','TXN10008',999),

(9,'Cash on Delivery','Pending','TXN10009',189),

(10,'Debit Card','Success','TXN10010',4299);

-- ==========================================================
-- TABLE 15 : INVOICES
-- ==========================================================

INSERT INTO invoices
(order_id,invoice_number,total_amount)
VALUES

(1,'INV10001',79999),

(2,'INV10002',74999),

(3,'INV10003',5999),

(4,'INV10004',3499),

(5,'INV10005',1299),

(6,'INV10006',699),

(7,'INV10007',2499),

(8,'INV10008',999),

(9,'INV10009',189),

(10,'INV10010',4299);

-- ==========================================================
-- TABLE 16 : RECENTLY_VIEWED
-- ==========================================================

INSERT INTO recently_viewed
(customer_id,product_id)
VALUES

(1,1),
(1,5),
(1,14),

(2,2),
(2,6),
(2,20),

(3,3),
(3,8),
(3,18),

(4,4),
(4,10),
(4,16),

(5,7),
(5,13),
(5,23),

(6,11),
(6,21),

(7,12),
(7,22),

(8,15),
(8,24),

(9,17),
(9,25),

(10,9),
(10,19);

SELECT COUNT(*) FROM admins;
SELECT COUNT(*) FROM customers;
SELECT COUNT(*) FROM categories;
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM product_images;
SELECT COUNT(*) FROM inventory;
SELECT COUNT(*) FROM cart;
SELECT COUNT(*) FROM wishlist;
SELECT COUNT(*) FROM orders;
SELECT COUNT(*) FROM notifications;
SELECT COUNT(*) FROM cart_items;
SELECT COUNT(*) FROM wishlist_items;
SELECT COUNT(*) FROM order_items;
SELECT COUNT(*) FROM payments;
SELECT COUNT(*) FROM invoices;
SELECT COUNT(*) FROM recently_viewed;