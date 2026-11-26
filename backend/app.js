var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

//------------------------------------------

const database = require('./database');
const {all} = require("express/lib/application");

//TODO Where to do the process of a "Game" counting, just using one Char, checking etc ?

//TODO all names have to be unique -> could also be used as ID (?)
/*let users = [
  {
    userID : 1,
    name : "miri",
    textSize : 100,
    isOnAudio : true,
    hand : [
      usesLThumb  = true,
      usesLIndex = true,
      usesLMiddle = true,
      usesLRing = true,
      uesLLittle = false,
      usesRThumb = false,
      usesRIndex = false,
      usesRMiddle = false,
      usesRRing = false,
      usesRLittle = false,
    ]
  }
]*/

// const defaultKeyboardMappings = [
//   {
//     fingers: {
//       usesLThumb: true,
//       usesLIndex: true,
//       usesLMiddle: true,
//       usesLRing: true,
//       usesLLittle: false,

//       usesRThumb: false,
//       usesRIndex: true,
//       usesRMiddle: false,
//       usesRRing: false,
//       usesRLittle: false
//     },
//     keyMappings: {
//       KeyQ: 'lLittle',
//       KeyA: 'lLittle',
//       KeyY: 'lLittle',
//       KeyW: 'lRing',
//       KeyS: 'lRing',
//       KeyX: 'lRing',
//       KeyE: 'lMiddle',
//       KeyD: 'lMiddle',
//       KeyC: 'lMiddle',
//       KeyR: 'lIndex',
//       KeyT: 'lIndex',
//       KeyF: 'lIndex',
//       KeyG: 'lIndex',
//       KeyV: 'lIndex',
//       KeyB: 'lIndex',
//       KeyZ: 'rIndex',
//       KeyU: 'rIndex',
//       KeyH: 'rIndex',
//       KeyJ: 'rIndex',
//       KeyN: 'rIndex',
//       KeyM: 'rIndex'
//     }
//   }
// ];


const getLevels = () => {
  return new Promise((resolve, reject) => {
    database.all('SELECT * FROM levels', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

const getNLevels = () => {
  return new Promise((resolve, reject) => {
    database.get('SELECT COUNT(levelID) AS nLevels FROM levels', (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row ? row.nLevels : null);      }
    });
  })
}

//get amount of Completed Levels of the user
//for the progressbar protocol
const getNCompletedAttempts = (userID) => {
  return new Promise((resolve, reject) => {
    database.get('SELECT COUNT(DISTINCT levelID) AS nCompletedLevels FROM attempts WHERE userId = ? AND isCompleted = 1',[userID], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row ? row.nCompletedLevels : null);      }
    });
  })
}

const getNAttemptsDays = (userID, nDays) => {
  return new Promise((resolve, reject) => {
    database.get('SELECT COUNT(levelID) AS nCompletedLevels FROM attempts WHERE userId = ? AND startTimeDateStamp >= ?',[userID, Date.now() - nDays * 24 * 60 * 60 * 1000], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row ? row.nCompletedLevels : null);      }
    });
  })
}

const getNCompletedAttemptsDays = (userID, nDays) => {
  return new Promise((resolve, reject) => {
    database.get('SELECT COUNT(levelID) AS nCompletedLevels FROM attempts WHERE userId = ? AND isCompleted = 1 AND startTimeDateStamp >= ?',[userID, Date.now() - nDays * 24 * 60 * 60 * 1000], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row ? row.nCompletedLevels : null);      }
    });
  })
}

const getUserId = (name) => {
  return new Promise((resolve, reject) => {
    database.get('SELECT userID FROM users WHERE name = ?', [name], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row ? row.userID : null);      }
    });
  })
}

const createUser = (data) => {
  return new Promise((resolve, reject) => {
    database.run('INSERT INTO users (name) VALUES (?)', [data.name],
        function(err) {
          if (err) {
            if (err.code === 'SQLITE_CONSTRAINT') {
              reject(new Error("This user already exists"));
              //databasis has the constraint:     name        TEXT    NOT NULL UNIQUE, included
            } else {
              reject(err);
            }
          } else {
            resolve(this.lastID);      }
        });
  })
}

