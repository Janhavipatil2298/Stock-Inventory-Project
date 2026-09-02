# InventoryPro-AI — Flask Backend

A Flask + MySQL backend built to match `src/types/index.ts` of the
`inventorypro-ai` React frontend exactly, so the JSON returned by every
endpoint can be consumed with **no field renaming** on the frontend
(camelCase keys throughout).

## Stack
- **Flask** – web framework
- **Flask-SQLAlchemy** – ORM
- **mysql-connector-python** – MySQL driver (via SQLAlchemy dialect `mysql+mysqlconnector`)
- **Flask-JWT-Extended** – auth (JWT bearer tokens)
- **Flask-Cors** – allows the Vite dev server to call the API

## 1. Setup

```bash
cd inventorypro_backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env            # then edit DB_* values
```

Create the MySQL database:
```sql
CREATE DATABASE inventorypro CHARACTER SET utf8mb4;
```

## 2. Create tables & seed demo data

```bash
python seed.py
```

This creates every table and a default Super Admin login matching the
frontend's pre-filled `LoginPage`:
```
email:    alexander.vance@inventorypro.ai
password: Passw0rd!
```
Also creates an `admin` and an `employee` demo account (same password),
plus one sample product/customer/supplier/warehouse so the dashboards
aren't empty on first run.

## 3. Run the server

```bash
python run.py
# → http://localhost:5000
```

## 4. Point the frontend at it

In the frontend's `Settings` module (`ERPConfig`), set:
```
pythonBackendUrl: http://localhost:5000
usePythonBackend: true
```
Or set `VITE_API_URL=http://localhost:5000/api` if you wire up an API
client (see "Frontend integration" below).

---

## Auth

All endpoints except `/api/auth/login`, `/api/auth/register`,
`/api/auth/forgot-password`, and `/api/health` require:
```
Authorization: Bearer <token>
```
`role` (`super_admin` / `admin` / `employee`) is embedded as a JWT claim
and enforced per-route:
- `employee` — read access + self-service (own leave/attendance, sales entry)
- `admin` — full CRUD on products/suppliers/purchases/employees etc.
- `super_admin` — everything, plus role changes, ERP config, deleting employees

## API Overview

| Module | Base path | Notes |
|---|---|---|
| Auth | `/api/auth` | `login`, `register`, `me`, `change-password`, `forgot-password` |
| Products | `/api/products` | CRUD, `/low-stock`, `/<id>/adjust-stock` (auto-logs a StockMovement) |
| Categories | `/api/categories` | CRUD |
| Suppliers | `/api/suppliers` | CRUD |
| Customers | `/api/customers` | CRUD |
| Sales Orders | `/api/sales` | Create auto-deducts stock & computes totals from line items |
| Purchase Orders | `/api/purchases` | `/<id>/receive` auto-increments stock |
| Warehouses | `/api/warehouses` | CRUD |
| Stock Movements | `/api/movements` | read-only ledger, filter by `productId` |
| Notifications | `/api/notifications` | list, mark read, delete |
| Employees | `/api/employees` | CRUD (super_admin required to grant admin roles) |
| Leave Requests | `/api/leave-requests` | employees self-file, admins review/approve |
| Attendance | `/api/attendance` | `clock-in` / `clock-out` |
| Config | `/api/config` | ERPConfig (super_admin to edit) |
| Dashboard | `/api/dashboard/summary`, `/api/dashboard/ai-insights` | KPI + AI insight numbers, computed from real DB data |

List endpoints support `?page=&perPage=` and return:
```json
{ "data": [...], "meta": { "page": 1, "perPage": 20, "total": 42, "totalPages": 3 } }
```

## Frontend integration

The React app currently persists everything to `localStorage`
(`src/services/storageService.ts`). To swap in this backend:
1. Create `src/services/apiClient.ts` with a small `fetch` wrapper that
   attaches `Authorization: Bearer <token>` (store the JWT from
   `/api/auth/login` in memory or `sessionStorage`).
2. Replace each `storageService` function's localStorage read/write with
   a call to the matching endpoint above — response shapes already match
   the `src/types/index.ts` interfaces, so component code doesn't change.
3. `ERPConfig.usePythonBackend` / `pythonBackendUrl` in `types/index.ts`
   already anticipate this — wire `App.tsx`'s data loading to branch on
   that flag.

## Project layout
```
inventorypro_backend/
├── app/
│   ├── __init__.py          # app factory, blueprint registration
│   ├── config.py            # env-driven config
│   ├── extensions.py        # db, jwt, cors singletons
│   ├── utils.py             # roles_required / min_role decorators, pagination
│   ├── models/models.py     # SQLAlchemy models (1:1 with types/index.ts)
│   └── routes/              # one blueprint per module
├── seed.py                  # create_all() + demo data
├── run.py                   # dev server entrypoint
├── requirements.txt
└── .env.example
```
