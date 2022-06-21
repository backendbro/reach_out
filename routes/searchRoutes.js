const router = require('express').Router()

router.get('/', (req,res) => {
    const payload = {
        pageTitle:"Search",
        userLoggedIn:req.session.user,
        userLoggedInJs:JSON.stringify(req.session.user),
        selectedTab:'posts'
    }
    res.status(200).render('searchPage', payload)
})

router.get('/posts', (req,res) => {
    const payload = {
        pageTitle:"Search",
        userLoggedIn:req.session.user,
        userLoggedInJs:JSON.stringify(req.session.user),
        selectedTab:'posts'
    }
    res.status(200).render('searchPage', payload)
})

router.get('/users', (req,res) => {
    const payload = {
        pageTitle:"Search",
        userLoggedIn:req.session.user,
        userLoggedInJs:JSON.stringify(req.session.user),
        selectedTab:'users'
    }
    res.status(200).render('searchPage', payload)
})

module.exports = router