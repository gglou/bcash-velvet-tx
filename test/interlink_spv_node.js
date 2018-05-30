const InterlinkSPVNode = require('../src/interlink_spv_node.js');
const helpers = require('./helpers');
const sinon = require("sinon");
const should = require("should");
const assert = require("assert");
const fixtures = require("./fixtures");
const consensus = require("bcash/lib/protocol/consensus");
const Network = require('bcash/lib/protocol/network');

describe("Interlink spv node", () => {
	var spvNode = null;
	var miner = null;
	var account = null;
	var wallet = null;
	var address = null;

	beforeEach("Initialize common values", async () => {
		miner = await helpers.getVelvetProver();
		spvNode = await helpers.getInterlinkSPVNode();
		spvNode.walletdb = spvNode.require('walletdb').wdb;
		watcher = new helpers.NodeWatcher(miner);
		wallet = await spvNode.walletdb.get('primary');
		account = await wallet.getAccount('default');
		address = account.receiveAddress();
  });

  afterEach("close node", async () => {
  	await miner.stopSync();
  	await miner.teardown();
  	await spvNode.stopSync();
  	await spvNode.teardown();
  });

	it("Does not send a transaction for genesis block", async ()=> {
		// Make the coin spendable.
    consensus.COINBASE_MATURITY = 0;

		// Doesn't send a transaction because of no funds.
		const firstBlock = await helpers.mineBlock(miner, address);

		// TODO: Why do we need the delay? It does update the balance correctly..
		await helpers.delay(500);

		console.log(await wallet.getBalance());
		console.log(account.receiveAddress());

		should(firstBlock.txs.length).equals(1);

		// Mine second block.
		const secondBlock = await helpers.mineBlock(miner, address);

		// Should receive a transaction.
		// At the moment we can see in the logs that it is created, but for some reason
		// the miner doesn't see it.
		// await watcher.waitForTX(); This gives test out of time.

		await helpers.delay(300);
		console.log(await wallet.getBalance());

		should(secondBlock.txs.length).equals(1);

		const thirdBlock = await helpers.mineBlock(miner, address);

		await helpers.delay(300);
		console.log(await wallet.getBalance());

		// We should expect the transaction to be mined and therefore the size 
		// of the transactions to be equal to 2.
		should(thirdBlock.txs.length).equals(2);
	});
});