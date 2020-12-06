import WebSocket = require('ws');
import axios = require('axios');

import { contractAddress } from '../Aeternity/contract-controller';
import * as RequestManager from '../utils/RequestManager';
import { STATUS_CODES } from 'http';

let ws = new WebSocket('wss://testnet.aeternal.io/websocket');

export function subscribeForEvents(contractAddress: String) {
  ws.send(`{"op":"Subscribe", "payload": "Object", "target": "${contractAddress}"}`);
}

export function getAllTransactions() {
  RequestManager.fetchTransactions();
}

export function startService() {
  ws.on('open', () => {
    console.log('AE WebSocket opened');
  });

  ws.on('message', (message: string) => {
    if (message == 'connected') {
      //subscribe for events for all contracts that have addresses
      subscribeForEvents(contractAddress);
      return;
    }

    const jsonMessage = JSON.parse(message);
    if (jsonMessage.payload && jsonMessage.payload.tx) {
      // console.log(jsonMessage.payload);
      // getAllTransactions();
      RequestManager.getDepositBalanceFromTX(jsonMessage.payload);
    }
    // ws.send(`Hello, you sent -> ${message}`);
  });

  ws.on('close', (code: number, reason: string) => {
    console.log('Socket close: %d %s', code, reason);
    ws = new WebSocket('ws://testnet.aeternal.io/websocket');
  });
}
