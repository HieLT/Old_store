import { Request, Response } from "express";
import User from "../models/user";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { TokenExpiredError } from "jsonwebtoken";
import validatePassword from "../utils/validatePassword";

class emailVerifyController {
    async emailRegisterVerification(req: Request, res: Response): Promise<void> {
        try {
            const { token } = req.body;
            const secret = process.env.ACTIVATION_SECRET!;
            const emailFromToken = jwt.verify(token, secret) as JwtPayload;
            const { email, password, firstname, lastname } = emailFromToken;
            const user = await User.findOne({ email }).exec();
            if (user) {
                res.status(401).send('Người dùng đã tồn tại');
                return;
            }
            const hashPassword = bcrypt.hashSync(password.toString(), 10);
            await User.create({
                email,
                password: hashPassword,
                firstname,
                lastname
            });
            res.status(201).send('Người dùng đã được tạo thành công');

        } catch (err: any) {
            if (err instanceof TokenExpiredError) {
                res.status(400).send('Token đã hết hạn');
            } else if (err.name === 'JsonWebTokenError') {
                res.status(401).send('Token không hợp lệ');
            } else {
                res.status(500).send('Yêu cầu không hợp lệ');
            }
        }
    }

    async emailResetPasswordVerification(req: Request, res: Response): Promise<void> {
        try {
            const { token, resetPassword } = req.body;

            if (!validatePassword(resetPassword)) {
                res.status(400).send('Mật khẩu không đáp ứng yêu cầu');
                return;
            }

            const secret = process.env.ACTIVATION_SECRET!;
            const emailFromToken = jwt.verify(token, secret) as JwtPayload;
            const { email } = emailFromToken;
            const user = await User.findOne({ email }).exec();

            if (!user) {
                res.status(401).send('Email không tồn tại');
                return
            }

            const hashPassword = bcrypt.hashSync(resetPassword.toString(), 10);
            user.password = hashPassword;
            await user.save();
            res.status(200).send({
                message: 'Email đã được xác thực thành công'
            });
        } catch (err: any) {
            if (err instanceof TokenExpiredError) {
                res.status(400).send('Token đã hết hạn');
            } else if (err.name === 'JsonWebTokenError') {
                res.status(401).send('Token không hợp lệ');
            } else {
                res.status(500).send('Yêu cầu không hợp lệ');
            }
        }
    }
}

export default new emailVerifyController();
