const Chat = require('../../schemas/ChatSchema')
const Message = require('../../schemas/MessageSchema')
const User = require('../../schemas/UserSchema')
const Notification = require('../../schemas/NotificationSchema')

const router = require('express').Router()

router.post('/', async (req,res) => {
   if(!req.body.content && !req.body.chatId){
    console.log(`Request header cannot be empty`)
    return
    }

    const userId = req.session.user._id
    const chatId = req.body.chatId
    const content = req.body.content

    const messageData = {
        sender:userId,
        content,
        chat:chatId
    }

    try{
        Message.create(messageData)
        .then(async message => {
            message = await message.populate('sender').execPopulate()
            message = await message.populate('chat').execPopulate()
            message = await User.populate(message, {path:'chat.users'})

    
        const chat = await Chat.findByIdAndUpdate(chatId, {recentMessage:message, byMe:userId})
        console.log(chat)
        insertNotifications(chat, message)
        res.status(200).send(message)
        })
    }catch(error){
        console.log(error)
        res.sendStatus(404)
    }

})


function insertNotifications(chat, message) {
    chat.users.forEach(async userId => {
        if(userId == message.sender._id.toString()) return;
            //come back
        await Notification.createNotification(userId, message.sender._id, "newMessage", message.chat._id);
        
    })
}


module.exports = router