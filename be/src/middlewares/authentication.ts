import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import UserRepo from "../repositories/user.repository";

const accessSecret =  process.env.ACCESS_SECRET_KEY!; 

const authentication = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).send({ message: "Không có token" });
        }
        const decoded = jwt.verify(token,accessSecret) as JwtPayload;
        
        const email = decoded.email;
        req.user = await UserRepo.getUserByEmail(email);

        next();
    } catch (err: any) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).send({ message: 'accessToken đã hết hạn' }) ;
        }
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).send({ message: 'accessToken không hợp lệ' });
        }
        res.status(500).send({ message: err.message });
    }
};

export default authentication;
