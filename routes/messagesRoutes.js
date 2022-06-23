const router = require('express').Router()

router.get('/', (req,res) => {
    const payload = {
        pageTitle:'Start chatting',
        userLoggedIn:req.session.user,
        userLoggedInJs:JSON.stringify(req.session.user)
    }

    res.status(200).render('chatDisplay', payload)
})

router.get('/new', (req,res) => {
    const payload = {
        pageTitle:'New chat',
        userLoggedIn:req.session.user,
        userLoggedInJs:JSON.stringify(req.session.user)
    }

    res.status(200).render('newChat', payload)
})

module.exports = router