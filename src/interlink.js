const helpers = require('./helpers');

class Interlink {

	constructor() {
		this.prevLevels = new Map();
	}

	// May take a lot of time at the start.
	async initialize(chain) {
		if (chain.height == 0) {
			return;
		}
		return;
	}

	update(blockhash, height) {
		let level = helpers.tailingZeros(blockHash);
		console.log(level);
		this.prevLevels[level] = {hash: blockHash, height: height};
	}

	// Construct a Merkle tree. See block.js or abstractblock.js to do it.
	/*
	hash() {
	}
	*/
}

module.exports = Interlink;