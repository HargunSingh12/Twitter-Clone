import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import bcrypt from 'bcryptjs'

export const getUserProfile = async(req,res)=>{
    const {username} = req.params;
    try {
        const user = await User.findOne({username}).select("-password");
        if(!user){
             return res.status(404).json({error:"User not found"})
        }
        res.status(200).json(user)
        
    } catch (error) {
        console.log("Error in getUserProfile Controller",error.message);
        res.status(500).json({error:"Internal Server Error"})
    }
}

export const followUnfollowUser = async(req,res)=>{
    try {
        const {id} = req.params;
        const userToModify = await User.findById(id)
        const currentUser = await User.findById(req.user._id)

        if(id === req.user._id.toString()){
            return res.status(400).json({error:"You can't follow/unfollow yourself "})
        }
        if(!userToModify|| !currentUser){
            return res.status(400).json({error:"User not found"})
        }
        const isFollowing = currentUser.following.includes(id)
        if(isFollowing){
            // Unfollow
            await User.findByIdAndUpdate(id,{$pull:{followers:req.user._id}})
            await User.findByIdAndUpdate(req.user._id,{$pull:{following:id}})
            return res.status(200).json({message: "User Unfollowed Successfully"})
        }else{
            //follow the user
            await User.findByIdAndUpdate(id,{$push :{followers: req.user._id}});
            await User.findByIdAndUpdate(req.user._id,{$push:{following:id}})
            //send a notificatin

            const newNotification = new Notification({
                type:"follow",
                from : req.user._id,
                to: id
            })
            await newNotification.save()
            return res.status(200).json({message: "User Followed Successfully"})

        }
    } catch (error) {
        console.log("Error in followUnfollowUser Controller",error.message);
        return res.status(500).json({error:"Internal Server Error"})
    }
}

export const getSuggestedProfile = async (req,res) => {
    try {
        const userId = req.user._id;
        const usersFollowedByMe = await User.findById(userId).select("following")
        const users = await User.aggregate([
            {
                $match:{
                    _id:{$ne:userId}
                }
            },
            {$sample:{size:10}}
        ])
        const filterusers = users.filter((user)=>!usersFollowedByMe.following.includes(user._id))
        const suggestedUsers = filterusers.slice(0,4);
        suggestedUsers.forEach((user)=>(user.password=null))
        res.status(200).json({suggestedUsers})
    } catch (error) {
        console.log("Error in getSuggested Controller",error.message);
        res.status(500).json({error:"Internal Server Error"})
    }
}

export const updateUser = async (req,res) => {
    const {fullname, username, email, currentpassword, newPassword, bio , link} = req.body
    let {coverImg, profileImg} = req.body
    const userId = req.user._id

    try {
        const user = await User.findById(userId)
        if(!user){
            return res.status(404).json({error:"User not found"})
        }
        if((currentpassword&&!newPassword) || (!currentpassword && newPassword) ){
            return res.status(400).json({error:"Please provide both the passwords"})
        }
        if(currentpassword && newPassword){
            const isMatch = await bcrypt.compare(currentpassword,user.password)
            if(!isMatch){
                return res.status(400).json({error:"Invalid password"})
            }
            if(newPassword.length < 6){
                return res.status(400).json({error:"Password must contain 6 characters"})
            }
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(newPassword,salt)
        }
    } catch (error) {
        
    }
}