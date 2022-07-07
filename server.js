const express = require('express');
const app = express();
const middleware = require('./middleware')
const path = require('path')
const connectDb = require("./database");
const session = require("express-session");
const dotenv = require('dotenv') 

dotenv.config()
const port = process.env.PORT || 3000
const server = app.listen(port, () =>{ 
    console.log(`Server listening on port ${port}`)});
const io = require('socket.io')(server, {pingTimeout: 60000})


connectDb()

app.set("view engine", "pug");
app.set("views", "views");

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
    secret: process.env.sessionSecret,
    resave: true,
    saveUninitialized: false
}))


// Routes
const loginRoute = require('./routes/loginRoutes');
const registerRoute = require('./routes/registerRoutes');
const logoutRoute = require('./routes/logoutRoutes')
const postRoute = require('./routes/postRoutes')
const profileRoute = require('./routes/profileRoutes')
const searchRoute = require('./routes/searchRoutes')
const settingRoute = require('./routes/settingRoutes')
const messageRoute = require('./routes/messagesRoutes')
const notificationRoute = require('./routes/NotificationRoutes')


// Api routes
const postsApiRoute = require('./routes/api/posts');
const usersApiRoute = require('./routes/api/users')
const settingsApiRoute = require('./routes/api/settings')
const chatApiRoute  = require('./routes/api/chats')
const messageApiRoute = require('./routes/api/messages')
const notificationApiRoute = require('./routes/api/notifications')

app.use('/login', loginRoute)
app.use("/register", registerRoute);
app.use('/logout', logoutRoute)

app.use("/post", middleware.protect, postRoute)
app.use('/profile', middleware.protect, profileRoute)
app.use('/search', middleware.protect, searchRoute)
app.use('/setting', middleware.protect, settingRoute)
app.use('/messages', middleware.protect, messageRoute)
app.use('/notifications', middleware.protect, notificationRoute)


app.use("/api/posts", postsApiRoute);
app.use('/api/users', usersApiRoute)
app.use('/api/settings', settingsApiRoute)
app.use('/api/chats', chatApiRoute)
app.use('/api/messages', messageApiRoute)
app.use('/api/notifications', notificationApiRoute)

app.get("/", middleware.protect, (req, res, next) => {

    const payload = {
        pageTitle: "Home",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
    }
    res.status(200).render("home", payload);
})

io.on('connection', socket => {
    socket.on('setup', userData => {
       socket.join(userData._id)
       socket.emit('connected')
    })

    socket.on("join room", chatRoom => socket.join(chatRoom));
    socket.on("typing", chatRoom => socket.in(chatRoom).emit("typing"));
    socket.on("stop typing", chatRoom => socket.in(chatRoom).emit("stop typing"));
    socket.on('notification recieved', userRoom => socket.in(userRoom).emit('notification recieved'))
   
    socket.on("new message", newMessage  => {
        let chat = newMessage.chat
        if(!chat.users) return console.log('Chat.users is empty')
        
        chat.users.forEach(user => {
            if(user._id == newMessage.sender._id) return 
            socket.in(user._id).emit('message received', newMessage)
        })
    });
})

