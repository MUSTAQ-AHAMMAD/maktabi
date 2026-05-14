# Maktabi — Enterprise Legal Workflow Automation System

A production-ready Enterprise Legal Management & Workflow Automation Platform built with Next.js, NestJS, PostgreSQL, and Prisma.

## 🏗 Architecture

```
maktabi/
├── frontend/          # Next.js 14 (App Router) + TypeScript + TailwindCSS + shadcn/ui
├── backend/           # NestJS + TypeScript + Prisma + PostgreSQL
└── docker-compose.yml # Full stack Docker orchestration
```

## ✨ Features

### Core Modules
| Module | Description |
|--------|-------------|
| **Litigation** | Case management, hearing tracking, lawyer assignment, risk scoring |
| **Investigations** | HR disciplinary workflow, severity classification, confidentiality |
| **Consultations** | Legal opinion requests, SLA tracking, knowledge tagging |
| **Contracts** | Contract lifecycle, expiry alerts, value tracking, multi-step approvals |
| **Financial** | Execution tracking, payment recording, progress monitoring |

### System Features
- 🔐 JWT authentication with Role-Based Access Control (9 roles)
- 📊 Role-based dashboards with KPI cards and charts
- 📋 Configurable workflow engine with audit logging
- 🌙 Full light/dark mode support
- 📱 Responsive design
- 🔍 Global search & advanced filtering
- 📄 Swagger API documentation

### Roles
`ADMIN` · `CEO` · `LEGAL_MANAGER` · `INTERNAL_LAWYER` · `EXTERNAL_LAWYER` · `HR` · `FINANCE` · `DEPARTMENT_MANAGER` · `EMPLOYEE`

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

> **No PostgreSQL installation required.** Docker bundles everything — database, backend, and frontend.

```bash
docker-compose up -d
```

Then open:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Swagger Docs: http://localhost:3001/api/docs

### Option 2: DB in Docker + local backend & frontend

Use this option if you want to run the backend and frontend directly with Node.js (e.g. for hot-reload development) but **do not have PostgreSQL installed** on your machine.

#### Prerequisites
- Node.js 20+
- Docker Desktop

#### 1. Start only the PostgreSQL container

```bash
docker-compose -f docker-compose.db-only.yml up -d
```

This starts PostgreSQL on `localhost:5432` with the credentials already set in `backend/.env.example`. No further database configuration is needed.

#### 2. Backend

**Linux / macOS**

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate deploy
npx ts-node prisma/seed.ts
npm run start:dev
```

**Windows (Command Prompt)**

```cmd
cd backend
copy .env.example .env
npm install
npx prisma generate
npx prisma migrate deploy
npx ts-node prisma/seed.ts
npm run start:dev
```

**Windows (PowerShell)**

```powershell
cd backend
Copy-Item .env.example .env
npm install
npx prisma generate
npx prisma migrate deploy
npx ts-node prisma/seed.ts
npm run start:dev
```

#### 3. Frontend

**Linux / macOS**

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

**Windows (Command Prompt)**

```cmd
cd frontend
copy .env.example .env.local
npm install
npm run dev
```

**Windows (PowerShell)**

```powershell
cd frontend
Copy-Item .env.example .env.local
npm install
npm run dev
```

### Option 3: Manual Setup (PostgreSQL installed locally)

#### Prerequisites
- Node.js 20+
- PostgreSQL 15+ (**not** MySQL/MariaDB — this project requires PostgreSQL)

> **Windows / XAMPP users:** XAMPP ships with MySQL/MariaDB, **not** PostgreSQL.
> You must install PostgreSQL separately.  Download the Windows installer from
> <https://www.postgresql.org/download/windows/> and run it.  During
> installation, note the password you set for the built-in `postgres` superuser
> — you will need it in the next step.

#### 1. Create the PostgreSQL database and user

**Linux / macOS**

```bash
psql -U postgres
```

**Windows** (open "SQL Shell (psql)" from the Start menu, or run from Command Prompt / PowerShell):

```cmd
psql -U postgres -h localhost
```

Once connected, run:

```sql
CREATE USER maktabi WITH PASSWORD 'maktabi123';
CREATE DATABASE maktabi_db OWNER maktabi;
GRANT ALL PRIVILEGES ON DATABASE maktabi_db TO maktabi;
\q
```

> **pgAdmin alternative:** If you prefer a GUI, open pgAdmin, connect to your
> local server, open the *Query Tool*, and paste the three SQL statements above
> (`\q` is a psql command to quit and is not needed in pgAdmin).

> **Note:** If you choose a different username or password, update
> `DATABASE_URL` in `backend/.env` accordingly.

#### 2. Backend

**Linux / macOS**

```bash
cd backend
cp .env.example .env
# Edit .env if you used different PostgreSQL credentials above
npm install
npx prisma generate
npx prisma migrate deploy
npx ts-node prisma/seed.ts
npm run start:dev
```

**Windows (Command Prompt)**

```cmd
cd backend
copy .env.example .env
rem Edit .env if you used different PostgreSQL credentials above
npm install
npx prisma generate
npx prisma migrate deploy
npx ts-node prisma/seed.ts
npm run start:dev
```

**Windows (PowerShell)**

```powershell
cd backend
Copy-Item .env.example .env
# Edit .env if you used different PostgreSQL credentials above
npm install
npx prisma generate
npx prisma migrate deploy
npx ts-node prisma/seed.ts
npm run start:dev
```

#### 3. Frontend

**Linux / macOS**

```bash
cd frontend
cp .env.example .env.local
# Edit .env.local if the backend runs on a different host/port
npm install
npm run dev
```

**Windows (Command Prompt)**

```cmd
cd frontend
copy .env.example .env.local
rem Edit .env.local if the backend runs on a different host/port
npm install
npm run dev
```

**Windows (PowerShell)**

```powershell
cd frontend
Copy-Item .env.example .env.local
# Edit .env.local if the backend runs on a different host/port
npm install
npm run dev
```

## 🔑 Demo Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@maktabi.com | Admin@123 | Admin |
| ceo@maktabi.com | Ceo@123 | CEO |
| legal.manager@maktabi.com | Legal@123 | Legal Manager |
| lawyer@maktabi.com | Lawyer@123 | Internal Lawyer |
| hr@maktabi.com | Hr@123 | HR |
| finance@maktabi.com | Finance@123 | Finance |
| employee@maktabi.com | Employee@123 | Employee |

## 📚 API Documentation

Swagger UI is available at: `http://localhost:3001/api/docs`

