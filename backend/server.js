import express from "express"
import dotenv from 'dotenv';
import path from"path"
import { v2 as cloudinary } from "cloudinary";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js"
import postRoutes from "./routes/postRoutes.js"
import notificationRoutes from './routes/notificationRoutes.js'
import { connectDb } from "./config/db.js";

dotenv.config()
cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})

const app = express();
const PORT = process.env.PORT || 8000

const __dirname = path.resolve()

app.use(express.json({limit:"5mb"}))
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

app.use('/api/auth',authRoutes)
app.use('/api/users',userRoutes)
app.use('/api/post',postRoutes)
app.use('/api/notifications',notificationRoutes)

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname,"/frontend/dist")));
}
app.get("*",(req,res)=>{
    res.sendFile(path.resolve(__dirname,"frontend","dist","index.html"))
})

app.listen(PORT, ()=>{
    connectDb()
 console.log(`Server is running on port ${PORT}`)
 console.log("From branch1")
   
})