var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

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
//This is just the vague structure
//no error-handling
//no fix data or data structure
//static data instead of databasis
//------------------------------------------
const database = require('./database');
const {all} = require("express/lib/application");

//Question: Where to do the process of a "Game" counting, just using one Char, checking etc ?

//all names have to be unique -> could also be used as ID (?)
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

const defaultKeyboardMappings = [
  {
    fingers: {
      usesLThumb: true,
      usesLIndex: true,
      usesLMiddle: true,
      usesLRing: true,
      usesLLittle: false,

      usesRThumb: false,
      usesRIndex: true,
      usesRMiddle: false,
      usesRRing: false,
      usesRLittle: false
    },
    keyMappings: {
      KeyQ: 'lLittle',
      KeyA: 'lLittle',
      KeyY: 'lLittle',
      KeyW: 'lRing',
      KeyS: 'lRing',
      KeyX: 'lRing',
      KeyE: 'lMiddle',
      KeyD: 'lMiddle',
      KeyC: 'lMiddle',
      KeyR: 'lIndex',
      KeyT: 'lIndex',
      KeyF: 'lIndex',
      KeyG: 'lIndex',
      KeyV: 'lIndex',
      KeyB: 'lIndex',
      KeyZ: 'rIndex',
      KeyU: 'rIndex',
      KeyH: 'rIndex',
      KeyJ: 'rIndex',
      KeyN: 'rIndex',
      KeyM: 'rIndex'
    }
  }
];
//completed -> Erfolgreich abgeschlossen
//finished -> Zuende gebracht (nicht abgebrochen) (all others should be deleted)
/*var attempt = [
  {
    attemptId : 4,
    levelId : 2,
    userId : 1,
    isFinish: true,
    isCompleted : true,
    stars : 2,
    time : 12345678,
    nMistakes : 10,
    percentCorrect : 88,
    startTimeDateStamp : 123456789
  }
]*/
const ALLOWED_FINGERS = [
  "LThumb",
  "LIndex",
  "LMiddle",
  "LRing",
  "LLittle",
  "RThumb",
  "RIndex",
  "RMiddle",
  "RRing",
  "RLittle"
];

//fingers has to be an array
//every element has to be part of ALLOWED_FINGERS
//no finger may appear more than once in the array
const validateFingers = (fingers) => {
  if (!Array.isArray(fingers)) {
    return false;
  }

  return fingers.every(finger => ALLOWED_FINGERS.includes(finger))
      && new Set(fingers).size === fingers.length;
};

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
const getNCompletedAttempts = (userId) => {
  return new Promise((resolve, reject) => {
    database.get('SELECT COUNT(DISTINCT levelID) AS nCompletedLevels FROM attempts WHERE userId = ? AND isCompleted = 1',[userId], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row ? row.nCompletedLevels : null);      }
    });
  })
}

const getNAttemptsDays = (userId, nDays) => {
  return new Promise((resolve, reject) => {
    database.get('SELECT COUNT(levelID) AS nCompletedLevels FROM attempts WHERE userId = ? AND startTimeDateStamp >= ?',[userId, Date.now() - nDays * 24 * 60 * 60 * 1000], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row ? row.nCompletedLevels : null);      }
    });
  })
}

const getNCompletedAttemptsDays = (userId, nDays) => {
  return new Promise((resolve, reject) => {
    database.get('SELECT COUNT(levelID) AS nCompletedLevels FROM attempts WHERE userId = ? AND isCompleted = 1 AND startTimeDateStamp >= ?',[userId, Date.now() - nDays * 24 * 60 * 60 * 1000], (err, row) => {
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
const changeFingers = (userId, req) => {
    //TODO Hermine kannst du gerne deinem Entwurf anpassen
    const user = users.get(userId);
    user.hand = req;
    const matchingMapping = defaultKeyboardMappings.find(mapping =>
        Object.keys(mapping.fingers).every(finger =>
            mapping.fingers[finger] === req[finger]
        )
    );
    user.keyMappings = { ...matchingMapping.keyMappings };
    return user;
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

//returns an array
const getActiveFingers = (userId) => {
  return new Promise((resolve, reject) => {
    database.get('SELECT usedFingers FROM users WHERE userID = ? ', [userId], (err, row) => {
      if (err) {
        reject(err);
      } else if (!row) {
        reject(new Error("User not found"));
      } else {
        const fingers = JSON.parse(row.usedFingers);

        if (!validateFingers(fingers)) {
          reject(new Error("The fingers are not valid"));
        } else {
          resolve(fingers);
        }
      }
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

//first login
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
    const allAttemps = await getAllAttempts(req.params.userID);
    res.json({allAttemps : allAttemps});
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

//when the attempt starts, create an attempt
app.post('/api/attempt', async (req, res) => {
  try {
    const newAttemptID = await createAttempt(req.body);
    res.status(201).json({ newAttemptID: newAttemptID });
  } catch (err) {
    res.status(500).json({ error: "Could not create attempt" });
  }
});

//When a mistake was made: increase the nMistakes
app.put('/api/mistake/:attemptId', async (req, res) => {
  //TODO
});

//When an attempt is finished, time, stars, percentage is calculated, independend if it was completed or not
app.put('/api/finished/:attemptId', async (req, res) => {
  // calculates percentage, stars, time ...
  //TODO
});

//When the attempt was aborted
//should be called if something went wrong (maybe additionally if it makes more than 20min -> should be interpreted as aborted)
app.delete('/api/attempt/:attemptId', async (req, res) => {
  //TODO
});

//Get the percentage of the total levels completed (progressbar level-overview-page)
app.get('/api/allLevelPercent/:userId', async (req, res) => {
  //TODO
});

//For the frontent and for the settings-page
app.get('/api/textSize/:userId', async (req, res) => {
  //TODO
});

//For the frontent and for the settings-page
app.put('/api/textSize/:userId', async (req, res) => {
  //TODO
});

//For the frontent and for the settings-page
app.get('/api/isAudio/:userId', async (req, res) => {
  //TODO
});

//For the frontent and for the settings-page
app.put('/api/isAudio/:userId', async (req, res) => {
  //TODO
});

//new fingers activated
//adds all new fingers and will also add a new defaultkeyboard
app.put('/api/finger/:userID', (req, res) => {
  const user = changeFingers(req.params.userID, req.body);
  if (!user) {
    return res.status(404).json({ error: 'User or fitting mapping not found' });
  }
  res.json(user)
  //TODO Hermine -> kannst du gerne deinem Entwurf anpassen
});

//needed for the representation of the settings
app.get('/api/fingers/:userID', async(req, res) => {
  try {
    const activeFingers = await getActiveFingers(req.params.userID);
    res.json({activeFingers : activeFingers});
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Could not find userId or active fingers'});
  }
});

//the keyboard for this user
app.get('/api/keyboard/:userId', async (req, res) => {
  //TODO Hermine
  //Wie auch immer du es umsetzen willst
});

//sends the whole keyboard and overwrittes the old keyboard
app.put('/api/keyboard/:userId', async (req, res) => {
  //TODO Hermine
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
