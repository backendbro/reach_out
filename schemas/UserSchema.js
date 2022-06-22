const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    full_name: { type: String, required: true, trim: true },
    username: { type: String, required: true, trim: true, unique: true },
    email: { type: String, required: true, trim: true, unique: true },
    description: { type: String},
    password: { type: String, required: true, select:false},
    profilePic: { type: String, default: "/images/profilePic.jpeg" },
    likes: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    shared: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    coverPic:{type:String, default:  "/images/profilePic.jpeg" }
    
}, { timestamps: true });


UserSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        next()
    }
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})


UserSchema.methods.validatePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password)
}


const User = mongoose.model('User', UserSchema);
module.exports = User;