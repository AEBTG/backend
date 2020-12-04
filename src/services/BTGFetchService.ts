import WebSocket = require('ws');
import axios = require('axios');
import * as RequestManager from '../utils/RequestManager';
import { IssuedAddress } from '../model/IssuedAddresses';

let ws = new WebSocket('wss://testnet.aeternal.io/websocket');

export async function subscribeForEvents() {
  const issuedAddresses = await IssuedAddress.find();
  const addresses: string[] = [];
  issuedAddresses.forEach(element => {
    addresses.push(element.address);
  });

  ws.send(`{"id":"1", "method":"subscribeAddresses", "params":{"addresses":${addresses}}}`);
}

export async function getAllTransactions(address: string) {
  await RequestManager.getAddress(address);
}

export function startService() {
  IssuedAddress.find(addresses => {
    addresses.forEach(element => {
      getAllTransactions(element.address);
    });
  });

  ws.on('open', () => {
    console.log('WebSocket opened');
  });

  ws.on('message', (message: string) => {
    if (message == 'connected') {
      //subscribe for events for all contracts that have addresses
      subscribeForEvents();
      return;
    }

    const jsonMessage = JSON.parse(message);
    if (jsonMessage.address) {
      getAllTransactions(jsonMessage.address);
    }
    // ws.send(`Hello, you sent -> ${message}`);
  });

  ws.on('close', (code: number, reason: string) => {
    console.log('Socket close: %d %s', code, reason);
    ws = new WebSocket('ws://testnet.aeternal.io/websocket');
  });
}