const router = require('express').Router()
const Chat = require('../schemas/ChatSchema')

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
    const chat = await Chat.findById(chatId)
    const payload = {
        pageTitle:'New chat',
        userLoggedIn:req.session.user,
        userLoggedInJs:JSON.stringify(req.session.user),
        chat
    }
    res.status(200).render('messageDisplay', payload)
})

module.exports = router