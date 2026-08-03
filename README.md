# 🏥 MediStock - Medical Inventory Management Platform

## 📝 Project Overview
MediStock is a medical inventory management platform designed to streamline tracking of pharmaceutical stock levels, categories, suppliers, and purchase orders. It provides real-time dashboard analytics and role-based access control (RBAC) for administrators and pharmacists.

## 👥 Team Project
- Developed collaboratively as a Software Engineering academic group project for the Infosys Springboard Internship.

## 💻 Tech Stack
- **Backend:** ☕ Java 17, Spring Boot 3.2.5, JPA/Hibernate, Spring Security, JJWT
- **Frontend:** ⚛️ React 18, Vite, Axios, Vanilla CSS, Lucide React
- **Database:** 🗄️ MySQL

## ✨ Key Features
- **Security:** 🔐 Role-Based Access Control (Admin/Pharmacist) with secure JWT auth.
- **Inventory:** 📦 Real-time tracking of medicine stocks, categories, and low-stock alerts.
- **Orders:** 🛒 Purchase order creation, tracking, and automatic stock updates.
- **Directories:** 👥 Management interfaces for vendors (suppliers) and user roles.

## 📂 Project Structure
```text
├── Database/                 # Database schema and initial scripts
├── docs/                     # System design documentation
├── medistock-backend/        # Spring Boot Java application
└── medistock-frontend/       # React client application
```

## 🚀 Setup Instructions
### ⚙️ Backend
1. Create a MySQL database and update settings in `application.properties`.
2. Run `./mvnw spring-boot:run` inside `medistock-backend/`.

### ⚙️ Frontend
1. Run `npm install` inside `medistock-frontend/`.
2. Run `npm run dev` to start the client application.

## 📄 Week 1 Deliverables
- Requirements analysis, system design, mockups, and database modeling.
- Detailed documentation is located in [docs/MediStock_Week1_Deliverables.docx](docs/MediStock_Week1_Deliverables.docx).

## 📈 Week 2 Progress
- ✅ Implemented backend JPA entities, repositories, services, and REST APIs.
- ✅ Integrated Spring Security with JWT token-based authorization.
- ✅ Developed React frontend dashboards, inventory, and order management pages.
- ✅ Connected frontend views to backend REST endpoints via Axios.

## 🔮 Future Enhancements
- 🔔 Automated notifications for low-stock levels and medicine expiry.
- 📊 Advanced analytics dashboards with PDF/Excel report export.
- 🐳 Application containerization and deployment configuration using Docker.

## ⚖️ License
This project is developed as part of the Infosys Springboard Internship.