### Key Endpoints
```
POST   /auth/login                    Login
GET    /dashboard/stats               Dashboard KPIs
GET    /litigation                    List cases
POST   /litigation                    Create case
PUT    /litigation/:id/status         Update case status
POST   /litigation/:id/hearings       Add hearing
GET    /contracts                     List contracts
GET    /contracts/expiring            Expiring contracts
GET    /investigations                List investigations
GET    /consultations                 List consultations
GET    /financial                     Financial executions
POST   /financial/:id/payments        Record payment
GET    /notifications                 User notifications
GET    /audit                         Audit logs (Admin/CEO)
GET    /users                         User directory
```

## 📸 Screenshots

### Login Page
![Login Page](docs/screenshots/01-login.png)

The login screen features the Maktabi branding, email/password fields, and quick-access demo account buttons.

### Dashboard
![Dashboard](docs/screenshots/02-dashboard.png)

The role-based dashboard shows KPI cards (Total Cases, Active Cases, Contracts, Pending Consultations), Financial Exposure summary, and Risk Distribution chart.

### Litigation Cases
![Litigation Cases](docs/screenshots/03-litigation-list.png)

Browse, search, and filter all litigation cases. The top-right **+ New Case** button opens the case creation form.

### New Litigation Case Form
![New Litigation Case](docs/screenshots/04-litigation-new.png)

Multi-field form to register a new litigation case with case number, type, court, assigned lawyer, risk level, and more.

### Investigations
![Investigations](docs/screenshots/05-investigations-list.png)

HR disciplinary investigation tracker with severity classification and confidentiality controls.

### New Investigation Form
![New Investigation](docs/screenshots/06-investigations-new.png)

Create a new investigation with subject, type, severity classification, and confidentiality settings.

### Consultations
![Consultations](docs/screenshots/07-consultations-list.png)

Legal opinion request management with SLA tracking and knowledge tagging.

### New Consultation Form
![New Consultation](docs/screenshots/08-consultations-new.png)

Submit a new legal consultation request with topic, priority, and department details.

### Contracts
![Contracts](docs/screenshots/09-contracts-list.png)

Full contract lifecycle management — view active contracts, expiry alerts, and multi-step approval status.

### New Contract Form
![New Contract](docs/screenshots/10-contracts-new.png)

Create a new contract with parties, value, dates, and approval workflow configuration.

### Financial Executions
![Financial](docs/screenshots/11-financial-list.png)

Track financial execution orders, record payments, and monitor payment progress.

### New Financial Record Form
![New Financial Record](docs/screenshots/12-financial-new.png)

Create a new financial execution record with amount, type, and linked case details.

### Calendar
![Calendar](docs/screenshots/13-calendar.png)

Monthly calendar view showing hearings, contract expiries, and other important legal deadlines.

### User Directory
![Users](docs/screenshots/14-users.png)

Admin view of all platform users with their roles and contact details.

