# Smart Tourism Intelligence and Visitor Analytics Platform

## Destination Demand Mining and Spatial-Web Analytics

[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.128-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)

---

## Project Overview

An intelligent tourism analytics platform that collects tourism-related data, processes and stores it in a MySQL data warehouse, extracts meaningful patterns from tourism-related web content, identifies visitor sentiment and tourism demand, applies K-Means clustering to tourism destinations, performs geographic analysis, and delivers actionable insights through a premium interactive React dashboard.

### Academic Modules

| Module | Focus Area |
|--------|-----------|
| **Module 1** | Tourism Data Collection and MySQL Database Management |
| **Module 2** | Web Mining and Tourism Demand Pattern Analysis |
| **Module 3** | K-Means Clustering and Spatial Tourism Analytics |
| **Module 4** | Interactive Tourism Dashboard and Visitor Insights Using React-Based Business Intelligence |

---

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Recharts (data visualization)
- React Leaflet (mapping)
- TanStack Query (server state management)
- React Hook Form + Zod (form handling & validation)
- Framer Motion (animations)
- Lucide React (icons)

### Backend
- Python 3.11
- FastAPI (web framework)
- SQLAlchemy 2.0 (ORM)
- Alembic (database migrations)
- Pydantic 2.x (validation)
- Pandas & NumPy (data processing)
- Scikit-learn (machine learning)
- NLTK + VADER (NLP & sentiment analysis)
- Shapely (spatial operations)

### Database
- MySQL 8.0 (primary database)
- Star schema data warehouse design
- SQLite fallback for development

---

## Folder Structure

```
DWDM new capstone/
├── backend/
│   ├── app/
│   │   ├── api/routes/         # FastAPI route handlers
│   │   ├── core/               # Configuration, security, logging
│   │   ├── database/           # Database connection, session management
│   │   ├── models/             # SQLAlchemy ORM models
│   │   ├── schemas/            # Pydantic request/response schemas
│   │   ├── repositories/       # Database CRUD operations
│   │   ├── services/           # Business logic
│   │   │   ├── ingestion/      # File upload & parsing
│   │   │   ├── etl/            # ETL pipeline
│   │   │   ├── web_mining/     # TF-IDF, keyword extraction
│   │   │   ├── sentiment/      # VADER sentiment analysis
│   │   │   ├── forecasting/    # Demand forecasting
│   │   │   ├── clustering/     # K-Means clustering
│   │   │   ├── spatial/        # Geographic analysis
│   │   │   ├── dashboard/      # Dashboard aggregation
│   │   │   └── reporting/      # Report generation
│   │   └── utils/              # Helper utilities
│   ├── data/sample/            # Sample demonstration datasets
│   ├── migrations/             # Alembic database migrations
│   ├── tests/                  # Automated test suite
│   ├── requirements.txt
│   ├── alembic.ini
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── layout/         # App shell, sidebar, topbar
│   │   │   ├── cards/          # Stat, insight, data cards
│   │   │   ├── charts/         # Recharts wrapper components
│   │   │   ├── tables/         # Data table component
│   │   │   ├── forms/          # Upload, filter, search components
│   │   │   ├── maps/           # React Leaflet map component
│   │   │   └── feedback/       # Loading, error, empty states
│   │   ├── pages/              # Page components by module
│   │   ├── services/           # API client
│   │   ├── hooks/              # Custom React hooks
│   │   ├── types/              # TypeScript type definitions
│   │   ├── utils/              # Formatting, constants
│   │   └── styles/             # Global styles & design tokens
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
└── README.md
```

---

## Prerequisites

- **Python** 3.11+
- **Node.js** 18+ and npm
- **MySQL** 8.0 (optional — SQLite fallback available for development)
- **Git**

---

## Installation

### 1. Clone the Repository

```bash
cd "D:\DWDM new capstone"
```

### 2. Backend Setup

```bash
# Create virtual environment (recommended)
cd backend
python -m venv venv
venv\Scripts\activate    # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Download NLTK data
python -c "import nltk; nltk.download('vader_lexicon'); nltk.download('punkt'); nltk.download('stopwords'); nltk.download('punkt_tab')"
```

### 3. Environment Configuration

