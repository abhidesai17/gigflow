let ioInstance = null;

function initSocket(server) {
  const { Server } = require('socket.io');

  ioInstance = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN,
      credentials: true,
    },
  });

  ioInstance.on('connection', (socket) => {
    socket.on('auth:identify', ({ userId }) => {
      if (!userId) return;
      socket.join(`user:${userId}`);
    });
  });

  return ioInstance;
}

function getIo() {
  return ioInstance;
}

module.exports = { initSocket, getIo };
