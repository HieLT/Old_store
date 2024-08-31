import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const authentication = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).send({ message: "Không có token" });
        }
        jwt.verify(token, process.env.SECRET_KEY!, (err, decoded) => {
            if (err) {
                return res.status(401).send({ message: "Token không hợp lệ" });
            }
            if (decoded) {
                const currentTime = Math.floor(Date.now() / 1000);
                const expired = (decoded as JwtPayload).exp;

                if (expired && currentTime >= expired) {
                    res.status(401).send({message: 'Token hết hạn'});
                }
                req.user = (decoded as JwtPayload).email;
                return next();
            }
        });
    } catch (err: any) {
        res.status(500).send({ message: err.message });
    }
};

export default authentication;
