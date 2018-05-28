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

  	const tx = await wallet.send(options);

  	return tx;
	}

}

module.exports = InterlinkSPVNode;