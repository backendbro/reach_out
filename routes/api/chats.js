const router = require('express').Router()
let Chat = require('../../schemas/ChatSchema')
let User = require('../../schemas/UserSchema')
let Message = require('../../schemas/MessageSchema')


router.get('/', async (req,res) => {
    let userId;
    if(req.session.user !== null){
         userId = req.session.user._id
    }
    const searchQuery = {users:{ $elemMatch:{$eq: userId } }}
    let results = await Chat.find(searchQuery)
    .populate('users')
    .populate('recentMessage')
    .sort({'updatedAt':-1})

    if(req.query.unreadOnly !== undefined && req.query.unreadOnly == "true") {
        results = results.filter(r => r.recentMessage && !r.recentMessage.readBy.includes(req.session.user._id));
    }

    results = await User.populate(results, {path:'recentMessage.sender'})
    res.status(200).json(results)
})


router.get('/:chatId', async (req,res) => {
    const chatId = req.params.chatId
    const userId = req.session.user._id
    try {
    const chat = await Chat.findOne({_id:chatId, users: {$elemMatch: { $eq: userId } } })
    .populate('users')
    res.status(200).send(chat)        
    } catch (error) {
    console.log(error)
    res.sendStatus(500)    
    }

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

    if(chatData.isGroup == true){
        chatData.groupOwner = req.session.user._id
    }

    try{
    const chat = await Chat.create(chatData)
    res.status(200).send(chat)
    }catch(error){
        console.log(error)
        return res.sendStatus(500)
    }

})

router.put('/:chatId', async (req,res) => {
    const chatId = req.params.chatId
    const chatName = req.body.chatName
    try {
        await Chat.findByIdAndUpdate(chatId, {chatName:chatName}, {new:true})
        res.sendStatus(204)   
    } catch (error) {
        console.log(error)
        return res.sendStatus(500)
    }
})

router.get('/:chatId/messages', async (req,res) => {
    const chatId = req.params.chatId
    try {
        const messages = await Message.find({chat:chatId})
        .populate('sender')
        res.status(200).send(messages)   
    } catch (error) {
        console.log(error)
        return res.sendStatus(500)
    }
})

router.put('/:chatId/leave', async (req,res) => {
    const userId = req.body.userId
    const chatId = req.params.chatId
    try {
        const chat = await Chat.findOne({_id:chatId, users:{$elemMatch: { $eq: userId}}})
        if(!chat){
            console.log('You cannot leave a room where you do not exist')
            return res.sendStatus(404)
        }
    
        await Chat.findByIdAndUpdate(chatId, {$pull : { users: userId }})
        res.sendStatus(200)   
    } catch (error) {
        console.log(error)
        return res.sendStatus(500)
    }
})


router.put('/:chatId/messages/markAsRead', async(req,res) => {
    const chatId = req.params.chatId
    try {
        await Message.updateMany({chat:chatId} , {$addToSet:{readBy:req.session.user._id}})
        res.sendStatus(204)   
    } catch (error) {
        console.log(error)
        return res.sendStatus(500)
    }
})


router.delete('/:chatId/delete', async (req,res) => {
    const userId = req.body.userId
    const chatId = req.params.chatId

    try {
        let chat = await Chat.findOne({_id:chatId, users:{$elemMatch: { $eq: userId}}})

        if(!chat){
            console.log('You cannot leave a room where you do not exist')
            return res.sendStatus(404)  
        }
        await Chat.deleteOne({_id:chatId})
        await Message.deleteMany({ chat: chatId})
    
        res.sendStatus(200)        
    } catch (error) {
        console.log(error)
        return res.sendStatus(500)
    }

})

module.exports = router