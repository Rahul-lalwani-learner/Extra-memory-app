import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken"; 
import dotenv from "dotenv";
import cookieParser from "cookie-parser"; 
import {UserModel, TagModel, ContentModel} from "./db"
import bcrypt from "bcrypt"; 
import z from "zod";
import { userMiddleware } from "./middleware";
import cors from 'cors'

// Extend Express Request interface to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}



dotenv.config();
const port = process.env.PORT || 3000;


const app = express(); 

app.use(cors({
    origin: [
        'http://localhost:5173', // Local development
        'https://extra-memory-front-end.vercel.app', // Production frontend
        process.env.FRONTEND_URL
    ].filter((origin): origin is string => Boolean(origin)), // Type-safe filter to remove undefined values
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // Allow cookies if needed
}));

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
        let hasedPassword = await bcrypt.hash(password, 5); 

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
    const match = await bcrypt.compare(password, user.password);
    
    if(match){
        if (!process.env.JWT_SECRET) {
            res.status(500).json({ message: "JWT secret not configured" });
            return;
        }
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET
        );
        
        // console.log('Generated token:', token.substring(0, 20) + '...');
        // console.log('Full token length:', token.length);

        res.json({
            message: "Signed In",
            token: token // Send token in response for localStorage storage
        })
    }
    else{
        res.status(404).json({
            message: "Invalid Credentials"
        })
    }
})


app.post('/api/v1/content', userMiddleware, async (req, res)=>{
    const userId = req.userId;
    const {link, title, type, tags} = req.body;

    try{
        // Process tags: find existing ones or create new ones
        const tagIds = [];
        if (tags && Array.isArray(tags)) {
            for (const tagName of tags) {
                if (typeof tagName === 'string' && tagName.trim()) {
                    // Try to find existing tag or create new one
                    let tag = await TagModel.findOne({ title: tagName.trim() });
                    if (!tag) {
                        tag = await TagModel.create({ title: tagName.trim() });
                    }
                    tagIds.push(tag._id);
                }
            }
        }

        await ContentModel.create({
            link: link, 
            title: title, 
            type: type, 
            userId: userId, 
            tags: tagIds
        })

        res.json({
            message: "Content added successfully", 
            userId: userId
        })
    }
    catch(e){
        console.error('Error adding content:', e);
        res.status(500).json({
            message: "Some Error while adding data", 
            error: e
        })
    }
})

app.get('/api/v1/content', userMiddleware,async (req, res)=>{
    const userId = req.userId; 
    try{
        const contents = await ContentModel.find({
            userId: userId
        }).populate("userId", "username")
        .populate('tags', 'title');

        if(!contents){
            res.status(403).json({
                message: "No Content"
            })
        }
        else{
            res.json({
                contents : contents
            })
        }
    }
    catch(e){
        res.status(500).json({
            message: "some Error in server", 
            error: e
        })
    }

})

app.delete('/api/v1/content', userMiddleware, async (req, res)=>{
    const userId = req.userId; 
    const {contentId} = req.body;
    try{
        const content = await ContentModel.findOne({
            _id : contentId,
            userId: userId // Ensure user can only delete their own content
        })

        if(!content){
            res.status(403).json({
                message: "Content with this contentId not present or you don't have permission to delete it"
            })
            return;
        }

        // Store tag IDs before deleting content for cleanup
        const tagIds = content.tags;

        // Delete the content
        await ContentModel.deleteOne({
            _id: contentId
        })

        // Clean up unused tags (tags that are no longer referenced by any content)
        if (tagIds && tagIds.length > 0) {
            for (const tagId of tagIds) {
                // Check if this tag is still used by other content
                const contentWithTag = await ContentModel.findOne({
                    tags: tagId
                });
                
                // If no other content uses this tag, delete it
                if (!contentWithTag) {
                    await TagModel.deleteOne({ _id: tagId });
                }
            }
        }

        res.json({
            message: "Content deleted successfully"
        })
    }
    catch(e){
        console.error('Error deleting content:', e);
        res.status(500).json({
            message: "Error deleting Content", 
            error: e
        })
    }
})

app.post("/api/v1/addtag", userMiddleware, async (req, res)=>{
    const {title}  = req.body; 

    try{
        await TagModel.create({
            title: title
        })
        res.json({
            message: `${title} tag is added`
        })
    }catch(e){ 
        res.status(500).json({
            message: "Error adding "+title+" Tag to server"
        })
    }
})

app.post('/api/v1/brain/share', userMiddleware,async (req, res)=>{
    const userId = req.userId;
    try{
        await UserModel.updateOne({ _id: userId }, {
            share: true
        })
        res.json({
            message: "you can now share your contents", 
            shareableLink: `${process.env.FRONTEND_URL}/brain/${userId}`
        })
    }
    catch(e){
        res.status(500).json({
            message: "Error enabling the share for this user", 
            error: e
        })
    }
})

app.put('/api/v1/brain/share', userMiddleware,async (req, res)=>{
    const userId = req.userId;
    try{
        await UserModel.updateOne({ _id: userId }, {
            share: false
        })
        res.json({
            message: "Content Sharing is closed"
        })
    }
    catch(e){
        res.status(500).json({
            message: "Error disabling content sharing", 
            error: e
        })
    }
})

app.get('/api/v1/brain/:shareLink',async (req, res)=>{
    const shareableUserId = req.params.shareLink;
    try{
        const isUserPresent = await UserModel.findOne({
            _id: shareableUserId
        })

        if(!isUserPresent){
            res.status(403).json({
                message: "This user is not present"
            })
            return;
        }
        if(isUserPresent.share == false){
            res.status(403).json({
                message: "You are not authorized to see this contents"
            })
            return;
        }

        const contents = await ContentModel.find({
            userId: shareableUserId
        }).populate("userId", "username")
        .populate('tags', 'title');
        
        res.json({
            message: "content found", 
            contents: contents
        })
    }
    catch(e){
        res.status(500).json({
            message: "Error opening the link", 
            error: e
        })
    }
})

app.get('/api/v1/tags',userMiddleware, async (req, res) => {
    try {
        const tags = await TagModel.find({}).select('title -_id');
        
        // Extract just the tag names
        const tagNames = tags.map(tag => tag.title);
        
        res.json({
            message: "Tags retrieved successfully",
            tags: tagNames
        });
    } catch (e) {
        console.error('Error fetching tags:', e);
        res.status(500).json({
            message: "Error fetching tags from server",
            error: e
        });
    }
});


async function main(){
    try {
        await mongoose.connect(process.env.DATABASE_CONNECTION_STRING + "extra-memory")
        console.log("Connected to MongoDB successfully");
        
        app.listen(port, ()=>{
            console.log(`Server running at http://localhost:${port}/`)
        })
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        process.exit(1);
    }
}

main();