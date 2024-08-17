import { Request, Response } from "express";
import User from "../models/user";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { TokenExpiredError } from "jsonwebtoken";
import validatePassword from "../utils/validatePassword";

class emailVerifyController {
    async emailRegisterVerification (req: Request, res: Response) : Promise<void> {
        try {
            const {token} = req.body;
            const secret = process.env.ACTIVATION_SECRET!;
            const emailFromToken = jwt.verify(token, secret) as JwtPayload;
            const {email, password, firstname, lastname} = emailFromToken;
            const user = await User.findOne({email}).exec();
            if(user) {
                res.status(401).send('User already exits');
                return
            }
            const hashPassword = bcrypt.hashSync(password.toString(), 10);
            await User.create({ 
                email,
                password : hashPassword,
                firstname,
                lastname
            })
            res.status(201).send('User created successfully');
            
        }
        catch(err:any) {
            if (err instanceof TokenExpiredError) {
                res.status(400).send('Token expired');
            } 
            else if (err.name === 'JsonWebTokenError') {
                res.status(401).send('Invalid token');
            } 
            else {
                res.status(500).send('Bad request');
            }
        }
    }
    async emailResetPasswordVerification (req: Request, res: Response) : Promise<void> {
        try {
            const {token, resetPassword} = req.body;
            
            if (!validatePassword(resetPassword)) {
                res.status(400).send('Password does not meet the required criteria');
                return;
            }

            const secret = process.env.ACTIVATION_SECRET!;
            const emailFromToken = jwt.verify(token, secret) as JwtPayload;
            const {email} = emailFromToken;
            const user = await User.findOne({email}).exec();

            if(user) {
                const hashPassword = bcrypt.hashSync(resetPassword.toString(), 10);  
                user.password = hashPassword;
                await user.save();
                res.status(200).send({
                    message: 'Email verified successfully'
                });
            }
            res.status(401).send('Email does not exits');
        }
        catch(err:any) {
            if (err instanceof TokenExpiredError) {
                res.status(400).send('Token expired');
            } 
            else if (err.name === 'JsonWebTokenError') {
                res.status(401).send('Invalid token');
            } 
            else {
                res.status(500).send('Bad request');
            }
        }
    }
}

export default new emailVerifyController();