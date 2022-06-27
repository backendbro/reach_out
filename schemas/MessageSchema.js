const mongoose = require('mongoose')
const Schema = mongoose.Schema

const MessageSchema = new Schema({
    sender:{type:Schema.Types.ObjectId, ref:'User'},
    content:{type:String},
    chat:{type:Schema.Types.ObjectId, ref:'Chat'},
    readBy:[{type:Schema.Types.ObjectId, ref:'Chat'}]
}, {timestamps:true})

module.exports = mongoose.model('Message', MessageSchema)