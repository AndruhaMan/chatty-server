const express = require('express');
const cors = require('cors');
const messageRouter = require('./routers/message.js');
const userRouter = require('./routers/user.js');
const USERS = require('./store/users.js');
const MESSAGES = require('./store/messages.js');

const PORT = process.env.PORT || 4000;

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

app.use('/messages', messageRouter);
app.use('/users', userRouter);

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