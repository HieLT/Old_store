import { Request,Response } from "express";
import RatingRepo from "../repositories/rating.repository";
import OrderRepo from "../repositories/order.repository";
import { getTimeFormat } from "../utils/helpers";

interface CustomRequest extends Request {
    account?: any;
}

class UserDashboardController {
    async getRatings(req: CustomRequest, res: Response): Promise<void> {
        const account = req.account;
        try {
            const ratings = await RatingRepo.getRatingUserDashboard(account._id);

            res.status(200).send(ratings);
        }catch(err: any){
            res.status(500).send(err.message);
        }
    }

    async getOrdersStatus(req: CustomRequest, res: Response): Promise<void> {
        const account = req.account;
        try {
            const ordersStatus = await OrderRepo.getOrdersStatusUserDashboard(account._id)

            res.status(200).send(ordersStatus);
        }catch(err: any){
            res.status(500).send(err.message);
        }
    }

    async getRevenue(req: CustomRequest, res: Response): Promise<void> {
        const account = req.account;
        const { groupBy = "month" } = req.query; 
        try {
            const timeFormat = getTimeFormat(String(groupBy));
            const revenue = await OrderRepo.getRevenueUserDashboard(account._id, timeFormat);
    
            res.status(200).send(revenue);
        } catch(err: any){
            res.status(500).send(err.message);
        }
    }

    async getExpenses(req: CustomRequest, res: Response): Promise<void> {
        const account = req.account;
        const { groupBy = "month" } = req.query; 
        try {
            const timeFormat = getTimeFormat(String(groupBy));
            const expenses = await OrderRepo.getExpensesUserDashboard(account._id, timeFormat);
    
            res.status(200).send(expenses);
        } catch(err: any){
            res.status(500).send(err.message);
        }
    }
}

export default new UserDashboardController();