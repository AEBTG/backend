class UTXO {
  txid: string;
  vout: number;
  value: string;
  height: number;
  confirmation: number;
  lockTime?: number;
}

export { UTXO };
