// Integrationstest: Endpoint -> Datenbank -> layoutSuggester (echter HTTP-Server, In-Memory-DB)
process.env.DB_PATH = ':memory:';

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const database = require('../database');
const app = require('../app');
const { DE_QWERTZ_KEYS } = require('../data/keyboardLayout');

const MAIN = DE_QWERTZ_KEYS.filter(k => k.zone === 'main').map(k => k.keyId);
const ALL_FINGERS = ['LLittle', 'LRing', 'LMiddle', 'LIndex', 'LThumb', 'RThumb', 'RIndex', 'RMiddle', 'RRing', 'RLittle'];
const TWO_INDEX = ['LIndex', 'RIndex'];

let server, base;
test.before(async () => {
  await database.ready;
  server = http.createServer(app);
  await new Promise(r => server.listen(0, r));
  base = `http://127.0.0.1:${server.address().port}`;
});

test.after(() => {
  server.close();
  database.close();
});

async function call(method, url, body) {
  const res = await fetch(base + url, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  return { status: res.status, body: await res.json() };
}

test('default: all fingers on, no layout saved yet', async () => {
  const f = await call('GET', '/api/finger/1');
  assert.equal(f.status, 200);
  assert.equal(f.body.enabledIds.length, 10);

  const k = await call('GET', '/api/keyboard/1');
  assert.equal(k.body.isComplete, false);
  assert.equal(k.body.homes, null);
});

test('user validation errors on keyboard routes return JSON', async () => {
  assert.equal((await call('GET', '/api/keyboard/999')).status, 404);
  assert.equal((await call('GET', '/api/keyboard/abc')).status, 400);
});

test('suggestion -> PUT -> GET: round trip saves mapping and returns homes', async () => {
  const s = await call('POST', '/api/keyboard/1/suggestion', {});
  assert.equal(s.status, 200);
  assert.equal(Object.keys(s.body.mapping).length, MAIN.length);
  assert.equal(s.body.homeMode, 'fixed');

  const payload = Object.fromEntries(
    Object.entries(s.body.mapping).map(([k, v]) => [
      k,
      typeof v === 'string' ? { fingerId: v, source: 'suggested' } : v
    ])
  );

  const put = await call('PUT', '/api/keyboard/1', { mapping: payload });
  assert.equal(put.status, 200);
  assert.equal(put.body.saved, MAIN.length);

  const g = await call('GET', '/api/keyboard/1');
  assert.equal(g.body.isComplete, true);
  assert.equal(g.body.homeMode, 'fixed');
  assert.ok(Object.values(g.body.mapping).every(e => e.source === 'suggested'));
  assert.equal(g.body.mapping.KeyÖ.fingerId, 'RLittle');
});

test('locked keys stay locked on next suggestion and reset with resetManual', async () => {
  const s = await call('POST', '/api/keyboard/2/suggestion', {
    fingers: TWO_INDEX,
    lockedKeys: { KeyE: 'RIndex' }
  });
  assert.equal(s.status, 200);
  const keyEFinger = typeof s.body.mapping.KeyE === 'string' ? s.body.mapping.KeyE : s.body.mapping.KeyE.fingerId;
  assert.equal(keyEFinger, 'RIndex');

  await call('PUT', '/api/finger/2', { fingers: TWO_INDEX });

  const toSave = Object.fromEntries(
    Object.entries(s.body.mapping).map(([k, v]) => {
      const fingerId = typeof v === 'string' ? v : v.fingerId;
      return [k, { fingerId, source: k === 'KeyE' ? 'manual' : 'suggested' }];
    })
  );
  assert.equal((await call('PUT', '/api/keyboard/2', { mapping: toSave })).status, 200);

  const again = await call('POST', '/api/keyboard/2/suggestion', {});
  const againE = typeof again.body.mapping.KeyE === 'string' ? again.body.mapping.KeyE : again.body.mapping.KeyE.fingerId;
  assert.equal(againE, 'RIndex');

  const reset = await call('POST', '/api/keyboard/2/suggestion', { resetManual: true });
  const resetE = typeof reset.body.mapping.KeyE === 'string' ? reset.body.mapping.KeyE : reset.body.mapping.KeyE.fingerId;
  assert.equal(resetE, 'LIndex');
});

test('changing fingers: needsNewSuggestion, GET reports incomplete layout', async () => {
  const s = await call('POST', '/api/keyboard/3/suggestion', {});
  const payload = Object.fromEntries(
    Object.entries(s.body.mapping).map(([k, v]) => [k, { fingerId: typeof v === 'string' ? v : v.fingerId, source: 'suggested' }])
  );
  await call('PUT', '/api/keyboard/3', { mapping: payload });

  const same = await call('PUT', '/api/finger/3', { fingers: ALL_FINGERS });
  assert.equal(same.body.needsNewSuggestion, false);

  const less = await call('PUT', '/api/finger/3', { fingers: TWO_INDEX });
  assert.equal(less.body.needsNewSuggestion, true);
  assert.equal((await call('GET', '/api/keyboard/3')).body.isComplete, false);
});

test('validation', async () => {
  assert.equal((await call('PUT', '/api/finger/4', { fingers: [] })).status, 400);
  assert.equal((await call('PUT', '/api/finger/4', { fingers: ['InvalidFinger'] })).status, 400);
  assert.equal((await call('POST', '/api/keyboard/4/suggestion', { fingers: [] })).status, 400);
  assert.equal((await call('PUT', '/api/keyboard/4', {})).status, 400);
  assert.equal((await call('PUT', '/api/keyboard/4', { mapping: [] })).status, 400);
  assert.equal((await call('PUT', '/api/keyboard/4', { mapping: { Nonsense: 'LIndex' } })).status, 400);

  const incomplete = await call('PUT', '/api/keyboard/4', { mapping: { KeyA: 'LIndex' } });
  assert.equal(incomplete.status, 400);
  assert.equal(incomplete.body.missing.length, MAIN.length - 1);

  const full = Object.fromEntries(MAIN.map(k => [k, 'LIndex']));
  assert.equal((await call('PUT', '/api/keyboard/4', { mapping: { ...full, KeyA: 'RIndex' } })).status, 200);

  await call('PUT', '/api/finger/4', { fingers: ['LIndex'] });
  assert.equal((await call('PUT', '/api/keyboard/4', { mapping: { ...full, KeyA: 'RIndex' } })).status, 400);
  assert.equal((await call('PUT', '/api/keyboard/4', { mapping: { ...full, KeyA: { fingerId: 'LIndex', source: 'x' } } })).status, 400);
});

test('10 parallel saves for one user all succeed (shared connection)', async () => {
  const s = await call('POST', '/api/keyboard/1/suggestion', {});
  const payload = Object.fromEntries(
    Object.entries(s.body.mapping).map(([k, v]) => [k, { fingerId: typeof v === 'string' ? v : v.fingerId, source: 'suggested' }])
  );
  const results = await Promise.all(
    Array.from({ length: 10 }, () => call('PUT', '/api/keyboard/1', { mapping: payload }))
  );
  assert.ok(results.every(r => r.status === 200), JSON.stringify(results.map(r => r.status)));

  const rows = await new Promise((res, rej) =>
    database.get('SELECT COUNT(*) n FROM key_mappings WHERE userID = 1', (e, r) => e ? rej(e) : res(r))
  );
  assert.equal(rows.n, MAIN.length);
});