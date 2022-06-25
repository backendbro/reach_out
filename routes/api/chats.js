const router = require('express').Router()
let Chat = require('../../schemas/ChatSchema')
let User = require('../../schemas/UserSchema')

router.get('/', async (req,res) => {
    let results = await Chat.find({users:{ $elemMatch:{$eq: req.session.user._id } }})
    .populate('users')
    .populate('recentMessage')
    .sort({'updatedAt':-1})

    results = await User.populate(results, {path:'recentMessage.sender'})
    res.status(200).json(results)
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