# DDB Bug Fixes TODO

## Plan Overview
- Critical: Missing apiService → Create with axios + demo fallback.
- Profile prop mismatches.
- Security: settings.py.
- Integration gaps.

## Steps
- [ ] 1. Create client/src/services/api.ts (full impl).
- [ ] 2. Edit client/src/pages/Profile.tsx (fix user props).
- [ ] 3. Edit backend/ddb_backend/settings.py (secure key/DEBUG).
- [ ] 4. Test: pnpm check, run dev/backend, verify login no crash.
- [ ] 5. Complete.

Current: Starting step 1.
