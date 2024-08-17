import { Request, Response } from "express";
import jwt, { SignOptions } from 'jsonwebtoken';
import mail from "../utils/mail";
import User from "../models/user";
import bcrypt from "bcrypt";
import validatePassword from "../utils/validatePassword";

const createToken = (payload: object, expiresIn: string): string => {
    const secret = process.env.ACTIVATION_SECRET!;
    const options: SignOptions = { expiresIn };
    return jwt.sign(payload, secret, options);
};

const handleUserNotFoundOrDeleted = (res: Response, user: any): void => {
    if (!user) {
        res.status(401).send('Email or password incorrect');
    } else if (user.is_delete) {
        res.status(403).send('User has been deleted, contact administrator to unlock');
    }
};
const sendEmail = async (email: string, subject: string, message: string, res: Response): Promise<void> => {
    try {
        await mail.sendMail({ email, subject, message });
        res.status(201).json({
            success: true,
            message: `Please check your email: ${email} to activate your account`,
        });
    } catch (err: any) {
        res.status(500).send('Send mail error');
    }
};

class UserController {
    async register(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            const userExisted = await User.findOne({ email });

            if (userExisted) {
                res.status(400).send('User already exists');
                return;
            }

            if (!validatePassword(password)) {
              res.status(400).send('Password does not meet the required criteria');
              return;
            }
            const activationToken = createToken({ email, password }, '5m');
            const activationUrl = `http://localhost:5174/verify/${activationToken}`;
            const message = `Hello, Please click this link to activate your account: ${activationUrl}`;
            await sendEmail(email, "Confirm your account", message, res);
        } catch (err) {
            res.status(400).send('Bad request');
        }
    }

    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });

            if (!user || user.is_delete) {
                handleUserNotFoundOrDeleted(res, user);
                return;
            }

            if (!validatePassword(password)) {
                res.status(400).send('Password does not meet the required criteria');
                return;
            }

            const isPasswordCorrect = await bcrypt.compare(password, user.password);

            if (!isPasswordCorrect) {
                res.status(401).send('Email or password incorrect');
                return;
            }

            const token = createToken({ email }, '1h');
            res.status(200).send({ token, user });
        } catch (err) {
            res.status(500).send('Bad request');
        }
    }

    async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body;
            const user = await User.findOne({ email });

            if (!user) {
                res.status(401).send('Email does not exist');
                return;
            }

            const resetPasswordToken = createToken({ email }, '5m');
            const resetPasswordUrl = `http://localhost:5174/reset-password/${resetPasswordToken}`;
            const message = `Hello, Please click this link to reset your password: ${resetPasswordUrl}`;

            await sendEmail(email, "Reset your account", message, res);
        } catch (err) {
            res.status(400).send('Bad request');
        }
    }
}

export default new UserController();
