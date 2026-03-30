# Product Management System

A full-featured product management platform with RESTful API, JWT authentication, pagination, and role-based access control. Built with **Java Spring Boot** (backend), **React.js** (frontend), and **MySQL/H2** (database).

## Features

### Core
- **CRUD Operations** – Create, Read, Update, Delete product records
- **Product Details** – ID, Name, Category, Price, Stock quantity, Description

### API
- **RESTful Design** – Consistent endpoints and HTTP semantics
- **Pagination & Sorting** – `page`, `size`, `sortBy`, `sortDir` query params
- **Filtering** – `category`, `search`, `minPrice`, `maxPrice`
- **Global Exception Handling** – Centralized `@ControllerAdvice` with structured `ApiError` responses
- **Bean Validation** – `@Valid`, `@NotNull`, `@Size` on all inputs

### Security
- **JWT Authentication** – Login at `/api/auth/login`, Bearer token for protected endpoints
- **Role-Based Access Control (RBAC)** – `ADMIN` (full access), `USER` (create/update)
- **Spring Security** – Stateless session, password encoding

### Documentation & Ops
- **OpenAPI / Swagger UI** – Interactive API docs at `/swagger-ui.html`
- **Spring Boot Actuator** – Health, info, metrics at `/actuator`
- **Structured Logging** – Logback with dev/prod/test profiles
- **Environment Profiles** – `dev` (H2), `prod` (MySQL), `test` (H2)

### Quality & Deployment
- **Unit & Integration Tests** – JUnit 5, MockMvc, `@WithMockUser`
- **Docker** – Dockerfile + docker-compose for backend, frontend, MySQL
- **CI/CD Ready** – GitHub Actions workflow

## Tech Stack

| Layer    | Technology                |
|----------|---------------------------|
| Backend  | Spring Boot 3.2, Spring Security, Spring Data JPA |
| Frontend | React 18, Vite            |
| Database | H2 (dev/test), MySQL (prod) |

## Prerequisites

- **Java 17+**
- **Node.js 20+** and npm
- **MySQL 8** (for production) – optional for dev (uses H2)

## Quick Start

### 1. Start Backend (dev – H2 in-memory)

```bash
cd backend
./mvnw spring-boot:run
```

On Windows:
```powershell
cd backend
mvnw.cmd spring-boot:run
```

The API runs at `http://localhost:8080`. Swagger UI: `http://localhost:8080/swagger-ui.html`.

### 2. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:5173`.

### 3. Login

Default users:

| Username | Password | Role  |
|----------|----------|-------|
| admin    | admin123 | ADMIN |
| user     | user123  | USER  |

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST   | `/api/auth/login` | No  | Login, returns JWT |
| GET    | `/api/products` | No  | List (paginated, sortable, filterable) |
| GET    | `/api/products/{id}` | No | Get by ID |
| POST   | `/api/products` | USER/ADMIN | Create product |
| PUT    | `/api/products/{id}` | USER/ADMIN | Update product |
| DELETE | `/api/products/{id}` | ADMIN | Delete product |

**Query params for GET /api/products:** `page`, `size`, `sortBy`, `sortDir`, `category`, `search`, `minPrice`, `maxPrice`.

## Docker

```bash
docker-compose up -d
```

- Backend: `http://localhost:8080`
- Frontend: `http://localhost:5173`
- MySQL: port 3306

## Configuration

- **Profiles:** `dev` (default, H2), `prod` (MySQL), `test`
- **Environment vars:** `SPRING_PROFILES_ACTIVE`, `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `JWT_SECRET`, `JWT_EXPIRATION_MS`

## Project Structure

```
product/
├── backend/
│   ├── src/main/java/com/productmanagement/
│   │   ├── controller/      # ProductController, AuthController
│   │   ├── service/         # ProductService
│   │   ├── repository/      # ProductRepository, UserRepository
│   │   ├── entity/          # Product, User
│   │   ├── dto/             # PageResponse, AuthRequest, AuthResponse, ApiError
│   │   ├── exception/       # GlobalExceptionHandler, ResourceNotFoundException
│   │   ├── security/        # JwtService, JwtAuthenticationFilter, UserDetailsServiceImpl
│   │   ├── config/          # SecurityConfig, OpenApiConfig, DataLoader
│   │   └── specification/   # ProductSpecification
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   ├── application-dev.yml
│   │   ├── application-prod.yml
│   │   ├── application-test.yml
│   │   └── logback-spring.xml
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/      # ProductList, ProductForm, Header, Login
│   │   └── services/        # productApi, authApi, authStore
│   └── Dockerfile
├── docker-compose.yml
├── .github/workflows/ci.yml
└── README.md
```
