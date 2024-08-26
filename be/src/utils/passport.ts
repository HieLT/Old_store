import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { config } from 'dotenv';  
import crypto from 'crypto';
import User from "../models/user";
config();

const generateStrongPassword = (length: number) => {
  return crypto.randomBytes(Math.ceil(length / 2))
               .toString('hex')  
               .slice(0, length);
};

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "http://localhost:8080/user/auth/google/callback",
    scope: ["profile", "email"],
    passReqToCallback: true
  }, async (req, accessToken:any, refreshToken:any, profile:any, done:any)=> {
    try{
      const user_email = profile.emails[0].value;
      let account = await User.findOne({user_email}).exec();
      if(account){
        try {
          await User.create({
            email:user_email,
            password: null,
            firstname: profile.name.familyName,
            lastname: profile.name.givenName
        });
        }catch {
          throw Error('google error return')
        }
      }
      return done(null, user_email);
    } catch(err){
      done(err,null)
    }
  }
));

passport.serializeUser(function(user_email, done) {
    done(null, user_email);
});

passport.deserializeUser(function(user_email:any, done) {
    done(null, user_email);
});

export default passport;
