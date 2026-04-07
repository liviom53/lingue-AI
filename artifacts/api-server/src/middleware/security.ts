import { type Request, type Response, type NextFunction } from "express";

const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX = 30;
const MAX_INPUT_CHARS = 1000;

const ipStore = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.socket.remoteAddress ?? "unknown";
}

function cleanupExpired() {
  const now = Date.now();
  for (const [ip, entry] of ipStore) {
    if (now > entry.resetAt) ipStore.delete(ip);
  }
}

export function aiRateLimit(req: Request, res: Response, next: NextFunction) {
  if (ipStore.size > 5000) cleanupExpired();

  const ip = getClientIp(req);
  const now = Date.now();
  const entry = ipStore.get(ip);

  if (!entry || now > entry.resetAt) {
    ipStore.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return next();
  }

  if (entry.count >= RATE_MAX) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    res.setHeader("Retry-After", retryAfter);
    return res.status(429).json({
      error: "Troppe richieste. Riprova tra poco.",
      retryAfter,
    });
  }

  entry.count++;
  return next();
}

export function validateInputSize(req: Request, res: Response, next: NextFunction) {
  const body = req.body ?? {};
  const fields = ["text", "message", "word", "sentence"];
  for (const field of fields) {
    const val = body[field];
    if (typeof val === "string" && val.length > MAX_INPUT_CHARS) {
      return res.status(400).json({
        error: `Il campo "${field}" supera il limite di ${MAX_INPUT_CHARS} caratteri.`,
      });
    }
  }
  return next();
}

const ALLOWED_ORIGINS = [
  /\.replit\.app$/,
  /\.replit\.dev$/,
  /^http:\/\/localhost/,
  /^http:\/\/127\.0\.0\.1/,
];

export function checkOrigin(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin ?? "";
  // No origin header or sandboxed iframe ("null") → allow
  if (!origin || origin === "null") return next();

  const allowed = ALLOWED_ORIGINS.some((pattern) => pattern.test(origin));
  if (!allowed) {
    return res.status(403).json({ error: "Origine non autorizzata." });
  }
  return next();
}
