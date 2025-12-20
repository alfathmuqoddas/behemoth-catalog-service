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
    docker run -d -p 3010:3000 --env-file ./.env -e DB_HOST=host.docker.internal -v /home/alfath/keys:/usr/src/app/keys --add-host=host.docker.internal:host-gateway --name behemoth-catalog-service localhost:5000/behemoth-nodejs-catalog-service
    ```

### Configuration

Create a `.env` file in the root of the project. Refer to `.env.example` for all available options.

```bash
PORT=3000
NODE_ENV=development
DB_DIALECT=sqlite
DB_STORAGE=:memory:
DB_SYNC=true
JWT_PUBLIC_KEY_PATH=keys/public.pem
OMDB_API_KEY=your_omdb_api_key_here
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

## Twelve-Factor App Compliance

This project adheres to the Twelve-Factor App methodology:

- **Config:** All configurations are handled through environment variables.
- **Backing Services:** Database is treated as an attached resource.
- **Disposability:** Implements graceful shutdown handlers for `SIGTERM` and `SIGINT`.
- **Logs:** Streams logs to `stdout` using Pino.
- **Dev/Prod Parity:** High parity achieved via environment-based configuration.
