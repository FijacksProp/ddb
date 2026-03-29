# DDB Nigeria Platform

This repository now has two clear layers:

- `client/`: responsive React customer banking portal
- `backend/`: Django monolith scaffold for accounts, wallets, transfers, loans, investments, and notifications

## Frontend direction

The React app has been refactored into a more realistic banking experience:

- responsive desktop/mobile app shell
- persistent multi-user demo state via local storage
- wallet-to-wallet transfers between users
- footprint-based loan decisions
- investment booking flow
- improved visual system, typography, spacing, and motion

## Backend direction

The Django backend follows the monolith recommendation from the project overview:

- custom user model in `apps.accounts`
- wallets, transfers, and ledger entries in `apps.banking`
- loan products and loan applications in `apps.loans`
- investment products and holdings in `apps.investments`
- notifications and audit trail models in `apps.engagement`

## Run the frontend

Install dependencies and start Vite:

```powershell
pnpm install
pnpm dev
```

## Run the backend

Create a Python virtual environment, install requirements, configure `.env`, then run migrations:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## Production gaps still to implement

This is not yet a production banking system. The remaining high-value work is:

- connect the React app to Django API endpoints instead of local-storage demo state
- add migrations, admin registrations, tests, and fixtures
- integrate JWT auth flow, OTP, BVN/NIN/KYC providers, and payment rails
- move loan scoring into service modules and background jobs
- add double-entry ledger controls beyond the current scaffold
- implement reconciliation, limits, fraud checks, and audit enforcement

## Deploy on Render with Supabase Postgres

This repo is configured for Render web services + Supabase managed Postgres.

### Services

- `ddb-backend` (Django service in `backend/`)
- `ddb-frontend` (Node service serving built React app)

### Supabase database setup

1. Create a Supabase project.
2. Go to `Project Settings > Database`.
3. Copy your Postgres connection string.
4. Prefer Supabase pooler connection string for production.
5. Ensure the URL includes `sslmode=require`.

### Render setup

1. Push this repo to GitHub.
2. In Render, choose **New + > Blueprint** and select this repo.
3. Open backend environment variables and set:
   - `DATABASE_URL` = your Supabase Postgres URL
   - `DJANGO_ALLOWED_HOSTS` = backend host only
   - `DJANGO_CSRF_TRUSTED_ORIGINS` = frontend URL with `https://`
   - `DJANGO_CORS_ALLOWED_ORIGINS` = frontend URL with `https://`
4. Open frontend environment variables and set:
   - `VITE_API_URL` = `https://<your-backend-host>/api/v1`
5. Redeploy both services.

### Notes

- Backend build runs migrations and `collectstatic` via `backend/render-build.sh`.
- In production, Django now requires `DATABASE_URL` and will fail fast if missing.
- `DB_DISABLE_SERVER_SIDE_CURSORS=True` is set in `render.yaml` for safer Supabase pooler compatibility.
