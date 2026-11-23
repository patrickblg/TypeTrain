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
    timeDateStamp : 123456789
  }
]*/
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
    res.status(500).json({error: 'Could not find attemps by userid'});
  }
});

//get amount of tried attemps Levels of the user in the last x days
//for the progressbar protocol
app.get('/api/users/:userId/days/:nDays/nAttempts',  (req, res) => {
  //TODO
});

//get amount of tried & completed attemps Levels of the user in the last x days
//for the progressbar protocol
app.get('/api/users/:userId/days/:nDays/nAttemptsCompleted',  (req, res) => {
  //TODO
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
app.post('/api/userData', (req, res) => {
  //TODO
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

//Returns the attemps of the user and level (if there are many, then we have to decide if we choose the best or the last)
//for the level-overview-page (combined with all levels information)
//if we use the last one, we can also use this for the "gratulation page"
app.get('/api/users/:userId/levels/:levelId/attempts',  (req, res) => {
   //TODO
});

//when the attempt starts
app.post('/api/attempt', (req, res) => {
  //TODO
});

//When a mistake was made: increase the nMistakes
app.put('/api/mistake/:attemptId', (req, res) => {
  //TODO
});

//When an attempt is finished, isFinished is set on true
app.put('/api/isFinished/:attemptId', (req, res) => {
  // calculates percantage, stars, time ...
  //TODO
});

//When the attempt was aborted
app.delete('/api/attempt/:attemptId', (req, res) => {
  //TODO
});

//Get the percentage of the total levels completed (progressbar level-overview-page)
app.get('/api/allLevelPercent/:userId', (req, res) => {
  //TOOD
});

//For the frontent and for the settings-page
app.get('/api/textSize/:userId', (req, res) => {
  //TODO
});

//For the frontent and for the settings-page
app.put('/api/textSize/:userId', (req, res) => {
  //TODO
});

//For the frontent and for the settings-page
app.get('/api/isAudio/:userId', (req, res) => {
  //TODO
});

//For the frontent and for the settings-page
app.put('/api/isAudio/:userId', (req, res) => {
  //TODO
});

//new fingers activated
//adds all new fingers and will also add a new defaultkeyboard
app.put('/api/finger/:userId', (req, res) => {
  const user = changeFingers(req.params.userId, req.body);
  if (!user) {
    return res.status(404).json({ error: 'User oder passendes Mapping nicht gefunden' });
  }
  res.json(user)
  //TODO Hermine -> kannst du gerne deinem Entwurf anpassen
});

//needed for the representation of the settings
app.get('/api/finger/:userId', (req, res) => {
  //TODO
});

//the keyboard for this user
app.get('/api/keyboard/:userId', (req, res) => {
  //TODO Hermine
  //Wie auch immer du es umsetzen willst
});

//sends the whole keyboard and overwrittes the old keyboard
app.put('/api/keyboard/:userId', (req, res) => {});

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
