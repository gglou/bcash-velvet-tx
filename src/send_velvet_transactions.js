const SPVNode = require('bcash/lib/node/spvnode');
const WalletDB = require('bcash/lib/wallet/walletdb');
const NodeClient = require('bcash/lib/wallet/nodeclient');
const Network = require('bcash/lib/protocol/network');
const Script = require('bcash/lib/script/script');
const Output = require('bcash/lib/primitives/output');
const InterlinkSPVNode = require('./interlink_spv_node');
const NodeClient = require('bcash/lib/wallet/nodeclient');

const config = require('./config');

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

  // node.syncSPV();

  const wallet = await node.walletdb.get(config.wallet);

  const account = await wallet.getAccount(config.account);

  const rate=config.rate;
  const script = Script.fromNulldata(Buffer.from("Hello word"));
  const output = Output.fromScript(script, 0);

  const options = {
    rate: rate,
    outputs: [output],
  };

  const tx = await wallet.createTX(options);

  console.log(tx);
  console.log(tx.outputs[0].getType());
  console.log(tx.outputs[0].script.isNulldata());
  console.log(tx.outputs[0].script.getData(1).toString());

  node.pool.watchAddress(account.receiveAddress());
  node.pool.watchAddress(account.changeAddress());

})().catch((err) => {
    console.error(err.stack);
    process.exit(1);
});