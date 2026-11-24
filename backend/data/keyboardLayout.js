// data/keyboardLayout.js

const DE_QWERTZ_KEYS = [
  // row 0, numbers (y = 0.0)
  { keyId: 'Backquote', label: '^', shiftLabel: '°', x: 0.5, y: 0.0, freq: 0.0001, zone: 'main' },
  { keyId: 'Digit1', label: '1', shiftLabel: '!', x: 1.5, y: 0.0, freq: 0.0050, zone: 'main' },
  { keyId: 'Digit2', label: '2', shiftLabel: '"', x: 2.5, y: 0.0, freq: 0.0045, zone: 'main' },
  { keyId: 'Digit3', label: '3', shiftLabel: '§', x: 3.5, y: 0.0, freq: 0.0030, zone: 'main' },
  { keyId: 'Digit4', label: '4', shiftLabel: '$', x: 4.5, y: 0.0, freq: 0.0025, zone: 'main' },
  { keyId: 'Digit5', label: '5', shiftLabel: '%', x: 5.5, y: 0.0, freq: 0.0025, zone: 'main' },
  { keyId: 'Digit6', label: '6', shiftLabel: '&', x: 6.5, y: 0.0, freq: 0.0020, zone: 'main' },
  { keyId: 'Digit7', label: '7', shiftLabel: '/', x: 7.5, y: 0.0, freq: 0.0020, zone: 'main' },
  { keyId: 'Digit8', label: '8', shiftLabel: '(', x: 8.5, y: 0.0, freq: 0.0025, zone: 'main' },
  { keyId: 'Digit9', label: '9', shiftLabel: ')', x: 9.5, y: 0.0, freq: 0.0025, zone: 'main' },
  { keyId: 'Digit0', label: '0', shiftLabel: '=', x: 10.5, y: 0.0, freq: 0.0035, zone: 'main' },
  { keyId: 'Keyß', label: 'ß', shiftLabel: '?', x: 11.5, y: 0.0, freq: 0.0031, zone: 'main' },
  { keyId: 'Quote', label: '´', shiftLabel: '`', x: 12.5, y: 0.0, freq: 0.0002, zone: 'main' },
  { keyId: 'Backspace', label: 'Backspace', x: 14.0, y: 0.0, freq: 0.0200, zone: 'main', isModifier: true, sideHint: 'R' },

  // row 1, upper row (y = 1.0)
  { keyId: 'Tab', label: 'Tab', x: 0.75, y: 1.0, freq: 0.0050, zone: 'main', isModifier: true, sideHint: 'L' },
  { keyId: 'KeyQ', label: 'Q', x: 2.0, y: 1.0, freq: 0.0002, zone: 'main' },
  { keyId: 'KeyW', label: 'W', x: 3.0, y: 1.0, freq: 0.0189, zone: 'main' },
  { keyId: 'KeyE', label: 'E', x: 4.0, y: 1.0, freq: 0.1740, zone: 'main' },
  { keyId: 'KeyR', label: 'R', x: 5.0, y: 1.0, freq: 0.0700, zone: 'main' },
  { keyId: 'KeyT', label: 'T', x: 6.0, y: 1.0, freq: 0.0615, zone: 'main' },
  { keyId: 'KeyZ', label: 'Z', x: 7.0, y: 1.0, freq: 0.0113, zone: 'main' },
  { keyId: 'KeyU', label: 'U', x: 8.0, y: 1.0, freq: 0.0435, zone: 'main' },
  { keyId: 'KeyI', label: 'I', x: 9.0, y: 1.0, freq: 0.0755, zone: 'main' },
  { keyId: 'KeyO', label: 'O', x: 10.0, y: 1.0, freq: 0.0251, zone: 'main' },
  { keyId: 'KeyP', label: 'P', x: 11.0, y: 1.0, freq: 0.0079, zone: 'main' },
  { keyId: 'KeyÜ', label: 'Ü', x: 12.0, y: 1.0, freq: 0.0065, zone: 'main' },
  { keyId: 'Plus', label: '+', shiftLabel: '*', x: 13.0, y: 1.0, freq: 0.0015, zone: 'main' },

  // row 3, home row (y = 2.0)
  { keyId: 'CapsLock', label: 'Fest', x: 0.875, y: 2.0, freq: 0.0010, zone: 'main', isModifier: true, sideHint: 'L' },
  { keyId: 'KeyA', label: 'A', x: 2.25, y: 2.0, freq: 0.0651, zone: 'main' },
  { keyId: 'KeyS', label: 'S', x: 3.25, y: 2.0, freq: 0.0727, zone: 'main' },
  { keyId: 'KeyD', label: 'D', x: 4.25, y: 2.0, freq: 0.0508, zone: 'main' },
  { keyId: 'KeyF', label: 'F', x: 5.25, y: 2.0, freq: 0.0166, zone: 'main' },
  { keyId: 'KeyG', label: 'G', x: 6.25, y: 2.0, freq: 0.0301, zone: 'main' },
  { keyId: 'KeyH', label: 'H', x: 7.25, y: 2.0, freq: 0.0476, zone: 'main' },
  { keyId: 'KeyJ', label: 'J', x: 8.25, y: 2.0, freq: 0.0027, zone: 'main' },
  { keyId: 'KeyK', label: 'K', x: 9.25, y: 2.0, freq: 0.0121, zone: 'main' },
  { keyId: 'KeyL', label: 'L', x: 10.25, y: 2.0, freq: 0.0344, zone: 'main' },
  { keyId: 'KeyÖ', label: 'Ö', x: 11.25, y: 2.0, freq: 0.0030, zone: 'main' },
  { keyId: 'KeyÄ', label: 'Ä', x: 12.25, y: 2.0, freq: 0.0054, zone: 'main' },
  { keyId: 'Key#', label: '#', shiftLabel: "'", x: 13.25, y: 2.0, freq: 0.0010, zone: 'main' },
  { keyId: 'Enter', label: 'Enter', x: 14.375, y: 1.5, freq: 0.0300, zone: 'main', isModifier: true, sideHint: 'R' },

  // row 3, down row (y = 3.0)
  { keyId: 'ShiftLeft', label: 'Shift', x: 0.625, y: 3.0, freq: 0.0250, zone: 'main', isModifier: true, sideHint: 'L' },
  { keyId: 'IntlBackslash', label: '<', shiftLabel: '>', x: 1.75, y: 3.0, freq: 0.0010, zone: 'main' },
  { keyId: 'KeyY', label: 'Y', x: 2.75, y: 3.0, freq: 0.0004, zone: 'main' },
  { keyId: 'KeyX', label: 'X', x: 3.75, y: 3.0, freq: 0.0003, zone: 'main' },
  { keyId: 'KeyC', label: 'C', x: 4.75, y: 3.0, freq: 0.0306, zone: 'main' },
  { keyId: 'KeyV', label: 'V', x: 5.75, y: 3.0, freq: 0.0067, zone: 'main' },
  { keyId: 'KeyB', label: 'B', x: 6.75, y: 3.0, freq: 0.0189, zone: 'main' },
  { keyId: 'KeyN', label: 'N', x: 7.75, y: 3.0, freq: 0.0978, zone: 'main' },
  { keyId: 'KeyM', label: 'M', x: 8.75, y: 3.0, freq: 0.0253, zone: 'main' },
  { keyId: 'Comma', label: ',', shiftLabel: ';', x: 9.75, y: 3.0, freq: 0.0150, zone: 'main' },
  { keyId: 'Period', label: '.', shiftLabel: ':', x: 10.75, y: 3.0, freq: 0.0150, zone: 'main' },
  { keyId: 'Slash', label: '-', shiftLabel: '_', x: 11.75, y: 3.0, freq: 0.0080, zone: 'main' },
  { keyId: 'ShiftRight', label: 'Shift', x: 13.625, y: 3.0, freq: 0.0250, zone: 'main', isModifier: true, sideHint: 'R' },

  // row 4, (y = 4.0)
  { keyId: 'ControlLeft', label: 'Strg', x: 0.625, y: 4.0, freq: 0.0010, zone: 'main', isModifier: true, sideHint: 'L' },
  { keyId: 'Fn', label: 'Fn', x: 1.875, y: 4.0, freq: 0.0001, zone: 'main', isModifier: true, sideHint: 'L' },
  { keyId: 'MetaLeft', label: 'Win', x: 3.125, y: 4.0, freq: 0.0001, zone: 'main', isModifier: true, sideHint: 'L' },
  { keyId: 'AltLeft', label: 'Alt', x: 4.375, y: 4.0, freq: 0.0005, zone: 'main', isModifier: true, sideHint: 'L' },
  { keyId: 'Space', label: 'Leertaste', x: 7.25, y: 4.0, freq: 0.1500, zone: 'main', isSpace: true },
  { keyId: 'AltRight', label: 'Alt Gr', x: 10.125, y: 4.0, freq: 0.0020, zone: 'main', isModifier: true, sideHint: 'R' },
  { keyId: 'MetaRight', label: 'Win', x: 11.375, y: 4.0, freq: 0.0001, zone: 'main', isModifier: true, sideHint: 'R' },
  { keyId: 'ContextMenu', label: 'Menü', x: 12.625, y: 4.0, freq: 0.0001, zone: 'main', isModifier: true, sideHint: 'R' },
  { keyId: 'ControlRight', label: 'Strg', x: 13.875, y: 4.0, freq: 0.0010, zone: 'main', isModifier: true, sideHint: 'R' },

  // numpad (to the right x = 16.0)
  { keyId: 'NumLock', label: 'Num', x: 16.0, y: 0.0, freq: 0.0001, zone: 'numpad' },
  { keyId: 'NumpadDivide', label: '÷', x: 17.0, y: 0.0, freq: 0.0005, zone: 'numpad' },
  { keyId: 'NumpadMultiply', label: '×', x: 18.0, y: 0.0, freq: 0.0005, zone: 'numpad' },
  { keyId: 'NumpadSubtract', label: '-', x: 19.0, y: 0.0, freq: 0.0010, zone: 'numpad' },

  { keyId: 'Numpad7', label: '7', x: 16.0, y: 1.0, freq: 0.0020, zone: 'numpad' },
  { keyId: 'Numpad8', label: '8', x: 17.0, y: 1.0, freq: 0.0020, zone: 'numpad' },
  { keyId: 'Numpad9', label: '9', x: 18.0, y: 1.0, freq: 0.0020, zone: 'numpad' },
  { keyId: 'NumpadAdd', label: '+', x: 19.0, y: 1.5, freq: 0.0010, zone: 'numpad' },

  { keyId: 'Numpad4', label: '4', x: 16.0, y: 2.0, freq: 0.0020, zone: 'numpad' },
  { keyId: 'Numpad5', label: '5', x: 17.0, y: 2.0, freq: 0.0020, zone: 'numpad' },
  { keyId: 'Numpad6', label: '6', x: 18.0, y: 2.0, freq: 0.0020, zone: 'numpad' },

  { keyId: 'Numpad1', label: '1', x: 16.0, y: 3.0, freq: 0.0020, zone: 'numpad' },
  { keyId: 'Numpad2', label: '2', x: 17.0, y: 3.0, freq: 0.0020, zone: 'numpad' },
  { keyId: 'Numpad3', label: '3', x: 18.0, y: 3.0, freq: 0.0020, zone: 'numpad' },
  { keyId: 'NumpadEnter', label: 'Enter', x: 19.0, y: 3.5, freq: 0.0020, zone: 'numpad' },

  { keyId: 'Numpad0', label: '0', x: 16.5, y: 4.0, freq: 0.0030, zone: 'numpad' },
  { keyId: 'NumpadDecimal', label: ',', x: 18.0, y: 4.0, freq: 0.0010, zone: 'numpad' }
];

