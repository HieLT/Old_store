import { Request,Response } from "express";
import { getTimeFormat } from "../utils/helpers";
import UserRepo from "../repositories/user.repository";
import PostRepo from "../repositories/post.repository";
import OrderRepo from "../repositories/order.repository";
import ConversationRepo from "../repositories/conversation.repository";

class AdminDashboardController {
    async overallStats(req: Request, res: Response): Promise<any> {
        try {
            const [users, posts, orders] = await Promise.all([
                UserRepo.getNumberOfUserCurrently(),
                PostRepo.getNumberOfPostCurrently(),
                OrderRepo.getNumberOfOrderCurrently(),
            ]);
    
            const stats = {
                users,
                posts,
                orders,
            };
    
            console.log(stats);  
    
            res.status(200).send(stats);
        } catch (err: any) {
            res.status(500).send(err.message);
        }
    }
    

    async getUserGrowth(req: Request, res: Response): Promise<any>{
        const { groupBy = 'month' }= req.query
        try{
            const timeFormat = getTimeFormat(String(groupBy));
            const stats = await UserRepo.getUserRegistrationStats(timeFormat);
            res.status(200).send(stats);
        } catch(err: any){
            res.status(500).send(err.message);
        }
    }

    async getPostsPerCategory(req: Request, res: Response): Promise<void> {
        try {
            const stats = await PostRepo.getPostsPerCategory();

            res.status(200).send(stats);
        }catch(err: any){
            res.status(500).send(err.message);
        }
    }

    async getPostsByStatus(req: Request, res: Response): Promise<void> {
        try {
            const stats = await PostRepo.getPostsByStatus();

            res.status(200).send(stats);
        }catch(err: any){
            res.status(500).send(err.message);
        }
    }

    async getOrderByStatus(req: Request, res: Response): Promise<void> {
        try{
            const stats = await OrderRepo.getOrderByStatusAdminDashboard();

            res.status(200).send(stats);
        } catch(err: any){
            res.status(500).send(err.message)
        }
    }

    async getOrderByTime(req: Request, res: Response): Promise<void> {
        const { groupBy = 'month'} = req.query
        try{
            const timeFormat = getTimeFormat(String(groupBy));
            const stats = await OrderRepo.getOrderByTimeAdminDashboard(timeFormat);

            res.status(200).send(stats);
        } catch(err: any){
            res.status(500).send(err.message)
        }
    }

    async getActiveConversation(req: Request, res: Response): Promise<void> {
        const { groupBy = 'month'} = req.query
        try{
            const timeFormat = getTimeFormat(String(groupBy));
            const stats = await ConversationRepo.getActiveConversations(timeFormat);

            res.status(200).send(stats);
        } catch(err: any){
            res.status(500).send(err.message)
        }
    }
}

export default new AdminDashboardController();