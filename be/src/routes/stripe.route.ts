import express from "express";
import stripeController from "../controllers/stripe.controller";
import authentication from "../middlewares/authentication";

const stripeRouter = express.Router();



stripeRouter.get('/account-list', authentication, stripeController.getStripeAccount)
stripeRouter.post('/create-account', authentication, stripeController.createStripeAccount);

// link the stripe account
stripeRouter.get('/account-link/:account_id/:user_id', stripeController.accountLink)
// catch the result of linked account
stripeRouter.get('/account-link-result/:stripe_account_id/:user_id', stripeController.accountLinkResult);

stripeRouter.get('/login-link', authentication, stripeController.loginLinks);
stripeRouter.post('/checkout', authentication, stripeController.checkOut);
stripeRouter.get('/check-linked-account/:stripe_id',stripeController.checkPayoutEnable);
//route to get payment-intent_id if checkout successfully
stripeRouter.get('/payment-success', stripeController.getPaymentIntentId);

export default stripeRouter;