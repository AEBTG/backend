import * as bitcoin from 'bgoldjs-lib';
import * as bip32 from 'bip32';
import * as bip39 from 'bip39';

let explorerURL = '';

if (process.env.explorerURL) {
  explorerURL = process.env.explorerURL;
} else {
  explorerURL = 'https://testnet.aeternal.io/';
}


const network = bitcoin.networks.bitcoingoldtestnet;

const mnemonic = 'praise you muffin lion enable neck grocery crumble super myself license ghost';
const seed = bip39.mnemonicToSeedSync(mnemonic);
const masterKey = bip32.fromSeed(seed);

const btgOptions = {
    network: network
};

function getAddress(node: any, network?: any): string {
  return bitcoin.payments.p2pkh({ pubkey: node.publicKey, network }).address!;
}

export { explorerURL, btgOptions, masterKey, network, getAddress };
