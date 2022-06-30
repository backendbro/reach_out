let connected = false;

let socket = io("http://localhost:3003");
socket.emit('setup', userLoggedIn) 

// setup handshake complete
socket.on("connected", () => connected = true)
socket.on('message recieved', (newMessage) => newMessageRecieved(newMessage))