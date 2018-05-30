const assert = require('assert');
const config = require('./config');
const merkle = require('bcrypto/lib/merkle');
const hash256 = require('bcrypto/lib/hash256');
const util = require('bcash/lib/utils/util');

class ChainInterlink {

	constructor() {
		// field for the genesis block?
		this.interlink = new Map();
		this.chainInterlink = new Map();
		this.hashInterlink = new Map();
	}

	// May take a lot of time at the start.
	async initialize(chain) {
		for (var i = 0; i <= chain.height; i++) {
			let hash = await chain.getHash(i);
			this.update(hash, i);
		}
	}

	update(blockHash, height, merkleSize = config.level) {
		if (typeof blockHash === 'string') {
			blockHash = Buffer.from(blockHash, 'hex');
		}

		const level = this.computeLevel(blockHash.toString('hex'));
		const leaves = [];

		// Genesis block does not have interlink.
		if (height != 0) {
			this.chainInterlink[blockHash] = new Map();
			for (var i = Math.max(level - merkleSize, 0); i <= level; i++) {
				leaves.push(this.interlink[i].hash);
				this.chainInterlink[blockHash][i] = this.interlink[i].hash;
			}
			/*Genesis is of infinite level and hence a pointer to it is included in 
			every block at the first available index within the 
			interlink data structure*/
			leaves.push(this.genesisHash);
			this.chainInterlink[blockHash][256] = this.genesisHash;

			const [merkleRoot, malleated] = merkle.createRoot(hash256, leaves);

			this.hashInterlink[blockHash] = merkleRoot;
		} else {
			this.genesisHash = blockHash;
		}

		// Genesis block level is infinite (i.e 256).
		let levelToUpdate = (height === 0) ? 256 : level;

		// Update for the next block.
		for (var lvl = 0; lvl <= levelToUpdate; lvl++) {
			// TODO: Is the height really needed? Good for debugging purposes sure.
			this.interlink[lvl] = {hash: blockHash, height: height};
		}
	}

	getInterlinkHash(blockHash) {
		// assert(this.hashInterlink[blockHash] !== undefined);
		return this.hashInterlink[blockHash];
	}

		// Computes the level of hash (i.e number of trailing zeros) of a 
		// little-endian hexadecimal hash.
	computeLevel(hexString) {
		let littleEndianStr = util.revHex(hexString);
		let zeros = 0;

		for (var i = 0; i < littleEndianStr.length; i++) {
			var ch = hexString.charAt(i);
			if (littleEndianStr.charAt(i) == '0') {
				zeros += 4;
			} else {
				var num = parseInt(ch, 16);
				if (num > 7) return zeros;
				if (num > 3) return zeros + 1;
				return (num > 1 ? zeros + 2 : zeros + 3);
			}
		}
		return zeros;
	}
}

module.exports = ChainInterlink;