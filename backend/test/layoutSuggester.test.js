const test = require('node:test');
const assert = require('node:assert/strict');
const { DE_QWERTZ_KEYS } = require('../data/keyboardLayout');
const { suggestLayout, homesFor, toEnabledIds } = require('../services/layoutSuggester');

const ALL_FINGERS = ['LLittle', 'LRing', 'LMiddle', 'LIndex', 'LThumb', 'RThumb', 'RIndex', 'RMiddle', 'RRing', 'RLittle'];
const TWO_INDEX = ['LIndex', 'RIndex'];
const mainKeys = DE_QWERTZ_KEYS.filter(k => k.zone === 'main');

// Jede Haupttaste hat einen aktiven Finger, Numpad bleibt leer
function assertComplete(mapping, enabledIds) {
  for (const key of mainKeys) {
    assert.ok(mapping[key.keyId], `${key.keyId} has no finger`);
    assert.ok(enabledIds.includes(mapping[key.keyId]), `${key.keyId} uses a disabled finger`);
  }
  for (const key of DE_QWERTZ_KEYS.filter(k => k.zone === 'numpad')) {
    assert.equal(mapping[key.keyId], undefined);
  }
}

test('10 fingers: fixed homes on the home row', () => {
  const { mapping, homeMode } = suggestLayout(ALL_FINGERS);
  assert.equal(homeMode, 'fixed');
  assertComplete(mapping, ALL_FINGERS);
  assert.equal(mapping.KeyF, 'LIndex');
  assert.equal(mapping.KeyJ, 'RIndex');
  assert.equal(mapping.KeyA, 'LLittle');
  assert.equal(mapping.KeyÖ, 'RLittle');
  assert.equal(mapping.KeyE, 'LMiddle');
  assert.equal(mapping.KeyI, 'RMiddle');
  assert.ok(['LThumb', 'RThumb'].includes(mapping.Space));
});

test('modifiers (Shift, Enter, Backspace, Tab) go to little fingers when available', () => {
  const { mapping } = suggestLayout(ALL_FINGERS);
  assert.equal(mapping.ShiftLeft, 'LLittle');
  assert.equal(mapping.Tab, 'LLittle');
  assert.equal(mapping.CapsLock, 'LLittle');
  assert.equal(mapping.ShiftRight, 'RLittle');
  assert.equal(mapping.Enter, 'RLittle');
  assert.equal(mapping.Backspace, 'RLittle');
});

test('2 index fingers: floating homes, each hand gets its half', () => {
  const { mapping, homes, homeMode } = suggestLayout(TWO_INDEX);
  assert.equal(homeMode, 'floating');
  assertComplete(mapping, TWO_INDEX);
  for (const keyId of ['KeyQ', 'KeyE', 'KeyA', 'KeyG', 'KeyB']) assert.equal(mapping[keyId], 'LIndex');
  for (const keyId of ['KeyZ', 'KeyO', 'KeyP', 'KeyL', 'KeyN']) assert.equal(mapping[keyId], 'RIndex');
  assert.ok(homes.LIndex.x > 3 && homes.LIndex.x < 5.5);
  assert.ok(homes.RIndex.x > 8 && homes.RIndex.x < 10);
});

test('3 fingers: all keys are assigned and the fingers stay in order', () => {
  const enabled = ['LIndex', 'RIndex', 'RMiddle'];
  const { mapping, homes, homeMode } = suggestLayout(enabled);
  assert.equal(homeMode, 'floating');
  assertComplete(mapping, enabled);
  assert.ok(homes.LIndex.x < homes.RIndex.x);
  assert.ok(homes.RIndex.x < homes.RMiddle.x);
});

test('asymmetric hands (3 left + 2 right) still use floating mode', () => {
  const enabled = ['LRing', 'LMiddle', 'LIndex', 'RIndex', 'RMiddle'];
  const { mapping, homeMode } = suggestLayout(enabled);
  assert.equal(homeMode, 'floating');
  assertComplete(mapping, enabled);
});

test('one hand with 5 fingers: every finger gets keys, order is kept', () => {
  const enabled = ['LLittle', 'LRing', 'LMiddle', 'LIndex', 'LThumb'];
  const { mapping, homes } = suggestLayout(enabled);
  assertComplete(mapping, enabled);
  assert.equal(mapping.Space, 'LThumb');
  assert.ok(homes.LLittle.x <= homes.LRing.x);
  assert.ok(homes.LRing.x <= homes.LMiddle.x);
  assert.ok(homes.LMiddle.x <= homes.LIndex.x);
  for (const id of ['LLittle', 'LRing', 'LMiddle', 'LIndex']) {
    assert.ok(Object.values(mapping).includes(id), `${id} has no key`);
  }
});

test('a single finger gets all keys', () => {
  assertComplete(suggestLayout(['RIndex']).mapping, ['RIndex']);
});

test('only thumbs enabled still assigns all keys without crashing', () => {
  const { mapping } = suggestLayout(['LThumb', 'RThumb']);
  assertComplete(mapping, ['LThumb', 'RThumb']);
});

test('without thumbs another finger presses the space bar', () => {
  assert.ok(TWO_INDEX.includes(suggestLayout(TWO_INDEX).mapping.Space));
});

test('locked keys stay, invalid locked keys are ignored, input is not mutated', () => {
  const locked = { KeyE: 'RIndex', KeyQ: 'LLittle', Nonsense: 'LIndex' };
  const { mapping, ignoredLocked } = suggestLayout(TWO_INDEX, locked);
  assert.equal(mapping.KeyE, 'RIndex');        // manuell fixiert, trotz großer Distanz
  assert.notEqual(mapping.KeyQ, 'LLittle');    // Finger nicht aktiviert -> ignoriert
  assert.equal(mapping.Nonsense, undefined);   // unbekannte Taste -> ignoriert
  assert.deepEqual(ignoredLocked.sort(), ['KeyQ', 'Nonsense']);
  assert.deepEqual(Object.keys(locked), ['KeyE', 'KeyQ', 'Nonsense']);
});

test('homesFor gives the same homes and homeMode as the suggestion', () => {
  const suggestion = suggestLayout(TWO_INDEX);
  const calculated = homesFor(suggestion.mapping, TWO_INDEX);
  assert.deepEqual(calculated.homes, suggestion.homes);
  assert.equal(calculated.homeMode, suggestion.homeMode);
});

test('deterministic output, helper conversion and error on empty fingers', () => {
  assert.deepEqual(suggestLayout(ALL_FINGERS), suggestLayout(ALL_FINGERS));
  assert.deepEqual(toEnabledIds({ usesLIndex: true, usesRIndex: true, usesLRing: false }), ['LIndex', 'RIndex']);
  assert.throws(() => suggestLayout([]));
});