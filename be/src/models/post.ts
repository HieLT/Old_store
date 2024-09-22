import { model, Schema } from "mongoose";

export interface IPost {
    _id: Schema.Types.ObjectId;
    poster_id: Schema.Types.ObjectId;
    product_id: Schema.Types.ObjectId;
    status: 'Pending'|'Approved'|'Rejected'|'Hidden'|'Draft'|'Done'|'Expired';
    draft_product: JSON;
    location: string
    is_deleted: boolean
}

const Post = new Schema<IPost>({
    poster_id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    product_id: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
    },
    status: {
        type: String,
        enum: ['Pending','Approved','Rejected','Hidden','Draft','Done','Expired']
    },
    draft_product: {
        type: JSON
    },
    location: {
        type: String,
        required: true
    },
    is_deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export default model<IPost>('Post', Post);
