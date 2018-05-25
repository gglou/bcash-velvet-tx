const SPVNode = require('bcash/lib/node/spvnode');
const WalletDB = require('bcash/lib/wallet/walletdb');
const Script = require('bcash/lib/script/script');
const Output = require('bcash/lib/primitives/output');
const NodeClient = require('bcash/lib/wallet/nodeclient');
const Network = require('bcash/lib/protocol/network');
const InterlinkSPVNode = require('./interlink_spv_node');

const config = require('./config');

// Set network to testnet.
Network.set(config.network);

const options = {
  network: config.network,
  httpPort: 3000,
  db: 'leveldb',
  memory: false,
  location: process.env.HOME + '/.bcash/testnet/spvchain',
  logConsole: true,
  logLevel: 'none'
};

const node = new InterlinkSPVNode(options);

// Sync SPV node.
(async () => {
  await node.initialize();

  node.syncSPV();
  // spv.startSync();

  const wallet = await node.walletdb.get(config.wallet);

  console.log(await node.chain.getHash(1000000));

  // Add our address to the spv filter.
  // const address = await wallet.getAddress('default').toString();
  /* const balance = await wallet.getBalance('default');

  console.log(balance);

  // Watch these two address and update wallet.
  const account = await wallet.getAccount(config.account);

  console.log(account.receiveAddress());
  console.log(account.changeAddress());

  node.pool.watchAddress(account.receiveAddress());
  node.pool.watchAddress(account.changeAddress());

  // const tx = await wallet.send(options);

  // const tx = await wallet.createTX(options);

  /*await wallet.sign(tx);

  console.log(tx.toRaw().toString('hex'));*/ 

  // console.log(tx);
})().catch((err) => {
    console.error(err.stack);
    process.exit(1);
});

node.pool.on('tx', async(tx) => {
  console.log('New transaction detected ' + tx);
  await node.walletdb.addTX(tx);
});

node.on('block', async(block) => {
  // TODO: Update interlink.
  node.interlink.update(block.hash().toString(), spv.chain.height);
  console.log(block.hash().toString());
});

node.on('connect', async(entry, block) => {
    await node.walletdb.addBlock(entry, block.txs);
});