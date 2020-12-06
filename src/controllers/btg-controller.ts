import * as bip32 from 'bip32';
import * as bip39 from 'bip39';
import * as bitcoin from 'bgoldjs-lib';
import { UTXO } from '../model/UTXO';
import { Order, STATUS } from '../model/Order';
import { raw } from 'express';
import { btgOptions, masterKey, network, getAddress } from '../config/network';
import * as RequestManager from '../utils/RequestManager';
import * as aeController from '../Aeternity/contract-controller';

const OPS = bitcoin.script.OPS;

export function sendATransaction(recepient: string, path: string, utxoData: Array<UTXO>) {
  console.log('reached send a transaction');
  if (!utxoData.length) {
    return;
  }

  const transactionBuilder = new bitcoin.TransactionBuilder(bitcoin.networks.bitcoingoldtestnet);

  const derivedNode = masterKey.derivePath(path);
  derivedNode.network = bitcoin.networks.bitcoingoldtestnet;

  const key = bitcoin.ECPair.fromWIF(derivedNode.toWIF(), bitcoin.networks.bitcoingoldtestnet);
  const hash160 = bitcoin.crypto.hash160(key.publicKey);

  const spk = bitcoin.script.compile([OPS.OP_DUP, OPS.OP_HASH160, hash160, OPS.OP_EQUALVERIFY, OPS.OP_CHECKSIG]);

  transactionBuilder.enableBitcoinGold(true);
  transactionBuilder.setVersion(2);

  let amount = 0;
  let inputsToUse = 0;
  utxoData.forEach(aUTXO => {
    amount += parseInt(aUTXO.value);
    console.log(parseInt(aUTXO.value));
    transactionBuilder.addInput(aUTXO.txid, aUTXO.vout, bitcoin.Transaction.DEFAULT_SEQUENCE, spk);
    inputsToUse++;
  });

  //   const fee = transactionBuilder.build().virtualSize() * 2;

  transactionBuilder.addOutput(recepient, amount - inputsToUse * 200);
  console.log('reached adding output');

  for (let i = 0; i < inputsToUse; i++) {
    transactionBuilder.sign(
      i,
      key,
      undefined,
      bitcoin.Transaction.SIGHASH_ALL | bitcoin.Transaction.SIGHASH_FORKID,
      parseInt(utxoData[i].value)
    );
  }

  const rawTX = transactionBuilder.build().toHex();
  console.log(rawTX);

  RequestManager.broadcastTransaction(rawTX).then(txId => {
    console.log(`txId: ${txId}`);
    console.log(path);
    Order.findOne({ hdPath: path }, (err, order) => {
      console.log(order);
      order.status = STATUS.completed;
      order.save();
      aeController
        .mint(order.sendAddress, amount)
        .then(result => {
          console.log(`AE Tranfer result: ${result}`);
        })
        .catch(err => {
          console.log(`AE Tranfer failed: ${err}`);
        });
    });
  });
}

export function sendTransactionFromMainWallet(recepient: string, amount: number) {
  const keyPair = bitcoin.ECPair.fromWIF(
    'cUudJ4KSiCMNin2YxFyjen1b47i2UT5JL4KChwgrowrSUL1zzexm', //mujQG13rGaEkjnxuS8yVDRWCJ93ufEHGjX
    bitcoin.networks.bitcoingoldtestnet
  );
  const address = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey }).address;
  RequestManager.getUTXOs('mujQG13rGaEkjnxuS8yVDRWCJ93ufEHGjX')
    .then(utxos => {
      if (!utxos.length) {
        console.log('no unspent outputs');
        return;
      }

      const hash160 = bitcoin.crypto.hash160(keyPair.publicKey);

      const spk = bitcoin.script.compile([OPS.OP_DUP, OPS.OP_HASH160, hash160, OPS.OP_EQUALVERIFY, OPS.OP_CHECKSIG]);

      const transactionBuilder = new bitcoin.TransactionBuilder(bitcoin.networks.bitcoingoldtestnet);
      transactionBuilder.enableBitcoinGold(true);
      transactionBuilder.setVersion(2);

      const utxoToUse = new Array<UTXO>();
      let remainingAmount = amount;

      utxos.forEach(aUTXO => {
        if (remainingAmount < 0) {
          return;
        }

        utxoToUse.push(aUTXO);
        transactionBuilder.addInput(aUTXO.txid, aUTXO.vout, bitcoin.Transaction.DEFAULT_SEQUENCE, spk);
        remainingAmount -= parseInt(aUTXO.value);
      });

      transactionBuilder.addOutput(recepient, amount - 250 * utxoToUse.length);
      transactionBuilder.addOutput('mujQG13rGaEkjnxuS8yVDRWCJ93ufEHGjX', -remainingAmount);

      for (let i = 0; i < utxoToUse.length; i++) {
        const aUTXO = utxoToUse[i];
        transactionBuilder.sign(
          i,
          keyPair,
          undefined,
          bitcoin.Transaction.SIGHASH_ALL | bitcoin.Transaction.SIGHASH_FORKID,
          parseInt(aUTXO.value)
        );
      }

      const rawTX = transactionBuilder.build().toHex();
      console.log(rawTX);

      RequestManager.broadcastTransaction(rawTX)
        .then(txId => {
          console.log(`txId: ${txId}`);
        })
        .catch(err => {
          console.log(`Transaction broadcast failed: ${err})`);
        });
    })
    .catch(err => {
      console.log(`Fetch UTXO failure: ${err}`);
    });
}
