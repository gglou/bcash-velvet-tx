const SPVNode = require('bcash/lib/node/spvnode');
const WalletPlugin = require('bcash/lib/wallet/plugin');
const ChainInterlink = require('./chain_interlink');
const Script = require('bcash/lib/script/script');
const Output = require('bcash/lib/primitives/output');
const config = require('./config');

class InterlinkSPVNode extends SPVNode {

	constructor(options) {
		super(options);
		this.use(WalletPlugin);
		this.interlink = new ChainInterlink();
		// For convenience.
		this.walletdb = this.require('walletdb').wdb;
	}

	async initialize() {
		await this.open();
		await this.connect();

		// TODO: Declare them in the object? 
		this.pool.on('tx', async(tx) => {
      console.log('New transaction detected ' + tx);
      await this.walletdb.addTX(tx);
    });

    this.on('block', async(block) => {
      // TODO: Update interlink.
      console.log('New block ' + this.chain.height);
      // console.log(block.hash());
      // console.log('New block' + block.hash());
      this.interlink.update(block.hash(), this.chain.height);

      if (this.chain.getProgress() === 1) {
        const tx = await this.sendInterlinkTX();
        console.log(tx.hash().toString('hex'));
      }
    });

    this.on('connect', async(entry, block) => {
      if (block.txs.length > 0) {
        await this.walletdb.addBlock(entry, block.txs);
      }
    });
	}

	async teardown() {
		await this.disconnect();
		await this.close();
	}

	async syncSPV() {
		await this.interlink.initialize(this.chain);
		this.startSync();
	}

	// Warning. The data will be correct only for the current block.
	async sendInterlinkTX() {
		const wallet = await this.walletdb.get(config.wallet);

		const hashInterlink = this.interlink.getInterlinkHash(
			Buffer.from(this.chain.tip.hash, 'hex'));

		const rate=config.rate;
		const script = Script.fromNulldata(hashInterlink);
		const output = Output.fromScript(script, 0);

		const options = {
			rate: rate,
			outputs: [output],
		};

  	// const tx = await wallet.send(options);
  	const tx = await wallet.createTX(options);

  	return tx;
	}
}

module.exports = InterlinkSPVNode;