const router = require('express').Router()

router.post('/general', async (req,res) => {
    console.log(req.body)
    res.status(200).send('Hello')
})

module.exports = router