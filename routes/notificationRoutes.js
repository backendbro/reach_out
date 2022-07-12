const router = require('express').Router()

router.get('/', async(req,res) => {
    const payload = {
        pageTitle:'Notifications',
        userLoggedIn:req.session.user,
        userLoggedInJs:JSON.stringify(req.session.user)
    }

    res.status(200).render('notificationPage', payload)
})

module.exports = router
