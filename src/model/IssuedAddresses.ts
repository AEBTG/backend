import { Document, model, Model, Schema } from 'mongoose';
import { btgOptions, masterKey, network, getAddress } from '../config/network';

import * as bitcoin from 'bgoldjs-lib';
import * as bip32 from 'bip32';
import * as bip39 from 'bip39';

export const purpose = 44;
export const coinType = 156;
export const account = 0;
export const change = 0;
export const addressIndex = 0;

export const IssuedAddressSchema = new Schema(
  {
    purpose: {
      type: Number,
      default: 44
    },
    coinType: {
      type: Number,
      default: 156
    },
    account: {
      type: Number,
      default: 0
    },
    change: {
      type: Number,
      default: 0
    },
    addressIndex: {
      type: Number,
      default: 1
    },
    path: String,
    address: String
  },
  {
    timestamps: true,
    versionKey: false
  }
);

IssuedAddressSchema.set('toJSON', {
  virtuals: true
});

export interface IssuedAddressDocument extends Document {
  purpose: number;
  coinType: number;
  account: number;
  change: number;
  addressIndex: number;
  path: string;
  address: string;
}

export const IssuedAddress: Model<IssuedAddressDocument> = model('IssuedAddress', IssuedAddressSchema);

export async function getNewAddress(): Promise<IssuedAddressDocument> {
  const wallets = await IssuedAddress.find()
    .sort({ addressIndex: -1 })
    .exec();
  let nextIndex = 0;

  if (wallets.length > 0) {
    const lastWallet = wallets[0];
    console.log(lastWallet);
    nextIndex = lastWallet.addressIndex + 1;
  }

  const path = `m/${purpose}'/${coinType}'/${account}'/${change}'/${nextIndex}`;
  const derivedNode = masterKey.derivePath(path);
  derivedNode.network = bitcoin.networks.bitcoingoldtestnet;
  const newWalletAddress = getAddress(derivedNode, network);

  const newIssuedAddress = new IssuedAddress({ addressIndex: nextIndex, path: path, address: newWalletAddress });
  await newIssuedAddress.save();

  return newIssuedAddress;
}
