import { Request, Response, NextFunction } from 'express';

import { Order, ACTION } from '../model/Order';
import { getNewAddress } from '../model/IssuedAddresses';
import { resourceUsage } from 'process';

export async function getAEBTG(req: Request, res: Response) {
  const sendAddress = req.body.sendAddress;
  const amount = req.body.amount;

  const issuedAddress = await getNewAddress();

  const order = new Order({
    action: ACTION.buyAEBTG,
    sendAddress: sendAddress,
    receiveAddress: issuedAddress,
    amount: amount
  });

  await order.save();

  return res.status(201).json({'order': order});
}
