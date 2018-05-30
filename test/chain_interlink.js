const ChainInterlink = require('../src/chain_interlink');
const TestHelpers = require('./helpers.js');
const sinon = require("sinon");
const should = require("should");
const assert = require("assert");
const fixtures = require("./fixtures");

describe("ChainInterlink", () => {
	var interlink = null;
	// Buffer 
	var genesisBufHash = Buffer.from(fixtures.blockHeaders.genesis, 'hex');
	var firstBufHash = Buffer.from(fixtures.blockHeaders.firstBlock, 'hex');
	var secBufHash = Buffer.from(fixtures.blockHeaders.secondBlock, 'hex');

	beforeEach("Initialize common values", () => {
		interlink = new ChainInterlink();
  });

  describe("Superblocks", () => {

	  it("Computes correctly the levels of superblocks", () => {
		  should(interlink.computeLevel(fixtures.blockHeaders.genesis)).equal(36);
		  should(interlink.computeLevel(fixtures.blockHeaders.firstBlock)).equal(32);
		  should(interlink.computeLevel(fixtures.blockHeaders.secondBlock)).equal(33);
	  });
	});

	describe("Current Interlink", () => {
		it("Produces undefined interlink for genesis", () => {
			interlink.update(fixtures.blockHeaders.genesis, 0);

			should(interlink.getInterlinkHash(genesisBufHash)).equal(undefined);
		});

		it("Populates all the interlink with the genesis hash", () => {
			interlink.update(fixtures.blockHeaders.genesis, 0);

			var allSame = true;
			for (var i = 0; i <= 256; i++) {
				allSame = allSame && 
					(interlink.interlink[i].hash.equals(genesisBufHash));
			}

			should(allSame).equal(true);
		});

		it("Updates correctly the levels", () => {
			interlink.update(fixtures.blockHeaders.genesis, 0);
			interlink.update(fixtures.blockHeaders.firstBlock, 1);

			should(interlink.interlink[/* level= */ 32].height).equal(1);
			should(interlink.interlink[/* level= */ 36].height).equal(0);

			interlink.update(fixtures.blockHeaders.secondBlock, 2);

			should(interlink.interlink[/* level= */ 33].height).equal(2);
		});
	});

	describe("Chain Interlink", () => {

		it("Builds correctly the chain link", () => {
		  interlink.update(fixtures.blockHeaders.genesis, 0);
		  interlink.update(fixtures.blockHeaders.firstBlock, 1);
		  interlink.update(fixtures.blockHeaders.secondBlock, 2, /*Merkle size*/ 2);

		  should(interlink.chainInterlink[secBufHash][/* level */ 32].equals(
			  firstBufHash));

		  should(interlink.chainInterlink[secBufHash][/* level */ 33].equals(
			  genesisBufHash));

		  should(interlink.chainInterlink[secBufHash][/* level */ 256].equals(
			  genesisBufHash));
		});
	});

	describe("Hash Interlink", () => {
		
		it("Is 32 bytes", () => {
			interlink.update(fixtures.blockHeaders.genesis, 0);
		  interlink.update(fixtures.blockHeaders.firstBlock, 1);

		  should(interlink.hashInterlink[firstBufHash].length).equals(32);
		});
	});
});