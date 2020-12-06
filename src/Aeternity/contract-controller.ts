/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';

import { AE_AMOUNT_FORMATS } from '@aeternity/aepp-sdk/es/utils/amount-formatter';
import {
  Universal as Ae,
  Node,
  MemoryAccount,
  Crypto
} from '@aeternity/aepp-sdk';
import Contract from './aeBTG';

const NODE_URL = process.env.AE_SDK || 'https://sdk-testnet.aepps.com';
const COMPILER_URL = process.env.AE_COMPILER_SDK || 'https://compiler.aepps.com'; // required for using Contract
const ACCOUNT = MemoryAccount({
  keypair: {
    secretKey:
      'b6ca021d7e247d1004834bff7893584b570cd6e2bb2132089b1f78415ee6cda8014bb98f3c2cefd80d540bd1774417adc2d7fbf5756357f7d6596a4c3886140e',
    publicKey: 'ak_a6mdy4yYbwvEst6DJdqfyBrcrkGYFnxwAMu3eviXbzozzNiP'
  }
});

export const contractAddress = 'ct_gtjR37cYNFwaseW6gvG3j3iGEzVXaaueFQPk8JRaKqMXF2YYX';
export let contractInstance: any;

const code = Contract;
let node: Node;
let ae: Ae;

export async function initialize() {
  node = await Node({ url: NODE_URL });
  ae = await Ae({
    debug: true,
    nodes: [{ name: 'testNode', instance: node }],
    compilerUrl: COMPILER_URL,
    accounts: [ACCOUNT]
  });
  contractInstance = await ae.getContractInstance(code, { contractAddress });
}

export async function deployContract(): Promise<any> {
  await initialize();
  const contract = contractInstance;
  
  const promise = new Promise((resolve, reject) => {
    contract
      .deploy()
      .then(result => {
        // result.contractCode = contract;
        // console.log(contract.bytecode.toString());
        console.log(result);
        resolve(result);
      })
      .catch(e => {
        reject(e);
      });
  });
  return promise;
}

export async function getTotalSupply() {
  const contract = contractInstance;
  const promise = new Promise((resolve, reject) => {
    contract
      .call('total_supply')
      .then(result => {
        resolve(result);
      })
      .catch(e => {
        console.log(e);
        reject(e);
      });
  });

  return promise;
}

export async function getBalance(address: String) {
  const contract = contractInstance;
  const promise = new Promise((resolve, reject) => {
    contract
      .call('balance_of', [address])
      .then(result => {
        resolve(result);
      })
      .catch(e => {
        console.log(e);
        reject(e);
      });
  });

  return promise;
}

export async function transfer(address: String, amount: Number) {
  const contract = contractInstance;
  const promise = new Promise((resolve, reject) => {
    contract
      .call('transfer', [address, amount])
      .then(result => {
        resolve(result);
      })
      .catch(e => {
        console.log(e);
        reject(e);
      });
  });

  return promise;
}

export async function mint(address: String, amount: Number) {
  const contract = contractInstance;
  const promise = new Promise((resolve, reject) => {
    contract
      .call('mint', [address, amount])
      .then(result => {
        resolve(result);
      })
      .catch(e => {
        console.log(e);
        reject(e);
      });
  });

  return promise;
}

export async function burn(amount: Number) {
  const contract = contractInstance;
  const promise = new Promise((resolve, reject) => {
    contract
      .call('burn', [amount])
      .then(result => {
        resolve(result);
      })
      .catch(e => {
        console.log(e);
        reject(e);
      });
  });

  return promise;
}

export function generateKeys() {
  const keypair = Crypto.generateKeyPair();
  const privKey = keypair.secretKey;
  const pubKey = keypair.publicKey;
  console.log(`Secret key: ${privKey}`);
  console.log(`Public key: ${pubKey}`);
  return { pubkey: pubKey, privKey: privKey };
}
