// Mock API server – mirrors semestralni-projekt Apiary spec
// POST /login   → returns { token }
// GET /items    → returns array of items
// POST /items   → creates item, returns 201
// GET /items/:id
// PUT /items/:id
// DELETE /items/:id → 204
import { createServer } from 'node:http';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, 'db.json');

const VALID_EMAIL = 'student@univerzita.cz';
const VALID_PASSWORD = 'mojetajneheslo';
const PORT = 3000;

function readDb() {
  return JSON.parse(readFileSync(DB_PATH, 'utf-8'));
}

function writeDb(data) {
  writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try { resolve(JSON.parse(body)); } catch { resolve({}); }
    });
  });
}

function send(res, status, data) {
  const body = status === 204 ? '' : JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  });
  res.end(body);
}

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') { send(res, 204, null); return; }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;

  // POST /login
  if (req.method === 'POST' && path === '/login') {
    const body = await readBody(req);
    if (body.email === VALID_EMAIL && body.password === VALID_PASSWORD) {
      send(res, 200, { token: 'mock-jwt-token-' + Date.now() });
    } else {
      send(res, 401, { message: 'Invalid credentials' });
    }
    return;
  }

  if (req.method === 'GET' && path === '/items') {
    const db = readDb();
    send(res, 200, db.items);
    return;
  }

  if (req.method === 'POST' && path === '/items') {
    const db = readDb();
    const body = await readBody(req);
    const newItem = { id: Date.now(), ...body };
    db.items.push(newItem);
    writeDb(db);
    send(res, 201, newItem);
    return;
  }

  const itemMatch = path.match(/^\/items\/(\d+)$/);
  if (itemMatch) {
    const id = Number(itemMatch[1]);
    const db = readDb();
    const idx = db.items.findIndex((i) => i.id === id);

    if (req.method === 'GET') {
      if (idx === -1) { send(res, 404, { message: 'Not found' }); return; }
      send(res, 200, db.items[idx]);
      return;
    }

    if (req.method === 'PUT') {
      const body = await readBody(req);
      if (idx === -1) { send(res, 404, { message: 'Not found' }); return; }
      db.items[idx] = { id, ...body };
      writeDb(db);
      send(res, 200, db.items[idx]);
      return;
    }

    if (req.method === 'DELETE') {
      if (idx === -1) { send(res, 404, { message: 'Not found' }); return; }
      db.items.splice(idx, 1);
      writeDb(db);
      send(res, 204, null);
      return;
    }
  }

  send(res, 404, { message: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`Mock API server running at http://localhost:${PORT}`);
  console.log(`  POST /login    { email, password } → { token }`);
  console.log(`  GET  /items`);
  console.log(`  POST /items`);
  console.log(`  GET  /items/:id`);
  console.log(`  PUT  /items/:id`);
  console.log(`  DELETE /items/:id`);
});
