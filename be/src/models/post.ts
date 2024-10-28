import { model, Schema } from "mongoose";

export interface IPost {
    _id: Schema.Types.ObjectId;
    name : string;
    poster_id: Schema.Types.ObjectId;
    product_id: Schema.Types.ObjectId | null;
    status: 'Pending'|'Approved'|'Rejected'|'Hidden'|'Draft'|'Done'|'Expired';
    location: string;
    is_deleted: boolean;
}

const Post = new Schema<IPost>({
    name: {
        type: String,
        required:[true,'Thiếu post name']
    },
    poster_id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    product_id: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        default: null
    },
    status: {
        type: String,
        enum: ['Pending','Approved','Rejected','Hidden','Draft','Done','Expired'],
        default: 'Pending'
    },
    location: {
        type: String,
        required: [true,"Thiếu post location"]
    },
    is_deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export default model<IPost>('Post', Post);
