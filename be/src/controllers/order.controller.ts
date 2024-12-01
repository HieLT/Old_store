import { Request, Response } from "express";
import PostRepo from "../repositories/post.repository";
import OrderRepo from "../repositories/order.repository";
import UserRepo from "../repositories/user.repository";
import { ORDER_STATUS, PAYMENT_METHOD } from "../utils/enum";

interface CustomRequest extends Request {
    account?: any;
}

class OrderController {
    async getOrder(req: CustomRequest, res: Response): Promise<void> {
        const account = req.account;
        const { id } = req.params;

        try {
            const order = await OrderRepo.getOrder(id);

            if (order.customer_id._id !== account._id &&
                order.post_id.poster_id !== account._id
            ) {
                res.status(400).send('Bạn không có quyền truy cập order này');
                return;
            }
            res.status(200).send(order);
        } catch {
            res.status(500).send('Lỗi server');
        }
    }

    async getMySellingOrders(req: CustomRequest, res: Response): Promise<void> {
        const account = req.account;
        const { status, search_key, page, limit } = req.params;

        try {
            try {
                const orders = await OrderRepo.getMySellingOrders(
                    account._id,
                    status,
                    search_key,
                    Number(page),
                    Number(limit)
                );

                res.status(200).send(orders)
            } catch (err: any) {
                res.status(400).send(err.message);
            }
        } catch {
            res.status(500).send('Lỗi server');
        }
    }

    async getMyByingOrders(req: CustomRequest, res: Response): Promise<void> {
        const account = req.account;
        const { status, search_key, page, limit } = req.params;
        try {
            try {
                const orders = OrderRepo.getMyByingOrders(
                    account._id,
                    status,
                    search_key,
                    Number(page),
                    Number(limit)
                );

                res.status(200).send(orders);
            } catch (err: any) {
                res.status(400).send(err.message);
            }
        } catch {
            res.status(500).send('Lỗi server');
        }
    }

    async createOrder(req: CustomRequest, res: Response): Promise<void> {
        try {
            const user = req.account;
            const {
                customer_id,
                post_id,
                payment_method,
                customer_name,
                customer_phone,
                customer_location,
                total
            } = req.body.order;

            const post = await PostRepo.getPost(post_id);
            const customer = await UserRepo.getUserById(customer_id);

            if (customer.is_deleted) {
                res.status(403).send('Bạn không thể tạo đơn hàng bởi người dùng đã bị xóa');
                return;
            }

            if (!post) {
                res.status(404).send('Post không tồn tại');
                return;
            }

            if (post.poster_id !== user._id) {
                res.status(403).send('Bạn không phải chủ sở hữu bài post');
            }

            if (post.poster_id === customer_id) {
                res.status(400).send('Không thể order post của chính mình');
                return;
            }

            let status;

            if (payment_method === PAYMENT_METHOD.COD) {
                status = ORDER_STATUS.PROCESSING;
            } else if (payment_method === PAYMENT_METHOD.CREDIT) {
                status = ORDER_STATUS.WAITING_FOR_PAYMENT;
            }

            try {
                await OrderRepo.newOrder(
                    {
                        customer_id,
                        post_id,
                        payment_method,
                        customer_name,
                        customer_phone,
                        customer_location,
                        total: total ? total : null,
                        status: status
                    }
                )
            } catch (err) {
                res.status(400).send(err)
            }

            res.status(201).send('Tạo mới thành công');
        } catch {
            res.status(500).send('Lỗi server');
        }
    }

    async updateOrderStatus(req: CustomRequest, res: Response): Promise<void> {
        try {
            const user = req.account;
            const { order_id, status } = req.body.post;

            if (status === ORDER_STATUS.RECEIVED || status === ORDER_STATUS.WAITING_FOR_PAYMENT) {
                res.status(403).send('Bạn không có quyền thay đổi trạng thái này');
                return;
            }

            const order = await OrderRepo.getOrder(order_id);

            if (!order) {
                res.status(404).send('Đơn hàng không tồn tại');
                return;
            }

            if (order?.post_id._id !== user._id) {
                res.status(403).send('Bạn không có quyền thay đổi trạng thái post này');
                return;
            }

            if (order.customer_id.is_deleted) {
                res.status(403).send('Bạn không thể cập nhật trạng thái bởi người dùng đã bị xóa');
                return;
            }

            try {
                await OrderRepo.updateStatusOrder(order_id, status);
            } catch (err: any) {
                res.status(400).send(err.message);
            }
        } catch {
            res.status(500).send('Lỗi server');
        }
    }

    async receivedOrder(req: CustomRequest, res: Response): Promise<void> {
        try {
            const user = req.account;
            const { order_id } = req.body.post;

            const order = await OrderRepo.getOrder(order_id);

            if (!order) {
                res.status(404).send('Đơn hàng không tồn tại');
                return;
            }

            if (user._id !== order.customer_id || order.status !== ORDER_STATUS.DELIVERED) {
                res.status(403).send('Bạn không có quyền thay đổi thành trạng thái này');
            }

            try {
                await OrderRepo.updateStatusOrder(order_id, ORDER_STATUS.RECEIVED);
            } catch (err: any) {
                res.status(400).send(err.message);
            }

            res.status(200).send('Cập nhật thành công');
        } catch {
            res.status(500).send('Lỗi server');
        }
    }
}

export default new OrderController();
