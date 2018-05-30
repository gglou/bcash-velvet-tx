const VelvetProver = require('../src/velvet_prover');
const InterlinkSPVNode = require('../src/interlink_spv_node');
const Script = require('bcash/lib/script/script');
const Output = require('bcash/lib/primitives/output');
const NodeClient = require('bcash/lib/wallet/nodeclient');
const WalletDB = require('bcash/lib/wallet/walletdb');

var testHelpers = {

  getVelvetProver: async () => {
    // Do we need a passphrase?
    const prover = new VelvetProver({
      network: "regtest",
      httpPort: 48448,
      loglevel: 'none',
      logConsole: true,
      listen: true,
      bip37: true,
    });

    await prover.initialize();

    prover.startSync();

    return prover;
  },

  getInterlinkSPVNode: async () => {
    const spv = new InterlinkSPVNode({
      network: "regtest",
      httpPort: 48445,
      loglevel: 'none',
      logConsole: true,
      nodes: ["127.0.0.1:48448"]
    });

    await spv.initialize();

    spv.syncSPV();

    return spv;
  },

  getWalletDB: async (node) => {
    var walletDB = new WalletDB({
      network: "regtest",
      db: "memory",
      client: new NodeClient(node)
    });

    await walletDB.open();
    await walletDB.connect();

    return walletDB;
  },


  mineBlock: async (node, rewardAddress) => {
    var block = await node.miner.mineBlock(node.chain.tip, rewardAddress);
    await node.chain.add(block);
    // node.chain.tip does not contain all the properties we want,
    // so we need to fetch it:
    return node.getBlock(node.chain.tip.hash);
  },

  sendNullDataTransaction: async(node, walletId = 'primary') => {
    const wallet = await this.walletdb.get(walletId);

    const rate = 10000;
    const script = Script.fromNulldata(hashInterlink);
    const output = Output.fromScript(script, 0);

    const options = {
      rate: rate,
      outputs: [output],
    };

    const tx = await wallet.send(options);

    return tx;
  },

  getPrimaryWallet: async (node) => {
    return node.walletdb.get('primary');
  },

  delay: async (milliseconds) => {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, milliseconds);
    });
  }
};


class NodeWatcher {
  constructor(node) {
    this.txCount = 0;
    this.blockCount = 0;
    this.node = node;
    this.node.on("tx", this.onTX.bind(this));
    this.node.on("block", this.onBlock.bind(this));
  }

  onTX() {
    this.txCount++;
  }

  onBlock() {
    this.blockCount++;
  }

  async waitForBlock(initialCount) {
    if (initialCount === undefined) initialCount = this.blockCount;
    await new Promise((resolve, reject) => {
      var check = (() => {
        if (this.blockCount > initialCount) resolve();
        else setTimeout(check, 100);
      }).bind(this);

      check();
    });
  }

  async waitForTX(initialCount) {
    if (initialCount === undefined) initialCount = this.txCount;
    await new Promise((resolve, reject) => {
      var check = (() => {
        if (this.txCount > initialCount) resolve();
        else setTimeout(check, 100);
      }).bind(this);
      check();
    });
  }
}

testHelpers.NodeWatcher = NodeWatcher;

module.exports = testHelpers;