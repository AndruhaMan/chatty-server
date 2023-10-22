const express = require('express');
const cors = require('cors');

const PORT = process.env.PORT || 4000;
let USERS = [];
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

app.use(cors());
app.use(express.json());

app.get('/messages', (req, res) => {
  res.json(MESSAGES);
});

io.on('connection', (socket) => {
  console.log(`${socket.id} connected ${new Date().toLocaleTimeString()}`);

  socket.on('enterName', (userName, callback) => {
    if (!USERS.find(user => user.userName === userName)) {
      USERS.push({
        id: socket.id,
        userName: userName
      });

      callback({
        status: 'ok'
      })
    } else {
      callback({
        status: 'error'
      })
    }
  });

  socket.on('message', (data) => {
    const userName = USERS.find(user => user.id === socket.id)?.userName;

    if (userName) {
      const message = {
        ...data,
        name: userName,
        id: Date.now(),
      };

      MESSAGES.push(message);
      io.emit('messageResponse', message);
    }

  });

  socket.on('disconnect', () => {
    USERS = USERS.filter(user => user.id !== socket.id);
    console.log(`${socket.id} disconnected ${new Date().toLocaleTimeString()}`);
  });
});

server.listen(PORT, () => {
  console.log('Server is running');
});