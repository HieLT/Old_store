import express from "express";
import emailVerifyController from "../controllers/emailVerifyController";
const emailVerificationRouter = express.Router();

emailVerificationRouter.post('/register', emailVerifyController.emailRegisterVerification);
emailVerificationRouter.put('/reset-password' , emailVerifyController.emailResetPasswordVerification);

export default emailVerificationRouter;
