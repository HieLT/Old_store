import { model, Schema, Document } from "mongoose";

export interface IProduct extends Document {  
    _id: Schema.Types.ObjectId;
    name: string;
    description?: string;  
    images: string[]; 
    attributes: Map<string, any>; 
    price?: number;
    condition: 'New' | 'Used' | 'Like New';
    category_id: Schema.Types.ObjectId;
}


const ProductSchema = new Schema<IProduct>({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    images: {
        type: [String],  
        required: true
    },
    attributes: {
        type: Map,
        of: Schema.Types.Mixed, 
        required: true,
    },
    price: {
        type: Number
    },
    condition: {
        type: String,
        enum: ["New", "Used", "Like New"],
        required: true
    },
    category_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Category'
    }
}, {
    timestamps: true
});

export default model<IProduct>('Product', ProductSchema);
