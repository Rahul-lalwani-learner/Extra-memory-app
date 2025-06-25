import mongoose, { model, Schema } from "mongoose";
import { boolean } from "zod";
const schema = mongoose.Schema; 

const userSchema = new Schema({
    username: {type: String, require: true, unique: true}, 
    password: {type: String, require: true}, 
    share: {type: Boolean , default: false}
})


const contentTypes = ['image', 'video', 'article', 'audio']; 
const contentSchema = new Schema({
    link: String, 
    type: {type: String, enum: contentTypes, require: true}, 
    title: {type: String, require: true}, 
    tags: [{type: mongoose.Types.ObjectId, ref: 'tags'}], 
    userId: {type: mongoose.Types.ObjectId, ref: 'users', require: true}
}); 

const tagSchema = new Schema({
    title: {type: String, require: true, unique: true}
}); 

const linkSchema = new Schema({
    hash: {type: String, require: true}, 
    userId: {type: mongoose.Types.ObjectId, ref: 'users', require: true}
});



export const UserModel = mongoose.model('users', userSchema); 
export const LinkModel = mongoose.model('links', linkSchema); 
export const TagModel = mongoose.model('tags', tagSchema); 
export const ContentModel = mongoose.model('contents', contentSchema); 



