import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { authMiddleware } from "./middleware/auth.js";
import type { Env, AppVariables } from "./types.js";

import healthRoutes from "./routes/health.js";
import betaSignupRoutes from "./routes/beta-signups.js";
import conversationRoutes from "./routes/conversations.js";
import messageRoutes from "./routes/messages.js";
import profileRoutes from "./routes/profiles.js";
import quickReplyRoutes from "./routes/quick-replies.js";
import webhookRoutes from "./routes/webhooks.js";
import adminRoutes from "./routes/admin.js";

const app = new Hono<{ Bindings: Env; Variables: AppVariables }>();

// ---- Global middleware ----
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "https://app.brildesk.com"],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

// ---- Public routes (no auth) ----
app.route("/health", healthRoutes);
app.route("/api/webhooks", webhookRoutes);
app.route("/api/beta-signups", betaSignupRoutes);

// ---- Protected routes ----
const api = new Hono<{ Bindings: Env; Variables: AppVariables }>();
api.use("/*", authMiddleware);
api.route("/conversations", conversationRoutes);
api.route("/messages", messageRoutes);
api.route("/profiles", profileRoutes);
api.route("/quick-replies", quickReplyRoutes);
api.route("/admin", adminRoutes);

app.route("/api", api);

// ---- 404 / error ----
app.notFound((c) => c.json({ error: "Not found" }, 404));
app.onError((err, c) => {
  console.error("[Worker] Unhandled error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

export default app;
