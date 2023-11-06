const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const PORT = process.env.PORT || 4000;
let USERS = [
  {
    userName: 'Andrew',
    password: '1234',
    sessionId: null,
  },

  {
    userName: 'Anna',
    password: '2626',
    sessionId: null,
  },
];
const MESSAGES = [];

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://web-basics-lab4-client.onrender.com",
    ],
  }
});

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

app.get('/messages', (req, res) => {
  res.json(MESSAGES);
});

app.post('/users/login', (req, res) => {
  const { userName, password } = req.body;

  const user = USERS.find(user => user.userName === userName);

  if (user && user.password === password) {
    const sessionId = crypto.randomBytes(16).toString('base64');
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

app.post('/users/signup', (req, res) => {
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
    sessionId: crypto.randomBytes(16).toString('base64'),
  };

  USERS.push(newUser);
  res.json({
    status: 'success',
    sessionId: newUser.sessionId,
  });
})

io.use((socket, next) => {
  const sessionId = socket.handshake.query.sessionId;
  const user = USERS.find(user => user.sessionId === sessionId);

  if (user) {
    next();
  } else {
    const err = new Error("not authorized");
    next(err);
  }
})

io.on('connection', (socket) => {
  console.log(`${socket.id} connected ${new Date().toLocaleTimeString()}`);

  socket.on('message', (data) => {
    const userName = USERS.find(user => user.sessionId === data.sessionId)?.userName;
    if (userName) {
      const message = {
        ...data,
        name: userName,
        time: new Date().toLocaleTimeString(),
        id: Date.now(),
      };

      MESSAGES.push(message);
      io.emit('messageResponse', message);
    }

  });

  socket.on('disconnect', () => {
    console.log(`${socket.id} disconnected ${new Date().toLocaleTimeString()}`);
  });
});

server.listen(PORT, () => {
  console.log('Server is running');
});