import * as bip32 from 'bip32';
import * as bip39 from 'bip39';
import * as bitcoin from 'bgoldjs-lib';
import { UTXO } from '../model/UTXO';
import { raw } from 'express';
import { btgOptions, masterKey, network, getAddress } from '../config/network';

export function sendATransaction(recepient: string, path: string, utxoData: [UTXO]) {
  console.log('reached send a transaction');
  const transactionBuilder = new bitcoin.TransactionBuilder(bitcoin.networks.bitcoingoldtestnet);

  const derivedNode = masterKey.derivePath(path);
  derivedNode.network = bitcoin.networks.bitcoingoldtestnet;

  const key = bitcoin.ECPair.fromWIF(derivedNode.toWIF(), bitcoin.networks.bitcoingoldtestnet);

  transactionBuilder.enableBitcoinGold(true);
  transactionBuilder.setVersion(2);

  let amount = 0;
  let currentIndex = 0;
  utxoData.forEach(aUTXO => {
    amount += parseInt(aUTXO.value);
    console.log(parseInt(aUTXO.value));
    transactionBuilder.addInput(aUTXO.txid, aUTXO.vout);
    currentIndex++;
  });

  //   const fee = transactionBuilder.build().virtualSize() * 2;

  transactionBuilder.addOutput(recepient, amount - 2000);
  console.log('reached adding output');

  for (let i = 0; i < currentIndex; i++) {
    transactionBuilder.sign(
      i,
      key,
      undefined,
      bitcoin.Transaction.SIGHASH_ALL | bitcoin.Transaction.SIGHASH_FORKID,
      amount
    );
  }

  const rawTX = transactionBuilder.build();

  console.log(rawTX.toHex());
}
