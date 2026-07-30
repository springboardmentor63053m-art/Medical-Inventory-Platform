# MediStock - Medical Inventory Management Platform

MediStock is a practical, enterprise-grade Medical Inventory Management Platform designed as a **Feature-Based Modular Monolith** using **Spring Boot 3 (Java 21)** and **React 19 (Vite)**.

## Project Structure
- `backend/`: Spring Boot 3 Java 21 Modular Monolith grouped by features.
- `frontend/`: React 19 + Vite Feature-Based Frontend application.
- `database/`: Database SQL schemas, Flyway migrations, and seed scripts.
- `docs/`: Core architecture, database, deployment, and API documentation.
- `postman/`: Postman collection for backend API testing.
- `scripts/`: Shell scripts for local setup, build, and deployment.

## Getting Started

### Backend Setup
```bash
cd backend
mvn spring-boot:run
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Docker Setup
```bash
docker-compose up -d --build
```