### Brands Management
![Brands](docs/screenshots/15-brands.png)

Manage organizational brands (IBRAQ, MATCH, FEELIN, SALFA) with brand-specific case filtering.

### Notifications
![Notifications](docs/screenshots/16-notifications.png)

Notification center with real-time alerts for case updates, deadlines, and workflow actions.

### Audit Log
![Audit Log](docs/screenshots/17-audit.png)

Chronological audit trail of all system actions, accessible to Admin and CEO roles.

### Profile
![Profile](docs/screenshots/18-profile.png)

User profile page for viewing and editing personal information and preferences.

---

## 🗄 Database Schema

Key entities: `User`, `LitigationCase`, `Hearing`, `Investigation`, `Consultation`, `Contract`, `FinancialExecution`, `Payment`, `Document`, `WorkflowState`, `ApprovalLog`, `AuditLog`, `Notification`

## 🛠 Tech Stack

**Frontend**: Next.js 14 · TypeScript · TailwindCSS · shadcn/ui · Recharts · Framer Motion · React Hook Form + Zod · Zustand

**Backend**: NestJS · TypeScript · Prisma ORM · PostgreSQL · JWT · Passport · Swagger

**DevOps**: Docker · Docker Compose

**Mobile**: Capacitor 8 · Android (Android Studio) · iOS (Xcode)

---

## 📱 Android & iOS Apps

