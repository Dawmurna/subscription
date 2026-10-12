# Push notification scaffold

This server is a minimal Web Push scaffold for persistent notifications.

Setup steps (later):
1) Install deps in `server/`: `npm install`
2) Generate VAPID keys:
   - `npx web-push generate-vapid-keys`
3) Create `.env` with:
   - `VAPID_PUBLIC_KEY=...`
   - `VAPID_PRIVATE_KEY=...`
4) Start server:
   - `npm start`

Endpoints:
- `GET /api/push/vapid-public-key`
- `POST /api/push/subscribe` (store a browser subscription)
- `POST /api/push/notify` (send a payload to all stored subscriptions)