const getAllAttempts = (userId) => {
  return new Promise((resolve, reject) => {
    database.all('SELECT * FROM attempts WHERE userID = ? ', [userId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  })
}

const getAllAttemptByLevel = (params) => {
  return new Promise((resolve, reject) => {
    database.all('SELECT * FROM attempts WHERE userID = ? AND levelID = ?', [params.userID, params.levelID], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  })
}

const createAttempt = (data) => {
  return new Promise((resolve, reject) => {
    database.run('INSERT INTO attempts (levelID, userID, startTimeDateStamp) VALUES (?, ?, ?)', [data.levelID, data.userID, Date.now()],
        function(err) {
          if (err) {
            if (err.code === 'SQLITE_CONSTRAINT') {
              reject(new Error("This attempt already exists"));
            } else {
              reject(err);
            }
          } else {
            resolve(this.lastID);      }
        });
  })
}

const allLevelPercent = async (userID) => {
  try {
    const nLevels = await getNLevels();
    const nCompletedAttempts = await getNCompletedAttempts(userID);

    return (100 / nLevels) * nCompletedAttempts;
  } catch (err) {
    throw err;
  }
};
const deleteAttempt = (attemptID) => {
  return new Promise((resolve, reject) => {
    database.run('DELETE FROM attempts WHERE attemptID = ?', [attemptID],
        function(err) {
          if (err) {
              reject(err);
          } else {
            resolve(this.changes);      }
        });
  })
}

const finishAttempt = async (attemptID) => {
  const result = new Promise((resolve, reject) => {
    database.get(
        'SELECT a.nMistakes, l.levelString, a.startTimeDateStamp FROM attempts a JOIN levels l ON a.levelID = l.levelID WHERE a.attemptID = ? ', [attemptID], (err, row) => {
      if (err) {
      reject(err);
    } else if (!row) {
      reject(new Error("Attempt not found"));
    } else {
      resolve(row);
    }
    });
  })
  const data = await result;
  const nMistakes  = data.nMistakes;
  const nCharacters = data.levelString.length;
  if (nCharacters === 0) {
    throw new Error("Level string is empty");
  }
  const percentCorrect = (100 / nCharacters)* (nCharacters - nMistakes);
  let isCompleted = false;
  let stars = 0;
  if(percentCorrect >= 70) {
    isCompleted = true;
    stars = 1;
    if(percentCorrect >= 90) {
      stars = 3;
    } else if (percentCorrect >= 80){
      stars = 2;
    }
  }
  const time = Date.now() - data.startTimeDateStamp;
  return new Promise((resolve, reject) => {
    //If good enough: isCompleted = 1
    //By some calculation:
    // e.g. 100 / N Digits of Level * mistakes  -> percentCorrect
    // > 90 -> 3 stars
    // > 80 -> 2 stars
    // > 70 -> 1 star and is Completed = 1
    //Time = current - startTimeDateStamp
    database.run(
        'UPDATE attempts SET isCompleted = ?, stars = ?, time = ?, percentCorrect = ? WHERE attemptID = ?',
        [isCompleted, stars, time, percentCorrect, attemptID],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes);      }
        });
  })
}

const addMistake = async (attemptID) => {
  const result = new Promise((resolve, reject) => {
    database.get(
        'SELECT nMistakes FROM attempts WHERE attemptID = ? ', [attemptID], (err, row) => {
          if (err) {
            reject(err);
          } else if (!row) {
            reject(new Error("Attempt not found"));
          } else {
            resolve(row);
          }
        });
  })
  const data = await result;
  const nMistakes = await data.nMistakes;
  return new Promise((resolve, reject) => {
    database.run(
        'UPDATE attempts SET nMistakes = ? WHERE attemptID = ?',
        [nMistakes + 1, attemptID],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes);      }
        });
  })
}

