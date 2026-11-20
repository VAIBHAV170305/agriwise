# 🌱 Agri-Wise (Agrovia)

> **Enterprise AI-Powered Smart Agriculture, Farm Management & Market Intelligence Platform**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.143.0-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.x-61DAFB.svg?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-Build-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Python](https://img.shields.io/badge/Python-3.12%2B-3776AB.svg?logo=python)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🌾 Overview

**Agri-Wise** is a full-stack smart agricultural ecosystem designed to empower smallholder and commercial farmers, Farmer Producer Organizations (FPOs), and institutional buyers with end-to-end digital tools. It bridges agronomic science, machine learning, and farm-to-table supply chains into a unified platform.

---

## ✨ Key Features

### 🧠 1. Cognitive Advisory & AI Engines
- **Crop Suitability Matcher:** Multi-parameter agronomic matching based on soil chemistry (NPK, pH), regional meteorology, and seasonal patterns.
- **Vision Disease Scanner:** Visual pest and foliar disease diagnosis with tailored organic and chemical remediation protocols.
- **RAG Agronomic Assistant:** Domain-grounded retrieval-augmented AI assistant answering farming and crop-health questions.
- **Mandi Demand Forecaster:** Time-series demand and price corridor forecasting to prevent distress sales.

### 🚜 2. Farm Cultivation & Financial Management
- **Plot & Batch Tracking:** Interactive plot mapping, crop lifecycle stages, sowing dates, and harvest estimates.
- **Activity & Expense Accounting:** Real-time ledger tracking seed, fertilizer, labor, and machinery costs.
- **Weather Advisories:** Localized 7-day forecast with humidity, rainfall, and spray suitability indices.

### 🛒 3. Direct Farm-to-Buyer Marketplace
- **Digital Mandi:** Transparent marketplace connecting farmers directly with commercial buyers, eliminating intermediary markups.
- **Contract & Escrow Workflow:** Automated order generation, status tracking, and digital contracts.
- **Logistics & Delivery Tracking:** Live dispatch statuses, driver assignments, route checkpoints, and OTP delivery verification.
- **FPO Collective Pooling:** Enables farmer cooperatives to aggregate produce volume for institutional bulk purchasing power.

### 🛡️ 4. Enterprise Security & Multi-Role RBAC
- Role-based permissions for **Farmers**, **Buyers**, **FPO Admins**, **Logistics Partners**, and **Platform Admins**.
- JWT-based authentication with bcrypt password hashing and audit logging.

---

## 🏗️ System Architecture

```
agriwise/
├── backend/
│   ├── app/
│   │   ├── data/             # Domain knowledge & seed data
│   │   ├── routers/          # FastAPI API endpoints (auth, crops, market, disease, etc.)
│   │   ├── services/         # AI engines, forecasters, and decision services
│   │   ├── auth.py           # JWT authentication & security utilities
│   │   ├── config.py         # Application settings & environment config
│   │   ├── database.py       # SQLAlchemy engine & session manager
│   │   ├── models.py         # Database ORM models
│   │   ├── schemas.py        # Pydantic request & response schemas
│   │   ├── seed.py           # Database migration & seed logic
│   │   └── main.py           # FastAPI entrypoint & middleware setup
│   └── requirements.txt      # Python dependencies
├── frontend/
│   ├── public/               # Static assets & icons
│   ├── src/
│   │   ├── components/       # UI views, dashboards & modals
│   │   ├── context/          # State management (Auth, Theme, Cart)
│   │   ├── services/         # Axios API clients
│   │   ├── App.jsx           # Application routing & layout
│   │   └── main.jsx          # React DOM entrypoint
│   ├── package.json          # Frontend dependencies & scripts
│   └── vite.config.js        # Vite build configuration
├── AGRIWISE_MASTER_DOCUMENTATION.md  # Detailed technical specifications
├── WEBSITE_WORKFLOW_GUIDE.md         # End-to-end platform workflows
├── package.json              # Root workspace runner scripts
└── requirements.txt          # Python dependencies
```

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.12+**
- **Node.js 18+ & npm**

---

### Quick Start (Full-Stack Concurrently)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/VAIBHAV170305/agriwise.git
   cd agriwise
   ```

2. **Install root dependencies:**
   ```bash
   npm install
   ```

3. **Set up Python Virtual Environment:**
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Linux / macOS:
   source venv/bin/activate

   pip install -r requirements.txt
   ```

4. **Install Frontend Dependencies:**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

5. **Run Frontend & Backend Together:**
   ```bash
   npm run dev
   ```
   - **Frontend:** http://localhost:5173
   - **Backend API Docs:** http://localhost:8000/docs

---

### Running Services Independently

#### Backend
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```
API Documentation will be live at `http://127.0.0.1:8000/docs`.

#### Frontend
```bash
cd frontend
npm run dev
```

---

## 📜 Documentation

For full system architecture, model specifications, database schema diagrams, and deployment guides, refer to:
- [Master Technical Handbook](AGRIWISE_MASTER_DOCUMENTATION.md)
- [Website Workflow Guide](WEBSITE_WORKFLOW_GUIDE.md)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
