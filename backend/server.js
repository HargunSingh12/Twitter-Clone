import express from "express"
import dotenv from 'dotenv';
import { v2 as cloudinary } from "cloudinary";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js"
import { connectDb } from "./config/db.js";

dotenv.config()
cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_KEY
})

const app = express();
const PORT = process.env.PORT || 8000

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use('/api/auth',authRoutes)
app.use('/api/users',userRoutes)

app.listen(PORT, ()=>{
    connectDb()
 console.log(`Server is running on port ${PORT}`)   
})