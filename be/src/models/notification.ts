import {Document, model, Schema} from 'mongoose';
import { NOTIFICATION_TYPE } from '../utils/enum';

export interface INotification extends Document {
    post_id : Schema.Types.ObjectId;
    title: String;
    type: String;
    payment_query_object: Object;
    receiver_id: Schema.Types.ObjectId;
    seen_at: Date | null;
    is_deleted: boolean
}

const NotificationSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            immutable : true
        },
        type: {
            type:String,
            enum: Object.values(NOTIFICATION_TYPE),
            immutable: true,
            required: true
        },
        receiver_id: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            immutable: true,
            required: true
        },
        post_id:{
            type: Schema.Types.ObjectId,
            ref: 'post',
            immutable: true,
            default: null
        },
        payment_query_object: {
            type: Object,
            default: null,
            immutable: true,
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
