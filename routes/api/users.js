const router = require('express').Router()
const User = require('../../schemas/UserSchema')
const upload = require('../../multer/upload')
const Cloudinary = require('../../cloudinary/cloudinary')

router.post('/profilepicture', upload.single("profileImageUpload"), async (req,res) => {
    
    if(!req.file){
        console.log('Please upload an image')
    }

    const userId = req.session.user._id
    const path = req.file.path
    try{
        const uploadedImage = await Cloudinary.uploader.upload(path)
        const urlPath = uploadedImage.url
        const user = await User.findByIdAndUpdate(userId, {profilePic:urlPath}, {new:true})

        res.sendStatus(200)
    }catch(error){
        console.log(error)
        res.sendStatus(400)
    } 
})

router.post('/coverpicture', upload.single("coverImageUpload"), async (req,res) => {
    if(!req.file){
        console.log('Please upload an image')
    }

    const userId = req.session.user._id
    const path = req.file.path
    try{
        const uploadedImage = await Cloudinary.uploader.upload(path)
        const urlPath = uploadedImage.url
        const user = await User.findByIdAndUpdate(userId, {coverPic:urlPath}, {new:true})
       
        res.sendStatus(200)
    }catch(error){
        console.log(error)
        res.sendStatus(400)
    } 
})

module.exports = router