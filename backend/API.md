# CloudForge API Documentation

Base URL:

http://localhost:5000

## Authentication

### Register

POST /api/auth/register

Request body:

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Test@12345"
}

Success response:

{
  "success": true,
  "message": "User registered successfully",
  "userId": 1
}

### Login

POST /api/auth/login

Request body:

{
  "email": "test@example.com",
  "password": "Test@12345"
}

Success response:

{
  "success": true,
  "message": "Login successful",
  "token": "JWT_TOKEN",
  "user": {
    "id": 1,
    "name": "Test User",
    "email": "test@example.com"
  }
}

## User

All user endpoints require:

Authorization: Bearer JWT_TOKEN

### Get Current User

GET /api/users/me

Success response:

{
  "success": true,
  "user": {
    "id": 1,
    "name": "Test User",
    "email": "test@example.com",
    "created_at": "..."
  }
}

### Update Current User

PUT /api/users/me

Request body:

{
  "name": "Updated User",
  "email": "updated@example.com"
}

## Repositories

All repository endpoints require:

Authorization: Bearer JWT_TOKEN

### Get Repositories

GET /api/repositories

### Add Repository

POST /api/repositories

Request body:

{
  "url": "https://github.com/expressjs/express",
  "branch": "master"
}

### Update Repository

PUT /api/repositories/:id

Request body:

{
  "url": "https://github.com/expressjs/express",
  "branch": "master"
}

### Delete Repository

DELETE /api/repositories/:id

## Common Status Codes

200 - Request successful

201 - Resource created

400 - Invalid request

401 - Authentication required or invalid token

404 - Resource not found

409 - Conflict, such as duplicate email/repository

500 - Internal server error

503 - External service verification failed