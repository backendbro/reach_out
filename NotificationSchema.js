const mongoose = require('mongoose')
const Schema = mongoose.Schema

const NotificationSchema = new Schema({
    userFrom:{type:Schema.Types.ObjectId, ref:'User'},
    userTo:{type:Schema.Types.ObjectId, ref:'User'},
    notificationType:String,
    opened:{type:Boolean, default:false},
    entityId:{type:Schema.Types.ObjectId}
}, {timestamps:true})

NotificationSchema.statics.createNotification = async (userFrom, userTo, notificationType, opened, entityId) => {
    const notificationData = {
        userFrom,
        userTo,
        notificationType,
        opened,
        entityId
    }

    await NotificationSchema.deleteOne(notificationData).catch(error => console.log(error))
    return NotificationSchema.create(notificationData).catch(error => console.log(error))
}



module.exports = mongoose.model('Notification', NotificationSchema)