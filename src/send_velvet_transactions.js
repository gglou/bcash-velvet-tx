const SPVNode = require('bcash/lib/node/spvnode');
const WalletDB = require('bcash/lib/wallet/walletdb');
const NodeClient = require('bcash/lib/wallet/nodeclient');
const Network = require('bcash/lib/protocol/network');
const InterlinkSPVNode = require('./interlink_spv_node');

const config = require('./config');

const options = {
  network: config.network,
  httpPort: 3000,
  db: 'leveldb',
  memory: false,
  location: process.env.HOME + '/.bcash/testnet/spvchain',
  logConsole: true,
  logLevel: 'info'
};

const node = new InterlinkSPVNode(options);

// Sync SPV node.
(async () => {
  await node.initialize();

  node.syncSPV();

  const wallet = await node.walletdb.get(config.wallet);

  const account = await wallet.getAccount(config.account);

  node.pool.watchAddress(account.receiveAddress());
  node.pool.watchAddress(account.changeAddress());

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
  console.log('New block ' + node.chain.height);
  // console.log('New block' + block.hash());
  node.interlink.update(block.hash(), node.chain.height);

  if (node.chain.getProgress() === 1) {
    const tx = await node.sendInterlinkTX();
    console.log(tx.hash().toString('hex'));
  }
});

node.on('connect', async(entry, block) => {
  if (block.txs.length > 0) {
    await node.walletdb.addBlock(entry, block.txs);
  }
});