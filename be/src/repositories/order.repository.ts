import Order, { IOrder } from "../models/order";

class OrderRepo {
    async getOrder(orderId: string): Promise<any> {
        try {
            return await Order.findById(orderId, { is_deleted: false })
                .populate({
                    path: "customer_id",
                    select: "-password",
                })
                .populate({
                    path: "post_id",
                    populate: [
                        {
                            path: "product_id",
                            model: "Product",
                        },
                        {
                            path: "poster_id",
                            model: "User",
                        },
                    ],
                });
        } catch (err) {
            throw err;
        }
    }

    async getMyByingOrders(
        userId: string,
        status: string,
        searchKey: string = "",
        page: number = 1,
        limit: number = 10
    ): Promise<any> {
        try {
            let searchQuery: any = {
                customer_id: userId,
                is_deleted: false,
            };

            if (searchKey)
                searchQuery = {
                    ...searchQuery,
                    _id: { $regex: searchKey, $options: "i" },
                };
            if (status) searchQuery.status = status;

            const [total, orders] = await Promise.all([
                Order.countDocuments(searchQuery),
                Order.find(searchQuery)
                    .populate({
                        path: "post_id",
                    })
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .exec(),
            ]);

            return { orders, total };
        } catch (err) {
            throw err;
        }
    }

    async getMySellingOrders(
        userId: string,
        status: string,
        searchKey: string = "",
        page: number = 1,
        limit: number = 10
    ): Promise<any> {
        try {
            let searchQuery: any = {
                "post_id.poster_id": userId,
                is_deleted: false,
            };

            if (searchKey)
                searchQuery = {
                    ...searchQuery,
                    _id: { $regex: searchKey, $options: "i" },
                };
            if (status) searchQuery.status = status;

            const [total, orders] = await Promise.all([
                Order.countDocuments(searchQuery),
                Order.find(searchQuery)
                    .populate({
                        path: "post_id",
                    })
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .exec(),
            ]);

            return { total, orders };
        } catch (err) {
            throw err;
        }
    }

    async newOrder(order: Partial<IOrder>): Promise<any> {
        try {
            const result = await Order.create(order);
            return result;
        } catch (err) {
            throw err;
        }
    }
    async updateStatusOrder(orderId: string, status: string): Promise<boolean> {
        try {
            const result = await Order.findByIdAndUpdate(
                orderId,
                { status },
                { runValidators: true }
            );

            return !!result;
        } catch (err) {
            throw err;
        }
    }
    async updateStripePaymentIntentId(
        orderId: string,
        paymentIntentId: string
    ): Promise<void> {
        try {
            await Order.findByIdAndUpdate(orderId, {
                stripe_payment_intent_id: paymentIntentId,
            });
        } catch (err) {
            throw err;
        }
    }
    async deleteOrder(orderId: string): Promise<boolean> {
        try {
            const result = await Order.findByIdAndUpdate(orderId, {
                is_deleted: true,
            });

            return !!result;
        } catch (err) {
            throw err;
        }
    }
}

export default new OrderRepo();
