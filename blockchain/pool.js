const Transaction = require('./transaction');

class TransactionPool {
    constructor() {
        this.transactionMap = {};
    }

    setTransaction(transaction) {
        this.transactionMap[transaction.id] = transaction;
    }

    
    setMap(transactionMap) {
        this.transactionMap = transactionMap;
    }

    existingTransaction({ property }) {
        const transactions = Object.values(this.transactionMap);
        return transactions.find(transaction => Object.keys(transaction.outputMap)[0] == property);   // return all transactions where property exists in output map
    }

    validTransactions(blockchain){
        // removes all transactions that are not valid from the array of object values returned
        return Object.values(this.transactionMap).filter(
            transaction => Transaction.validTransaction(transaction, blockchain)
        );
    }

    clear() {
        this.transactionMap = {};
    }

    clearBlockchainTransactions({ chain }) {        // only clear transactions from the pool that have already been added to the blockchain
        for (let i = 1; i < chain.length; i++) {    // i = 1 skips genesis block
            const block = chain[i];                 // for each block in the blockchain
            for (let transaction of block.data) {               // find each transaction id
                if (this.transactionMap[transaction.id]) {      // if local transcation map has value at the provided id
                    delete this.transactionMap[transaction.id]; // delete it
                }
            }
        }
    }
}

module.exports = TransactionPool;