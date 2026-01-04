# Node.js Movie Catalog Service

This is a Twelve-Factor App compliant movie catalog service built with Node.js, Express, and Sequelize, using TypeScript. It provides a CRUD API for movies, with authentication and authorization (admin only for write operations).

The service is designed to work with an external authentication service (e.g., `behemoth/nodejs-auth-service`). It uses asymmetric (RSA) encryption for JWT verification, requiring the public key from the auth service.

## Features

- **Movie Catalog:** View all movies with pagination and get details by ID.
- **Admin CRUD:** Add, update, and delete movies (Admin only).
- **External Integration:** Add movies automatically using IMDb IDs via the OMDB API.
- **Monitoring:** Prometheus metrics endpoint.
- **Twelve-Factor Compliant:** Config via environment variables, stateless processes, graceful shutdown, etc.

## Technologies Used

- **Backend:** Node.js, Express.js
- **ORM:** Sequelize
- **Database:** SQLite (default), supports MySQL and PostgreSQL via config.
- **Language:** TypeScript
- **Authentication:** JWT (RS256)
- **Monitoring:** Prometheus (prom-client)
- **Logging:** Pino (JSON logging)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [npm](https://www.npmjs.com/)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd nodejs-catalog-service
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```

### Docker

1.  Build the Docker image:
    ```bash
    docker build -t localhost:5000/behemoth-nodejs-catalog-service .
    ```
2.  Run the Docker image:
    ```bash
    docker run -d -p 3020:3020 --env-file ./.env -v /home/alfath/keys:/usr/src/app/keys --network your_shared_network --name behemoth-catalog-service localhost:5000/behemoth-nodejs-catalog-service
    ```
3.  Tips run the development server on docker container (make sure your postgres container is running on the same network)
    ```bash
    docker run --rm -v $(pwd):/app -w /app -p 3020:3020 --network proxy node:lts-alpine sh -c "npm install && npm run dev -- --host 0.0.0.0"
    ```

### Configuration

Create a `.env` file in the root of the project. Refer to `.env.example` for all available options.

```env
DB_HOST=shared_postgres (make sure the container and postgres container in the same network)
DB_HOST=localhost (if you are running postgres locally)
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_password
PORT=3020
NODE_ENV=development
DB_DIALECT=postgres
```

### Public Keys

Place the `public.pem` key from your authentication service in the `keys/` directory (or set `JWT_PUBLIC_KEY_PATH`).

## Available Scripts

### `npm run dev`

Runs the app in development mode using `nodemon`.

### `npm run build`

Compiles TypeScript to JavaScript in the `dist` folder.

### `npm start`

Runs the compiled app in production mode.

## API Endpoints

- `GET /get?page=1&size=10` - List all movies (paginated).
- `GET /get/:id` - Get movie details by ID.
- `POST /add` - Manually add a movie.
- `POST /add-imdb` - Add a movie using IMDb ID (`{"imdbId": "tt..."}`).
- `PUT /update/:id` - Update movie details.
- `DELETE /delete/:id` - Delete a movie.

### Monitoring

- `GET /metrics` - Prometheus metrics.

### Miscelaneous

#### Liveness Check

- **URL:** `/health/liveness`
- **Method:** `GET`
- **Description:** Returns a 200 OK response if the service is live.

#### Readiness Check

- **URL:** `/health/readyness`
- **Method:** `GET`
- **Description:** Returns a 200 OK response if the service is ready.

#### Startup Check

- **URL:** `/health/startup`
- **Method:** `GET`
- **Description:** Returns a 200 OK response if the service is started.

## Twelve-Factor App Compliance

This project adheres to the Twelve-Factor App methodology:

- **Config:** All configurations are handled through environment variables.
- **Backing Services:** Database is treated as an attached resource.
- **Disposability:** Implements graceful shutdown handlers for `SIGTERM` and `SIGINT`.
- **Logs:** Streams logs to `stdout` using Pino.
- **Dev/Prod Parity:** High parity achieved via environment-based configuration.
