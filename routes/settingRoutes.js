const router = require('express').Router()

router.get('/', (req,res) => {
    const payload = {
        pageTitle:'Setting',
        userLoggedIn:req.session.user,
        userLoggedInJs:JSON.stringify(req.session.user),
        profilePic:JSON.stringify(req.session.user.profilePic)
    }
    res.status(200).render('settingPage', payload)
})
module.exports = router