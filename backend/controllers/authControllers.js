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
            res.status(200).json({
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
            res.status(400).json({error:"Invalid user data"})
        }
    }catch(error){
        console.log(error.message)
        res.status(500).json({error:"Internal Server Error"})
    }
}
export const login= async (req,res)=>{
    res.json({
        data:"You hit the login endpoint"
    })
}
export const logout= (req,res)=>{
    res.json({
        data:"You hit the logout endpoint"
    })
}