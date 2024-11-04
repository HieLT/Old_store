import {model, Schema, Document} from "mongoose";

export interface IProduct extends Document {
    _id: Schema.Types.ObjectId;
    name: string;
    description?: string;
    images: string[];
    price?: number;
    condition: 'New' | 'Used' | 'Like New';
    category_id: Schema.Types.ObjectId
}

const ProductSchema = new Schema<IProduct>({
    name: {
        type: String,
        required: [true,'Tên product là thuộc tính bắt buộc']
    },
    description: {
        type: String,
        default: null
    },
    images: {
        type: [String],
        required: [true,'images là thuộc tính bắt buộc']
    },
    price: {
        type: Number,
        default: null
    },
    condition: {
        type: String,
        enum: ["New", "Used", "Like New"],
        required: [true,'Condition là thuộc tính bắt buộc']
    },
    category_id: {
        type: Schema.Types.ObjectId,
        required: [true, 'Category là thuộc tính bắt buộc'],
        ref: 'Category',
    
    }
}, {
    timestamps: true
});

export default model<IProduct>('Product', ProductSchema);
