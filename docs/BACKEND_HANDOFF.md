# ShopSphere Backend Handoff Report

Welcome to the **ShopSphere** Enterprise Backend. This document provides a complete technical handover of the upgraded backend service, detailing its architecture, database schemas, REST APIs, security design, logging, test results, and deployment guidelines.

---

## 1. Project Overview

ShopSphere has been upgraded from a basic CRUD utility into a production-ready, enterprise-grade e-commerce backend service. Built using **Spring Boot 3.x**, **Java 21**, **Spring Data JPA**, **PostgreSQL**, and **Spring Security**, the backend is 100% feature-complete and stable.

### Tech Stack Summary
- **Core Framework**: Spring Boot 3.x (Spring Boot v4.1.0-compatible parent dependency structure)
- **Programming Language**: Java 21 (LTS)
- **Database**: PostgreSQL (relational mapping, custom native queries)
- **Security**: Spring Security 6.x & JSON Web Token (JWT) with HS256 sign key encryption
- **Logging**: SLF4J with Logback console & daily rolling file rotation
- **Testing**: JUnit 5, Mockito (100% test compile & run success)
- **Containerization**: Multi-stage Docker & docker-compose configurations

---

## 2. Directory & Component Architecture

The codebase follows standard Spring Boot package conventions:
- `com.shopsphere`
  - `config`: Configuration beans, including database initialization, Swagger config, and `SecurityConfig.java`.
  - `controller`: `@RestController` classes exposing REST APIs.
  - `dto`: Request and response data transfer objects.
    - `request`: Input payloads with validations (`@NotNull`, `@Email`, `@Size`, etc.).
    - `response`: Outgoing payloads, including the unified `ApiResponse` envelope.
  - `entity`: JPA entities mapping to the database (inheriting common fields like `id`, `createdAt`, `updatedAt` from `BaseEntity`).
  - `enums`: Global enum types (`Role`, `OrderStatus`).
  - `exception`: Custom domain exceptions and the `GlobalExceptionHandler` mapping errors to the `ApiResponse` structure.
  - `mapper`: MapStruct and helper mappers translating entities to/from DTOs.
  - `repository`: JPA repositories defining database CRUD operations and custom native queries.
  - `security`: Components for JWT filters, token providers, user details, and access entry points.
  - `service` & `serviceImpl`: Business logic definition and implementation.

---

## 3. Database Schema & Key Relationships

The PostgreSQL database maintains the following key relationships:
1. **Customer**:
   - `OneToOne` with `Cart`
   - `OneToOne` with `Wishlist`
   - `OneToMany` with `Order`
   - `OneToMany` with `RecentlyViewed`
   - `OneToMany` with `Review`
   - `OneToMany` with `Notification`
2. **Category**:
   - `OneToMany` with `Product`
3. **Product**:
   - `OneToOne` with `Inventory` (mapped on product ID, properties: `quantity`, `reservedQuantity`, `inStock`)
   - `OneToMany` with `Review`
   - `OneToMany` with `ProductImage`
4. **Cart**:
   - `OneToMany` with `CartItem` (sum of cart item quantities represents total cart size)
5. **Wishlist**:
   - `OneToMany` with `WishlistItem`
6. **Order**:
   - `OneToMany` with `OrderItem` (captures historic snapshots of `unitPrice` and `quantity`)
   - `OneToOne` with `Payment` (captures transaction ID and simulated gateway state)
   - `OneToOne` with `Invoice` (stores calculated tax, shipping, and total amount)

---

## 4. Key Milestones & Enterprise Features Implemented

### 4.1 Authentication & Security (JWT)
- **BCrypt Encryption**: Enforced BCrypt encryption for passwords on user creation and updates (`Customer` and `Admin`).
- **Unified Auth**: Custom `UserDetails` and `UserDetailsService` query both `AdminRepository` and `CustomerRepository` based on email identifiers.
- **Access Controls**: Exposes `/auth/login` to generate bearer tokens containing user details (ID, role, email, name). Locked down administrative endpoints (`/admin/**`, `/reports/**`, `/dashboard/admin`) to `ADMIN` roles, while protecting orders, carts, and wishlists for `CUSTOMER` roles.

### 4.2 Payments
- **Simulation**: Implements UPI, Card, Net Banking, and COD simulated processing.
- **Workflow Integration**: Non-COD orders execute payments directly; COD orders set the payment status to `PENDING` until delivery.
- **Transaction Logs**: Each payment generates a unique transaction code: `TXN-<UUID>` and transitions the order status to `CONFIRMED` on payment success.

