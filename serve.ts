// Tiny static server for game/ (Node 22, standard library only), so the
// entry can be played locally without a build step:
//   node serve.ts [--port 8080]
// Serves game/ on http://localhost:8080 by default. It sends the MIME
// types a browser game needs, refuses any path outside game/, and does
// nothing clever: a development convenience, not a web server.

import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('./game', import.meta.url)));
const args = process.argv.slice(2);
const portIndex = args.indexOf('--port');
const requested = portIndex === -1 ? 8080 : Number(args[portIndex + 1]);
const port = Number.isInteger(requested) && requested > 0 && requested < 65536 ? requested : 8080;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.txt': 'text/plain; charset=utf-8',
};

createServer((request, response) => {
  try {
    const url = new URL(request.url ?? '/', 'http://localhost');
    let rel = decodeURIComponent(url.pathname);
    if (rel === '/') rel = '/index.html';
    const file = resolve(join(root, normalize(rel).replace(/^(\.\.[/\\])+/, '')));
    if (!file.startsWith(root + sep) && file !== root) {
      response.writeHead(403);
      response.end('forbidden');
      return;
    }
    const st = statSync(file);
    if (!st.isFile()) {
      response.writeHead(404);
      response.end('not found');
      return;
    }
    response.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' });
    createReadStream(file).pipe(response);
  } catch (_) {
    response.writeHead(404);
    response.end('not found');
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`serving game/ on http://127.0.0.1:${port}`);
});
