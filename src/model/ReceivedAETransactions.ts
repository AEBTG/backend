import { Document, model, Model, Schema } from 'mongoose';

export const ReceivedAETransactionSchema = new Schema(
  {
    txId: String,
    amount: Number,
    addressToSend: String
  },
  {
    timestamps: true,
    versionKey: false
  }
);

ReceivedAETransactionSchema.set('toJSON', {
  virtuals: true
});

export interface ReceivedAETransactionDocument extends Document {
  txId: string;
  amount: number;
  addressToSend: string;
}

export const ReceivedAETransaction: Model<ReceivedAETransactionDocument> = model(
  'ReceivedAETransaction',
  ReceivedAETransactionSchema
);
