const express = require('express');
const multer = require('multer');
const nedb = require('@seald-io/nedb');
const cookieParser = require('cookie-parser');

const expressSession = require('express-session');
const nedbSession = require('nedb-promises-session-store');
const bcrypt = require('bcrypt');

const app = express();

const upload = multer({ dest: 'public/uploads/' });

let database = new nedb({
  filename: 'database.txt',
  autoload: true
});

database.ensureIndex({ fieldName: 'playerId', unique: true });

const userdb = new nedb({
  filename: 'usersdb.txt',
  autoload: true
});

const nedbSessionInit = nedbSession({
  connect: expressSession,
  filename: 'sessions.txt'
});

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.set('view engine', 'ejs');

app.use(expressSession({
  store: nedbSessionInit,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 365
  },
  secret: 'supersecret',
  resave: false,
  saveUninitialized: false
}));

function formatElapsedTime(ms) {
  if (!Number.isFinite(ms) || ms < 0) {
    return 'first visit';
  }

  const seconds = Math.floor(ms / 1000);

  if (seconds < 60) {
    return `${seconds}s ago`;
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  return `${days}d ago`;
}

function getLoggedInUser(req) {
  return req.session.loggedInUser || null;
}

function addNpcOfflineBuildings(savedGame) {
  if (!savedGame) {
    return;
  }

  if (!savedGame.gameState) {
    return;
  }

  if (!savedGame.gameState.map) {
    return;
  }

  const now = Date.now();
  const lastUpdatedAt = Number(savedGame.updatedAt);

  if (lastUpdatedAt <= 0) {
    return;
  }

  const elapsedMs = now - lastUpdatedAt;

  if (elapsedMs <= 0) {
    return;
  }

  const hoursAway = Math.floor(elapsedMs / (1000 * 60 * 60));

  if (hoursAway < 1) {
    return;
  }

  let maxBuilds = hoursAway;

  if (maxBuilds > 20) {
    maxBuilds = 20;
  }

  const buildsToAdd = Math.floor(Math.random() * (maxBuilds + 1));

  if (buildsToAdd <= 0) {
    return;
  }

  const map = savedGame.gameState.map;
  const buildingTypes = ['h1', 'f1', 'wm', 'tp1'];

  for (let i = 0; i < buildsToAdd; i++) {
    const randomIndex = Math.floor(Math.random() * buildingTypes.length);
    const randomBuilding = buildingTypes[randomIndex];

    let placed = false;

    for (let attempts = 0; attempts < 60; attempts++) {
      const row = Math.floor(Math.random() * map.length);

      if (map[row]) {
        const col = Math.floor(Math.random() * map[row].length);

        if (map[row][col] === 'bg') {
          map[row][col] = randomBuilding;
          placed = true;
          break;
        }
      }
    }

    if (placed === false) {
      break;
    }
  }
}

function renderLogin(req, res) {
  let error = null;

  if (req.query.user === 'null') {
    error = 'Username not found.';
  }

  if (req.query.password === 'invalid') {
    error = 'Password invalid.';
  }

  res.render('login.ejs', { error });
}

function renderRegister(req, res) {
  let error = null;

  if (req.query.error === 'exists') {
    error = 'Username already exists.';
  }

  res.render('signup.ejs', { error });
}

app.get('/', (req, res) => {
  const now = Date.now();

  const lastLogin = req.cookies.lastLogin
    ? parseInt(req.cookies.lastLogin, 10)
    : null;

  const elapsed = lastLogin ? now - lastLogin : NaN;
  const timeSinceLastLogin = formatElapsedTime(elapsed);

  const hundredYears = Date.now() + 100 * 365 * 24 * 60 * 60 * 1000;

  res.cookie('lastLogin', now, {
    expires: new Date(hundredYears)
  });

  res.render('index.ejs', {
    timeSinceLastLogin: timeSinceLastLogin,
    loggedInUser: getLoggedInUser(req)
  });
});

app.get('/login', renderLogin);
app.get('/login-page', renderLogin);

app.get('/register', renderRegister);
app.get('/signup-page', renderRegister);

app.post('/register', async (req, res) => {
  const username = (req.body.username || '').trim();
  const pass = req.body.pass || '';

  if (!username || !pass) {
    return res.status(400).send('username and pass are required');
  }

  userdb.findOne({ username: username }, async (findErr, existingUser) => {
    if (findErr) {
      return res.status(500).send('Unable to register user');
    }

    if (existingUser) {
      return res.redirect('/register?error=exists');
    }

    const encryptedPassword = await bcrypt.hash(pass, 10);

    const userToAdd = {
      username: username,
      password: encryptedPassword
    };

    userdb.insert(userToAdd, (insertErr) => {
      if (insertErr) {
        return res.status(500).send('Unable to register user');
      }

      const accountRecord = {
        playerId: username,
        gameState: null,
        updatedAt: Date.now()
      };

      database.insert(accountRecord, (dbErr) => {
        if (dbErr) {
          return res.status(500).send('Unable to initialize account data');
        }

        return res.redirect('/login');
      });
    });
  });
});

app.post('/authenticate', (req, res) => {
  const username = (req.body.username || '').trim();
  const pass = req.body.pass || '';

  const searchedUser = {
    username: username
  };

  userdb.findOne(searchedUser, (err, foundUser) => {
    if (foundUser == null || err) {
      console.log('user not found');
      return res.redirect('/login?user=null');
    }

    if (bcrypt.compareSync(pass, foundUser.password)) {
      req.session.loggedInUser = foundUser.username;
      return res.redirect('/');
    }

    return res.redirect('/login?password=invalid');
  });
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.post('/save-game', upload.none(), (req, res) => {
  const loggedInUser = getLoggedInUser(req);

  if (!loggedInUser) {
    return res.status(401).json({
      ok: false,
      error: 'Please log in to save.'
    });
  }

  const gameState = req.body.gameState;

  if (!gameState) {
    return res.status(400).json({
      ok: false,
      error: 'gameState is required.'
    });
  }

  let parsedGameState;

  try {
    if (typeof gameState === 'string') {
      parsedGameState = JSON.parse(gameState);
    } else {
      parsedGameState = gameState;
    }
  } catch (err) {
    return res.status(400).json({
      ok: false,
      error: 'couldnt load'
    });
  }

  const dataToStore = {
    playerId: loggedInUser,
    gameState: parsedGameState,
    updatedAt: Date.now()
  };

  database.update(
    { playerId: loggedInUser },
    { $set: dataToStore },
    { upsert: true },
    (err) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          error: 'Unable to save game.'
        });
      }

      return res.json({
        ok: true,
        playerId: loggedInUser
      });
    }
  );
});

app.get('/load-game', (req, res) => {
  const loggedInUser = getLoggedInUser(req);

  if (!loggedInUser) {
    return res.status(401).json({
      ok: false,
      error: 'Please log in to load.'
    });
  }

  database.findOne({ playerId: loggedInUser }, (err, savedGame) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        error: 'Unable to load game.'
      });
    }

    if (!savedGame) {
      return res.status(404).json({
        ok: false,
        error: 'No saved game found for this player.'
      });
    }

    addNpcOfflineBuildings(savedGame);

    return res.json({
      ok: true,
      playerId: savedGame.playerId,
      gameState: savedGame.gameState,
      updatedAt: savedGame.updatedAt
    });
  });
});

app.listen(8000, () => {
  console.log('Server is running on port 8000');
});