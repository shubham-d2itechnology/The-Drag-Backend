import express from 'express';
import dotenv from 'dotenv'
import connectDB from './src/db/db.js';
import cors from 'cors';
import userRoutes from './src/routes/userRoutes.js';
import {v2 as cloudinary} from 'cloudinary'
import cookieParser from 'cookie-parser';

dotenv.config({path:'.env'}); 

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET
})


const app = express();

app.use(express.json());

app.use(express.urlencoded({extended:false}));
app.use(cors({
    origin:process.env.ORIGIN,
    credentials:true,
        

}));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Welcome to Drag');
});
app.use('/v1/apis',userRoutes);


connectDB()
.then(()=>{
    app.listen(5000, () => {
        console.log('Server is running at port 5000');
    })
})
.catch(() => {
    console.error("Error occured while starting server");
})