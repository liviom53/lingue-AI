import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "dist/public");
const PORT = Number(process.env.PORT ?? 19529);
const BASE = "/lingua-ai";

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

const server = http.createServer((req, res) => {
  let url = req.url.split("?")[0];
  console.log(`[lingua-ai] ${req.method} ${url}`);

  let stripped = url;
  if (stripped.startsWith(BASE)) {
    stripped = stripped.slice(BASE.length) || "/";
  }
  if (stripped === "") stripped = "/";

  let filePath = path.join(distDir, stripped);

  try {
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      filePath = path.join(filePath, "index.html");
      fs.statSync(filePath);
    }
  } catch {
    filePath = path.join(distDir, "index.html");
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || "application/octet-stream";
  const isHtml = ext === ".html";

  let content;
  try {
    content = fs.readFileSync(filePath);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
    return;
  }

  res.writeHead(200, {
    "Content-Type": contentType,
    "Cache-Control": isHtml
      ? "no-cache, no-store, must-revalidate"
      : "public, max-age=31536000, immutable",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(content);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[lingua-ai] serving at http://0.0.0.0:${PORT}/lingua-ai/`);
  console.log(`[lingua-ai] dist dir: ${distDir}`);
});
