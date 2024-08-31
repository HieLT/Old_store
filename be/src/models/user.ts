import {model,  Schema} from "mongoose";

export interface IUser {
    _id: Schema.Types.ObjectId;
    email: string;
    phone: string | null;
    firstname: string;
    lastname: string;
    password: string | null;
    address: string | null;
    avatar: string | null ;
    follower_ids: Schema.Types.ObjectId[];
    following_user_ids: Schema.Types.ObjectId[];
    is_delete: boolean;
    is_google_account: boolean;
};

const User = new Schema<IUser>({
    email: {
        type: String ,
        required: true , 
        immutable : false
    },
    phone :{
        type: String ,
        default: null
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
        type: String ,
    },
    address: {
        type: String,
        default: null
    },
    avatar: {
        type: String,
        default: null
    },
    follower_ids: [{
        type: Schema.Types.ObjectId,
    }],
    following_user_ids: [{
        type: Schema.Types.ObjectId,
    }],
    is_google_account: {
        type: Boolean , 
        default : false,
        immutable: true
    },
    is_delete: {
        type: Boolean,
        default: false,
        select: false,

    }
}, {
    timestamps: true
});

export default model<IUser>('User', User);