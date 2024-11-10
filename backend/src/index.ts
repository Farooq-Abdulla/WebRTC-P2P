import { Server, Socket } from 'socket.io';
const io = new Server(8080, {});
let senderSocket: null | Socket = null;
let receiverSocket: null | Socket = null;
io.on('connection', (socket) => {
  socket.on('identify-as-sender', (message: Socket) => {
    senderSocket = message;
  });
  socket.on('identify-as-receiver', (message: Socket) => {
    receiverSocket = message;
  });
  socket.on('create-offer', (message: RTCSessionDescription) => {
    receiverSocket?.emit('create-offer', message.sdp);
  });
  socket.on('create-answer', (message: RTCSessionDescription) => {
    senderSocket?.emit('create-answer', message.sdp);
  });
  socket.on('forward-ice-candidate', () => {});
});
