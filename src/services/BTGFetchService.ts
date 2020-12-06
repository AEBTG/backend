import WebSocket = require('ws');
import axios = require('axios');
import * as RequestManager from '../utils/RequestManager';
import { IssuedAddress } from '../model/IssuedAddresses';
import * as BTGController from '../controllers/btg-controller';
import { json } from 'express';
import { start } from 'repl';

let ws = new WebSocket('ws://159.89.21.17:9130/websocket');

export async function subscribeForEvents() {
  const issuedAddresses = await IssuedAddress.find();

  if (!issuedAddresses) return;

  const addresses: string[] = [];
  issuedAddresses.forEach(element => {
    addresses.push(`"${element.address}"`);
  });

  const json = `{"id":"0", "method":"subscribeAddresses", "params":{"addresses":[${addresses}]}}`;
  console.log(json);
  ws.send(json);
}

export async function sendCoinsToMainWallet(senderAddress: string) {
  RequestManager.getUTXOs(senderAddress)
    .then(utxos => {
      IssuedAddress.findOne({ address: senderAddress })
        .then(issuedAddress => {
          BTGController.sendATransaction('mujQG13rGaEkjnxuS8yVDRWCJ93ufEHGjX', issuedAddress.path, utxos);
        })
        .catch(err => {
          console.log(err);
        });
    })
    .catch(err => {
      console.log(err);
    });
}

export async function getAllTransactions(address: string) {
  // await RequestManager.getAddress(address);
  console.log('Readched get all transactions');
  sendCoinsToMainWallet(address).then(result => {});
}

export function startService() {
  IssuedAddress.find(addresses => {
    if (!addresses) return;
    addresses.forEach(element => {
      getAllTransactions(element.address);
    });
  });

  ws = new WebSocket('ws://159.89.21.17:9130/websocket');

  ws.on('open', () => {
    console.log('BTG WebSocket opened');
    subscribeForEvents();
  });

  ws.on('message', (message: string) => {
    console.log('received a message');
    // if (message == 'connected') {
    //   //subscribe for events for all contracts that have addresses
    //   return;
    // }

    const jsonMessage = JSON.parse(message);
    if (jsonMessage.data.address) {
      getAllTransactions(jsonMessage.data.address)
        .then(result => {})
        .catch(error => {});

      console.log(jsonMessage);
    }
    // ws.send(`Hello, you sent -> ${message}`);
  });

  ws.on('close', (code: number, reason: string) => {
    console.log('Socket close: %d %s', code, reason);
    startService();
  });
}
