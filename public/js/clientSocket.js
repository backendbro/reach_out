let connected = false;

const origin = window.location.origin;
let socket = io(origin)

socket.emit('setup', userLoggedIn) 

// setup handshake complete
socket.on('connected', () => connected = true)
socket.on('message received', (newMessage) => newMessageRecieved(newMessage))
socket.on('notification recieved', () => {
    $.get('/api/notifications/latest', (notificationData) => {
        showNotificationPopup(notificationData)
        refreshNotificationsBadge()
    })
})

function emitNotification(userId){
    if(userId == userLoggedIn._id)return
    socket.emit('notification recieved', userId)
}
