class TransactionMiner {
    constructor({ blockchain, transactionPool, seller, pubsub }){
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.seller = seller;
        this.pubsub = pubsub;
    }

    mineTransactions(blockchain) {
        const validTransactions = this.transactionPool.validTransactions(blockchain);     // get list of valid transactions
        this.blockchain.addBlock({ data: validTransactions });                  // add these transactions to the blockchain
        this.pubsub.broadcastChain();
        this.transactionPool.clear();
    }
}

module.exports = TransactionMiner;