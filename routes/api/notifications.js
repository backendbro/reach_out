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
    await Notification.findByIdAndUpdate(notificationId, {opened:true}, {new:true})
    res.sendStatus(200)
})

router.put('/markAsOpened', async (req,res) => {
    await Notification.updateMany({userTo:{$eq: req.session.user._id}},  {opened:true})
    res.sendStatus(200)
})

router.get('/latest', async (req,res) => {
    const notification = await Notification.findOne({userTo:req.session.user._id})
    .populate('userFrom')
    .populate('userTo')
    .sort({createdAt:-1})

    res.status(200).send(notification)
})


module.exports = router