# How to Run the Complete ShopSphere Application

This guide contains step-by-step instructions on setting up the database, booting up the Spring Boot backend server, and launching the React Vite frontend application for **ShopSphere**.

---

## 🗄️ Step 1: Database Setup (PostgreSQL)

The Spring Boot backend connects to a PostgreSQL database instance.

1. **Verify/Install PostgreSQL**: Ensure you have PostgreSQL installed on your machine.
2. **Start the Database Service**: Make sure your local PostgreSQL service is running on the default port `5432`.
3. **Configure Database Credentials**:
   - Open the Spring Boot configurations at `shopsphere/src/main/resources/application.properties`.
   - Update the datasource credentials to match your PostgreSQL instance (e.g., if your PostgreSQL password is not `student123`):
     ```properties
     spring.datasource.url=jdbc:postgresql://localhost:5432/shopsphere_db
     spring.datasource.username=postgres
     spring.datasource.password=YOUR_POSTGRES_PASSWORD_HERE
     ```
4. **Create the Database and Schema**:
   - Run the SQL scripts located in the `database` folder:
     - [create_database.sql](file:///d:/Projects%20and%20Hackathons/Shopsphere/database/create_database.sql): Connect to your default server database and run this script to initialize `shopsphere_db`.
     - [create_tables.sql](file:///d:/Projects%20and%20Hackathons/Shopsphere/database/create_tables.sql): Switch your database connection to `shopsphere_db` and run this script to create the necessary tables.
     - [sample_data.sql](file:///d:/Projects%20and%20Hackathons/Shopsphere/database/sample_data.sql): Execute this script to populate sample product collections, users, and admin credentials.

---

## ☕ Step 2: Run the Spring Boot Backend (Run ONLY One)

The backend runs on port **8080**. You must only run it **once** using either **Method A** OR **Method B**. Running both will cause a "Port 8080 was already in use" conflict.

### Method A: Run via your IDE (IntelliJ IDEA, Eclipse, VS Code) - Recommended
1. Open the `shopsphere` folder in your IDE.
2. Let the IDE import Maven dependencies.
3. Locate the main application file: `src/main/java/com/shopsphere/ShopsphereApplication.java` (or run/debug the `ShopsphereApplication` class).
4. Click **Run** or **Debug**. The IDE will launch the server on port `8080`.

### Method B: Run via Terminal (Command Line)
1. Open a new terminal (e.g. PowerShell or Command Prompt).
2. Navigate to the backend project folder:
   ```powershell
   cd "d:\Projects and Hackathons\Shopsphere\shopsphere"
   ```
3. Build and package the project:
   ```powershell
   .\mvnw clean package -DskipTests
   ```
4. Boot the server:
   ```powershell
   .\mvnw spring-boot:run
   ```

---

## 🛑 How to Resolve: "Port 8080 was already in use"

If you see this error, another process (such as your IDE run instance or a previous background terminal) is already running on port 8080.

### Option 1: Stop the active run in your IDE
If you have your IDE open, look for a running instance of `ShopsphereApplication` and click the red **Stop** button.

### Option 2: Kill the process on port 8080 via PowerShell
If a background process is locking port 8080, open PowerShell as an administrator and run:

1. **Find the Process ID (PID)**:
   ```powershell
   Get-NetTCPConnection -LocalPort 8080
   ```
   Look at the `OwningProcess` column to find the PID.

2. **Terminate the process**:
   ```powershell
   Stop-Process -Id <PID> -Force
   ```
   *(Replace `<PID>` with the actual process ID number, e.g. `Stop-Process -Id 12456 -Force`)*

### Option 3: Kill the process on port 8080 via CMD
Alternatively, in Command Prompt:
1. Find the PID:
   ```cmd
   netstat -ano | findstr :8080
   ```
2. Kill the process:
   ```cmd
   taskkill /PID <PID> /F
   ```

---

## ⚛️ Step 3: Run the React Vite Frontend

1. Open a terminal console.
2. Navigate to the root directory of the project:
   ```powershell
   cd "d:\Projects and Hackathons\Shopsphere"
   ```
3. Install frontend dependencies:
   ```bash
   npm install
   ```
4. Launch the local Vite development server:
   ```bash
   npm run dev
   ```
5. The frontend is now running at [http://localhost:5173](http://localhost:5173).
