const axios = require('axios').default;
import * as network from '../config/network';
import { Address } from '../model/address';
import { UTXO } from '../model/utxo';
import { Order } from '../model/Order';

const explorerURL = network.explorerURL;
const explorer = axios.create({
  baseURL: explorerURL,
  timeout: 30000
});

const btgExplorer = axios.create({
  baseURL: 'http://159.89.21.17:9130/',
  timeout: 30000
});

export function fetchTransactions() {
  //TODO: Add TX reading
}

export async function getDepositBalanceFromTX(transaction: any) {
  const tx = transaction.tx;

  if (tx.call_data === 'cb_EWJ1cm7QwhFk') {
    // burn
    const hash: string = transaction.hash;
    const contract: string = tx.contract_id;
    const amount: number = tx.amount;

    const order = await Order.findOne({ txId: hash });
    if (!order) {
      return;
    }
    //TODO: Set the parameters that are required
  }
}

export async function getTransactionsPerAddress(address: String) {
  explorer
    .get('/middleware/contracts/transactions/address/' + address)
    .then(async response => {
      const transactions: Array<any> = response.data.transactions;
      for (let index = 0; index < transactions.length; index++) {
        await getDepositBalanceFromTX(transactions[index]);
      }
    })
    .catch(error => {
      console.log('Fetching transactions failed:' + error);
    });
}

export async function getAddress(address: string): Promise<any> {
  const promise = new Promise((resolve, reject) => {
    btgExplorer
      .get('/api/v2/address/' + address)
      .then(response => {
        const addressData = response.data;
        const addressInfo = Object.assign(new Address(), addressData);
        resolve(addressInfo);
      })
      .catch(error => {
        reject(error);
      });
  });

  return promise;
}

export async function getUTXOs(address: string): Promise<Array<UTXO>> {
  const promise = new Promise<Array<UTXO>>((resolve, reject) => {
    btgExplorer
      .get('/api/v2/utxo/' + address)
      .then(response => {
        const utxosData = response.data as [object];
        const utxos = new Array<UTXO>();
        for (const item of utxosData) {
          utxos.push(Object.assign(new UTXO(), item));
        }
        resolve(utxos);
      })
      .catch(error => {
        reject(null);
      });
  });

  return promise;
}

export function broadcastTransaction(txData: string): Promise<string | any> {
  const promise = new Promise((resolve, reject) => {
    btgExplorer
      .get('/api/v2/sendtx/' + txData)
      .then(response => {
        const txid = response.data.result as string;
        resolve(txid);
      })
      .catch(error => {
        reject(error);
      });
  });

  return promise;
}
