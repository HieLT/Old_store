import adminRouter from "./admin.route";
import userRouter from "./user.route";
import emailVerificationRouter from "./emailVerification.router";

const route = (app: any) => {
    app.use('/admin', adminRouter);
    app.use('/user', userRouter)
    app.use('/verify-email', emailVerificationRouter);
};

export default route;