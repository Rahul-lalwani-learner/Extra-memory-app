"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const db_1 = require("./db");
const bcrypt_1 = __importDefault(require("bcrypt"));
const zod_1 = __importDefault(require("zod"));
const middleware_1 = require("./middleware");
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const port = 3000;
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173', // Your frontend URL (default Vite port)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
const reqBodySchema = zod_1.default.object({
    username: zod_1.default.string().min(3).max(10),
    password: zod_1.default.string()
        .min(8, { message: "Password must be at least 8 characters long" })
        .max(20, { message: "Password must be at most 20 characters long" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
        .regex(/[0-9]/, { message: "Password must contain at least one number" })
        .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character" })
});
app.post('/api/v1/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const zReqResponse = reqBodySchema.safeParse(req.body);
    if (!zReqResponse.success) {
        res.status(411).json({
            message: zReqResponse.error
        });
        return;
    }
    const { username, password } = req.body;
    try {
        let hasedPassword = yield bcrypt_1.default.hash(password, 5);
        try {
            yield db_1.UserModel.create({
                username: username,
                password: hasedPassword
            });
        }
        catch (e) {
            if (e.code === 11000) {
                res.status(403).json({
                    message: "User already exists with this username"
                });
            }
            else {
                res.status(500).json({
                    message: "Some problem while creating user"
                });
            }
            return;
        }
        res.status(200).json({
            message: "Signed Up"
        });
    }
    catch (e) {
        res.status(500).json({
            message: "Some problem while creating user"
        });
    }
}));
app.post('/api/v1/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const zReqResponse = reqBodySchema.safeParse(req.body);
    if (!zReqResponse.success) {
        res.status(411).json({
            message: zReqResponse.error
        });
        return;
    }
    const { username, password } = req.body;
    const user = yield db_1.UserModel.findOne({
        username: username
    });
    if (!user) {
        res.status(403).json({
            message: "User not found",
        });
        return;
    }
    const match = yield bcrypt_1.default.compare(password, user.password);
    if (match) {
        if (!process.env.JWT_SECRET) {
            res.status(500).json({ message: "JWT secret not configured" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET);
        // console.log('Generated token:', token.substring(0, 20) + '...');
        // console.log('Full token length:', token.length);
        res.json({
            message: "Signed In",
            token: token // Send token in response for localStorage storage
        });
    }
    else {
        res.status(404).json({
            message: "Invalid Credentials"
        });
    }
}));
app.post('/api/v1/content', middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const { link, title, type, tags } = req.body;
    try {
        // Process tags: find existing ones or create new ones
        const tagIds = [];
        if (tags && Array.isArray(tags)) {
            for (const tagName of tags) {
                if (typeof tagName === 'string' && tagName.trim()) {
                    // Try to find existing tag or create new one
                    let tag = yield db_1.TagModel.findOne({ title: tagName.trim() });
                    if (!tag) {
                        tag = yield db_1.TagModel.create({ title: tagName.trim() });
                    }
                    tagIds.push(tag._id);
                }
            }
        }
        yield db_1.ContentModel.create({
            link: link,
            title: title,
            type: type,
            userId: userId,
            tags: tagIds
        });
        res.json({
            message: "Content added successfully",
            userId: userId
        });
    }
    catch (e) {
        console.error('Error adding content:', e);
        res.status(500).json({
            message: "Some Error while adding data",
            error: e
        });
    }
}));
app.get('/api/v1/content', middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    try {
        const contents = yield db_1.ContentModel.find({
            userId: userId
        }).populate("userId", "username")
            .populate('tags', 'title');
        if (!contents) {
            res.status(403).json({
                message: "No Content"
            });
        }
        else {
            res.json({
                contents: contents
            });
        }
    }
    catch (e) {
        res.status(500).json({
            message: "some Error in server",
            error: e
        });
    }
}));
app.delete('/api/v1/content', middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const { contentId } = req.body;
    try {
        const content = yield db_1.ContentModel.findOne({
            _id: contentId,
            userId: userId // Ensure user can only delete their own content
        });
        if (!content) {
            res.status(403).json({
                message: "Content with this contentId not present or you don't have permission to delete it"
            });
            return;
        }
        // Store tag IDs before deleting content for cleanup
        const tagIds = content.tags;
        // Delete the content
        yield db_1.ContentModel.deleteOne({
            _id: contentId
        });
        // Clean up unused tags (tags that are no longer referenced by any content)
        if (tagIds && tagIds.length > 0) {
            for (const tagId of tagIds) {
                // Check if this tag is still used by other content
                const contentWithTag = yield db_1.ContentModel.findOne({
                    tags: tagId
                });
                // If no other content uses this tag, delete it
                if (!contentWithTag) {
                    yield db_1.TagModel.deleteOne({ _id: tagId });
                }
            }
        }
        res.json({
            message: "Content deleted successfully"
        });
    }
    catch (e) {
        console.error('Error deleting content:', e);
        res.status(500).json({
            message: "Error deleting Content",
            error: e
        });
    }
}));
app.post("/api/v1/addtag", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title } = req.body;
    try {
        yield db_1.TagModel.create({
            title: title
        });
        res.json({
            message: `${title} tag is added`
        });
    }
    catch (e) {
        res.status(500).json({
            message: "Error adding " + title + " Tag to server"
        });
    }
}));
app.post('/api/v1/brain/share', middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    try {
        yield db_1.UserModel.updateOne({ _id: userId }, {
            share: true
        });
        res.json({
            message: "you can now share your contents",
            shareableLink: `${process.env.FRONTEND_URL}/api/v1/brain/${userId}`
        });
    }
    catch (e) {
        res.status(500).json({
            message: "Error enabling the share for this user",
            error: e
        });
    }
}));
app.put('/api/v1/brain/share', middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    try {
        yield db_1.UserModel.updateOne({ _id: userId }, {
            share: false
        });
        res.json({
            message: "Content Sharing is closed"
        });
    }
    catch (e) {
        res.status(500).json({
            message: "Error disabling content sharing",
            error: e
        });
    }
}));
app.get('/api/v1/brain/:shareLink', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const shareableUserId = req.params.shareLink;
    try {
        const isUserPresent = yield db_1.UserModel.findOne({
            _id: shareableUserId
        });
        if (!isUserPresent) {
            res.status(403).json({
                message: "This user is not present"
            });
            return;
        }
        if (isUserPresent.share == false) {
            res.status(403).json({
                message: "You are not authorized to see this contents"
            });
            return;
        }
        const contents = yield db_1.ContentModel.find({
            userId: shareableUserId
        }).populate("userId", "username")
            .populate('tags', 'title');
        res.json({
            message: "content found",
            contents: contents
        });
    }
    catch (e) {
        res.status(500).json({
            message: "Error opening the link",
            error: e
        });
    }
}));
app.get('/api/v1/tags', middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tags = yield db_1.TagModel.find({}).select('title -_id');
        // Extract just the tag names
        const tagNames = tags.map(tag => tag.title);
        res.json({
            message: "Tags retrieved successfully",
            tags: tagNames
        });
    }
    catch (e) {
        console.error('Error fetching tags:', e);
        res.status(500).json({
            message: "Error fetching tags from server",
            error: e
        });
    }
}));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield mongoose_1.default.connect(process.env.DATABASE_CONNECTION_STRING + "extra-memory");
        app.listen(port, () => {
            console.log(`http://localhost:${port}/`);
        });
    });
}
main();
