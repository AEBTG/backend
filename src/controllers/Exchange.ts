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
    receiveAddress: issuedAddress.address,
    hdPath: issuedAddress.path,
    amount: amount
  });

  await order.save();

  return res.status(201).json({ order: order });
}

export async function getOrders(req: Request, res: Response) {
  const orders = Order.find()
    .then(orders => {
      return res.status(200).json({ orders: orders });
    })
    .catch(err => {
      return res.status(400).json({ error: err });
    });
}
