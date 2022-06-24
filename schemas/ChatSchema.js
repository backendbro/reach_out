const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ChatSchema = new Schema({
    chatName:{type:String},
    isGroup:{type:Boolean, default:false},
    users:[{type:Schema.Types.ObjectId, ref:'User'}],
    recentMessage:{type:Schema.Types.ObjectId, ref:'Message'}
},{timestamps:true})

module.exports = mongoose.model('Chat', ChatSchema)
