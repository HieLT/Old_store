import { Request, Response } from "express";
import PostRepo from "../repositories/post.repository";
import OrderRepo from "../repositories/order.repository";
import UserRepo from "../repositories/user.repository";
import { NOTIFICATION_TITLE, NOTIFICATION_TYPE, ORDER_STATUS, PAYMENT_METHOD, POST_STATUS } from "../utils/enum";
import notificationRepo from "../repositories/notification.repository";
import mail from "../services/mail";

const Stripe = require('stripe');
const stripe = Stripe(String(process.env.STRIPE_PRIVATE_KEY));

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
        const { status, search_key, page } = req.query;

        try {
            try {
                const {total, orders} = await OrderRepo.getMySellingOrders(
                    account._id,
                    status as string,
                    search_key as string,
                    Number(page) || 1
                );

                res.status(200).send({total, orders})
            } catch (err: any) {
                res.status(400).send(err.message);
            }
        } catch {
            res.status(500).send('Lỗi server');
        }
    }

    async getMyBuyingOrders(req: CustomRequest, res: Response): Promise<void> {
        const account = req.account;
        const { status, search_key, page, limit } = req.query;
        try {
            try {
                const {total, orders} = await OrderRepo.getMyByingOrders(
                    account._id,
                    status as string,
                    search_key as string,
                    Number(page),
                    Number(limit)
                );

                res.status(200).send({total, orders});
            } catch (err: any) {
                res.status(400).send(err.message);
            }
        } catch {
            res.status(500).send('Lỗi server');
        }
    }

    async createOrder(req: CustomRequest, res: Response): Promise<void> {
        const user = req.account;
        const order = req.body.order;
        try {
            if (!order.customer_id) {
                res.status(400).send('Thiếu thông tin người mua')
                return;
            }
            const post = await PostRepo.getPost(String(order.post_id));
            const customer = await UserRepo.getUserById(String(order.customer_id));

            //order validation
            if (customer.is_deleted) {
                res.status(403).send('Bạn không thể tạo đơn hàng với người dùng đã bị xóa');
                return;
            }

            if (!post) {
                res.status(404).send('Post không tồn tại');
                return;
            }

            if (String(post.poster_id) !== String(user._id)) {
                res.status(403).send('Bạn không phải chủ sở hữu bài post');
                return;
            }

            if (String(post.poster_id) === String(order.customer_id)) {
                res.status(400).send('Không thể order post của chính mình');
                return;
            }

            if (post.is_ordering) {
                res.status(400).send('Bạn đã tạo đơn cho bài post này, nếu muốn tạo lại, hãy hủy đơn cũ');
                return;
            }

            if (!order.receiver_stripe_account_id) {
                res.status(400).send('Thiếu tài khoản nhận tiền');
                return;
            }

            let notification_title, notification_type, order_status;
            // if (order.payment_method === PAYMENT_METHOD.COD) {
            //     notification_title = NOTIFICATION_TITLE.PAYMENT_COD;
            //     order_status = ORDER_STATUS.PROCESSING;
            //     notification_type = NOTIFICATION_TYPE.PAYMENT_COD
            // }
            // if (order.payment_method === PAYMENT_METHOD.CREDIT) {
            if (!order.total || order.total < 20000) {
                res.status(400).send(`Chọn payment_method là ${PAYMENT_METHOD.CREDIT} total phải >= 20000`);
                return;
            }

            const stripeAccount = await stripe.accounts.retrieve(order.receiver_stripe_account_id);
            if (!stripeAccount.payouts_enabled) {
                res.status(400).send('Tài khoản stripe chưa liên kết với nền tảng website, hãy liên kết với nền tảng website ở phần chỉnh sửa thông tin của bạn')  
                return;
            }

            notification_title = NOTIFICATION_TITLE.PAYMENT_CREDIT;
            order_status = ORDER_STATUS.WAITING_FOR_PAYMENT;
            notification_type = NOTIFICATION_TYPE.PAYMENT_CREDIT
            // };

            const newOrder = await OrderRepo.newOrder(
                {
                    ...order,
                    status: order_status,
                    total: order.total ? order.total : null,
                });

            await PostRepo.updatePost(post._id, {is_ordering: true})
            await notificationRepo.sendNotification({
                order_id: newOrder._id,
                title: notification_title,
                type: notification_type,
                receiver_id: order.customer_id,
                post_id: null
            })

            res.status(201).send('Tạo mới thành công');

        } catch (err: any) {
            res.status(400).send(err.message);
        }
    }

    async updateOrderStatus(req: CustomRequest, res: Response): Promise<void> {
        const account = req.account;
        const { order_id, status } = req.body.order;
        try {

            if (status === ORDER_STATUS.RECEIVED || status === ORDER_STATUS.WAITING_FOR_PAYMENT) {
                res.status(403).send('Bạn không có quyền thay đổi trạng thái này');
                return;
            }

            const order = await OrderRepo.getOrder(order_id);

            if (!order) {
                res.status(404).send('Đơn hàng không tồn tại');
                return;
            }

            if (String(order?.post_id.poster_id._id) !== String(account._id)) {
                res.status(403).send('Bạn không có quyền thay đổi trạng thái post này');
                return;
            }

            if (order.customer_id.is_deleted) {
                res.status(403).send('Bạn không thể cập nhật trạng thái bởi người dùng đã bị xóa');
                return;
            }

            try {
                const updated = await OrderRepo.updateStatusOrder(order_id, status);

                if (status !== order.status && status === ORDER_STATUS.DELIVERED && updated) {
                    await notificationRepo.sendNotification({
                        order_id: order._id,
                        title: NOTIFICATION_TITLE.DELIVERED_ORDER,
                        type: NOTIFICATION_TYPE.DELIVERED_ORDER,
                        receiver_id: order.customer_id,
                        post_id: null
                    })
                }
        
                res.status(200).send('Thay đổi trạng thái thành công');
            } catch (err: any) {
                res.status(400).send(err.message);
            }
        } catch (err: any) {
            res.status(400).send(err.message);
        }
    }

    async receivedOrder(req: CustomRequest, res: Response): Promise<void> {
        try {
            const account = req.account;
            const { order_id } = req.body.post;

            const order = await OrderRepo.getOrder(order_id);

            if (!order) {
                res.status(404).send('Đơn hàng không tồn tại');
                return;
            }

            if (String(account._id) !== String(order.customer_id) || order.status !== ORDER_STATUS.DELIVERED) {
                res.status(403).send('Bạn không có quyền thay đổi thành trạng thái này');
            }

            try {
                const updatedOrder = await OrderRepo.updateStatusOrder(order_id, ORDER_STATUS.RECEIVED);
                await PostRepo.updatePost(order.post_id._id, { status: POST_STATUS.DONE });
                if (updatedOrder) {
                    let paymentIntent
                    try {
                        // Capture the authorized payment
                        paymentIntent = await stripe.paymentIntents.capture(order.stripe_payment_intent_id);
                    } catch (err: any) {

                        res.status(500).send(err.message);
                    }

                    const email = order.post_id.poster_id.email;
                    const web_name = process.env.WEB_NAME;
                    const subject = `Bạn nhận được tiền từ một đơn hàng tại ${web_name}`;
                    const amount = paymentIntent.amount;
                    const currency = paymentIntent.currency;
                    const receiver = paymentIntent.transfer_data.destination;
                    const message = `Bạn nhận được ${amount}+${currency} từ việc đăng bán sản phẩm trong bài post ${order.post_id.title}.Số tiền đã được chuyển vào trong tài khoản stripe: ${receiver}`
                    mail.sendMail({ email, subject, message });

                    await notificationRepo.sendNotification({
                        post_id: null,
                        order_id: order._id,
                        title: NOTIFICATION_TITLE.RECEIVED,
                        type: NOTIFICATION_TYPE.RECEIVED,
                        receiver_id: order.post_id.poster_id._id
                    })
                }
            } catch (err: any) {
                res.status(400).send(err.message);
            }

            res.status(200).send('Người dùng đã nhận được hàng và đã chuyển tiền cho người bán');
        } catch {
            res.status(500).send('Lỗi server');
        }
    }
    async cancelOrder(req: CustomRequest, res: Response): Promise<void> {
        const account = req.account;
        const { order_id } = req.body.order;
        try {
            const order = await OrderRepo.getOrder(order_id);
            const createrOrderId = String(order.post_id.poster_id._id);
            const buyerOrderId = String(order.customer_id._id);
            if (String(account._id) !== createrOrderId && String(account._id) !== buyerOrderId) {
                res.status(403).send('Bạn không có quyền thay đổi đơn này');
                return;
            }

            if (
                order.status === ORDER_STATUS.DELIVERED ||
                order.status === ORDER_STATUS.CANCELLED ||
                order.status === ORDER_STATUS.DERLIVERING ||
                order.status === ORDER_STATUS.DELIVERED
            ) {
                res.status(403).send('Đơn ở trạng thái này không được phép hoàn lại');
                return;
            }

            await stripe.paymentIntents.cancel(order.stripe_payment_intent_id);
            await PostRepo.updatePost(order.post_id._id, {is_ordering: false})
            await OrderRepo.updateStatusOrder(order._id, ORDER_STATUS.CANCELLED)
            res.status(200).send('Hủy đơn thành công');

        } catch (err: any) {
            res.status(400).send(err.message);
        }
    }
}

export default new OrderController();
