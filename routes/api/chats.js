const router = require('express').Router()

router.get('/hello', (req,res) => {
    console.log('Hello world')
})

module.exports = router