import { NextFunction, Request, Response } from "express";
import UserRepo from "../repositories/user.repository";
const isNotDeleted  = async (req: Request, res: Response, next: NextFunction)  =>{
    try {
        let email = req.user;
        const user = await UserRepo.getUserByEmail(email) ; 
        if (!user.is_delete) {
            req.user = user
            return next();
        }
        return res.status(403).send('Tài khoản đã bị khóa, vui lòng liên hệ admin để mở khóa');
            
    } catch (err: any) {
        res.status(500).send({ message: err.message });
    }
};

export default isNotDeleted;
