import { model, Schema } from "mongoose";

export interface ICategory {
    _id: Schema.Types.ObjectId;
    name: string;
    description: string ;
    attributes: Object;
    is_deletde : boolean ;
}

const Category = new Schema<ICategory>({
     name: {
          type: String,
          required: true
     },
     description: {
          type: String
     },
     attributes: {
          type: Object,
          required: true,
          validate: {
               validator: function(v: any) {
                   return typeof v === 'object'&& !Array.isArray(v) && Object.keys(v).length > 0;
               },
               message: 'Attributes must be a non-empty object'
           }
     },
     is_deletde: {
          type: Boolean,
          default: false
     }
}, {
    timestamps: true
});

export default model<ICategory>('Category', Category);
