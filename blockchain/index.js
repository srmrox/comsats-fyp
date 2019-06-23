const Block = require('./block');
const Transaction = require('./transaction');
const { cryptoHash } = require('../util');

class Blockchain {
    constructor() {
        this.chain = [Block.genesis()];
    }

    addBlock({ data }) {
        const newBlock = Block.mineBlock({
            lastBlock: this.chain[this.chain.length-1],
            data
        });

        this.chain.push(newBlock);
    }

    locateOwner(property) {
        for (let i = this.chain.length - 1; i > 0; i--) {
            const block = this.chain[i];
            for (let transaction of block.data) {
                if (transaction.outputMap[property]) {
                    return block;
                }
            }
        }

        return null;
    }

    listProperties(entity) {
        let properties = [];
        
        for (let i = this.chain.length - 1; i > 0; i--) {
            const block = this.chain[i];
            for (let transaction of block.data) {
                const property = Object.keys(transaction.outputMap)[0]
                if (transaction.outputMap[property] == entity.publicKey) {
                    // at this stage, we've found that this property was owned by the entity at some point
                    // now we have to see if the property is owned by the entity now by reading the latest block with ownership data
                    const proofBlock = this.locateOwner(property);
        
                    if (proofBlock){
                        let ownerFlag = false;
                        for (let transaction of proofBlock.data) {
                            if(transaction.outputMap[property] === entity.publicKey) {
                                ownerFlag = true;
                            }
                        }

                        if(ownerFlag == true) {
                            properties.push(property);
                        }
                    }
                }
            }
        }

        return properties;
    }

    static isValidChain(chain) {

        // CHECK FOR GENESIS BLOCK
        // since we only want to match the contents of the block in our
        // blockchain with the genesis data, we use stringify to overcome
        // JavaScript's strict === matching
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
            return false;
        }

        for (let i = 1; i < chain.length; i++) {
            const {timestamp, lastHash, hash, nonce, difficulty, data } = chain[i];
            const actualLastHash = chain[i-1].hash;
            const lastDifficulty = chain[i-1].difficulty;

            // CHECK LAST HASH OF EACH BLOCK
            if (lastHash !== actualLastHash) {
                return false;
            }

            // CHECK HASH OF EACH BLOCK
            const validatedHash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
            if (hash !== validatedHash) {
                return false;
            }

            // CHECK FOR DIFFICULTY JUMP
            if (Math.abs(lastDifficulty - difficulty) > 1) {
                return false;
            }
        }

        return true;
    }

    replaceChain (chain, validateTransactions, onSuccess) {

        // CHECK LENGTH OF COMPARISON CHAIN
        if (chain.length <= this.chain.length) {
            console.error('Incoming chain must be longer!')
            return;
        }

        // CHECK VALIDITY OF COMPARISON CHAIN
        if (!Blockchain.isValidChain(chain)) {
            console.error('Incoming chain must be valid!')
            return;
        }

        if(validateTransactions && !this.validTransactionData({ chain })) {     // check if all data blocks in the blockchain are valid transactions
            console.error('Incoming chain has invalid data');
            return;
        }

        if (onSuccess) onSuccess();
        console.log('Replacing chain with:', chain);
        this.chain = chain;
    }

    validTransactionData({ chain }) {
        // for each block in the chain
        for (let i = 1; i < chain.length; i++){
            const block = chain[i];
            const transactionSet = new Set();
            
            // for each transaction in the block
            for (let transaction of block.data) {
                if (!Transaction.validTransaction(transaction, this)){        // checks if transaction is invalid
                    console.error('Invalid transaction');
                    return false;
                }

                if (transactionSet.has(transaction)) {                  // checks if a transaction appears more than once in the block
                    console.error('Duplicate transaction in block');
                    return false;
                } else {
                    transactionSet.add(transaction);
                }
            }
        }

        return true;
    }
}

module.exports = Blockchain;