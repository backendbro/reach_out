const router = require('express').Router()
let Chat = require('../../schemas/ChatSchema')

router.get('/hello', (req,res) => {
    console.log('Hello world')
})

router.post('/', async (req,res) => {
    if(!req.body.users){
        console.log(`Request header is empty`)
        res.sendStatus(404)
        return;
    }

    const users = JSON.parse(req.body.users)
    if(users.length == 0){  
        console.log(`Users array is empty`)
        res.sendStatus(404)
        return;
    }

    users.push(req.session.user)
    const chatData = {
        users,
        isGroup:true
    }
    try{
    const chat = await Chat.create(chatData)
    res.status(200).send(chat)
    }catch(error){
        console.log(error)
        res.sendStatus(400)
    }

})


module.exports = router