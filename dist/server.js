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
dotenv_1.default.config();
const port = 3000;
const app = (0, express_1.default)();
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
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict'
        });
        res.json({
            message: "Signed In"
        });
    }
    else {
        res.status(403).json({
            message: "Invalid Credentials"
        });
    }
}));
app.post('/api/v1/content', middleware_1.userMiddleware, (req, res) => {
    res.json({
        message: "done"
    });
});
app.get('/api/v1/content', (req, res) => {
});
app.delete('/api/v1/content', (req, res) => {
});
app.post('/api/v1/brain/share', (req, res) => {
});
app.get('/api/v1/brain/:shareLink', (req, res) => {
});
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield mongoose_1.default.connect(process.env.DATABASE_CONNECTION_STRING + "extra-memory");
        app.listen(port, () => {
            console.log(`http://localhost:${port}/`);
        });
    });
}
main();
