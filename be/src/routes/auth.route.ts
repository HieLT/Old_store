import express, { NextFunction } from "express";
import authController from "../controllers/authController";
const authRouter = express.Router();

authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
authRouter.post('/reset-password', authController.resetPassword);
authRouter.get('/google', authController.loginGoogle);
authRouter.get('/google/callback', authController.callbackGoogle);
authRouter.get('/google/success', authController.loginGoogleSuccess);
authRouter.get('/google/fail', authController.loginGoogleFail);
authRouter.get('/google/logout', authController.googleLogout);

export default authRouter;