const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ChatSchema = new Schema({
    chatName:{type:String},
    isGroup:{type:Boolean, default:false},
    users:[{type:Schema.Types.ObjectId, ref:'User'}],
    groupOwner:{type:Schema.Types.ObjectId, ref:'User'},
    recentMessage:{type:Schema.Types.ObjectId, ref:'Message'},
    byMe:{type:Schema.Types.ObjectId}
},{timestamps:true})


const Chat = mongoose.model('Chat', ChatSchema)
module.exports = Chat