### 4.3 Invoices
- **Financial Logic**: Calculates 18% GST (tax) and shipping fees (flat Rs. 100, free for order amounts exceeding Rs. 2,000).
- **Downloadable Summary**: Generates clean, human-readable text file summaries with structured tables containing order items, tax breakdowns, and final totals. Exposes the files as file attachments (`Content-Disposition`).

### 4.4 Notifications
- **Automated Triggers**: Automatically posts notifications to the customer database for events such as `Order Placed`, `Order Cancelled`, `Payment Success`, `Payment Failed`, and `Order Status Update` (e.g. Shipped or Delivered).
- **Stock Alerts**: Flags stock warnings in notifications when product catalog items drop below 10 units.

### 4.5 Dashboards & Reports
- **Customer Dashboard**: Computes wishlist count, total cart size, active non-delivered orders, and recent viewing history.
- **Admin Dashboard**: Consolidates total revenue, order count, customer volume, and items with low stock.
- **Report Aggregations**: Generates JSON summaries for monthly sales, top-selling items, top-spending customers, and total catalog assets.

### 4.6 Advanced Search APIs
- **JPA Specifications**: The product query API dynamically builds search filters using criteria builder objects (category, brand, availability, price ranges).
- **Pagination & Sorting**: Seamlessly handles page indices, size limits, and multi-field sorting configurations (e.g., `price,desc`).

### 4.7 Validation & Exception Wrapper
- **ApiResponse Wrapper**: Envelops all controller outputs in a unified JSON structure:
  ```json
  {
    "success": true,
    "message": "Operation completed successfully",
    "data": { ... }
  }
  ```
- **Error Handlers**: Traps validation errors, user access issues, and resource mismatches, formatting them into clear validation reports.

---

## 5. REST API Documentation Summary

### 5.1 Authentication (`/auth`)
- **Login**: `POST /auth/login`
  - Payload: `{ "email": "...", "password": "..." }`
  - Response: `{ "token": "...", "role": "...", "fullName": "..." }`

### 5.2 Product Catalog (`/products` & `/categories`)
- **Advanced Query**: `GET /products/filter`
  - Params: `name`, `categoryId`, `brand`, `minPrice`, `maxPrice`, `available`, `page`, `size`, `sort`.
- **Search**: `GET /products/search?query={searchTerm}`

### 5.3 Order Lifecycle & Payments (`/orders` & `/payments`)
- **Checkout**: `POST /orders/place` (converts cart to order, deducts stock, clears cart)
- **Simulate Payment**: `POST /payments/process`
  - Payload: `{ "orderId": 12, "amount": 1999.00, "paymentMethod": "UPI" }`
- **Admin Status Update**: `PUT /orders/update-status/{id}?status={status}`
  - Statuses: `PENDING`, `CONFIRMED`, `PACKED`, `SHIPPED`, `DELIVERED`, `CANCELLED`.

### 5.4 Invoices (`/invoices`)
- **Generate**: `POST /invoices/generate/{orderId}`
- **Download TXT Summary**: `GET /invoices/download/{invoiceId}`

### 5.5 Notifications (`/notifications`)
- **Get Customer Notifications**: `GET /notifications/customer/{customerId}`
- **Get Unread Count**: `GET /notifications/unread-count/{customerId}`
- **Mark as Read**: `PUT /notifications/read/{id}`

---

## 6. Local Setup & Docker Instructions

### Standalone Local Execution
1. Create a database in PostgreSQL: `CREATE DATABASE shopsphere_db;`.
2. Configure credentials in `src/main/resources/application.properties`.
3. Compile and verify code:
   ```bash
   ./mvnw clean package
   ```
4. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```

### Docker Execution
Run the complete application stack (app + database) in isolated container systems:
```bash
# Build multi-stage containers
docker compose build

# Startup background services
docker compose up -d

# View app container log traces
docker compose logs -f app
```

---

## 7. Verification & Test Metrics
All tests run and compile successfully. Run unit tests using:
```bash
./mvnw test
```
The test suite validates:
- **JwtTokenProviderTest**: Validates token generation, validity checks, and extraction of custom user claims.
- **OrderServiceTest**: Evaluates cart checkouts, stock checking logic, and cancellation transitions.
- **PaymentServiceTest**: Verifies mock transactions, success flows, and database linkages.

The backend service is fully optimized and ready for frontend integration!
