import {Document, model, Schema} from 'mongoose';

export interface INotification extends Document {
    post_id : Schema.Types.ObjectId;
    order_id: Schema.Types.ObjectId;
    title: String;
    type: String;
    receiver_id: Schema.Types.ObjectId;
    seen_at: Date | null;
    is_deleted: boolean
}

const NotificationSchema = new Schema(
    {
        title: {
            type: String,
            default: null
        },
        type: {
            type:String,
            default: null
        },
        receiver_id: {
            type: Schema.Types.ObjectId,
            default: null,
            ref: 'user',
        },
        post_id:{
            type: Schema.Types.ObjectId,
            ref: 'post',
            default: null
        },
        order_id:{
            type: Schema.Types.ObjectId,
            ref: 'order',
            default: null
        },
        seent_at: {
            type: Date,
            default: null
        },
        is_deleted: {
            type: Boolean,
            default: false
        }
},
    {timestamps: true}
);

export default model<INotification>('Notification', NotificationSchema);
