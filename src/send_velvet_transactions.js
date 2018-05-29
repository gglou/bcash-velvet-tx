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