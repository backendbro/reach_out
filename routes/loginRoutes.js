const router = require('express').Router()
const User = require('../schemas/UserSchema')

router.get('/', (req,res) => {
    res.render('login')
})

router.post('/', async (req, res) => {
    const {username, password} = req.body
    const payload = {
        username : req.body.username,
        password: req.body.password
    }
   
   if(!username || !password){
       payload.errorMessage = "Invalid credentials"
       res.status(404).render('login', payload)
   }
   
   if(username && password){
    let user = await User.findOne({
        $or:[
            {username:username},
            {email:username}
        ]
    }).select('+password')
    if(user){
        const isMatch = await user.validatePassword(password)
        if(isMatch){
            req.session.user = user
            res.redirect('/')
        }else{
            payload.errorMessage = 'Invalid crendentials'
            return res.render('login', payload)
        }
    }else{
        payload.errorMessage = 'Invalid crendentials'
        return res.render('login', payload)
    }
   }
})


module.exports = router