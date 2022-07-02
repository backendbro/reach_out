const router = require('express').Router()
const Notification = require('../../schemas/NotificationSchema')

router.get('/', async (req,res) => {
    const searchQuery = {userTo:req.session.user, notificationType:{$ne:'messages'}}
    if(req.query.readOnly !== undefined && req.query.readOnly == true){
        searchQuery.opened = false
    }
    const notification = await Notification.find(searchQuery)
    .populate('userFrom')
    .populate('userTo')
    .sort({'createdAt':-1})

    res.status(200).send(notification)
})
module.exports = router