const getTextSize = (userID) => {
  return new Promise((resolve, reject) => {
    database.all('SELECT textSize FROM users WHERE userID = ?', [userID], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  })
}
const updateTextSize = async (userID, data) => {
  //TODO: verify that textSize is in range -> what is the range?
  return new Promise((resolve, reject) => {
    database.run(
        'UPDATE users SET textSize = ? WHERE userID = ?',
        [data.textSize, userID],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes);      }
        });
  })
}
const getIsOnAudio = (userID) => {
  return new Promise((resolve, reject) => {
    database.all('SELECT isOnAudio FROM users WHERE userID = ?', [userID], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  })
}
const updateIsOnAudio = async (userID, data) => {
  return new Promise((resolve, reject) => {
    database.run(
        'UPDATE users SET isOnAudio = ? WHERE userID = ?',
        [data.isOnAudio, userID],
        function(err) {
          if (data.isOnAudio !== 1 && data.isOnAudio !== 0) {
            reject(new Error("Invalid value for isOnAudio"));
          }
          else if (err) {
            reject(err);
          } else {
            resolve(this.changes);      }
        });
  })
}

//-----------------endpoints------------------
//get general level info
app.get('/api/levels', async (req, res) => {
  try {
    const levels = await getLevels();
    res.json({levels: levels});
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Could not retrieve levels'});
  }
});

//get nLevels
app.get('/api/nLevels', async (req, res) => {
  try {
    const nLevels = await getNLevels();
    res.json({nLevels: nLevels});
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Could not retrieve nLevels'});
  }
});

//get amount of Completed Levels of the user
//for the progressbar protocol
app.get('/api/nCompletedLevels/:userID', async (req, res) => {
  try {
    const nCompletedLevels = await getNCompletedAttempts(req.params.userID);
    res.json({nCompletedLevels : nCompletedLevels});
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Could not find attempts by userid'});
  }
});

//get amount of tried (completed and not completed) attempts of the user in the last x days
//for the progressbar protocol
//TODO: Should it be unique per Id?
app.get('/api/users/:userID/days/:nDays/nAttempts',  async(req, res) => {
  try {
    const nDays = Number(req.params.nDays);
    if (!Number.isInteger(nDays) || nDays < 0) {
      return res.status(400).json({ error: 'Invalid number of days' });
    }
    const nAttempts = await getNAttemptsDays(req.params.userID, nDays);
    res.json({nAttempts : nAttempts});
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Could not find attempts by userid and in the last n days'});
  }
});

//get amount of tried & completed attempts Levels of the user in the last x days
//for the progressbar protocol
app.get('/api/users/:userID/days/:nDays/nAttemptsCompleted',  async(req, res) => {
  try {
    const nDays = Number(req.params.nDays);
    if (!Number.isInteger(nDays) || nDays < 0) {
      return res.status(400).json({ error: 'Invalid number of days' });
    }
    const nCompletedAttempts = await getNCompletedAttemptsDays(req.params.userID, nDays);
    res.json({nCompletedAttempts : nCompletedAttempts});
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Could not find attempts by userid and in the last n days'});
  }
});

//verification login != first login
app.get('/api/userData/:name', async(req, res) => {
  try {
    const userID = await getUserId(req.params.name);
    res.json({userID: userID});
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Could not find id by user-name'});
  }
});

/**First login: Creates a new user
 * POST api/users
 * Request Body
 * {
 *     "name": "String"
 * }
 */
app.post('/api/users', async(req, res) => {
  try {
    const newUserId = await createUser(req.body);
    res.status(201).json({ newUserId: newUserId });
  } catch (err) {
    if (err.message === "This user already exists") {
      return res.status(409).json({ error: err.message });
    }
    res.status(500).json({ error: "Could not create user" });
  }
});

//protocol data
app.get('/api/allAttempts/:userID', async(req, res) => {
  try {
    const allAttempts = await getAllAttempts(req.params.userID);
    res.json({allAttempts : allAttempts});
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Could not find attemps by userid'});
  }
});

//Returns the attempts of the user and level (if there are many, then we have to decide if we choose the best or the last)
//for the level-overview-page (combined with all level-information)
//if we use the last one, we can also use this for the "gratulation page"
//current implementation: all attempts
app.get('/api/users/:userID/levels/:levelID/attempts',  async (req, res) => {
  try {
    const attempt = await getAllAttemptByLevel(req.params);
    res.json({attempt: attempt});
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Could not find attempt by level and user'});
  }
});
/**when the attempt starts, create an attempt
 * POST api/attempt
 * Request Body
 * {
 *     "levelID": Integer,
 *     "userID":  Integer
 * }
 */
app.post('/api/attempt', async (req, res) => {
  try {
    const newAttemptID = await createAttempt(req.body);
    res.status(201).json({ newAttemptID: newAttemptID });
  } catch (err) {
    res.status(500).json({ error: "Could not create attempt" });
  }
});

//When a mistake was made: increase the nMistakes
app.patch('/api/mistake/:attemptID', async (req, res) => {
  try {
    const changes = await addMistake(req.params.attemptID);
    if (changes === 0) {
      return res.status(404).json({ error: "Attempt not found" });
    }

    res.status(200).json({
      message: "Mistakes successfully increased",
      attemptID: req.params.attemptID
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not patch increased mistake" });
  }
});

//When an attempt is finished, time, stars, percentage is calculated, independent if it was completed or not
app.patch('/api/finished/:attemptID', async (req, res) => {
  // calculates percentage, stars, time ...
  try {
    const changes = await finishAttempt(req.params.attemptID);
    if (changes === 0) {
      return res.status(404).json({ error: "Attempt not found" });
    }

    res.status(200).json({
      message: "Attempt successfully finished",
      attemptID: req.params.attemptID
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not patch attempt" });
  }
});

//When the attempt was aborted
//should be called if something went wrong (maybe additionally if it makes more than 20min -> should be interpreted as aborted)
app.delete('/api/attempt/:attemptID', async (req, res) => {
  try {
    const deletedRows = await deleteAttempt(req.params.attemptID);
    if (deletedRows === 0) {
      return res.status(404).json({
        error: "Attempt not found"
      });
    }
    res.status(200).json({
      message: "Attempt successfully deleted",
      deletedRows: deletedRows
    });
  } catch (err) {
    res.status(500).json({ error: "Could not delete attempt" });
  }
});

//Get the percentage of the total levels completed (progressbar level-overview-page)
app.get('/api/allLevelPercent/:userID', async (req, res) => {
  try {
    const percentage = await allLevelPercent(req.params.userID);
    res.json({percentage: percentage});
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Could not calculate the percentage'});
  }
});

//For the frontent and for the settings-page
app.get('/api/textSize/:userID', async (req, res) => {
  try {
    const textSize = await getTextSize(req.params.userID);
    res.json({textSize: textSize});
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Could not get Textsize'});
  }
});

/**Updates the textSize
 * Purpose: For the frontent and for the settings-page
 * PATCH api/textSize/:userID
 * Request Body
 * {
 *     "textSize": Integer,
 * }
 */
app.patch('/api/textSize/:userID', async (req, res) => {
  try {
    const changes = await updateTextSize(req.params.userID, req.body);
    if (changes === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      message: "TextSize successfully changed",
      attemptID: req.params.attemptID
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not patch textSize" });
  }
});

//For the frontent and for the settings-page
app.get('/api/isAudio/:userID', async (req, res) => {
  try {
    const isOnAudio = await getIsOnAudio(req.params.userID);
    res.json({isAudio: isOnAudio});
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Could not get isAudio'});
  }
});
/**Updates the Audio-Setting
 * Purpose: For the frontent and for the settings-page
 * PATCH api/isAudio/:userID
 * Request Body
 *    Valid values: {0,1}
 * {
 *     "isOnAudio": Integer,
 * }
 */
app.patch('/api/isAudio/:userID', async (req, res) => {
  try {
    const changes = await updateIsOnAudio(req.params.userID, req.body);
    if (changes === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({
      message: "IsOnAudio successfully changed",
      attemptID: req.params.attemptID
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not patch IsOnAudio" });
  }
});

// ------------ keyboard -------------
const { DE_QWERTZ_KEYS, FINGER_META } = require('./data/keyboardLayout');
const { suggestLayout, homesFor, toEnabledIds } = require('./services/layoutSuggester');

const MAIN_KEY_IDS = DE_QWERTZ_KEYS.filter(k => k.zone === 'main').map(k => k.keyId);

// ------------ database helpers -------------
//TODO Miri gern anpassen
function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    database.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });
}

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    database.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });
}

function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    database.run(sql, params, (err) => (err ? reject(err) : resolve()));
  });
}
// ------------ helpers -------------
function getFingerFlags(userRow) {
  const flags = {};
  for (const finger of FINGER_META) flags[finger.prop] = Boolean(userRow[finger.prop]);
  return flags;
}

