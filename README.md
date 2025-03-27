# Wishlist Application

A Go-based REST API for managing wishlists with authentication, PostgreSQL database, and Kubernetes deployment.

## Features

- REST API with authentication
- PostgreSQL database with migrations
- Prometheus metrics
- Structured logging with Zap
- Kubernetes deployment
- CI/CD with GitHub Actions
- Swagger documentation
- Health check endpoint
- Docker containerization

## Prerequisites

- Go 1.21 or later
- PostgreSQL 13 or later
- Docker
- Kubernetes cluster (for deployment)
- kubectl (for deployment)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/wishlist.git
cd wishlist
```

2. Install dependencies:
```bash
go mod download
```

3. Set up environment variables:
```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_USER=wishlist
export DB_PASSWORD=your_password
export DB_NAME=wishlist
```

4. Run migrations:
```bash
go run cmd/migrate/main.go
```

5. Run the application:
```bash
go run cmd/app/main.go
```

## API Endpoints

- `GET /healthcheck` - Health check endpoint
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/wishlists` - Get user's wishlists
- `POST /api/v1/wishlists` - Create new wishlist
- `GET /api/v1/wishlists/{id}` - Get wishlist by ID
- `PUT /api/v1/wishlists/{id}` - Update wishlist
- `DELETE /api/v1/wishlists/{id}` - Delete wishlist

## Development

### Running Tests
```bash
go test -v ./...
```

### Building Docker Image
```bash
docker build -t wishlist:latest -f deployments/docker/Dockerfile .
```

### Deploying to Kubernetes
```bash
kubectl apply -f deployments/kubernetes/
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 