import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken"; 
import dotenv from "dotenv";
import cookieParser from "cookie-parser"; 
import {UserModel, LinkModel, TagModel, ContentModel} from "./db"
import bcrpyt from "bcrypt"; 
import z from "zod";


dotenv.config();
const port = 3000;


const app = express(); 
app.use(express.json()); 
app.use(cookieParser());

const reqBodySchema = z.object({
    username: z.string().min(3).max(10), 
    password: z.string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(20, { message: "Password must be at most 20 characters long" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character" })

})


app.post('/api/v1/signup',async (req, res)=>{

    const zReqResponse = reqBodySchema.safeParse(req.body);
    if(!zReqResponse.success){
        res.status(411).json({
            message: zReqResponse.error
        })
        return;
    }
    
    const {username, password}: z.infer<typeof reqBodySchema> = req.body; 

    try{
        let hasedPassword = await bcrpyt.hash(password, 5); 

        try{
            await UserModel.create({
                username: username, 
                password: hasedPassword
            })
        }
        catch(e: any){
            if(e.code === 11000){
                res.status(403).json({
                    message: "User already exists with this username"
                })
            }
            else{
                res.status(500).json({
                    message: "Some problem while creating user"
                })
            }
            return;
        }

        res.status(200).json({
            message: "Signed Up"
        })
    }
    catch(e){
        res.status(500).json({
            message: "Some problem while creating user"
        })
    }
})

app.post('/api/v1/signin', async (req, res)=>{
    const zReqResponse = reqBodySchema.safeParse(req.body);
    if(!zReqResponse.success){
        res.status(411).json({
            message: zReqResponse.error
        })
        return;
    }
    
    const {username, password}: z.infer<typeof reqBodySchema> = req.body; 

    const user: (z.infer<typeof reqBodySchema> & {_id: string}) | null = await UserModel.findOne({
        username: username
    })

    if(!user){
        res.status(403).json({
            message: "User not found", 
        })
        return;
    }
    const match = await bcrpyt.compare(password, user.password);
    
    if(match){
        if (!process.env.JWT_SECRET) {
            res.status(500).json({ message: "JWT secret not configured" });
            return;
        }
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET
        );
        
        res.cookie('token', token, {
            httpOnly: true, 
            secure: true, 
            sameSite: 'strict'
        }); 

        res.json({
            message: "Signed In"
        })
    }
    else{
        res.status(403).json({
            message: "Invalid Credentials"
        })
    }
})

app.post('/api/v1/content', (req, res)=>{

})

app.get('/api/v1/content', (req, res)=>{

})

app.delete('/api/v1/content', (req, res)=>{

})

app.post('/api/v1/brain/share', (req, res)=>{

})

app.get('/api/v1/brain/:shareLink', (req, res)=>{

})


async function main(){
    await mongoose.connect(process.env.DATABASE_CONNECTION_STRING + "extra-memory")
    app.listen(port, ()=>{
        console.log(`http://localhost:${port}/`)
    })
}

main(); 