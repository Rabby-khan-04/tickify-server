# Tickify Server

Backend REST API for **Tickify** — a cinema ticketing platform. Built with Node.js, Express, and MongoDB.

---

## Tech Stack

| Layer      | Technology                           |
| ---------- | ------------------------------------ |
| Runtime    | Node.js (ES Modules)                 |
| Framework  | Express 5                            |
| Database   | MongoDB via Mongoose                 |
| Auth       | JWT (access + refresh token pattern) |
| Payments   | Stripe                               |
| Movie Data | TMDB API                             |
| Dev Tools  | Nodemon, dotenv                      |

---

## Project Structure

```
src/
├── controllers/      # Route handlers
├── middleware/        # Auth & admin guards
├── models/           # Mongoose schemas
├── routes/           # Express routers
└── index.js          # Entry point
```

---

## API Routes

Base URL: `/api/v1`

### Auth — `/auth`

| Method | Endpoint                | Access | Description                   |
| ------ | ----------------------- | ------ | ----------------------------- |
| POST   | `/register`             | Public | Register a new user           |
| PATCH  | `/me`                   | JWT    | Update current user profile   |
| POST   | `/jwt`                  | Public | Issue JWT from Firebase token |
| POST   | `/refresh-access-token` | Public | Refresh access token          |
| POST   | `/logout`               | Public | Logout user                   |

---

### Users — `/users`

| Method | Endpoint                    | Access      | Description                 |
| ------ | --------------------------- | ----------- | --------------------------- |
| GET    | `/`                         | JWT + Admin | Get all users               |
| GET    | `/me`                       | JWT         | Get current user            |
| POST   | `/favorite/:movieId`        | JWT         | Add movie to favorites      |
| POST   | `/remove-favorite/:movieId` | JWT         | Remove movie from favorites |
| GET    | `/favorites`                | JWT         | Get favorite movies         |

---

### Movies — `/movies`

| Method | Endpoint          | Access      | Description                         |
| ------ | ----------------- | ----------- | ----------------------------------- |
| GET    | `/now-playing`    | Public      | Now playing movies                  |
| GET    | `/upcoming`       | Public      | Upcoming movies                     |
| GET    | `/all`            | Public      | All movies (paginated + filterable) |
| GET    | `/filter-options` | Public      | Available filter options            |
| GET    | `/:movieId`       | Public      | Movie details by ID                 |
| GET    | `/movie/:movieId` | Public      | Movie by MongoDB ID                 |
| GET    | `/`               | JWT + Admin | All movies (admin view)             |
| GET    | `/movies-count`   | JWT + Admin | Total movie count                   |
| PATCH  | `/movie/:movieId` | JWT + Admin | Update a movie                      |

---

### Showtimes — `/showtimes`

| Method | Endpoint                    | Access      | Description                    |
| ------ | --------------------------- | ----------- | ------------------------------ |
| POST   | `/`                         | JWT + Admin | Add a new showtime             |
| GET    | `/all`                      | JWT + Admin | Get all showtimes              |
| GET    | `/upcoming`                 | Public      | Upcoming showtimes             |
| GET    | `/:showId`                  | Public      | Get a specific showtime        |
| GET    | `/movie/:movieId`           | Public      | Showtimes for a movie          |
| POST   | `/booked-seats/:showtimeId` | Public      | Get booked seats for a session |

---

### Theaters — `/theaters`

| Method | Endpoint      | Access      | Description            |
| ------ | ------------- | ----------- | ---------------------- |
| POST   | `/`           | JWT + Admin | Add a theater          |
| GET    | `/`           | JWT + Admin | Get all theaters       |
| GET    | `/:theaterId` | Public      | Get a specific theater |
| DELETE | `/:theaterId` | JWT + Admin | Delete a theater       |

---

### Bookings — `/bookings`

| Method | Endpoint            | Access      | Description                 |
| ------ | ------------------- | ----------- | --------------------------- |
| POST   | `/:date/:time`      | JWT         | Book seats for a showtime   |
| GET    | `/my`               | JWT         | Get current user's bookings |
| GET    | `/my-booking-count` | JWT         | Get booking count           |
| GET    | `/my/:bookingId`    | JWT         | Get a specific booking      |
| GET    | `/:showtimeId`      | JWT + Admin | Bookings for a showtime     |
| GET    | `/`                 | JWT + Admin | All bookings                |

---

### Payments — `/payments`

Stripe-powered checkout. Handles session creation and webhook events.

---

### Contact — `/contact`

| Method | Endpoint  | Access | Description                   |
| ------ | --------- | ------ | ----------------------------- |
| POST   | `/submit` | Public | Submit a contact form message |

---

### Dashboard — `/dashboard`

| Method | Endpoint  | Access      | Description                    |
| ------ | --------- | ----------- | ------------------------------ |
| GET    | `/stats`  | JWT + Admin | Platform-wide stats            |
| GET    | `/charts` | JWT + Admin | Chart data for admin dashboard |

---

## Installation

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Stripe account
- TMDB API account

### 1. Clone the repository

```bash
git clone https://github.com/your-username/tickify-server.git
cd tickify-server
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
# Server
PORT=4000
NODE_ENV=development

# Database
MONGODB_URI=your_mongodb_connection_string

# CORS
CORS_ORIGIN=http://localhost:3000

# JWT
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1h
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d

# TMDB
TMDB_ACCESS_TOKEN=your_tmdb_bearer_token

# Stripe
STRIPE_PK=pk_test_...
STRIPE_SK=sk_test_...
STRIPE_WEBHOOK_KEY=whsec_...
```

> ⚠️ Never commit your `.env` file. Add it to `.gitignore`.

### 4. Run the development server

```bash
npm run dev
```

### 5. Run in production

```bash
npm start
```

The server will start on `http://localhost:4000` by default.

---

## Environment Variables Reference

| Variable               | Required | Description                         |
| ---------------------- | -------- | ----------------------------------- |
| `PORT`                 | Yes      | Port the server runs on             |
| `NODE_ENV`             | Yes      | `development` or `production`       |
| `MONGODB_URI`          | Yes      | MongoDB Atlas connection string     |
| `CORS_ORIGIN`          | Yes      | Allowed frontend origin             |
| `ACCESS_TOKEN_SECRET`  | Yes      | Secret for signing access JWTs      |
| `ACCESS_TOKEN_EXPIRY`  | Yes      | Access token lifetime (e.g. `1h`)   |
| `REFRESH_TOKEN_SECRET` | Yes      | Secret for signing refresh JWTs     |
| `REFRESH_TOKEN_EXPIRY` | Yes      | Refresh token lifetime (e.g. `10d`) |
| `TMDB_ACCESS_TOKEN`    | Yes      | TMDB API v4 bearer token            |
| `STRIPE_PK`            | Yes      | Stripe publishable key              |
| `STRIPE_SK`            | Yes      | Stripe secret key                   |
| `STRIPE_WEBHOOK_KEY`   | Yes      | Stripe webhook signing secret       |

---

## Auth Flow

```
1. Client authenticates with Firebase
2. Client sends Firebase ID token to POST /api/v1/auth/jwt
3. Server verifies token, issues access + refresh JWT pair
4. Client includes access token in Authorization: Bearer <token> header
5. On expiry, client calls POST /api/v1/auth/refresh-access-token
```

---

## License

MIT
