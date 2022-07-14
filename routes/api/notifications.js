const router = require('express').Router()
const Notification = require('../../schemas/NotificationSchema')

router.get('/', async (req,res) => {
    const searchQuery = {userTo:req.session.user._id, notificationType:{$ne:'newMessage'}}
    if(req.query.unreadOnly !== undefined && req.query.unreadOnly == "true"){
        searchQuery.opened = false
    }
    const notification = await Notification.find(searchQuery)
    .populate('userFrom')
    .populate('userTo')
    .sort({'createdAt':-1})

    res.status(200).send(notification)
})

router.put('/:notificationId/markAsOpened', async (req,res) => {
    const notificationId = req.params.notificationId
    try {
        await Notification.findByIdAndUpdate(notificationId, {opened:true}, {new:true})
        res.sendStatus(200)   
    } catch (error) {
        console.log(error)
        return res.sendStatus(500)
    }
})

router.put('/markAsOpened', async (req,res) => {
    try {
        await Notification.updateMany({userTo:{$eq: req.session.user._id}},  {opened:true})
        res.sendStatus(200)   
    } catch (error) {
        console.log(error)
        return res.sendStatus(500)
    }
})

router.get('/latest', async (req,res) => {
    
    try{
        const notification = await Notification.findOne({userTo:req.session.user._id})
        .populate('userFrom')
        .populate('userTo')
        .sort({createdAt:-1})
    
        res.status(200).send(notification)
    }catch(error){
        console.log(error)
        return res.sendStatus(500)
    }
})


module.exports = router