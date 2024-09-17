import { Request, Response, NextFunction } from "express";
import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import mail from "../services/mail";
import UserRepo from "../repositories/user.repository";
import AdminRepo from "../repositories/admin.repository";
import bcrypt from "bcrypt";
import validatePassword from "../utils/validatePassword";
import validateEmail from "email-validator";
import passport from "../utils/passport";
import { refreshToken } from "firebase-admin/app";


const fe_access = process.env.FE_ACCESS ;
const accessSecret = process.env.ACCESS_SECRET_KEY! ;
const refreshSecret = process.env.REFRESH_SECRET_KEY! ;

const createToken = (payload: object, expiresIn: string, secretKey: string): string => {
    const options: SignOptions = { expiresIn };
    return jwt.sign(payload, secretKey, options);
};

const handleUserNotFoundOrDeleted = (res: Response, account: any): void => {
    if (!account) {
        res.status(404).send('Người dùng không tồn tại');
    } else if (account.is_delete) {
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
            res.status(500);
        }
    }

    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password, account_role } = req.body;
            if ( !account_role ){
                res.status(400).send('Thiếu account_role');
                return;
            }
            if(!email || !validateEmail.validate(email)){
                res.status(400).send('Email không đáp ứng yêu cầu');
                return;
            }

            if (!password || !validatePassword(password)) {
                res.status(400).send('Mật khẩu không đáp ứng yêu cầu');
                return;
            }

            //accont_role :  admin or user 
            let account ;
            if ( account_role === 'user') account = await UserRepo.getUserByEmail(email) ;
            else account = await AdminRepo.getAdminByEmail(email);
            
            if (!account || account.is_delete) {
                handleUserNotFoundOrDeleted(res, account);
                return;
            }

            const isPasswordCorrect = await bcrypt.compare(password, account.password!);

            if (!isPasswordCorrect) {
                res.status(401).send('Email hoặc mật khẩu không chính xác');
                return;
            }
            const {  password: _,  ...userDetails } = account.toObject();

            const accessToken = createToken({ email , account_role}, '15m', accessSecret);
            const refreshToken = createToken({ email , account_role}, '7d', refreshSecret);
            
            res.cookie('accessToken' , accessToken);
            res.cookie('refreshToken', refreshToken);
            
            res.status(200).send({ accessToken, refreshToken , user: userDetails });
        } catch (err) {
            res.status(500);
        }
    }

    getNewAccessToken(req: Request, res: Response) {
        try {
            const refreshToken = req.cookies.refreshToken;
            const decoded = jwt.verify(refreshToken,refreshSecret) as JwtPayload;
            const email = decoded.email;
            const account_role = decoded.account_role;

            const newAccessToken = createToken({email, account_role}, '15m' , accessSecret);
            const newRefreshToken = createToken({email} , '7d' , refreshSecret);

            res.cookie('accessToken', newAccessToken);
            res.cookie('refreshToken' , newRefreshToken);
            
            res.status(200).send('Lấy access-token và refesh-token mới thành công');

        } catch (err : any) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).send({ message: 'refreshToken đã hết hạn' }) ;
            }
            if (err.name === 'JsonWebTokenError') {
                return res.status(401).send({ message: 'refreshToken không hợp lệ' });
            }
            res.status(500);
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
            res.status(500);
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
            const token = createToken({ email, account_role:'user'}, '1h', accessSecret);
            
            const userProfile = await UserRepo.getUserByEmail(email);
            setAuthCookies(res, token, userProfile);
    
            return res.redirect(`${fe_access}`);
        })(req, res, next);
    }
}

export default new AuthController();
