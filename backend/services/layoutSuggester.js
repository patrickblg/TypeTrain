// services/layoutSuggester.js
//
// Suggests which finger should press which key (only calculation)

const { DE_QWERTZ_KEYS, FINGER_META, HOME_KEYS } = require('../data/keyboardLayout');

const ROW_WEIGHT = 1.3;    // moving up/down a row is harder than moving sideways
const LOAD_WEIGHT = 0.1;   // how strongly we avoid giving one finger too many keys
const REACH_PENALTY = 1;   // extra cost for keys beyond a finger's comfortable reach

const REACH = { Little: 1.5, Ring: 1.8, Middle: 2.2, Index: 2.2, Thumb: 3 };
const HAND_SPLIT_X = [7.0, 6.5, 6.75, 7.25];

const FINGER_ORDER = {
  L: ['lLittle', 'lRing', 'lMiddle', 'lIndex'],
  R: ['rIndex', 'rMiddle', 'rRing', 'rLittle']
};

// ---------- Keys ----------

const KEYS = DE_QWERTZ_KEYS.filter(key => key.zone === 'main'); // numpad is ignored for now
const TOTAL_FREQ = KEYS.reduce((sum, key) => sum + key.freq, 0);

// ---------- Helpers ----------
function toEnabledIds(fingersObj) {
  return FINGER_META.filter(f => fingersObj[f.prop]).map(f => f.id);
}

// fixed homes for over 3 fingers per hand
function useFixedHomes(fingers) {
  const countLeft = fingers.filter(f => !f.isThumb && f.side === 'L').length;
  const countRight = fingers.filter(f => !f.isThumb && f.side === 'R').length;
  return countLeft >= 3 && countRight >= 3;
}

// Position (x, y) of the home key of every finger
function startHomes(fingers) {
  const homes = {};
  for (const finger of fingers) {
    const homeKey = DE_QWERTZ_KEYS.find(k => k.keyId === HOME_KEYS[finger.id]);
    homes[finger.id] = { x: homeKey.x, y: homeKey.y };
  }
  return homes;
}

// Keep only locked keys that exist and belong to an enabled finger
function cleanLocked(locked, enabledIds) {
  const valid = {};
  const ignored = [];
  for (const [keyId, fingerId] of Object.entries(locked)) {
    const keyExists = KEYS.some(k => k.keyId === keyId);
    if (keyExists && enabledIds.includes(fingerId)) valid[keyId] = fingerId;
    else ignored.push(keyId);
  }
  return { valid, ignored };
}

// Enabled fingers that can press the key at all
function allowedFingers(key, fingers, fixed) {
  const nonThumbs = fingers.filter(f => !f.isThumb);
  const pool = nonThumbs.length > 0 ? nonThumbs : fingers;

  if (fixed) {
    const owner = pool.find(f => HOME_KEYS[f.id] === key.keyId);
    if (owner) return [owner];
  }

  if (key.isSpace) {
    const thumbs = fingers.filter(f => f.isThumb);
    return thumbs.length > 0 ? thumbs : pool;
  }

  // Modifiers (Shift, Enter, ...)
  if (key.isModifier) {
    const sameSide = pool.filter(f => f.side === key.sideHint);
    if (sameSide.length === 0) return pool;
    const little = sameSide.find(f => f.id.endsWith('Little'));
    return little ? [little] : sameSide;
  }

  // If both hands are in use, each hand only gets its own half of the keyboard
  const leftHand = pool.filter(f => f.side === 'L');
  const rightHand = pool.filter(f => f.side === 'R');
  if (leftHand.length > 0 && rightHand.length > 0) {
    const splitX = HAND_SPLIT_X[Math.round(key.y)] ?? 7.0;
    return key.x < splitX ? leftHand : rightHand;
  }
  return pool;
}

// ---------- Cost ----------

// How hard is it for this finger to reach this key? (frequent keys count more)
function reachCost(key, finger, home) {
  const dx = key.isSpace ? 0 : key.x - home.x;
  const dy = (key.y - home.y) * ROW_WEIGHT;
  const distance = Math.hypot(dx, dy);

  const maxReach = REACH[finger.id.slice(1)];
  const tooFar = Math.max(0, distance - maxReach);

  const share = key.freq / TOTAL_FREQ;
  return share * (distance + REACH_PENALTY * tooFar) / finger.agility;
}

// Penalty for giving one finger too many keys.
function loadCost(finger, share, capacity) {
  if (finger.isThumb) return 0;
  return LOAD_WEIGHT * (share / capacity) ** 2;
}

// ---------- Assigning keys to fingers ----------

