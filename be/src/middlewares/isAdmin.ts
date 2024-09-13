import { NextFunction, Request, Response } from "express";
import { IAdmin } from "../models/admin";
const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user as IAdmin;
        if (user.role === 'admin') return next();

        return res.status(403).send('Tài khoản đã bị khóa, vui lòng liên hệ admin để mở khóa');
            
    } catch (err: any) {
        res.status(500).send({ message: err.message });
    }
};

export default isAdmin;
