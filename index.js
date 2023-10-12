const express = require('express');
const cors = require('cors');

const PORT = process.env.PORT || 4000;

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "https://andruhaman.github.io/web-basics-lab4-client/",
  }
});

app.use(cors());
app.use(express.json());

io.on('connection', (socket) => {
  console.log(`${socket.id} connected`);

  socket.on('message', (data) => {
    io.emit('messageResponse', data);
  });

  socket.on('disconnect', () => {
    console.log(`${socket.id} disconnected`);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});