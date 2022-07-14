const router = require('express').Router()

router.get('/', (req,res) => {
    if(req.session){
        req.session = null
        res.redirect('/login')
    }
})
module.exports = router