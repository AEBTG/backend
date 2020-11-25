const axios = require('axios').default;
import * as network from '../config/network';
import { Order } from '../model/Order';

const explorerURL = network.explorerURL;
const explorer = axios.create({
  baseURL: explorerURL,
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