const FINGER_META = [
  { prop: 'usesLLittle', id: 'lLittle', side: 'L', agility: 0.7 },
  { prop: 'usesLRing',   id: 'lRing',   side: 'L', agility: 0.85 },
  { prop: 'usesLMiddle', id: 'lMiddle', side: 'L', agility: 1.0 },
  { prop: 'usesLIndex',  id: 'lIndex',  side: 'L', agility: 1.0 },
  { prop: 'usesLThumb',  id: 'lThumb',  side: 'L', agility: 1.0, isThumb: true },
  { prop: 'usesRThumb',  id: 'rThumb',  side: 'R', agility: 1.0, isThumb: true },
  { prop: 'usesRIndex',  id: 'rIndex',  side: 'R', agility: 1.0 },
  { prop: 'usesRMiddle', id: 'rMiddle', side: 'R', agility: 1.0 },
  { prop: 'usesRRing',   id: 'rRing',   side: 'R', agility: 0.85 },
  { prop: 'usesRLittle', id: 'rLittle', side: 'R', agility: 0.7 }
];

const HOME_KEYS = {
  lLittle: 'KeyA', lRing: 'KeyS', lMiddle: 'KeyD', lIndex: 'KeyF',
  rIndex: 'KeyJ', rMiddle: 'KeyK', rRing: 'KeyL', rLittle: 'KeyÖ',
  lThumb: 'Space', rThumb: 'Space'
};

module.exports = { DE_QWERTZ_KEYS, FINGER_META, HOME_KEYS };