The web application can be packaged as a native Android or iOS app using [Capacitor](https://capacitorjs.com/).

### Quick start

```bash
cd frontend

# 1. Install dependencies (first time, requires Node.js 22+)
npm install

# 2. Build static export and sync to native projects
NEXT_STATIC_EXPORT=true npm run build:static

# 3a. Add Android platform and open in Android Studio
npx cap add android
npm run cap:android

# 3b. Add iOS platform and open in Xcode (macOS only)
npx cap add ios
npm run cap:ios
```

See **[mobile/README.md](mobile/README.md)** for full setup instructions, live-reload workflow, and publishing guidance.

---

## 🔧 Troubleshooting

> **📖 For comprehensive Docker troubleshooting, see [docs/DOCKER_TROUBLESHOOTING.md](docs/DOCKER_TROUBLESHOOTING.md)**

### Docker container keeps restarting

If you see the backend container status as "Restarting" with errors like:
```
exec ./docker-entrypoint.sh: no such file or directory
```

**This means you're running an old cached Docker image.** You need to rebuild:

```bash
# Quick fix: Use the rebuild script
./docker-rebuild.sh

# Or manually
docker compose down
docker rmi maktabi-backend:latest
docker compose build --no-cache
docker compose up -d
```

See [docs/DOCKER_TROUBLESHOOTING.md](docs/DOCKER_TROUBLESHOOTING.md) for more details.

### Port already in use

If you see an error like:

```
Error response from daemon: ports are not available: exposing port TCP 0.0.0.0:3001 -> 127.0.0.1:0:
listen tcp 0.0.0.0:3001: bind: Only one usage of each socket address (protocol/network address/port)
is normally permitted.
```

This means another application is already using port 3001 (backend), 3000 (frontend), or 5432 (PostgreSQL).

#### Solution 1: Stop the conflicting service

**Find what's using the port:**

**Linux / macOS:**
```bash
# Check what's using port 3001
lsof -i :3001

# Check what's using port 3000
lsof -i :3000

# Check what's using port 5432
lsof -i :5432
```

**Windows (PowerShell):**
```powershell
# Check what's using port 3001
Get-NetTCPConnection -LocalPort 3001 | Select-Object -Property LocalAddress, LocalPort, State, OwningProcess
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess

# Check what's using port 3000
Get-NetTCPConnection -LocalPort 3000 | Select-Object -Property LocalAddress, LocalPort, State, OwningProcess
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess

# Check what's using port 5432
Get-NetTCPConnection -LocalPort 5432 | Select-Object -Property LocalAddress, LocalPort, State, OwningProcess
Get-Process -Id (Get-NetTCPConnection -LocalPort 5432).OwningProcess
```

**Windows (Command Prompt):**
```cmd
# Check what's using port 3001
netstat -ano | findstr :3001

# Check what's using port 3000
netstat -ano | findstr :3000

# Check what's using port 5432
netstat -ano | findstr :5432
```

Then stop the process using that port. Common causes:
- A local development server is running (`npm run start:dev` or `npm run dev`)
- A previous Docker container is still running
- Another PostgreSQL instance is installed and running

**Stop local development servers:**
```bash
# Stop any running npm processes
# Press Ctrl+C in the terminal where they're running, or close the terminal
```

**Stop Docker containers:**
```bash
docker-compose down
# or for specific containers
docker stop maktabi_backend maktabi_frontend maktabi_postgres
```

#### Solution 2: Change the port mapping

If you can't stop the conflicting service, edit `docker-compose.yml` to use different ports:

```yaml
backend:
  ports:
    - "3002:3001"  # Changed from 3001:3001 - backend now accessible on localhost:3002

frontend:
  ports:
    - "3001:3000"  # Changed from 3000:3000 - frontend now accessible on localhost:3001

postgres:
  ports:
    - "5433:5432"  # Changed from 5432:5432 - database now accessible on localhost:5433
```

**Important:** If you change the backend port, also update `NEXT_PUBLIC_API_URL` in the frontend service:

```yaml
frontend:
  environment:
    NEXT_PUBLIC_API_URL: "http://localhost:3002"  # Match the new backend port
```

### Backend not responding (ERR_EMPTY_RESPONSE)

If the frontend shows errors like `net::ERR_EMPTY_RESPONSE` when trying to connect to the backend API at `http://localhost:3001`, this means the backend container has crashed or failed to start.

#### Diagnosis

**Check backend container status:**
```bash
docker ps -a | grep maktabi_backend
```

If the container shows as "Exited" or keeps restarting, view the logs:

```bash
docker logs maktabi_backend
```

#### Common causes and solutions

**1. Database connection failure**

The backend depends on PostgreSQL being ready. If migrations fail or the database isn't accessible, the backend won't start.

**Solution:**
```bash
# Stop all containers
docker-compose down

# Remove volumes to reset the database
docker volume rm maktabi_postgres_data

# Restart with fresh database
docker-compose up -d

# Watch the backend logs
docker logs -f maktabi_backend
```

**2. Prisma client generation or migration issues**

If you see errors related to Prisma or database schema:

```bash
# Rebuild the backend image from scratch
docker-compose down
docker rmi maktabi-backend:latest
docker-compose up -d --build

# Watch the logs
docker logs -f maktabi_backend
```

**3. Seed script failures**

The backend tries to seed demo data on first start. If the seed fails (e.g., data already exists), the new entrypoint script will continue anyway. However, if you see seed-related errors:

```bash
# The seed is now optional and won't block startup
# Check logs to confirm the backend started despite seed warnings
docker logs maktabi_backend
```

**4. Port already in use**

If another process is using port 3001, the backend container may fail. See the "Port already in use" section above.

**5. Check backend health manually**

Once the container is running, verify the backend is responding:

```bash
# Should return API documentation
curl http://localhost:3001/api/docs

# Should return 200 OK or 401 Unauthorized (both mean backend is working)
curl http://localhost:3001/auth/login
```

If curl works but the browser doesn't, check CORS settings or try clearing browser cache.

### Docker image deletion error

If you see this error when trying to delete Docker images:

```
Image maktabi-backend:latest is in use. Delete the container that's using it and try again.
```

This occurs when containers are still running or stopped containers still reference the image. Use the cleanup script to safely remove containers and images:

#### Automated cleanup (recommended)

**Linux / macOS:**
```bash
./docker-cleanup.sh
```

**Windows (PowerShell):**
```powershell
.\docker-cleanup.ps1
```

#### Manual cleanup

**Stop and remove containers:**
```bash
docker-compose down
docker rm -f maktabi_backend maktabi_frontend maktabi_postgres
```

**Remove images:**
```bash
docker rmi maktabi-backend:latest maktabi-frontend:latest
```

**Remove volumes (optional - deletes database data):**
```bash
docker volume rm maktabi_postgres_data
```

**Remove all project resources at once:**
```bash
docker-compose down -v --rmi all
```

### PostgreSQL initialization error

If you see this error when starting Docker containers:

```
Database is uninitialized and superuser password is not specified.
You must specify POSTGRES_PASSWORD to a non-empty value for the superuser.
```

This occurs when an **old Docker volume** exists from a previous failed PostgreSQL initialization. The solution is to remove the old volume:

#### Option 1: Reset database volume (data will be lost)

```bash
# Stop all containers
docker-compose down

# Remove the postgres volume
docker volume rm maktabi_postgres_data

# Start containers again
docker-compose up -d
```

#### Option 2: Full cleanup (removes all containers, volumes, and images)

```bash
# Stop and remove all containers, networks, volumes for this project
docker-compose down -v

# Optional: Remove images as well to rebuild from scratch
docker-compose down -v --rmi all

# Start fresh
docker-compose up -d
```

#### For docker-compose.db-only.yml

If using the database-only setup:

```bash
docker-compose -f docker-compose.db-only.yml down -v
docker-compose -f docker-compose.db-only.yml up -d
```

> **Note:** The `-v` flag removes volumes. Any data in the PostgreSQL database will be deleted. The database will be recreated with the seed data when you restart the containers.