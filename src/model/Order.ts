import { Document, model, Model, Schema } from 'mongoose';

export enum ACTION {
  buyAEBTG = 'buyAEBTG',
  sellAEBTG = 'sellAEBTG'
}

export const actionArray = Object.keys(ACTION).map(key => ACTION[key]);

export enum STATUS {
  created = 'created', // initial state
  completed = 'completed' // the amount was sent to the user
}

export const statusArray = Object.keys(STATUS).map(key => STATUS[key]);

export const OrderSchema = new Schema(
  {
    action: {
      type: String,
      enum: actionArray
    },
    sendAddress: String, //Address of the user to receive the coins
    receiveAddress: String, //Our address that we are using
    amount: Number,
    hdPath: String,
    txId: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: statusArray,
      default: STATUS.created
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

OrderSchema.set('toJSON', {
  virtuals: true
});

export interface OrderDocument extends Document {
  action: string;
  sendAddress: string;
  receiveAddress: string;
  amount: number;
  hdPath: string;
  txId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

OrderSchema.pre('save', function(next) {
  const doc = this as OrderDocument;

  if (doc.isModified('status')) {
    console.log('status changed');
  }

  next();
});

export const Order: Model<OrderDocument> = model('Order', OrderSchema);