function setFingers(userId, flags) {
  const setClause = FINGER_META.map(f => `${f.prop} = ?`).join(', ');
  const values = FINGER_META.map(f => (flags[f.prop] ? 1 : 0));
   return dbRun(`UPDATE users SET ${setClause} WHERE userID = ?`, [...values, userId]);
}

async function getMapping(userId) {
  const rows = await dbAll('SELECT keyID, fingerID, source FROM key_mappings WHERE userID = ?', [userId]);
  const mapping = {};
  for (const row of rows) mapping[row.keyID] = { fingerId: row.fingerID, source: row.source };
  return mapping;
}

// Only the manual keys: { KeyQ: 'lLittle', ... }
async function getManualMapping(userId) {
  const mapping = await getMapping(userId);
  const manual = {};
  for (const [keyId, entry] of Object.entries(mapping)) {
    if (entry.source === 'manual') manual[keyId] = entry.fingerId;
  }
  return manual;
}

// Replaces the whole layout entries: [{ keyId, fingerId, source }]
async function replaceMapping(userId, entries) {
  await dbRun('BEGIN');
  try {
    await dbRun('DELETE FROM key_mappings WHERE userID = ?', [userId]);
    for (const e of entries) {
      await dbRun(
        'INSERT INTO key_mappings (userID, keyID, fingerID, source) VALUES (?, ?, ?, ?)',
        [userId, e.keyId, e.fingerId, e.source]
      );
    }
    await dbRun('COMMIT');
  } catch (err) {
    await dbRun('ROLLBACK').catch(() => {});
    throw err;
  }
}

