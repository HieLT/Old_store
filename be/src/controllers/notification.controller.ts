import { Request, Response } from 'express';
import NotificationRepo from '../repositories/notification.repository';

interface CustomRequest extends Request {
    account?: any;
}

class NotificationController {
    async getNotifications(req: CustomRequest, res: Response): Promise<void> {
        const account = req.account;
        const {
            search_key ,
            seen_at,
            page,
            limit
        } = req.query;
        try {
            try {
                const notifications = await NotificationRepo.getNotifications
                    (
                        account._id,
                        search_key as string,
                        seen_at as any,
                        Number(page),
                        Number(limit)
                    );
                
                res.status(200).send(notifications);
            } catch (err: any) {
                res.status(400).send(err.message);
            }
        } catch {
            res.status(500).send('Lỗi server');
        }
    }
    async createNotification(req: Request, res: Response): Promise<void> {
        const notification = req.body;
        try {
            try {
                await NotificationRepo.createNotification(notification);

                res.status(201).send('Tạo mới thành công');
            } catch (err: any) {
                res.status(400).send(err.message);
            }
        } catch {
            res.status(500).send('Lỗi server');
        }
    }

    async updateNotification(req: Request, res: Response): Promise<void> {
        const notificationId = req.params.id;
        const notification = req.body;
        try {
            try {
                await NotificationRepo.updateNotification(notificationId, notification);

                res.status(200).send('Cập nhật thành công');
            } catch (err: any) {
                res.status(400).send(err.message);
            }
        } catch {
            res.status(500).send('Lỗi server');
        }
    }

    async deleteNotification(req: Request, res: Response): Promise<void> {
        const notificationId = req.params.id;
        try {
            try {
                await NotificationRepo.updateNotification(notificationId, { is_deleted: true });

                res.status(200).send('Xóa nhật thành công');
            } catch (err: any) {
                res.status(400).send(err.message);
            }
        } catch {
            res.status(500).send('Lỗi server');
        }
    }
}
export default new NotificationController();
