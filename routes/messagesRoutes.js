const router = require('express').Router()
const Chat = require('../schemas/ChatSchema')
const mongoose = require('mongoose')

router.get('/', (req,res) => {
    const payload = {
        pageTitle:'Say Hello',
        userLoggedIn:req.session.user,
        userLoggedInJs:JSON.stringify(req.session.user)
    }

    res.status(200).render('inboxPage', payload)
})

router.get('/new', (req,res) => {
    const payload = {
        pageTitle:'New chat',
        userLoggedIn:req.session.user,
        userLoggedInJs:JSON.stringify(req.session.user)
    }

    res.status(200).render('newChat', payload)
})

router.get('/:chatId', async (req,res) => {
    const chatId = req.params.chatId
    const userId = req.session.user._id
    const isValid = mongoose.isValidObjectId(chatId)

    const payload = {
        pageTitle:'New chat',
        userLoggedIn:req.session.user,
        userLoggedInJs:JSON.stringify(req.session.user)
    }

    if(!isValid){
        payload.errorMessage = `Chat does not exist or you are not permitted to view this page`
        return res.status(200).render('chatPage', payload)
    }

    let chat = await Chat.findOne({_id:chatId, users:{$elemMatch:{$eq:userId}}})
    .populate('users')

    if(chat == null){
     payload.errorMessage('Chat does not exist')   
    }else{
    payload.chat = chat
    }
    res.status(200).render('chatPage', payload)
    
})

module.exports = router