```bash
# Copy example env file
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux

# Edit .env with your MySQL credentials (or leave defaults for SQLite fallback)
```

### 4. MySQL Setup (Optional)

If MySQL is available:

```sql
-- Connect to MySQL
mysql -u root -p

-- Create database
CREATE DATABASE IF NOT EXISTS tourism_dw CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create application user (recommended)
CREATE USER IF NOT EXISTS 'tourism_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON tourism_dw.* TO 'tourism_user'@'localhost';
FLUSH PRIVILEGES;
```

Update `.env` with your MySQL credentials. If MySQL is not available, the application will automatically use SQLite.

### 5. Database Migrations

```bash
cd backend
alembic upgrade head
```

### 6. Frontend Setup

```bash
cd frontend
npm install
```

---

## Running the Application

### Start Backend

```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`. API documentation at `http://localhost:8000/docs`.

### Start Frontend

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## Sample Data

The platform includes synthetic demonstration datasets for Tamil Nadu tourism destinations:

- **tamil_nadu_destinations.csv** — 50+ tourism destinations with coordinates, visitor counts, ratings
- **tamil_nadu_reviews.csv** — 200+ synthetic tourism reviews

> **Note**: These datasets are clearly labelled as **Synthetic Demonstration Data** and do not represent official tourism statistics.

To import sample data:
1. Navigate to Module 1 → Data Collection & Upload
2. Upload the sample CSV files from `backend/data/sample/`
3. Run the ETL pipeline to load data into the warehouse

---

## Testing

### Backend Tests

```bash
cd backend
python -m pytest tests/ -v
```

### Frontend Build Check

```bash
cd frontend
npx tsc --noEmit
npm run build
```

---

## Data Warehouse Schema

The platform uses a **star schema** design:

### Dimension Tables
- `dim_destination` — Tourism destination details
- `dim_location` — Geographic hierarchy
- `dim_date` — Time dimension with seasons
- `dim_tourism_category` — Tourism category classification

### Fact Tables
- `fact_visitor_analytics` — Visitor metrics and demand measures
- `fact_tourism_reviews` — Sentiment analysis aggregates

---

## API Endpoints

| Group | Endpoint | Description |
|-------|----------|-------------|
| Health | `GET /api/health` | System health check |
| Datasets | `POST /api/datasets/upload` | Upload tourism dataset |
| Datasets | `GET /api/datasets` | List datasets |
| ETL | `POST /api/etl/execute` | Execute ETL pipeline |
| Database | `GET /api/database/tables` | Browse warehouse tables |
| Web Mining | `POST /api/web-mining/keywords` | Extract keywords (TF-IDF) |
| Sentiment | `POST /api/sentiment/analyze` | Run sentiment analysis |
| Demand | `GET /api/demand/trends` | Visitor demand trends |
| Clustering | `POST /api/clustering/execute` | Run K-Means clustering |
| Spatial | `GET /api/spatial/destinations` | Spatial destination data |
| Dashboard | `GET /api/dashboard/overview` | Dashboard KPIs |
| Reports | `POST /api/reports/export` | Export reports (CSV/PDF) |

---

## Troubleshooting

### MySQL Connection Issues
- Verify MySQL service is running: `net start MySQL80`
- Check credentials in `.env`
- The application falls back to SQLite automatically if MySQL is unavailable

### NLTK Data Missing
```bash
python -c "import nltk; nltk.download('all')"
```

### Port Conflicts
- Backend default: 8000 (change with `--port`)
- Frontend default: 5173 (change in `vite.config.ts`)

### Build Errors
```bash
# Frontend
cd frontend && npm install && npm run build

# Backend
cd backend && pip install -r requirements.txt
```

---

## Academic Context

**Project Title**: Smart Tourism Intelligence and Visitor Analytics Platform Using Destination Demand Mining and Spatial-Web Analytics

**Domain**: Tourism Intelligence, Data Warehousing, Data Mining, Web Mining, Machine Learning, Spatial Analytics, Business Intelligence

**Level**: B.Tech Computer Science and Engineering Capstone Project

---

## License

This project is developed for academic purposes.

---

*Built with engineering discipline and attention to detail.*

