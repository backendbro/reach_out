const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PostSchema = new Schema({
    post: { type: String, trim: true },
    postedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    postImage:{type:String},
    pinned: Boolean,
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    sharedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    sharedData: { type: Schema.Types.ObjectId, ref: 'Post' },
    replyTo: { type: Schema.Types.ObjectId, ref: 'Post' }
}, { timestamps: true });

var Post = mongoose.model('Post', PostSchema);
module.exports = Post;