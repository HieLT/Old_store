import {Document, model, Schema} from "mongoose";
import {CATEGORY_ATTRIBUTE_TYPE} from "../utils/enum";

export interface IAttributeProduct extends Document {
    _id: Schema.Types.ObjectId;
    product_id: Schema.Types.ObjectId,
    attribute_id: Schema.Types.ObjectId,
    value: Schema.Types.Mixed
}

const AttributeProductSchema: Schema<IAttributeProduct> = new Schema<IAttributeProduct>({
    product_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
    },
    attribute_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Attribute'
    },
    value: {
        type: Schema.Types.Mixed,
    }
}, {
    timestamps: true
});

export default model<IAttributeProduct>('AttributeProduct', AttributeProductSchema);
