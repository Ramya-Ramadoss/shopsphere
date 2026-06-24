# ShopSphere Quick Start Guide

This guide provides step-by-step instructions to open, build, run, and test the ShopSphere backend application on your local Windows machine.

---

## 1. Prerequisites
Ensure you have the following installed:
- **Java JDK 21**
- **PostgreSQL** (with a database named `shopsphere_db` created)
- **Git** (optional)

---

## 2. Step-by-Step Instructions

### Step 2.1: Open the Project Folder
Open your terminal (PowerShell or Command Prompt) and navigate to the backend project directory:
```powershell
cd "d:\Projects and Hackathons\Shopsphere\shopsphere"
```

### Step 2.2: Clean and Build the Project
Compile the code, run automated tests, and package the application into a deployable JAR file:
```powershell
.\mvnw clean package
```
*Note: If you want to skip running unit tests during the build, append the skip-tests flag:*
```powershell
.\mvnw clean package -DskipTests
```

### Step 2.3: Run the Spring Boot Backend
Start the application on port `8080`:
```powershell
.\mvnw spring-boot:run
```
Leave this terminal window open. The server will print logs and notify you once initialization is complete:
`Started ShopsphereApplication in X.XXX seconds`

---

## 3. Accessing Swagger and API Documentation

Once the server is running, open your web browser and navigate to the following URLs:

### 3.1 Interactive Swagger UI (Test Endpoints)
- **URL**: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
- **How to resolve the Petstore default template issue**:
  1. If you see the "Petstore Everything about your Pets" template, look at the **Explore** text input field at the very top header of the Swagger UI page.
  2. Clear the input box and type: **`/v3/api-docs`** (or `http://localhost:8080/v3/api-docs`).
  3. Click the **Explore** button next to it to load the ShopSphere endpoints.
  4. Press **`Ctrl + F5`** (Hard Reload) to clear any cached templates from your browser.

### 3.2 Raw OpenAPI Specification (JSON metadata)
- **URL**: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

---

## 4. Alternative: Run Containerized (Docker)

If you prefer to run the entire backend and database stack isolated inside Docker containers:

1. **Build and Start Container Services**:
   ```bash
   docker compose up --build -d
   ```
2. **Examine Container Boot Logs**:
   ```bash
   docker compose logs -f app
   ```
3. **Stop Container Services**:
   ```bash
   docker compose down
   ```
4. **done**