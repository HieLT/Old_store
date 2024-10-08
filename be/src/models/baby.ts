import { model, Schema } from "mongoose";

export interface IBaby {
  _id: Schema.Types.ObjectId;
  firstname: string;
  lastname: string;
  birthdate: Date;
  parent_id: Schema.Types.ObjectId;
  gender: 'male' | 'female';
  weight: number;  
  height: number; 
  shoe_size: number; 
  clothing_size: number;  
};

const Baby = new Schema<IBaby>({
  firstname: {
    type: String,
    required: [true, 'fisrtname là bắt buộc']
  },
  lastname: {
    type: String,
    required: [true, 'lastname là bắt buộc']
  },
  birthdate: {
    type: Date,
    required: [true, 'ngày sinh là bắt buộc']
  },
  parent_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Cần đăng nhập'],
    immutable: true,
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: [true, 'Cần thêm giới tính']
  },
  weight: {
    type: Number,
    validate: {
        validator: function(weight: number) {
            return weight >= 2.5 && weight <=35
        },
        message: 'Cân nặng của bé phải trong khoảng 2.5 - 30kg'
    }
  },
  height: {
    type: Number,
    validate: {
        validator: function(height: number) {
            return height >= 46 && height <=160
        },
        message: 'Chiều cao của bé phải trong khoảng 46 - 160cm'
    }
  },
  shoe_size: {
    type: Number,
    validate: {
        validator: function(size: number) {
            return size >=16 && size <=36
        },
        message: 'Size giày của bé phải trong khoảng 16 - 36'
    }
  },
  clothing_size: {
    type: Number,
    validate: {
        validator: function(size: number) {
            return size > 0 && size <=12
        },
        message: 'Size quần áo của bé phải trong khoảng 1 - 12'
    }
  }
}, {
  timestamps: true
});

export default model<IBaby>('Baby', Baby);
