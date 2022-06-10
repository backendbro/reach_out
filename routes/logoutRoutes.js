const router = require('express').Router()

router.get('/', (req,res) => {
    if(req.session){
        req.session.destroy(() => {
            res.redirect('/')
        })
    }
})
module.exports = router