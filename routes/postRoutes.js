const router = require('express').Router()

router.get('/:postId', (req,res) => {
    const payload = {
        pageTitle:'Post',
        userLoggedIn:req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
        postId: req.params.postId
    }
    res.status(200).render('postPage', payload)
})

module.exports = router