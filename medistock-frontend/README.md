<div align="center">
  
# 🏥 Medistock Frontend
**Modern UI for the Medical Inventory Management System**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)]()
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)]()
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)]()

</div>

---

## 📖 Overview

The **Medistock Frontend** is the user interface for the Medical Inventory Management System. Built with React, Vite, and Tailwind CSS, it provides a clean, responsive, and intuitive dashboard for managing medical supplies, tracking expirations, and monitoring stock levels in real-time.

## ✨ Key Features

- 📊 **Interactive Dashboard**: Real-time overview of inventory metrics, upcoming expirations, and system notifications.
- 📦 **Inventory Management**: Easy-to-use data tables for managing medicines, stock batches, and suppliers.
- ⏱️ **Expiry Tracking**: Dedicated views to quickly identify and manage expired or near-expiry medicines.
- 🔐 **Secure Access**: JWT-based authentication flow seamlessly integrated with the backend API.
- ⚡ **Lightning Fast**: Powered by Vite and React for instant HMR and optimized production builds.

---

## 🏗️ Project Structure

```text
medistock-frontend/
├── src/
│   ├── components/      # Reusable UI components (Buttons, Cards, Inputs)
│   ├── layouts/         # Page layout structures (e.g., DashboardLayout)
│   ├── pages/           # Main application views (Dashboard, Login, Expiries)
│   ├── lib/             # Utility functions and API interceptors
│   ├── App.tsx          # Application routing
│   └── main.tsx         # React entry point
├── public/              # Static assets
└── package.json         # Project dependencies and scripts
```

---

## 🚀 Getting Started

Follow these steps to run the frontend application on your local machine.

### Prerequisites
- **Node.js**: v20 or higher (We recommend using the provided portable Node.js if you don't have it installed globally)
- **Backend API**: Ensure the Medistock Backend is running locally on port `8080`.

### Launching the Application

Open your terminal, navigate to the frontend directory, and run:

```bash
# Install dependencies (only needed the first time)
npm install

# Start the development server
npm run dev
```

The application will be available in your browser at:
> 🌐 **[http://localhost:5173](http://localhost:5173)**

*Note: If you are using the portable Node.js version provided in the project folder, make sure to add it to your PATH before running the commands above.*

---
<div align="center">
  <i>Developed for the Infosys Virtual Internship 7.0</i>
</div>
