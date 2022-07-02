const mongoose = require('mongoose')
const Schema = mongoose.Schema

const NotificationSchema = new Schema({
    userFrom:{type:Schema.Types.ObjectId, ref:'User'},
    userTo:{type:Schema.Types.ObjectId, ref:'User'},
    notificationType:String,
    opened:{type:Boolean, default:false},
    entityId:{type:Schema.Types.ObjectId}
}, {timestamps:true})

NotificationSchema.statics.createNotification = async (userTo, userFrom, notificationType, entityId) => {
    const data = {
        userTo: userTo,
        userFrom: userFrom,
        notificationType: notificationType,
        entityId: entityId
    };
    await Notification.deleteOne(data).catch(error => console.log(error));
    return Notification.create(data).catch(error => console.log(error));
}


let Notification = mongoose.model('Notification', NotificationSchema);
module.exports = Notification;