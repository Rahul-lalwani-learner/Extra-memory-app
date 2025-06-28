"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userMiddleware = userMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function userMiddleware(req, res, next) {
    // console.log('Authorization header:', req.headers.authorization);
    // Get token from Authorization header
    let token = null;
    if (req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7); // Remove 'Bearer ' prefix
        }
    }
    // console.log('Token found:', token ? token.substring(0, 20) + '...' : 'No token');
    if (!token) {
        console.log('No token found in authorization header');
        res.status(403).json({
            message: "You are not signed In"
        });
        return;
    }
    try {
        if (!process.env.JWT_SECRET) {
            res.status(500).json({
                message: "JWT is not Cofigured"
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (decoded && typeof decoded !== "string" && "userId" in decoded) {
            req.userId = decoded.userId;
            next();
        }
        else {
            res.status(403).json({
                message: "You are not signed In"
            });
        }
    }
    catch (error) {
        res.status(403).json({
            error: error
        });
    }
}
