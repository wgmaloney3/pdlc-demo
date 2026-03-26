# Clayton Demo — mock API (phases 2–3 stand-in)

Use this until Aurora/FastAPI/Clayton integration and feature APIs are live. All routes use in-memory state (resets on server restart except hard-coded fixture homes).

## Run

```bash
cd mock-api
python -m pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

- OpenAPI UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- From the React app, set `VITE_API_BASE_URL=http://127.0.0.1:8000` and send `Authorization: Bearer <token>` after login.

## What this covers

| Phase | Work orders (approx.) | Mock routes |
|-------|----------------------|-------------|
| 2 | Auth, FastAPI shell | `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` |
| 2 | Clayton / inventory (stub) | Fixture homes in `GET /api/homes`, `POST /api/matching/run` |
| 3 | Buyer profile / questionnaire | `GET/PUT /api/buyer/profile` |
| 3 | Matching | `POST /api/matching/run` |
| 3 | Home detail | `GET /api/homes/{id}` |
| 3 | Favorites | `GET/POST /api/favorites`, `DELETE /api/favorites/{id}`, `GET /api/favorites/compare?ids=` |
| 3 | Customization | `GET /api/homes/{id}/customization/options`, `PUT .../selection` |

**Not mocked here:** S3 uploads, async inventory sync job, LLM/NLP search (phase 4–5). Add routes in `main.py` as needed.

## Auth

1. `POST /auth/login` with `{"email":"you@example.com","password":"anything"}`  
2. Use returned `access_token` as `Authorization: Bearer <token>` on subsequent calls.

Log in once per dev session; tokens are stored in server memory only.

## Frontend + MSW (browser mocks)

In `frontend/`:

- **`.env.development`** — `VITE_USE_MSW=true` uses [MSW](https://mswjs.io/) so the UI works **without** this Python process. Set `VITE_USE_MSW=false` to call this mock-api instead (run uvicorn on port 8000).
- **`src/mocks/`** — handlers mirror these routes; **`src/mocks/fixtures.ts`** should stay aligned with `mock-api/main.py` fixtures.

```bash
cd frontend
npm install
npm run dev
```

Open the app, use **Log in (mock)**, then the home list loads via the same API contract.
