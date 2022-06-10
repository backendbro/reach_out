router = require('express').Router()
const User = require('../schemas/UserSchema')

router.get('/', (req,res) => {
    res.render('register')
})

router.post("/", async (req,res) => {
    const {full_name, email, username, password, password2} = req.body
    const payload = {
        full_name:req.body.full_name,
        email: req.body.email,
        username: req.body.username
    }
    const UserData = {
        full_name:req.body.full_name,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password
    }

    if(!full_name || !email || !username || !password || !password2){
        payload.errorMessage = "Invalid credentials"
        return res.status(404).render('register', payload)
    }

    if(password != password2){
        payload.errorMessage = "Passwords do not match"
        return res.status(404).render('register', payload)
    }

    if(full_name && email && username && password){
        let user = await User.findOne({
            $or:[
                {username: username},
                {email: email}
            ]
        })  

        if(!user){
            user = await User.create(UserData)
            req.session.user = user
            res.redirect('/')
        }else{
            if(email == user.email){
                payload.errorMessage = "Email already in use"
            }else{
                payload.errorMessage = "Username already in use"
            }

            res.render('register', payload)
        }
    }
})  

module.exports = router
