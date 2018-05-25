const SPVNode = require('bcash/lib/node/spvnode');
const WalletPlugin = require('bcash/lib/wallet/plugin');
const Interlink = require('./interlink');
const Script = require('bcash/lib/script/script');
const Output = require('bcash/lib/primitives/output');

class InterlinkSPVNode extends SPVNode {
	// interlink : Interlink

	constructor(options) {
		super(options);
		this.use(WalletPlugin);
		this.interlink = new Interlink();
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
		const wallet = await node.walletdb.get(config.wallet);


	}

}

module.exports = InterlinkSPVNode;