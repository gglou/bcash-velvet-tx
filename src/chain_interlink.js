const assert = require('assert');
const config = require('./config');
const merkle = require('bcrypto/lib/merkle');
const hash256 = require('bcrypto/lib/hash256');

class ChainInterlink {

	constructor() {
		// field for the genesis block?
		this.interlink = new Map();
		this.hashInterlink = new Map();
	}

	// May take a lot of time at the start.
	async initialize(chain) {
		for (var i = 0; i <= chain.height; i++) {
			let hash = await chain.getHash(i);
			this.update(hash, i);
		}
	}

	update(blockHash, height) {
		if (typeof blockHash === 'string') {
			blockHash = Buffer.from(blockHash, 'hex');
		}

		// 256-bits.
		// assert(blockHash.length == 64);

		const level = this.computeLevel(blockHash.toString('hex'));
		const leaves = [];

		// Genesis block does not have interlink.
		if (height != 0) {
			for (var i = level; i >= Math.max(level - config.level, 0); i--) {
				// console.log('Hash pushed to merkle tree:' + this.interlink[i].hash);
				leaves.push(this.interlink[i].hash);
			}

			const [merkleRoot, malleated] = merkle.createRoot(hash256, leaves);

			this.hashInterlink[blockHash] = merkleRoot;
		}

		// Genesis block level is infinite (i.e 256).
		let levelToUpdate = (height === 0) ? 256 : level;

		// Update for the next block.
		for (var lvl = 0; lvl <= levelToUpdate; lvl++) {
			this.interlink[lvl] = {hash: blockHash, height: height};
		}
	}

	getInterlinkHash(blockHash) {
		// assert(this.hashInterlink[blockHash] !== undefined);
		return this.hashInterlink[blockHash];
	}

		// Computes the level of hash (i.e number of trailing zeros) of a big-endian
		// hexadecimal hash.
	computeLevel(hexString) {
		var zeros = 0;
		for (var i = hexString.length - 1; i >= 0; i--) {
			var ch = hexString.charAt(i);
			if (hexString.charAt(i) == '0') {
				zeros += 4;
			} else {
				var num = parseInt(ch, 16);
				if ((num % 8) == 0) return zeros + 3;
				if ((num % 4) == 0) return zeros + 2;
				if ((num % 2) == 0) return zeros + 1;
				return zeros;
			}
		}
		return zeros;
	}
}

module.exports = ChainInterlink;