import express from "express"
import authRoutes from "./routes/authRoutes.js";
import dotenv from 'dotenv';
import { connectDb } from "./config/db.js";
const app = express();

dotenv.config()
const PORT = process.env.PORT || 8000
app.use('/api/auth',authRoutes)


app.listen(PORT, ()=>{
    connectDb()
 console.log(`Server is running on port ${PORT}`)   
})