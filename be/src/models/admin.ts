import {model, Schema} from "mongoose";

export interface IAdmin {
    _id: Schema.Types.ObjectId;
    username: string;
    password: string;
    role: string;
    is_active: boolean;
    is_deleted: boolean;
};

const Admin = new Schema<IAdmin>({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    is_active: {
        type: Boolean,
        default: false
    },
    is_deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export default model<IAdmin>('Admin', Admin);