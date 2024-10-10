import adminRouter from './admin.route';
import authRouter from './auth.route';
import emailVerificationRouter from './emailVerification.router';
import userRouter from './user.route';
import locationRouter from './location.route';
import publicRouter from "./public.route";
import babyRouter from './baby.route';



const route = (app: any) => {
    app.use('/admin', adminRouter);
    app.use('/auth', authRouter);
    app.use('/public', publicRouter);
    app.use('/verify-email', emailVerificationRouter);
    app.use('/user' , userRouter);
    app.use('/location', locationRouter);
    app.use('/baby',babyRouter);
};

export default route;
