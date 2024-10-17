import { model, Schema } from "mongoose";
import AttributeRepo from "../repositories/attribute.repository";

export interface IAttributeProduct {
    _id : Schema.Types.ObjectId,
    product_id: Schema.Types.ObjectId,
    attribute_id: Schema.Types.ObjectId,
    value: string[] | string | [];
}

const AttributeProduct = new Schema<IAttributeProduct>({
    product_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Product',
        immutable: true
    },
    attribute_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Attribute',
        immutable: true
    },
    value: {
        type: Schema.Types.Mixed,
        validate: {
            validator: async function (input: any) {
                const attribute = await AttributeRepo.getAttribute(String(this.attribute_id)); 
                if (!attribute) return false; 
    
                const attribute_type = attribute.input_type;
                const attribute_initial_value = attribute.initial_value as String[];
    
    
                if (attribute_type === 'Dropdown' || attribute_type === 'Radio') {
                    const isValid = typeof input === 'string' && attribute_initial_value.includes(input);
                    if (!isValid) {
                        throw new Error('Đầu vào của thuộc tính phải là 1 string');
                    }
                    return isValid;
                }
    
                if (attribute_type === 'Checkbox') {
                    const isValid = Array.isArray(input) && input.every(item => attribute_initial_value.includes(item));
                    if (!isValid) {
                        throw new Error('Đầu vào của thuộc tính phải là 1 string array');
                    }
                    return isValid;
                }
    
                return false; 
            },
            message: (props: any) => props.reason.message, 
        },
    }
    
}, {
    timestamps: true,
});

export default model<IAttributeProduct>('AttributeProduct', AttributeProduct);