function assignKeys(fingers, homes, locked, fixed) {
  const mapping = { ...locked };

  // How much a finger can handle depends on its agility (thumbs don't count)
  const handlers = fingers.filter(f => !f.isThumb);
  const agilitySum = (handlers.length > 0 ? handlers : fingers).reduce((sum, f) => sum + f.agility, 0);
  const capacity = {};
  const share = {};
  for (const finger of fingers) {
    capacity[finger.id] = finger.agility / agilitySum;
    share[finger.id] = 0;
  }

  const loadOf = key => (key.isModifier ? 0 : key.freq / TOTAL_FREQ);

  for (const key of KEYS) {
    if (mapping[key.keyId]) share[mapping[key.keyId]] += loadOf(key);
  }

  // Most frequent keys first, so they get the best spots
  const todo = KEYS
    .filter(key => !(key.keyId in locked))
    .sort((a, b) => b.freq - a.freq);

  for (const key of todo) {
    let bestFinger = null;
    let bestCost = Infinity;

    for (const finger of allowedFingers(key, fingers, fixed)) {
      const before = share[finger.id];
      const after = before + loadOf(key);
      const cost = reachCost(key, finger, homes[finger.id])
        + loadCost(finger, after, capacity[finger.id])
        - loadCost(finger, before, capacity[finger.id]);

      if (cost < bestCost) {
        bestCost = cost;
        bestFinger = finger;
      }
    }

    mapping[key.keyId] = bestFinger.id;
    share[bestFinger.id] += loadOf(key);
  }

  return mapping;
}

// ---------- Floating homes ----------

// New home of every finger = average position of its keys (weighted by how often they are used)
function averageHomes(mapping, fingers, oldHomes) {
  const sums = {};
  for (const finger of fingers) sums[finger.id] = { weight: 0, x: 0, y: 0 };

  for (const key of KEYS) {
    if (key.isModifier || key.isSpace) continue;
    const sum = sums[mapping[key.keyId]];
    sum.weight += key.freq;
    sum.x += key.freq * key.x;
    sum.y += key.freq * key.y;
  }

  const homes = {};
  for (const finger of fingers) {
    const sum = sums[finger.id];
    const hasKeys = sum.weight > 0 && !finger.isThumb;
    homes[finger.id] = hasKeys
      ? { x: sum.x / sum.weight, y: sum.y / sum.weight }
      : oldHomes[finger.id];
  }

  // Keep the fingers of one hand in their natural order (little finger on the outside)
  for (const side of ['L', 'R']) {
    const ids = FINGER_ORDER[side].filter(id => homes[id]);
    const positions = ids.map(id => homes[id]).sort((a, b) => a.x - b.x);
    ids.forEach((id, i) => { homes[id] = positions[i]; });
  }
  return homes;
}

function roundHomes(homes) {
  const result = {};
  for (const [id, home] of Object.entries(homes)) {
    result[id] = { x: Math.round(home.x * 100) / 100, y: Math.round(home.y * 100) / 100 };
  }
  return result;
}

// ---------- Main functions ----------

// Suggests a layout for the given fingers.
function suggestLayout(enabledIds, locked = {}) {
  const fingers = FINGER_META.filter(f => enabledIds.includes(f.id));
  if (fingers.length === 0) throw new Error('At least one finger must be enabled');

  const fixed = useFixedHomes(fingers);
  const { valid, ignored } = cleanLocked(locked, enabledIds);

  let homes = startHomes(fingers);
  let mapping = assignKeys(fingers, homes, valid, fixed);

  if (!fixed) {
    for (let round = 0; round < 10; round++) {
      const newHomes = averageHomes(mapping, fingers, homes);
      const newMapping = assignKeys(fingers, newHomes, valid, fixed);
      const unchanged = Object.keys(mapping).every(id => mapping[id] === newMapping[id]);
      homes = newHomes;
      mapping = newMapping;
      if (unchanged) break;
    }
    homes = averageHomes(mapping, fingers, homes);
  }

  return {
    mapping,
    homes: roundHomes(homes),
    homeMode: fixed ? 'fixed' : 'floating',
    ignoredLocked: ignored
  };
}

// Home positions for a layout that is already saved
function homesFor(mapping, enabledIds) {
  const fingers = FINGER_META.filter(f => enabledIds.includes(f.id));
  const fixed = useFixedHomes(fingers);
  const start = startHomes(fingers);
  const homes = fixed ? start : averageHomes(mapping, fingers, start);
  return { homes: roundHomes(homes), homeMode: fixed ? 'fixed' : 'floating' };
}

module.exports = { suggestLayout, homesFor, toEnabledIds };