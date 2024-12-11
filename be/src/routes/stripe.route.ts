import express from "express";
import stripeController from "../controllers/stripe.controller";
import authentication from "../middlewares/authentication";
import { session } from "passport";
const Stripe = require('stripe');
const stripe = Stripe(String(process.env.STRIPE_PRIVATE_KEY));


const stripeRouter = express.Router();



stripeRouter.get('/account-list', authentication, stripeController.getStripeAccount)
stripeRouter.post('/create-account', authentication, stripeController.createStripeAccount);
stripeRouter.get('/account-link/:account_id', stripeController.accountLink)
stripeRouter.get('/login-link', authentication, stripeController.loginLinks);
stripeRouter.post('/checkout', authentication, stripeController.checkOut);
//route to get payment-intent_id if checkout successful


export default stripeRouter;