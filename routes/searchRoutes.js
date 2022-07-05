const router = require('express').Router()

router.get('/', (req,res) => {
    const user = req.session.user
    const payload = getPayload('posts', user)
    res.status(200).render('searchPage', payload)
})

router.get('/posts', (req,res) => {
    const user = req.session.user
    const payload = getPayload('posts', user)
    res.status(200).render('searchPage', payload)
})

router.get('/users', (req,res) => {
    const user = req.session.user
    const payload = getPayload('users', user)
    res.status(200).render('searchPage', payload)
})

function getPayload(selectedTab, user){
    return {
        pageTitle:"Search",
        userLoggedIn:user,
        userLoggedInJs:JSON.stringify(user),
        selectedTab:selectedTab
    }
}
module.exports = router