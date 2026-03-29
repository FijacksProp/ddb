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

## Deploy on Render

This repo is now prepared for Render with a blueprint file: `render.yaml`.

### What gets deployed

- `ddb-backend` (Django web service in `backend/`)
- `ddb-frontend` (Node web service serving built React app)
- `ddb-postgres` (managed Postgres database)

### One-time setup

1. Push this repo to GitHub.
2. In Render, choose **New + > Blueprint**.
3. Select the GitHub repo and deploy.
4. After first deploy, replace placeholder hostnames in Render env vars:
   - `DJANGO_ALLOWED_HOSTS`
   - `DJANGO_CSRF_TRUSTED_ORIGINS`
   - `DJANGO_CORS_ALLOWED_ORIGINS`
   - `VITE_API_URL`

### Notes

- Backend build runs migrations and `collectstatic` automatically via `backend/render-build.sh`.
- Backend reads `DATABASE_URL` when provided (Render Postgres), otherwise falls back to local SQLite config.
- For local development, continue using `.env` from `backend/.env.example`.
