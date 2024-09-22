import { model, Schema } from "mongoose";

export interface IProduct {
    _id: Schema.Types.ObjectId;
    name: string;
    description: string;
    is_deletde : boolean;
    images: string;
    price: number;
    condition: 'New' | 'Used' | 'Like New';
    category_id: Schema.Types.ObjectId;
    is_deleted: boolean
}

const Product = new Schema<IProduct>({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    images: {
        type: String,
        required: true
    },
    price: {
        type: Number
    },
    condition: {
        type: String,
        enum: ["New","Used","Like New"],
    },
    is_deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export default model<IProduct>('Product', Product);
