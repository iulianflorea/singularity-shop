# Singularity Shop

Full-stack online shop with Spring Boot 3.x backend and Angular 17+ frontend.

## Prerequisites

- Java 21
- Maven 3.9+
- Node.js 20+, npm
- MySQL 8+
- Angular CLI (`npm install -g @angular/cli`)

## Backend Setup

```bash
cd backend

# Create database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS singularity_shop CHARACTER SET utf8mb4;"

# Copy and fill env vars
cp ../.env.example .env

# Run with env vars exported
export DB_PASSWORD=yourpassword
export PAYMENT_SERVICE_API_KEY=yourkey
export JWT_SECRET=your-secret-min-32-chars
mvn spring-boot:run
```

Backend runs on `http://localhost:8091`.

## Frontend Setup

```bash
cd frontend

npm install

# Development server
ng serve

# Production build
ng build --configuration=production
```

Frontend runs on `http://localhost:4200`.

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DB_URL` | MySQL JDBC URL | `jdbc:mysql://localhost:3306/singularity_shop` |
| `DB_USERNAME` | DB username | `root` |
| `DB_PASSWORD` | DB password | *(required)* |
| `PAYMENT_SERVICE_URL` | Payment microservice base URL | `https://pay.singularity-cloud.com` |
| `PAYMENT_SERVICE_API_KEY` | Internal API key for payment service | *(required)* |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | *(required)* |
| `SERVER_PORT` | Backend port | `8091` |

## API Overview

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/products` | No | List products (pagination, search, category) |
| GET | `/api/v1/products/:id` | No | Product detail |
| GET | `/api/v1/products/category/:cat` | No | Products by category |
| POST | `/api/v1/products` | Yes | Create product |
| PUT | `/api/v1/products/:id` | Yes | Update product |
| DELETE | `/api/v1/products/:id` | Yes | Soft-delete product |
| POST | `/api/v1/cart/calculate` | No | Calculate cart total with tax |
| POST | `/api/v1/customers/register` | No | Register + create in payment service |
| POST | `/api/v1/customers/login` | No | Login — returns JWT |
| GET | `/api/v1/customers/me` | Yes | Current customer profile |
| POST | `/api/v1/orders` | Yes | Create order + call payment intent |
| GET | `/api/v1/orders/:id` | Yes | Order details |
| GET | `/api/v1/orders/customer/:id` | Yes | Customer order history |
| POST | `/api/v1/orders/:id/confirm` | Yes | Confirm payment, update status |

## Checkout Flow

1. User fills shipping form on `/checkout`
2. Angular calls `POST /api/v1/orders` → receives `{ orderId, clientSecret, totalAmount }`
3. Backend calls `POST https://pay.singularity-cloud.com/api/v1/payments/intent`
4. Angular calls `stripe.confirmCardPayment(clientSecret, { card })`
5. On success → Angular calls `POST /api/v1/orders/{orderId}/confirm`
6. Backend calls `POST https://pay.singularity-cloud.com/api/v1/payments/confirm`
7. Order status → `CONFIRMED` → redirect to `/order-confirmation/:orderId`

## Project Structure

```
singularity-shop/
├── backend/                    # Spring Boot 3.x, Java 21, MySQL
│   └── src/main/java/com/singularity/shop/
│       ├── config/             # Security, CORS, RestTemplate
│       ├── controller/         # REST controllers
│       ├── service/            # Business logic
│       ├── repository/         # Spring Data JPA
│       ├── entity/             # JPA entities
│       ├── dto/                # Request / Response DTOs
│       ├── client/             # PaymentServiceClient (RestTemplate)
│       ├── security/           # JWT util, filter, UserDetailsService
│       └── exception/          # GlobalExceptionHandler
├── frontend/                   # Angular 17+
│   └── src/app/
│       ├── pages/              # Home, Products, Cart, Checkout, Orders, Login, Register
│       ├── components/         # Navbar, Footer, ProductCard, Toast, Skeleton, EmptyState
│       ├── services/           # Product, Cart, Order, Auth, Stripe, Toast
│       ├── models/             # TypeScript interfaces
│       ├── interceptors/       # JWT auth interceptor
│       └── guards/             # Auth guard
├── .env.example
├── .gitignore
└── README.md
```

## Stripe Integration

Load key in `frontend/src/environments/environment.ts`:

```ts
export const environment = {
  stripePublishableKey: 'pk_live_...'
};
```

Stripe.js is loaded from CDN in `index.html`. Card input uses Stripe Elements — no custom card fields.

## CORS

Backend allows:
- `https://shop.singularity-cloud.com` (production)
- `http://localhost:4200` (development)
