import { createServer } from 'node:http';
import { createReadStream, existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, 'dist/public');
const port = parseInt(process.env.PORT || '22883');
const indexHtml = path.join(publicDir, 'index.html');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

console.log(`[diario] publicDir: ${publicDir}`);
console.log(`[diario] index.html exists: ${existsSync(indexHtml)}`);

createServer(async (req, res) => {
  const urlPath = new URL(req.url, 'http://localhost').pathname;
  console.log(`[diario] ${req.method} ${urlPath}`);

  let filePath = path.join(publicDir, urlPath);

  try {
    const s = await stat(filePath);
    if (s.isDirectory()) filePath = path.join(filePath, 'index.html');
  } catch {
    filePath = indexHtml;
  }

  if (!existsSync(filePath)) {
    console.log(`[diario] 404: ${filePath}`);
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';

  res.writeHead(200, { 'Content-Type': contentType });
  const stream = createReadStream(filePath);
  stream.on('error', (err) => {
    console.error(`[diario] stream error: ${err.message}`);
    if (!res.writableEnded) res.end();
  });
  stream.pipe(res);
}).listen(port, '0.0.0.0', () => {
  console.log(`[diario] serving on 0.0.0.0:${port}`);
});
