const helpers = require('./helpers');
const config = require('./config');
const merkle = require('bcrypto/lib/merkle');
const hash256 = require('bcrypto/lib/hash256');

class Interlink {

	constructor() {
		// field for the genesis block?
		this.prevLevels = new Map();
		this.hashInterlink = new Map();
	}

	// May take a lot of time at the start.
	async initialize(chain) {
		for (var i = 0; i <= chain.height; i++) {
			let hash = await chain.getHash(i);
			this.update(Buffer.from(hash, 'hex'), i);
		}
	}

	update(blockHash, height) {
		const level = helpers.trailingZeros(blockHash.toString('hex'));
		const leaves = [];

		// Genesis block does not have interlink.
		if (height != 0) {
			for (var i = level; i >= Math.max(level - config.level, 0); i--) {
				// console.log('Hash pushed to merkle tree:' + this.prevLevels[i].hash);
				leaves.push(this.prevLevels[i].hash);
			}

			const [merkleRoot, malleated] = merkle.createRoot(hash256, leaves);

			this.hashInterlink[blockHash] = merkleRoot;
		}

		// Genesis block level is infinite (i.e 256).
		let levelToUpdate = (height === 0) ? 256 : level;

		// Update for the next block.
		for (var lvl = 0; lvl <= levelToUpdate; lvl++) {
			this.prevLevels[lvl] = {hash: blockHash, height: height};
		}
	}

	getInterlinkHash(blockHash) {
		assert(this.hashInterlink[blockHash] !== undefined);
		return this.hashInterlink[blockHash];
	}

}

module.exports = Interlink;