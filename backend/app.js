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
  //TODO: verify that textSize is in range

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

//For the frontent and for the settings-page
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

//For the frontent and for the settings-page
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

//new fingers activated
//adds all new fingers and will also add a new defaultkeyboard
app.patch('/api/finger/:userID', (req, res) => {
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
app.patch('/api/keyboard/:userId', async (req, res) => {
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
