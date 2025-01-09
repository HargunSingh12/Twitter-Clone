import User from "../models/user.model.js";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import bcrypt from 'bcryptjs'

export const signup = async (req,res)=>{
    try{
        const{fullname,username,email, password} = req.body
        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({error:"Invalid email format"})
        }
        const exisitingUser = await User.findOne({ username });
        if(exisitingUser){
            return res.status(400).json({error:"Username already taken"})
        }
        const exisitingEmail = await User.findOne({email});
        if(exisitingEmail){
            return res.status(400).json({error:"Email already used"})
        }
        if(password.length < 6){
            return res.status(400).json({error:"Password must have 6 characters"})
        }
        

        //hash passowrd
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt)

        const newUser = new User({
            fullname,
            username,
            email,
            password:hashedPassword
        })
        if(newUser){
            generateTokenAndSetCookie(newUser._id,res)
            await newUser.save();
            return res.status(200).json({
                _id:newUser._id,
                username:newUser.username,
                fullname:newUser.fullname,
                email:newUser.email,
                followers:newUser.followers,
                following:newUser.following,
                profileImg:newUser.profileImg,
                coverImg:newUser.coverImg
            })
        }else{
           return res.status(400).json({error:"Invalid user data"})
        }
    }catch(error){
        console.log("Error in signup controller",error.message)
        return res.status(500).json({error:"Internal Server Error"})
    }
}
export const login= async (req,res)=>{
    try {
        const {username, password} = req.body
        if (!username || !password) {
            return res.status(400).json({ error: "Both username and password are required" });
        }
        const user = await User.findOne({username})
        const isPasswordValid = await bcrypt.compare(password, user?.password||"")
        if(!user|| !isPasswordValid){
            return res.status(400).json({error:"Invalid username or passowrd"})
        }
        generateTokenAndSetCookie(user._id,res);
        return res.status(200).json({
            _id:user._id,
            username:user.username,
            fullname:user.fullname,
            email:user.email,
            followers:user.followers,
            following:user.following,
            profileImg:user.profileImg,
            coverImg:user.coverImg
        })
        
    } catch (error) {
        console.log("Error in login controller")
        return res.status(500).json({error:"Internal Server Error"})
    }
}
export const logout= async(req,res)=>{
    try {
        res.cookie("jwt","",{maxAge:0})
        return res.status(200).json({message:"Logged out successfully"})
    } catch (error) {
        console.log("Error in logout controller")
        return res.status(500).json({error:"Internal Server Error"})
    }
}

export const getMe = async(req,res)=>{
try {
    const user = await User.findById(req.user._id).select("-password");
    return res.status(200).json(user)
} catch (error) {
    console.log("Error in getMe controller")
        return res.status(500).json({error:"Internal Server Error"})
}
}