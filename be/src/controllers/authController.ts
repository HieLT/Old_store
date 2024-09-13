import { Request, Response, NextFunction } from "express";
import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import mail from "../services/mail";
import UserRepo from "../repositories/user.repository";
import bcrypt from "bcrypt";
import validatePassword from "../utils/validatePassword";
import validateEmail from "email-validator";
import passport from "../utils/passport";


const fe_access = process.env.FE_ACCESS ;
const accessSecret = process.env.ACCESS_SECRET_KEY! ;
const refeshSecret = process.env.REFRESH_SECRET_KEY! ;

const createToken = (payload: object, expiresIn: string, secretKey: string): string => {
    const options: SignOptions = { expiresIn };
    return jwt.sign(payload, secretKey, options);
};

const handleUserNotFoundOrDeleted = (res: Response, user: any): void => {
    if (!user) {
        res.status(404).send('Email hoặc mật khẩu không chính xác');
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

const setAuthCookies = (res: Response, token: string, userProfile: any): void =>{
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'development',
        sameSite: 'lax' as const,
        maxAge: 3600000 
    };
    res.cookie('auth_token', token, cookieOptions);
    res.cookie('user_profile', userProfile, cookieOptions);
}

class AuthController {
    async register(req: Request, res: Response): Promise<void> {
        try {
            const { email, password, firstname, lastname} = req.body;

            if(!email || !validateEmail.validate(email)){
                res.status(400).send('Email không đáp ứng yêu cầu');
                return;
            }
            const userExisted = await UserRepo.getUserByEmail(email);

            if (userExisted) {
                res.status(400).send('Người dùng đã tồn tại');
                return;
            }
            if(!password || !validatePassword(password)){
                res.status(400).send('Mật khẩu không đáp ứng yêu cầu');
                return;
            }

            const activationToken = createToken({ email, password , firstname, lastname }, '3d', accessSecret);
            const activationUrl = `${fe_access}/verify-email/${activationToken}`;
            const message = `Xin chào, vui lòng nhấp vào liên kết này để kích hoạt tài khoản của bạn: ${activationUrl}`;
            await sendEmail(email, "Xác nhận tài khoản của bạn", message, res);
        } catch (err) {
            res.status(400).send('Yêu cầu không hợp lệ');
        }
    }

    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            if(!email || !validateEmail.validate(email)){
                res.status(400).send('Email không đáp ứng yêu cầu');
                return;
            }

            if (!password || !validatePassword(password)) {
                res.status(400).send('Mật khẩu không đáp ứng yêu cầu');
                return;
            }

            const user = await UserRepo.getUserByEmail(email);

            if (!user || user.is_delete) {
                handleUserNotFoundOrDeleted(res, user);
                return;
            }

            const isPasswordCorrect = await bcrypt.compare(password, user.password!);

            if (!isPasswordCorrect) {
                res.status(401).send('Email hoặc mật khẩu không chính xác');
                return;
            }
            const {  password: _,  ...userDetails } = user.toObject();

            console.log(accessSecret, refeshSecret);
            const accessToken = createToken({ email }, '15m', accessSecret);
            const refeshToken = createToken({ email }, '7d', refeshSecret);
            
            
            res.status(200).send({ accessToken, refeshToken , user: userDetails });
        } catch (err : any) {
            res.status(500).send({ message : err.name});
        }
    }

    getNewAccessToken(req: Request, res: Response) {
        try {
            const { refreshToken } = req.body;
            const decoded = jwt.verify(refreshToken,refeshSecret) as JwtPayload;
            const email = decoded.email;

            const newAccessToken = createToken({email}, '15m' , accessSecret);
            const newRefreshToken = createToken({email} , '7d' , refeshSecret);
            
            res.status(200).send({newAccessToken, newRefreshToken});

        } catch (err : any) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).send({ message: 'refreshToken đã hết hạn' }) ;
            }
            if (err.name === 'JsonWebTokenError') {
                return res.status(401).send({ message: 'refreshToken không hợp lệ' });
            }
            res.status(500).send({ message : err.name})
        }
    }
    async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body;

            if(!validateEmail.validate(email)){
                res.status(400).send('Email không đáp ứng yêu cầu');
                return;
            }

            const user = await UserRepo.getUserByEmail(email);

            if (!user) {
                res.status(401).send('Email không tồn tại');
                return;
            }

            if(user.is_google_account){
                res.status(403).send('Tài khoản google không thể thay đổi mật khẩu');
                return ;
            }

            const resetPasswordToken = createToken({ email }, '5m', accessSecret);
            const resetPasswordUrl = `${fe_access}/reset-password?token=${resetPasswordToken}&expired_within=${'300'}`;
            const message = `Xin chào, vui lòng nhấp vào liên kết này để đặt lại mật khẩu của bạn: ${resetPasswordUrl}`;

            await sendEmail(email, "Đặt lại mật khẩu của bạn", message, res);
        } catch (err) {
            res.status(400).send('Yêu cầu không hợp lệ');
        }
    }
    
    loginGoogle(req: Request, res: Response, next: NextFunction) : void {
        passport.authenticate('google', {
            scope: ['email', 'profile']
        })(req, res, next);
    }
    
    callbackGoogle(req: Request, res: Response, next: NextFunction): void {
        passport.authenticate('google', async (err: any, user: Express.User, info: any) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.redirect('fail');
            }
    
            const email = (user as { email: string }).email;
            const token = createToken({ email }, '1h', accessSecret);
            
            const userProfile = await UserRepo.getUserByEmail(email);
            setAuthCookies(res, token, userProfile);
    
            return res.redirect(`${fe_access}`);
        })(req, res, next);
    }
}

export default new AuthController();
