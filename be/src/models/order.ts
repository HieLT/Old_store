import {Document, model, Schema} from 'mongoose';
import { ORDER_STATUS, PAYMENT_METHOD } from '../utils/enum';

export interface IOrder extends Document {
    customer_id: Schema.Types.ObjectId;
    post_id: Schema.Types.ObjectId;
    customer_name : String;
    customer_phone : String;
    customer_location: String;
    payment_method: String;
    status: String;
    total: Number;
    is_deleted: boolean;
}

const OrderSchema = new Schema(
    {
        customer_id:{
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        post_id: {
            type: Schema.Types.ObjectId,
            required:true,
            ref:'Post'
        },
        payment_method: {
            type: String,
            enum: PAYMENT_METHOD,
            required: true
        },
        customer_name: {
            type: String,
            required: true 
        },
        customer_phone: {
            type: String,
            required: true
        },
        customer_address: {
            type: Object,
            required: true
        },
        status: {
            type: String,
            enum: ORDER_STATUS,
            default: ORDER_STATUS.PROCESSING
        },
        total: {
            type: Number,
            default : null
        },
        is_deleted: {
            type: Boolean,
            default: false
        }
},
    {timestamps: true}
);

export default model<IOrder>('Order', OrderSchema);
