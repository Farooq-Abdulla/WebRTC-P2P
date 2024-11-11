import { Server, Socket } from 'socket.io';
const io = new Server(8080, {
  cors: {
    allowedHeaders: ['*'],
    origin: '*',
  },
});
let senderSocket: null | Socket = null;
let receiverSocket: null | Socket = null;
io.on('connection', (socket) => {
  socket.on('identify-as-sender', () => {
    senderSocket = socket;
    console.log('Identified sender', senderSocket.id);
  });
  socket.on('identify-as-receiver', () => {
    receiverSocket = socket;
    console.log('Identified receiver', receiverSocket.id);
  });
  socket.on('create-offer', (offer: RTCSessionDescription) => {
    if (receiverSocket) receiverSocket?.emit('create-offer', offer);
  });
  socket.on('create-answer', (offer: RTCSessionDescription) => {
    if (senderSocket) senderSocket?.emit('create-answer', offer);
  });
  socket.on('forward-ice-candidate', (candidate: RTCIceCandidate) => {
    if (socket === senderSocket && receiverSocket)
      receiverSocket.emit('forward-ice-candidate', candidate);
    else if (socket === receiverSocket && senderSocket)
      senderSocket.emit('forward-ice-candidate', candidate);
  });
});
