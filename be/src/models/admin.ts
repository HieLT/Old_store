import { model, Schema } from "mongoose";

export interface IAdmin {
    _id: Schema.Types.ObjectId;
    email: string;
    password: string;
    avatar : string;
    phone : string;
    firstname : string; 
    lastname : string;
    role: "admin" | "super_admin"; 
    is_deleted: boolean;
}

const Admin = new Schema<IAdmin>({
    email: {
        type: String,
        required: true,
        immutable : true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: null
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
    role: {
        type: String,
        enum: ["admin", "super_admin"], 
        default: "admin", 
        immutable : true
    },
    is_deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export default model<IAdmin>('Admin', Admin);
