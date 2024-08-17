import { Request, Response } from "express";
import jwt, { SignOptions } from 'jsonwebtoken';
import mail from "../utils/mail";
import User from "../models/user";
import bcrypt from "bcrypt";
import validatePassword from "../utils/validatePassword";
import validateEmail from "email-validator";

const createToken = (payload: object, expiresIn: string): string => {
    const secret = process.env.ACTIVATION_SECRET!;
    const options: SignOptions = { expiresIn };
    return jwt.sign(payload, secret, options);
};

const handleUserNotFoundOrDeleted = (res: Response, user: any): void => {
    if (!user) {
        res.status(401).send('Email hoặc mật khẩu không chính xác');
    } else if (user.is_delete) {
        res.status(403).send('Người dùng đã bị xóa, liên hệ quản trị viên để mở khóa');
    }
};

const sendEmail = async (email: string, subject: string, message: string, res: Response): Promise<void> => {
    try {
        await mail.sendMail({ email, subject, message });
        res.status(201).json({
            success: true,
            message: `Vui lòng kiểm tra email của bạn: ${email} để kích hoạt tài khoản`,
        });
    } catch (err: any) {
        res.status(500).send('Không thể gửi được email');
    }
};

class UserController {
    async register(req: Request, res: Response): Promise<void> {
        try {
            const { email, password, firstname, lastname} = req.body;

            if(!validateEmail.validate(email)){
                res.status(400).send('Email không đáp ứng yêu cầu');
                return;
            }

            if (!validatePassword(password)) {
              res.status(400).send('Mật khẩu không đáp ứng yêu cầu');
              return;
            }

            const userExisted = await User.findOne({ email });

            if (userExisted) {
                res.status(400).send('Người dùng đã tồn tại');
                return;
            }
           
            const activationToken = createToken({ email, password , firstname, lastname }, '5m');
            const activationUrl = `http://localhost:3000/verify/${activationToken}`;
            const message = `Xin chào, vui lòng nhấp vào liên kết này để kích hoạt tài khoản của bạn: ${activationUrl}`;
            await sendEmail(email, "Xác nhận tài khoản của bạn", message, res);
        } catch (err) {
            res.status(400).send('Yêu cầu không hợp lệ');
        }
    }

    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            if(!validateEmail.validate(email)){
                res.status(400).send('Email không đáp ứng yêu cầu');
                return;
            }

            if (!validatePassword(password)) {
                res.status(400).send('Mật khẩu không đáp ứng yêu cầu');
                return;
            }

            const user = await User.findOne({ email }).select('-__v');

            if (!user || user.is_delete) {
                handleUserNotFoundOrDeleted(res, user);
                return;
            }

            const isPasswordCorrect = await bcrypt.compare(password, user.password);

            if (!isPasswordCorrect) {
                res.status(401).send('Email hoặc mật khẩu không chính xác');
                return;
            }
            const {  password: _,  ...userDetails } = user.toObject();
            const token = createToken({ email }, '1h');
            res.status(200).send({ token, user: userDetails });
        } catch (err) {
            console.error('Lỗi khi đăng nhập:', err);
            res.status(500).send('Lỗi máy chủ nội bộ');
        }
    }

    async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body;

            if(!validateEmail.validate(email)){
                res.status(400).send('Email không đáp ứng yêu cầu');
                return;
            }

            const user = await User.findOne({ email });

            if (!user) {
                res.status(401).send('Email không tồn tại');
                return;
            }

            const resetPasswordToken = createToken({ email }, '5m');
            const resetPasswordUrl = `http://localhost:3000/reset-password/${resetPasswordToken}`;
            const message = `Xin chào, vui lòng nhấp vào liên kết này để đặt lại mật khẩu của bạn: ${resetPasswordUrl}`;

            await sendEmail(email, "Đặt lại mật khẩu của bạn", message, res);
        } catch (err) {
            res.status(400).send('Yêu cầu không hợp lệ');
        }
    }
}

export default new UserController();
