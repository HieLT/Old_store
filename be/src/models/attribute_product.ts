import { model, Schema } from "mongoose";
import AttributeRepo from "../repositories/attribute.repository";

export interface IAttributeProduct {
    _id: Schema.Types.ObjectId,
    product_id: Schema.Types.ObjectId,
    attribute_id: Schema.Types.ObjectId,
    value: string[] | string | [];
}

const AttributeProduct = new Schema<IAttributeProduct>({
    product_id: {
        type: Schema.Types.ObjectId,
        required: [true, 'product_id là thuộc tính bắt buộc'],
        ref: 'Product',
        immutable: true
    },
    attribute_id: {
        type: Schema.Types.ObjectId,
        required: [true,'attribute_id là thuộc tính bắt buộc'],
        ref: 'Attribute',
        immutable: true
    },
    value: {
        type: Schema.Types.Mixed,
        default: null,
        validate: {
            validator: async function (input: string) {
                if (!input || input.length === 0) throw new Error(`attribute_id:${this.attribute_id} Đầu vào là bắt buộc`);

                const attribute = await AttributeRepo.getAttribute(String(this.attribute_id));

                const attribute_type = attribute.input_type;
                const attribute_initial_value = attribute.initial_value as String[];

                if (attribute_type === 'dropdown' || attribute_type === 'radio') {
                    const isValid = attribute_initial_value.includes(input);
                    if (!isValid) {
                        throw new Error(`attribute_id:${this.attribute_id} Đầu vào của thuộc tính phải là ${attribute_initial_value}`);
                    }
                    return isValid;
                }

                else if (attribute_type === 'checkbox') {
                    const isValid = Array.isArray(input) && input.every(item => attribute_initial_value.includes(item));
                    if (!isValid) {
                        throw new Error(`attribute_id:${this.attribute_id} Đầu vào của thuộc tính phải là 1 string array và phải là ${attribute_initial_value}`);
                    }
                    return isValid;
                }

                else if (attribute_type === 'text') {
                    if (typeof (input) !== 'string') {
                        throw new Error(`attribute_id:${this.attribute_id} Đầu vào của thuộc tính phải là 1 string`);
                    }
                    return true;
                }
                return false;
            },
            message: (props: any) => props.message,
        },
    }

}, {
    timestamps: true,
});

export default model<IAttributeProduct>('AttributeProduct', AttributeProduct);
