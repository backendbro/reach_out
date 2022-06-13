const router = require('express').Router()
const User = require('../../schemas/UserSchema');
const Post = require('../../schemas/PostSchema');
const upload = require('../../multer/upload')
const Cloudinary = require('../../cloudinary/cloudinary')

router.get("/", async (req, res) => {
    let results = await getPosts({})
    res.status(200).send(results)
})

router.get('/:postId', async(req,res) => {
    const postId = req.params.postId
    
    let postData = await getPosts({_id:postId})
    postData = postData[0]

    let results = {
        postData:postData
    }

    if(postData.replyTo !== undefined){
        results.replyTo = postData.replyTo
    }

    results.replies = await getPosts({replyTo:postId})

    res.status(200).send(results)    
})

router.get('/:postId/getImage', async (req,res) => {
    const postId = req.params.postId
    const post = await Post.findById(postId)
    const postUrl = post.postImage
    res.status(200).send(postUrl)
})

router.post("/",  upload.single('postImage') ,async (req, res) => {

    const postData = {
        postedBy: req.session.user._id
    }
    
    if(req.file){
        const file = req.file
        const path = file.path
        postData.postImage = path
    }

    if(req.body){
        const post = req.body.value || req.body.post
        postData.post = post
    }  

    if(req.body.replyTo){
        postData.replyTo = req.body.replyTo
    }
    
    try{
        if(postData.postImage){
            const imageUpload = await Cloudinary.uploader.upload(postData.postImage)
            postData.postImage = imageUpload.url
        
            let postWithImage = await Post.create(postData)
            postWithImage = await User.populate(postWithImage, {path:'postedBy'})
            return res.status(200).send(postWithImage)
       
        }else{
         
         let normPost = await Post.create(postData)
         normPost = await User.populate(normPost, {path: 'postedBy'})
         normPost = await Post.populate(normPost, {path:'replyTo'})
         return res.status(200).send(normPost)  
        
        }
    }catch(error){
        console.log(error)
        res.sendStatus(400)
    }
})


router.put("/:id/like", async (req, res, next) => {

    const postId = req.params.id;
    const userId = req.session.user._id;

    const isLiked = req.session.user.likes && req.session.user.likes.includes(postId);

    const option = isLiked ? "$pull" : "$addToSet";

    // Insert user like
    req.session.user = await User.findByIdAndUpdate(userId, { [option]: { likes: postId } }, { new: true})
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })

    // Insert post like
    var post = await Post.findByIdAndUpdate(postId, { [option]: { likes: userId } }, { new: true})
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })


    res.status(200).send(post)
})


router.post("/:id/share", async (req, res, next) => {
    const postId = req.params.id;
    const userId = req.session.user._id;

    // Try and delete retweet
    const checkIfPostExist = await Post.findOneAndDelete({ postedBy: userId, sharedData: postId })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })

    const option = checkIfPostExist != null ? "$pull" : "$addToSet";

    let sharedPost = checkIfPostExist;

    if (sharedPost == null) {
        sharedPost = await Post.create({ postedBy: userId, sharedData: postId })
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        })
    }

    // Insert user like
    req.session.user = await User.findByIdAndUpdate(userId, { [option]: { shared: sharedPost._id } }, { new: true })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })

    // Insert post like
    var post = await Post.findByIdAndUpdate(postId, { [option]: { sharedUsers: userId } }, { new: true })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })


    res.status(200).send(post)
})

async function getPosts(filter){
    let results = await Post.find(filter)
    .populate('postedBy')
    .populate('sharedData')
    .populate('replyTo')
    .sort({"createdAt": -1})

    results = await User.populate(results, {path: "sharedData.postedBy"})
    results = await User.populate(results, {path: "replyTo.postedBy"})
    return results
}

module.exports = router;