import {model,  Schema} from "mongoose";

export interface IUser {
    _id: Schema.Types.ObjectId;
    email: string;
    phone: string
    firstname: string;
    lastname: string;
    password: string;
    address: string;
    avatar: string;
    confirmed_at: Date;
    follower_ids: Schema.Types.ObjectId[];
    following_user_ids: Schema.Types.ObjectId[];
    is_active: boolean;
    is_delete: boolean;
};

const User = new Schema<IUser>({
    email: {
        type: String ,
        required: true
    },
    phone :{
        type: String 
    },
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    address: {
        type: String,
    },
    avatar: {
        type: String,
    },
    confirmed_at: {
        type: Date,
    },
    follower_ids: [{
        type: Schema.Types.ObjectId
    }],
    following_user_ids: [{
        type: Schema.Types.ObjectId
    }],
    is_active: {
        type: Boolean,
        default: false
    },
    is_delete: {
        type: Boolean,
        default: false,
        select: false
    }
    
}, {
    timestamps: true
});

export default model<IUser>('User', User);