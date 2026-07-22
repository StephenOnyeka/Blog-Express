# Blog API — Postman documentation

This folder contains an auto-generated OpenAPI 3.0 spec (`openapi.json`) describing
every endpoint of the Blog backend. Postman imports it directly and builds a full
collection (folders per tag, example bodies, and bearer auth wired up).

## Regenerating the spec

The spec is generated from the project's existing Zod validators — they are the
single source of truth, so the docs never drift from what the API actually accepts.

```bash
npm run docs:postman
```

This writes `postman/openapi.json`. Re-run it whenever you add or change a route or
validator. The generator code lives in [`src/docs`](../src/docs):

- `setup.ts` — enables `.openapi()` on Zod (must load before any schema is built)
- `registry.ts` — request/response schemas + the `bearerAuth` security scheme
- `paths.ts` — every endpoint, its params, and responses
- `generate.ts` — emits `postman/openapi.json`

## Importing into Postman

1. Open Postman → **Import** (top-left).
2. Drag in `postman/openapi.json` (or **Files → Choose Files**).
3. Choose **"Import as: Postman Collection"** and keep the defaults. Postman creates a
   **Blog API** collection with a folder per tag (Auth, Users, Articles, …).

### Set the base URL

Postman reads `servers[0].url` from the spec, so requests default to
`http://localhost:8080/api`. To point at another environment, edit the collection
variable **`baseUrl`** (Collection → Variables) — e.g. your deployed URL.

### Authenticate (JWT bearer)

Protected endpoints (🔒 `/auth/me`, article/user writes, all notifications) use a
bearer token.

1. Send **Auth → Log in** (or **Register**) with a valid body. The response contains
   a `token`.
2. Copy that `token`.
3. On the **Blog API** collection → **Authorization** tab, the type is already
   **Bearer Token**. Paste the token into the **Token** field (or set a
   `{{token}}` collection variable and reference it).
4. All 🔒 requests inherit this automatically.

> Tip: add this test script to the Login request to auto-capture the token:
> ```js
> pm.collectionVariables.set("token", pm.response.json().token);
> ```

## Endpoint summary

| Tag | Endpoints |
| --- | --- |
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` 🔒, `GET /auth/google`, `GET /auth/google/callback` |
| Users | `GET /users/{id}`, `PUT /users/{id}` 🔒, `POST /users/{id}/follow` 🔒, `DELETE /users/{id}/follow` 🔒 |
| Articles | `GET /articles`, `GET /articles/{id}`, `POST /articles` 🔒, `PUT /articles/{id}` 🔒, `DELETE /articles/{id}` 🔒 |
| Notifications 🔒 | `GET /notifications`, `GET /notifications/unread-count`, `PATCH /notifications/read-all`, `PATCH /notifications/{id}/read` |
| Subscriptions | `POST /subscriptions`, `GET /subscriptions/verify`, `DELETE /subscriptions/unsubscribe` |
| System | `GET /health` |

🔒 = requires a bearer token.
