# CloudForge REST API Reference

Base URL:
```
http://localhost:5000
```

---

## Table of Contents
1. [Authentication & Authorization](#1-authentication--authorization)
2. [User Management & Preferences](#2-user-management--preferences)
3. [Repository Management](#3-repository-management)
4. [Deployment Management](#4-deployment-management)
5. [CI/CD Pipelines & Builds](#5-cicd-pipelines--builds)
6. [Infrastructure & Kubernetes](#6-infrastructure--kubernetes)
7. [Cloud Cost Management & Estimation](#7-cloud-cost-management--estimation)
8. [Monitoring, Logs & Alerts](#8-monitoring-logs--alerts)
9. [Dashboard Summary](#9-dashboard-summary)
10. [Health & Diagnostics](#10-health--diagnostics)
11. [Standard Status Codes](#11-standard-status-codes)

---

## 1. Authentication & Authorization

### Register
`POST /api/auth/register`
* **Rate Limited**: 10 requests / 15 minutes
* **Request Body**:
```json
{
  "name": "Jane Developer",
  "email": "jane@example.com",
  "password": "SecurePassword@123",
  "role": "developer"
}
```
* **Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "userId": 1
}
```

### Login
`POST /api/auth/login`
* **Rate Limited**: 10 requests / 15 minutes
* **Request Body**:
```json
{
  "email": "jane@example.com",
  "password": "SecurePassword@123"
}
```
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Jane Developer",
    "email": "jane@example.com",
    "role": "developer"
  }
}
```

### Logout
`POST /api/auth/logout`
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 2. User Management & Preferences

All endpoints in this section require: `Authorization: Bearer <JWT_TOKEN>`.

### Get Current User Profile
`GET /api/users/me`
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "Jane Developer",
    "email": "jane@example.com",
    "created_at": "2026-10-03T15:00:00.000Z"
  }
}
```

### Update Profile
`PUT /api/users/me`
* **Request Body**:
```json
{
  "name": "Jane D.",
  "email": "jane.updated@example.com"
}
```

### Change Password
`PUT /api/users/me/password`
* **Request Body**:
```json
{
  "currentPassword": "OldPassword@123",
  "newPassword": "NewPassword@456"
}
```

### Get Preferences
`GET /api/users/preferences`
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "preferences": {
    "theme": "dark",
    "language": "en",
    "timezone": "Asia/Kolkata",
    "default_landing_page": "dashboard"
  }
}
```

### Update Preferences
`PUT /api/users/preferences`
* **Request Body**:
```json
{
  "theme": "dark",
  "language": "en",
  "timezone": "UTC",
  "defaultLandingPage": "repositories"
}
```

### Notification Preferences
* `GET /api/users/notifications`: Retrieve current alert & notification toggles.
* `PUT /api/users/notifications`: Update notification flags (deployment, pipeline, security, system, email).

### GitHub Connection & OAuth
* `GET /api/users/github`: Retrieve connected GitHub username and timestamp.
* `PUT /api/users/github`: Manually connect GitHub username and token.
* `GET /api/users/github/connect`: Start GitHub OAuth state and redirect URL.
* `GET /api/users/github/callback`: OAuth callback handler.

---

## 3. Repository Management

Requires: `Authorization: Bearer <JWT_TOKEN>`.

### List Repositories
`GET /api/repositories`
* Returns all repositories owned by the authenticated user.

### Add Repository
`POST /api/repositories`
* Verifies repository accessibility and branch validity via GitHub REST API.
* **Request Body**:
```json
{
  "url": "https://github.com/expressjs/express",
  "branch": "master"
}
```
* **Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "Repository added successfully",
  "repositoryId": 1
}
```

### Update Repository
`PUT /api/repositories/:id`

### Delete Repository
`DELETE /api/repositories/:id`

---

## 4. Deployment Management

Requires: `Authorization: Bearer <JWT_TOKEN>`.

### List Deployments
`GET /api/deployments`
* **Query Parameters**: `project`, `environment`, `status`
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "count": 4,
  "deployments": [
    {
      "id": "dep-001",
      "project": "api-gateway",
      "environment": "Production",
      "version": "v2.4.1",
      "branch": "main",
      "status": "success",
      "deployed_at": "2026-08-13 10:30",
      "deployed_by": "Aditya D."
    }
  ]
}
```

### Trigger Deployment
`POST /api/deployments`
* **Request Body**:
```json
{
  "project": "api-gateway",
  "environment": "Production",
  "version": "v2.5.0",
  "branch": "main"
}
```
* **Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "Deployment completed successfully",
  "deployment": {
    "id": "dep-1696347890123",
    "project": "api-gateway",
    "environment": "Production",
    "version": "v2.5.0",
    "branch": "main",
    "status": "success",
    "deployedAt": "2026-10-03 20:30",
    "deployedBy": "Jane Developer"
  }
}
```

### Rollback Deployment
`POST /api/deployments/rollback`
* **Request Body**:
```json
{
  "project": "api-gateway",
  "version": "v2.4.0",
  "environment": "Production"
}
```

### Get Deployment Logs
`GET /api/deployments/:id/logs`
* Returns lifecycle build, container pull, and Kubernetes rollout log entries.

### List Deployment Environments
`GET /api/deployments/environments`
* Returns environment states for Development, Staging, and Production.

### List Releases
`GET /api/deployments/releases`
* Returns release history with notes and deployment status.

---

## 5. CI/CD Pipelines & Builds

Requires: `Authorization: Bearer <JWT_TOKEN>`.

### List Pipelines
`GET /api/pipelines`
* Returns pipeline workflows with individual stage states (`GitHub`, `Build`, `Test`, `Docker`, `Deploy`, `Kubernetes`).

### Trigger Pipeline Run
`POST /api/pipelines/:id/run`

### Advance Pipeline Stage
`POST /api/pipelines/:id/stages/:stageIndex/advance`
* Marks stage as `success` and advances queued next stages.

### Pipeline Runs History
`GET /api/pipelines/runs`

### Build History
`GET /api/pipelines/builds`

### Trigger Build
`POST /api/pipelines/builds`
* **Request Body**:
```json
{
  "branch": "develop",
  "commit": "f1a9c3b"
}
```

### Build Logs
`GET /api/pipelines/builds/:id/logs`

---

## 6. Infrastructure & Kubernetes

Requires: `Authorization: Bearer <JWT_TOKEN>`.

### List Cloud Resources
`GET /api/infrastructure/resources`
* Returns resources: EC2, Kubernetes, Docker, VPC, Load Balancers, and Databases with CPU, Memory, and Cost.

### Provision Resource
`POST /api/infrastructure/resources`
* **Request Body**:
```json
{
  "type": "EC2",
  "region": "ap-south-1",
  "environment": "Production"
}
```

### Deprovision Resource
`DELETE /api/infrastructure/resources/:id`

### Terraform Configurations
`GET /api/infrastructure/terraform`

### Terraform Plan
`POST /api/infrastructure/terraform/plan`
* **Request Body**: `{ "configName": "vpc-network" }`

### Terraform Apply
`POST /api/infrastructure/terraform/apply`
* **Request Body**: `{ "configName": "vpc-network" }`

### Kubernetes Clusters & Nodes
* `GET /api/infrastructure/kubernetes/clusters`: Active clusters with node, pod, and service counts.
* `GET /api/infrastructure/kubernetes/nodes`: Node readiness, CPU, memory, and scheduled pod metrics.
* `GET /api/infrastructure/kubernetes/pods`: Pod running states and restart counts.

---

## 7. Cloud Cost Management & Estimation

Requires: `Authorization: Bearer <JWT_TOKEN>`.

### Cost Overview
`GET /api/cost/overview`
* Returns current spend, estimated monthly spend, daily spend, service distribution, and monthly trend history.

### Dynamic Cost Calculator
`POST /api/cost/calculate`
* **Request Body**:
```json
{
  "provider": "aws",
  "region": "ap-south-1",
  "compute": true,
  "storage": true,
  "database": true,
  "network": true,
  "instanceSize": "medium"
}
```
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "provider": "aws",
  "region": "ap-south-1",
  "estimatedCost": 13700,
  "currency": "INR"
}
```

### Get & Set Budget Limit
* `GET /api/cost/budget`: Returns monthly limit, spend, and usage percentage.
* `POST /api/cost/budget`: Updates monthly budget limit (`{ "amount": 60000 }`).

### Cost Optimization Insights
`GET /api/cost/recommendations`
* Lists actionable recommendations (stopping idle instances, right-sizing workloads) with estimated savings.

---

## 8. Monitoring, Logs & Alerts

Requires: `Authorization: Bearer <JWT_TOKEN>`.

### Live System Metrics
`GET /api/monitoring/metrics`
* Returns CPU, Memory, Disk, Network, Uptime, Request rates, Error rates, Response times, and historical chart coordinates.

### Centralized Logs
`GET /api/monitoring/logs`
* **Query Parameters**: `service`, `level` (`INFO`, `WARNING`, `ERROR`)
* Returns latest 50 structured log entries.

### Log Ingestion
`POST /api/monitoring/logs`
* **Request Body**:
```json
{
  "service": "api-gateway",
  "level": "INFO",
  "message": "User session authenticated"
}
```

### Alerts Management
* `GET /api/monitoring/alerts`: List active and resolved alerts.
* `PUT /api/monitoring/alerts/:id/acknowledge`: Acknowledge an alert.

### Service Health Checks
`GET /api/monitoring/health`
* Returns operational status across Applications, Servers, Containers, Kubernetes, and APIs.

---

## 9. Dashboard Summary

Requires: `Authorization: Bearer <JWT_TOKEN>`.

### Summary
`GET /api/dashboard/summary`
* Returns aggregated overview metrics, daily deployment chart, infrastructure health bars, pipeline statuses, cloud spend summary, and live activity stream.

---

## 10. Health & Diagnostics

* `GET /api/health`: Express server liveness check.
* `GET /api/db-test`: MySQL database connection probe.

---

## 11. Standard Status Codes

| Code | Status | Meaning |
| :--- | :--- | :--- |
| **200** | OK | Request succeeded. |
| **201** | Created | Resource created successfully. |
| **400** | Bad Request | Validation error or missing required parameters. |
| **401** | Unauthorized | Missing, invalid, or expired JWT bearer token. |
| **403** | Forbidden | Insufficient role permissions. |
| **404** | Not Found | Resource or endpoint not found. |
| **409** | Conflict | Duplicate resource (e.g. duplicate email or repository). |
| **429** | Too Many Requests | Rate limit exceeded. |
| **500** | Internal Server Error | Unhandled server or database error. |
| **503** | Service Unavailable | External verification service unreachable. |