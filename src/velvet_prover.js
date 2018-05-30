const FullNode = require('bcash/lib/node/fullnode');
const WalletPlugin = require('bcash/lib/wallet/plugin');
const ChainInterlink = require('./chain_interlink');
const Script = require('bcash/lib/script/script');
const Output = require('bcash/lib/primitives/output');
const config = require('./config');

class VelvetProver extends FullNode {

	constructor(options) {
		super(options);
		// Do we need a wallet for the full node? Probably not.
		// this.use(WalletPlugin);
		this.realInterlink = new ChainInterlink();
		this.interlink = new ChainInterlink();
		// Set it this way? Hmm..
		// this.walletdb = this.require('walletdb').wdb;
	}

	async initialize() {
		await this.open();
		await this.connect();

		// Find transactions with OP_RETURN and try them as interlinks.
		// The format needs to be just a 32 byte string.
		// TODO: On connect or in on block? Need to decide.
		this.on('connect', async(entry, block) => {
			console.log('Hello ' + block.txs.length);
			for (let tx of block.txs) {
				for (let output of tx.outputs) {
					// Check if the output is nulldata.
					if (output.getType() === 'nulldata' && 
						output.script.getData(1).length === 32) {
							console.log('OP_RETURN transaction detected with 32 bytes stored');
						// TODO: Update interlink.
					}
				}
			}
    });
	}

	async teardown() {
		await this.disconnect();
		await this.close();
	}

	// TODO: Construct NIPoPoW velvet proof.
	async prove(blockById) {
	}
}

module.exports = VelvetProver;