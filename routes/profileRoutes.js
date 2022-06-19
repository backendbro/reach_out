const router = require('express').Router();
const User = require('../schemas/UserSchema');

router.get("/", async (req, res) => {
    const user = await User.findById(req.session.user._id)
    const payload = {
        pageTitle: user.username,
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
        profileUser: user,
        selectedTab:'post'
    }
    
    res.status(200).render("profilePage", payload);
})

router.get("/:username", async(req,res) => {
    const username = req.params.username
    const loggedInUser = req.session.user
    const payload = await getPayload(username, loggedInUser)
    payload.selectedTab = 'post'
    res.status(200).render('profilePage', payload)
})

router.get('/:username/replies', async (req,res) => {
    const username = req.params.username
    const loggedInUser = req.session.user
    const payload = await getPayload(username, loggedInUser)
    payload.selectedTab = 'replies'
    res.status(200).render('profilePage', payload)
})

router.get('/:username/media', async (req,res) => {
    const username = req.params.username
    const loggedInUser = req.session.user
    const payload = await getPayload(username, loggedInUser)
    payload.selectedTab = 'media'
    res.status(200).render('profilePage', payload)
})

async function getPayload(username, loggedInUser){
    let user = await User.findOne({username:username})
    if(user == null){
        user = await User.findById(username)
        
        if(user == null){
            return {
                pageTitle:"User not found",
                userLoggedIn: loggedInUser,
                userLoggedInJs: JSON.stringify(loggedInUser)
            }
        }
    }

    return {
        pageTitle:user.username,
        userLoggedIn:loggedInUser,
        userLoggedInJs:JSON.stringify(loggedInUser),
        profileUser:user
    }
}

module.exports = router;