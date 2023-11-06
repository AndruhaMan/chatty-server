const crypto = require('crypto');
const router = require('express').Router();
const USERS = require('../store/users.js');

router.get('/', (req, res) => {
  res.json(USERS);
});

router.post('/login', (req, res) => {
  const { userName, password } = req.body;

  const user = USERS.find(user => user.userName === userName);

  if (user && user.password === password) {
    const sessionId = crypto.randomBytes(16).toString('hex');

    user.sessionId = sessionId;

    res.json({
      status: 'success',
      sessionId: sessionId,
    });
  } else {
    res.status(401).json({
      status: 'error',
    });
  }

  res.end();
})

router.post('/signup', (req, res) => {
  const { userName, password } = req.body;

  const user = USERS.find(user => user.userName === userName);

  if (user) {
    res.status(401).json({
      status: 'error',
    });

    return;
  }

  const newUser = {
    userName,
    password,
    sessionId: crypto.randomBytes(16).toString('hex'),
  };

  USERS.push(newUser);
  res.json({
    status: 'success',
    sessionId: newUser.sessionId,
  });
})

module.exports = router;