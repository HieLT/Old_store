
import { Request, Response } from 'express'; 
import adminRouter from './admin.route';
import authRouter from './auth.route';
import emailVerificationRouter from './emailVerification.router';
import userRouter from './user.route';




const route = (app: any) => {
    app.use('/admin', adminRouter);
    app.use('/auth', authRouter);
    app.use('/verify-email', emailVerificationRouter);
    app.use('/user' , userRouter)
};

export default route;
