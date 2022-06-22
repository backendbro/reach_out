const router = require('express').Router()
const User = require('../../schemas/UserSchema')

router.post('/general', async (req,res) => {
   
    const user = await User.findById(req.session.user._id)
    const {full_name, username, email, description} = req.body
    const payload = {
        pageTitle:'Setting',
        userLoggedIn:req.session.user,
        userLoggedInJs:JSON.stringify(req.session.user),
        profileUser:req.session.user,
        full_name:full_name,
        username:username,
        email:email,
        description:description    
    }
    
    const newPayload = {
        pageTitle:'Setting',
        userLoggedIn:req.session.user,
        userLoggedInJs:JSON.stringify(req.session.user)
    }

    let settingsData = new Object()
    if(full_name){
        settingsData.full_name = full_name
    }

    if(description){
        settingsData.description = description
    }

    if(username){
        const checkIfUserExists = await User.findOne({username:username})
        if(checkIfUserExists == null){
            settingsData.username = username
        }else{
            payload.errorMessage = `Username already exists`
            return res.status(404).render('settingPage', payload)
        }
    }

    if(email){
        const checkIfEmailExists = await User.findOne({email:email})
        if(checkIfEmailExists == null){
            settingsData.email = email
        }else{
            payload.errorMessage =  `Email already exists`
            return res.status(404).render('settingPage', payload)
        }
    }

    
    try {
        req.session.user = await User.findByIdAndUpdate(req.session.user._id, settingsData, {new:true})
        res.redirect('/setting')
    } catch (error) {
        console.log(error)
        res.sendStatus(404)
    }
    
})

router.post('/password', async (req,res) => {
    const { currentPassword, newPassword, repeatPassword} = req.body
    const payload = {
        pageTitle:'Setting',
        userLoggedIn:req.session.user,
        userLoggedInJs:JSON.stringify(req.session.user),
        profileUser:req.session.user
    }

    if(currentPassword == "" || newPassword == "" || repeatPassword == ""){
        payload.errorMessage = "Please fill in all empty field"
        return res.status(404).render('settingPage', payload)
    }
    
    const user = await User.findById(req.session.user._id).select('+password')
    const isMatch = await user.validatePassword(currentPassword)    
    if(!isMatch){
        payload.errorMessage = 'Current and old password do not match'
        return res.status(404).render('settingPage', payload)
    }
   
    if(newPassword !== repeatPassword){
    payload.errorMessage = `"new password" and "repeat new password" do not match`
    return res.status(404).render('settingPage', payload)
    }

    user.password = newPassword
    await user.save()
    res.status(200).render('settingPage', payload)
})

module.exports = router