# NexusCloud — Cloud DevOps Platform

A modern cloud-native DevOps platform UI built with React, featuring deployment management, CI/CD pipelines, infrastructure provisioning, monitoring, and cost optimization.

## Tech Stack

- React 18 + Vite
- React Router v6
- Recharts (dashboard visualizations)
- CSS design system (dark premium SaaS theme)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Demo Login

Use any valid email and password (4+ characters). Authentication is stored in `localStorage`.

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | Login / Sign up |
| `/dashboard` | Main dashboard |
| `/deployment/*` | Deployment service (4 sub-services) |
| `/pipelines/*` | Pipeline service (4 sub-services) |
| `/infrastructure/*` | Infrastructure service (4 sub-services) |
| `/monitoring/*` | Monitoring service (4 sub-services) |
| `/cost/*` | Cost estimation service (4 sub-services) |

## Working Triggers

- **Deploy Now** — Configure and simulate deployment
- **Run Pipeline** — Animate pipeline stages sequentially
- **Provision Infrastructure** — Create new cloud resources
- **Terraform Plan/Apply** — Simulated IaC operations
- **Calculate Cost** — Mock pricing calculator
- **Set Budget** — Save and track budget usage
- **Acknowledge Alert** — Update alert status
- **Rollback** — Confirm and rollback deployments
- **Logout** — Clear auth and redirect to login

## Project Structure

```
src/
├── components/     # Reusable UI (Modal, Sidebar, cards, charts)
├── pages/          # Route pages per service
├── context/        # Auth context
├── data/           # Mock data (replace with API)
├── services/       # API layer (mock implementations)
└── styles/         # Global CSS design system
```

## Backend Integration

Replace mock functions in `src/services/api.js` with real API calls. Mock data in `src/data/mockData.js` can be swapped for API responses.
