import express from "express";
import webpush from "web-push";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Basic file-based persistence (replace with a real database in production).
const SUBSCRIPTIONS_FILE = path.join(process.cwd(), "subscriptions.json");
const subscriptions = new Set();

// Load subscriptions from file on startup
try {
  if (fs.existsSync(SUBSCRIPTIONS_FILE)) {
    const data = fs.readFileSync(SUBSCRIPTIONS_FILE, "utf8");
    const subs = JSON.parse(data);
    subs.forEach(sub => subscriptions.add(sub));
    console.log(`Loaded ${subscriptions.size} subscriptions from file`);
  }
} catch (err) {
  console.warn("Failed to load subscriptions from file:", err.message);
}

// Save subscriptions to file
const saveSubscriptions = () => {
  try {
    fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify([...subscriptions], null, 2));
  } catch (err) {
    console.error("Failed to save subscriptions:", err.message);
  }
};

const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

if (!publicKey || !privateKey) {
  console.warn("Missing VAPID keys. Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY.");
} else {
  webpush.setVapidDetails("mailto:admin@example.com", publicKey, privateKey);
}

app.get("/api/push/vapid-public-key", (req, res) => {
  res.json({ publicKey });
});

app.get("/api/subs", (req, res) => {
  const subs = [...subscriptions].map(raw => JSON.parse(raw));
  return res.json({ ok: true, subscriptions: subs });
});

app.post("/api/subs", (req, res) => {
  const subscription = req.body;
  if (!subscription) return res.status(400).json({ ok: false, message: "Missing subscription" });

  const raw = JSON.stringify(subscription);
  subscriptions.add(raw);
  saveSubscriptions();

  return res.json({ ok: true });
});

app.post("/api/push/subscribe", (req, res) => {
  const subscription = req.body;
  if (!subscription) return res.status(400).json({ ok: false });
  subscriptions.add(JSON.stringify(subscription));
  saveSubscriptions(); // Persist to file
  return res.json({ ok: true });
});

app.post("/api/push/notify", async (req, res) => {
  if (req.headers['x-api-key'] !== process.env.API_SECRET) return res.status(401).end();

  const payload = JSON.stringify(req.body || {});
  const results = [];

  for (const raw of subscriptions) {
    const subscription = JSON.parse(raw);
    try {
      await webpush.sendNotification(subscription, payload);
      results.push({ ok: true });
    } catch (err) {
      results.push({ ok: false, error: err?.message || "send failed" });
    }
  }

  return res.json({ ok: true, results });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Push server listening on ${port}`);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ ok: false, error: 'Internal error' });
});
