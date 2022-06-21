const router = require('express').Router()

router.get('/', async (req,res) => {
    const payload = {
        pageTitle:'Setting',
        userLoggedIn:req.session.user,
        userLoggedInJs:JSON.stringify(req.session.user),
        profileUser:req.session.user
    }
    res.status(200).render('settingPage', payload)
})
module.exports = router