const router = require('express').Router()
const User = require('../../schemas/UserSchema')
const upload = require('../../multer/upload')
const Cloudinary = require('../../cloudinary/cloudinary')
const Notification = require('../../schemas/NotificationSchema')


router.get('/', async (req,res) => {
    let queryString = req.query;
    if(req.query.search !== undefined) {
        queryString = {
            $or: [
                { full_name: { $regex: req.query.search, $options: "i" }},
                { username: { $regex: req.query.search, $options: "i" }}
            ]
        }
    }
    try {
        const users = await User.find(queryString)
        res.status(200).send(users)   
    } catch (error) {
        console.log(error)
        return res.sendStatus(500)
    }
})

router.post('/profilepicture', upload.single("profileImageUpload"), async (req,res) => {
    
    if(!req.file){
        console.log('Please upload an image')
        return;
    }

    const userId = req.session.user._id
    const path = req.file.path
    try{
        const uploadedImage = await Cloudinary.uploader.upload(path)
        const urlPath = uploadedImage.url
        req.session.user = await User.findByIdAndUpdate(userId, {profilePic:urlPath}, {new:true})
        res.sendStatus(200)
    }catch(error){
        console.log(error)
        res.sendStatus(500)
    } 
})

router.post('/coverpicture', upload.single("coverImageUpload"), async (req,res) => {
    if(!req.file){
        console.log('Please upload an image')
        return;
    }

    const userId = req.session.user._id
    const path = req.file.path
    try{
        const uploadedImage = await Cloudinary.uploader.upload(path)
        const urlPath = uploadedImage.url
        req.session.user = await User.findByIdAndUpdate(userId, {coverPic:urlPath}, {new:true})
        res.sendStatus(200)
    }catch(error){
        console.log(error)
        res.sendStatus(500)
    } 
})

router.put('/:userId/follow', async (req,res) => {
    const userId = req.params.userId
    const searchedUser = await User.findByIdAndUpdate(req.session.user._id)
    const userLoggedIn = req.session.user._id
   
    const isFollowing = searchedUser.following && searchedUser.following.includes(userId)
    const option = isFollowing ? "$pull" : "$addToSet";
       
    req.session.user = await User.findByIdAndUpdate(userLoggedIn, { [option]: { following: userId } }, {new:true})
    .catch(error => {
        console.log(error)
        res.sendStatus(500)
    })

    const user = await User.findByIdAndUpdate(userId, { [option]: {followers: userLoggedIn} }, {new:true})
    .catch(error => {
        console.log(error)
        res.sendStatus(500)
    })
    
    if(!isFollowing){
        await Notification.createNotification(user._id, req.session.user._id, 'follow', user._id)
        }
    res.status(200).json(user)
})

router.get('/:userId/following', async(req,res) => {
    try {
        const userId = req.params.userId
        const user = await User.findById(userId)
        .populate('following')
        res.status(200).send(user.following)
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

router.get('/:userId/follower', async(req,res) => {
    try {
        const userId = req.params.userId
        const user = await User.findById(userId)
        .populate('followers')
        res.status(200).send(user.followers) 
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})


module.exports = router