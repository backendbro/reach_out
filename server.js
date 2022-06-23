const express = require('express');
const app = express();
const middleware = require('./middleware')
const path = require('path')
const connectDb = require("./database");
const session = require("express-session");
const dotenv = require('dotenv')

dotenv.config()
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


const server = app.listen(process.env.port, () =>{ 
    console.log(`Server listening on port  ${process.env.port}`)});


// Routes
const loginRoute = require('./routes/loginRoutes');
const registerRoute = require('./routes/registerRoutes');
const logoutRoute = require('./routes/logoutRoutes')
const postRoute = require('./routes/postRoutes')
const profileRoute = require('./routes/profileRoutes')
const searchRoute = require('./routes/searchRoutes')
const settingRoute = require('./routes/settingRoutes')
const messageRoute = require('./routes/messagesRoutes')

// Api routes
const postsApiRoute = require('./routes/api/posts');
const usersApiRoute = require('./routes/api/users')
const settingsApiRoute = require('./routes/api/settings')
const chatApiRoute  = require('./routes/api/chats')

app.use('/login', loginRoute)
app.use("/register", registerRoute);
app.use("/post", middleware.requireLogin, postRoute)
app.use('/profile', middleware.requireLogin, profileRoute)
app.use('/search', middleware.requireLogin, searchRoute)
app.use('/setting', middleware.requireLogin, settingRoute)
app.use('/messages', middleware.requireLogin, messageRoute)
app.use('/logout', logoutRoute)

app.use("/api/posts", postsApiRoute);
app.use('/api/users', usersApiRoute)
app.use('/api/settings', settingsApiRoute)
app.use('/api/chats', chatApiRoute)

app.get("/", middleware.requireLogin, (req, res, next) => {

    const payload = {
        pageTitle: "Home",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
    }
    res.status(200).render("home", payload);
})

