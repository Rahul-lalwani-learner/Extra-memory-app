import mongoose, { model, Schema } from "mongoose";
import { ModuleResolutionKind } from "typescript";
const schema = mongoose.Schema; 

const userSchema = new Schema({
    username: {type: String, require: true, unique: true}, 
    password: {type: String, require: true}, 
})


const contentTypes = ['image', 'video', 'article', 'audio']; 
const contentSchema = new Schema({
    link: String, 
    type: {type: String, enum: contentTypes, require: true}, 
    title: {type: String, require: true}, 
    tags: [{type: mongoose.Types.ObjectId, ref: 'Tag'}], 
    userId: {type: mongoose.Types.ObjectId, ref: 'User', require: true}
}); 

const tagSchema = new Schema({
    title: {type: String, require: true, unique: true}
}); 

const linkSchema = new Schema({
    hash: {type: String, require: true}, 
    userId: {type: mongoose.Types.ObjectId, ref: 'User', require: true}
});



const UserModel = mongoose.model('users', userSchema); 
const LinkModel = mongoose.model('links', linkSchema); 
const TagModel = mongoose.model('tags', tagSchema); 
const ContentModel = mongoose.model('contents', contentSchema); 

module.exports = {
    UserModel, 
    LinkModel, 
    TagModel, 
    ContentModel
}

