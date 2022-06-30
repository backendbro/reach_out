const router = require('express').Router()
const Chat = require('../schemas/ChatSchema')
const mongoose = require('mongoose')
const User = require('../schemas/UserSchema')

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
        const checkByUser = await User.findById(chatId)


        if(checkByUser !== null){
            chat = await getChatByUserId(checkByUser._id, userId)
            console.log(chat)
        }
    }

    if(chat == null){
     payload.errorMessage('Chat does not exist')   
    }else{
    payload.group = chat.groupOwner 
    payload.isGroupChat = chat.isGroup
    payload.chat = chat
    }
    
    res.status(200).render('chatPage', payload)
    
})

async function getChatByUserId(otherUser, userLoggedIn){
    return await Chat.findOneAndUpdate({
        isGroup:false, 
        users:{
            $size:2,
            $all:[
                {$elemMatch:{$eq: mongoose.Types.ObjectId(otherUser) }},
                {$elemMatch:{$eq: mongoose.Types.ObjectId(userLoggedIn) }}
            ]
        }
    },
    {
        $setOnInsert:{
            users:[otherUser, userLoggedIn]
        }
    },
    {
        new:true,
        upsert:true
    })
    .populate('users')
}


module.exports = router