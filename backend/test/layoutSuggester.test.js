const test = require('node:test');
const assert = require('node:assert/strict');
const { DE_QWERTZ_KEYS } = require('../data/keyboardLayout');
const { suggestLayout, homesFor, toEnabledIds } = require('../services/layoutSuggester');

const ALL_FINGERS = ['lLittle', 'lRing', 'lMiddle', 'lIndex', 'lThumb', 'rThumb', 'rIndex', 'rMiddle', 'rRing', 'rLittle'];
const TWO_INDEX = ['lIndex', 'rIndex'];
const mainKeys = DE_QWERTZ_KEYS.filter(k => k.zone === 'main');

// Every main key has a finger and that finger is enabled. The numpad stays empty.
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
  assert.equal(mapping.KeyF, 'lIndex');
  assert.equal(mapping.KeyJ, 'rIndex');
  assert.equal(mapping.KeyA, 'lLittle');
  assert.equal(mapping.Semicolon, 'rLittle');
  assert.equal(mapping.KeyE, 'lMiddle');
  assert.equal(mapping.KeyI, 'rMiddle');
  assert.ok(['lThumb', 'rThumb'].includes(mapping.Space));
});

test('2 index fingers: floating homes, each hand gets its half', () => {
  const { mapping, homes, homeMode } = suggestLayout(TWO_INDEX);
  assert.equal(homeMode, 'floating');
  assertComplete(mapping, TWO_INDEX);
  for (const keyId of ['KeyQ', 'KeyE', 'KeyA', 'KeyG', 'KeyB']) assert.equal(mapping[keyId], 'lIndex');
  for (const keyId of ['KeyZ', 'KeyO', 'KeyP', 'KeyL', 'KeyN']) assert.equal(mapping[keyId], 'rIndex');
  assert.ok(homes.lIndex.x > 3 && homes.lIndex.x < 5.5);
  assert.ok(homes.rIndex.x > 8 && homes.rIndex.x < 10);
});

test('3 fingers: all keys are assigned and the fingers stay in order', () => {
  const enabled = ['lIndex', 'rIndex', 'rMiddle'];
  const { mapping, homes } = suggestLayout(enabled);
  assertComplete(mapping, enabled);
  assert.ok(homes.lIndex.x < homes.rIndex.x);
  assert.ok(homes.rIndex.x < homes.rMiddle.x);
});

test('one hand with 5 fingers: every finger gets keys, order is kept', () => {
  const enabled = ['lLittle', 'lRing', 'lMiddle', 'lIndex', 'lThumb'];
  const { mapping, homes } = suggestLayout(enabled);
  assertComplete(mapping, enabled);
  assert.equal(mapping.Space, 'lThumb');
  assert.ok(homes.lLittle.x <= homes.lRing.x);
  assert.ok(homes.lRing.x <= homes.lMiddle.x);
  assert.ok(homes.lMiddle.x <= homes.lIndex.x);
  for (const id of ['lLittle', 'lRing', 'lMiddle', 'lIndex']) {
    assert.ok(Object.values(mapping).includes(id), `${id} has no key`);
  }
});

test('a single finger gets all keys', () => {
  assertComplete(suggestLayout(['rIndex']).mapping, ['rIndex']);
});

test('without thumbs another finger presses the space bar', () => {
  assert.ok(TWO_INDEX.includes(suggestLayout(TWO_INDEX).mapping.Space));
});

test('locked keys stay, invalid locked keys are ignored', () => {
  const locked = { KeyE: 'rIndex', KeyQ: 'lLittle', Nonsense: 'lIndex' };
  const { mapping, ignoredLocked } = suggestLayout(TWO_INDEX, locked);
  assert.equal(mapping.KeyE, 'rIndex');        // locked, even though it is far away
  assert.notEqual(mapping.KeyQ, 'lLittle');    // this finger is not enabled
  assert.equal(mapping.Nonsense, undefined);
  assert.deepEqual(ignoredLocked.sort(), ['KeyQ', 'Nonsense']);
  assert.deepEqual(Object.keys(locked), ['KeyE', 'KeyQ', 'Nonsense']); // input is not changed
});

test('homesFor gives the same homes as the suggestion', () => {
  const suggestion = suggestLayout(TWO_INDEX);
  assert.deepEqual(homesFor(suggestion.mapping, TWO_INDEX).homes, suggestion.homes);
});

test('same input gives same output, no fingers throws an error', () => {
  assert.deepEqual(suggestLayout(ALL_FINGERS), suggestLayout(ALL_FINGERS));
  assert.deepEqual(toEnabledIds({ usesLIndex: true, usesRIndex: true, usesLRing: false }), ['lIndex', 'rIndex']);
  assert.throws(() => suggestLayout([]));
});