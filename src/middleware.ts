import jwt, { JwtPayload } from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config(); 



export function userMiddleware(req:any, res:any, next:any){
    const token = req.cookies.token;
    if(!token){
        res.status(403).json({
            message: "You are not signed In"
        })
        return;
    }
    try{
        if(!process.env.JWT_SECRET){
            res.status(500).json({
                message: "JWT is not Cofigured"
            })
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded && typeof decoded !== "string" && "userId" in decoded) {
            req.userId = (decoded as JwtPayload).userId;
            next();
        }
        else {
            res.status(403).json({
                message: "You are not signed In"
            })
        }
    }catch(error){
        res.status(403).json({
            error: error
        })
    }
}
