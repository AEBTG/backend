let explorerURL: string = ""

if (process.env.explorerURL) {
    explorerURL = process.env.explorerURL;
} else {
    explorerURL = 'https://testnet.aeternal.io/';
}


export {explorerURL}