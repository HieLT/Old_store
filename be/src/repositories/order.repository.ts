import Order, { IOrder } from "../models/order";

class OrderRepo {
    async getOrder(orderId: string): Promise<any> {
        try {
            return await Order.findById({ orderId, is_deleted: false })
                .populate({
                    path: 'customer_id',
                    select: '-password',
                })
                .populate({
                    path: 'post_id',
                })
        } catch (err) {
            throw err;
        }
    }

    async getMyByingOrders(
        userId: string,
        status: string,
        searchKey: string = '',
        page: number = 1,
        limit: number = 10): Promise<any> {
        try {
            const searchQuery: any = {
                customer_id: userId,
                is_deleted: false,
                _id: { $regex: searchKey, $options: 'i' },

            }

            if (status) searchQuery.status = status

            const orders = Order
                .find(searchQuery)
                .populate({
                    path: 'post_id'
                })
                .skip((page - 1) * limit)
                .limit(limit)
                .exec();


            return orders;
        } catch (err) {
            throw err;
        }
    }

    async getMySellingOrders(
        userId: string,
        status: string,
        searchKey: string = '',
        page: number = 1,
        limit: number = 10): Promise<any> {
        try {
            const searchQuery: any = {
                'post_id.poster_id': userId,
                is_deleted: false,
                _id: { $regex: searchKey, $options: 'i' },

            }
            if (status) searchQuery.status = status;

            const orders = Order
                .find(searchQuery)
                .populate({
                    path: 'post_id'
                })
                .skip((page - 1) * limit)
                .limit(limit)
                .exec();


            return orders;
        } catch (err) {
            throw err;
        }
    }

    async newOrder(order: Partial<IOrder>): Promise<boolean> {
        try {
            const result = await Order.create(order);
            return !!result;
        } catch (err) {
            throw err;
        }
    }
    async updateStatusOrder(orderId: string, status: string): Promise<boolean> {
        try {
            const result = await Order.findByIdAndUpdate(orderId, { status });

            return !!result;
        } catch (err) {
            throw err;
        }
    }
    async deleteOrder(orderId: string): Promise<boolean> {
        try {
            const result = await Order.findByIdAndUpdate(orderId, { is_deleted: true });

            return !!result;
        } catch (err) {
            throw err;
        }
    }
}

export default new OrderRepo()