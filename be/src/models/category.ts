import { model, Schema, Document } from "mongoose";

export interface ICategory extends Document {
    _id: Schema.Types.ObjectId;
    name: string;
    description?: string;  
    attributes: string[];  
    is_deleted: boolean;
}

const CategorySchema = new Schema<ICategory>({
     name: {
          type: String,
          required: true
     },
     description: {
          type: String
     },
     attributes: {
          type: [String],  
          required: true,
          validate: {
               validator: function(v: any) {
                   return Array.isArray(v) && v.length > 0;  // Ensure it's a non-empty array
               },
               message: 'Attributes must be a non-empty array of strings'
           }
     },
     is_deleted: {  
          type: Boolean,
          default: false
     }
}, {
    timestamps: true
});

export default model<ICategory>('Category', CategorySchema);
