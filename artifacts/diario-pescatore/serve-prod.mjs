import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "dist/public");
const PORT = Number(process.env.PORT ?? 22883);
const BASE = "";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

const indexPath = path.join(distDir, "index.html");
console.log(`[diario-pescatore] dist dir: ${distDir}`);
console.log(`[diario-pescatore] index.html exists: ${fs.existsSync(indexPath)}`);

const server = http.createServer((req, res) => {
  let url = req.url.split("?")[0];

  let stripped = url;
  if (BASE && stripped.startsWith(BASE)) {
    stripped = stripped.slice(BASE.length) || "/";
  }
  if (stripped === "") stripped = "/";

  let filePath = path.join(distDir, stripped);
  let status = 200;

  try {
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      filePath = path.join(filePath, "index.html");
      fs.statSync(filePath);
    }
  } catch {
    filePath = indexPath;
    status = 200;
  }

  const ext = path.extname(filePath);
  const ct = MIME[ext] ?? "application/octet-stream";

  const isHtml = ct.startsWith("text/html");
  const cacheHeader = isHtml
    ? "no-cache, no-store, must-revalidate"
    : "public, max-age=31536000, immutable";

  try {
    const data = fs.readFileSync(filePath);
    res.writeHead(status, {
      "Content-Type": ct,
      "Cache-Control": cacheHeader,
    });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[diario-pescatore] Server running on port ${PORT}`);
});
