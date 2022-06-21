const router = require('express').Router()

router.get('/', (req,res) => {
    const payload = {
        pageTitle:'Settings',
        userLoggedIn:req.session.user,
        userLoggedInJs:JSON.stringify(req.session.user)
    }
    res.status(200).render('settingPage', payload)
})
module.exports = router