async function loadUser(req, res, next) {
  try {
    const userId = Number(req.params.userId);
    if (!Number.isInteger(userId) || userId < 1) {
      return res.status(400).json({ error: 'Invalid userId' });
    }
    const user = await getUser(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

// ------------ keyboard -------------

function checkFingers(body) {
  for (const finger of FINGER_META) {
    if (typeof body?.[finger.prop] !== 'boolean') return `${finger.prop} must be true or false`;
  }
  if (toEnabledIds(body).length === 0) return 'At least one finger must be enabled';
  return null;
}

//new fingers activated
//adds all new fingers and will also add a new defaultkeyboard
app.put('/api/finger/:userId', loadUser, async (req, res, next) => {
  try {
    const error = checkFingers(req.body);
    if (error) return res.status(400).json({ error });

    await setFingers(req.user.userID, req.body);

    const enabledIds = toEnabledIds(req.body);
    const saved = Object.values(await getMapping(req.user.userID));
    const needsNewSuggestion = saved.length === 0 || saved.some(e => !enabledIds.includes(e.fingerId));

    res.json({ enabledIds, needsNewSuggestion });
  } catch (err) {
    next(err);
  } 
});

//needed for the representation of the settings (saves only fingers no change of keyboard layout)
app.get('/api/finger/:userId', loadUser, (req, res) => {
  const fingers = getFingerFlags(req.user);
  res.json({ fingers, enabledIds: toEnabledIds(fingers) });
});

// the current keyboard for this user
app.get('/api/keyboard/:userId', loadUser, async (req, res, next) => {
    try {
    const mapping = await getMapping(req.user.userID);
    const enabledIds = toEnabledIds(getFingerFlags(req.user));

    const isComplete = MAIN_KEY_IDS.every(keyId => mapping[keyId] && enabledIds.includes(mapping[keyId].fingerId));
    if (!isComplete) return res.json({ mapping, isComplete, homes: null, homeMode: null });

    const fingerOfKey = {};
    for (const [keyId, entry] of Object.entries(mapping)) fingerOfKey[keyId] = entry.fingerId;
    const { homes, homeMode } = homesFor(fingerOfKey, enabledIds);

    res.json({ mapping, isComplete, homes, homeMode });
  } catch (err) {
    next(err);
  }
});

// sends the whole keyboard and overwrittes the old keyboard
app.put('/api/keyboard/:userId', loadUser, async (req, res, next) => {
  try {
    const mapping = req.body?.mapping;
    if(!mapping || typeof mapping !== 'object') {
      return res.status(400).json({error: 'mapping is missing'});
    }

    const enabledIds = toEnabledIds(getFingerFlags(req.user));
    const entries = [];

    for (const [keyId, value] of Object.entries(mapping)) {
      const fingerId = typeof value === 'string' ? value : value?.fingerId;
      const source = typeof value === 'string' ? 'manual' : (value?.source ?? 'manual');

      if (!MAIN_KEY_IDS.includes(keyId)) return res.status(400).json({ error: `Unknown key: ${keyId}` });
      if (!enabledIds.includes(fingerId)) return res.status(400).json({ error: `${keyId}: finger ${fingerId} is not enabled` });
      if (source !== 'manual' && source !== 'suggested') return res.status(400).json({ error: `${keyId}: invalid source` });

      entries.push({ keyId, fingerId, source });
    }

    const missing = MAIN_KEY_IDS.filter(keyId => !(keyId in mapping));
    if (missing.length > 0) return res.status(400).json({ error: 'Layout is incomplete', missing });

    await replaceMapping(req.user.userID, entries);
    res.json({ saved: entries.length });
  } catch (err) {
    next(err);
  }
});

// makes a suggestion based on selected fingers
app.post('/api/keyboard/:userId/suggestion', loadUser, async (req, resm, next) => {
  try {
    const body = req.body || {}
    let enabledIds = toEnabledIds(getFingerFlags(req.user));
    if (body.fingers) {
      const error = checkFingers(body.fingers);
      if (error) return res.status(400).json({ error });
      enabledIds = toEnabledIds(body.fingers);
    }

    const manualKeys = body.resetManual ? {} : await getManualMapping(req.user.userID);
    const locked = { ...manualKeys, ...body.lockedKeys };

    res.json(suggestLayout(enabledIds, locked));
  } catch (err) {
    next(err);
  }

});

//-----------------------------------------------------
// catch 404 and forward to error handler
app.use((err, req, res, next) => {
  if (err.status === 404) {
    return res.status(404).json({
      error: 'Route not found'
    });
  }

  console.error(err);

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

module.exports = app;
