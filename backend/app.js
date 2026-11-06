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

//Question: Where to do the process of a "Game" counting, just using one Char, checking etc ?

const nLevels = 22;
//constant entry: ~ 22 entries
const levels  = [{
  id : 1,
  levelString : "asasasdasdfaffdaassd",
  levelTypes : [
    "asdf"
  ]
  },
  {
    id : 2,
    levelString : "ghjklgjkhglkghjjgljkgjhgk",
    levelTypes : [
      "ghjkl",
    ]
  },
  {
    id : 3,
    levelString : "qwertzwetzq677qwet648wetzeqtweqewr4q2",
    levelTypes : [
      "qwertz", "12345",
    ]
  },
  {
    id : 4,
    levelString : "Hallo du. Ja, du! Du schreibst gerade einen schönen Text bla Bla BLA ....",
    levelTypes : [
        "Sätze"
    ]
  },
  {
    id : 5,
    levelString : "wqoeui czcd7ew VGGgh jwd742hj djdhsdfk vgrh",
    levelTypes : [
        ".,;:", "Wörter", "Sätze"
    ]
  },
]

//all names have to be unique -> could also be used as ID (?)
let users = [
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
  },
  {
    userID : 2,
    name : "hermine",
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
  },
  {
    userID : 3,
    name : "patrick",
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
  },
  {
    userID : 4,
    name : "robert",
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
    ],
    keyMappings: {}
  },
]

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
//completed -> Erfolgreich abgeschloss
//finished -> Zuende gebracht (nicht abgebrochen) (all others should be deleted)
var attempt = [
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
  },
  {
    attemptId : 3,
    levelId : 2,
    userId : 1,
    isFinish: true,
    isCompleted : false,
    stars : 0,
    time : 12345678,
    nMistakes : 100,
    percentCorrect : 10,
    timeDateStamp : 123456789
  },
  {
    attemptId : 2,
    levelId : 1,
    userId : 2,
    isFinish: true,
    isCompleted : false,
    stars : 0,
    time : 12345678,
    nMistakes : 100,
    percentCorrect : 10,
    timeDateStamp : 123456789
  },
  {
    attempId : 1,
    levelId : 1,
    userId : 1,
    isFinish: true,
    isCompleted : false,
    stars : 0,
    time : 12345678,
    nMistakes : 100,
    percentCorrect : 10,
    timeDateStamp : 123456789
  },
]
const getLevels = () => levels
const getNLevels = () => levels
const getUserId = (name) => users.find(name).userId
const changeFingers = (userId, req) => {
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

//get general level info
app.get('/api/levels', (req, res) => {
  res.json({levels: getLevels()})
});

//get nLevels
app.get('/api/nLevels', (req, res) => {
  res.json({nLevels: getNLevels()})
});

//get amount of Completed Levels of the user
//for the progressbar protocol
app.get('/api/nCompletedLevels/:userId', (req, res) => {
  //TODO
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
app.get('app/userData/:name', (req, res) => {
  res.json({id: getUserId(name)})
});

//first login
app.post('app/userData', (req, res) => {
  //TODO
});

//protocol data
app.get('/api/allAttempts/:userId', (req, res) => {
  //TODO
});

//Returns the attemps of the user and level (if there are many, then we have to decide if we choose the best or the last)
//for the level-overview-page (combined with all levels information)
//if we use the last one, we can also use this for the "gratulation page"
app.get('/api/users/:userId/levels/:levelId/attempts',  (req, res) => {
   //TODO
});

//when the attempt starts
app.post('app/attempt', (req, res) => {
  //TODO
});

//When a mistake was made: increase the nMistakes
app.put('app/mistake/:attemptId', (req, res) => {
  //TODO
});

//When an attempt is finished, isFinished is set on true
app.put('app/isFinished/:attemptId', (req, res) => {
  // calculates percantage, stars, time ...
  //TODO
});

//When the attempt was aborted
app.delete('app/attempt/:attemptId', (req, res) => {
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
  res.json(user);
});

//needed for the representation of the settings
app.get('app/finger/:userId', (req, res) => {
  //TODO
});

//the keyboard for this user
app.get('/api/keyboard/:userId', (req, res) => {});

//sends the whole keyboard and overwrittes the old keyboard
app.put('/api/keyboard/:userId', (req, res) => {});

//-----------------------------------------------------
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
