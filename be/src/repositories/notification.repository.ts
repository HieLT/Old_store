import Notification, { INotification } from "../models/notification";
class ConversationRepo {
    async getNotifications(
        userId: string,
        searchKey: string = '',
        seen_at: Date | null = null,
        page: number = 1,
        limit: number = 10
    ): Promise<INotification[]> {
        try {
            const searchQuery: any = {
                receiver_id: userId,
                searchKey: { $regex: searchKey, $options: 'i' },
                is_deleted: false,
            };
            if (seen_at === null) searchQuery.seen_at = null;

            const result = await Notification.find(searchQuery)
                .skip((page - 1) * limit)
                .limit(limit)
                .exec();

            return result;
        } catch (err) {
            throw err;
        }
    }

    async createNotification(notification: Partial<INotification>): Promise<boolean> {
        try {
            const result = await Notification.create(notification);

            return !!result;
        } catch (err) {
            throw err;
        }
    }

    async updateNotification(notificationId: string, notification: Partial<INotification>): Promise<boolean> {
        try {
            const result = await Notification.findOneAndUpdate({ _id: notificationId }, notification, { runValidator: true });

            return !!result;
        } catch (err) {
            throw err;
        }
    }
}
export default new ConversationRepo();