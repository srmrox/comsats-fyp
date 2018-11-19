const sha256 = require('sha256');           // for hashing

// the block class; since we don't have consensus mechanism yet, nonce is not included
class Block {

    // this gets called every time a new block is made (that's what a constructor function is)
    constructor(index, timestamp, data, prevHash) {
        this.index = index;             //   the serial number of the block; TODO this should be a hash too
        this.timestamp = timestamp;     //   time at which the block was created
        this.data = data;               //   the data stored in the block; TODO possibility to have more than one data?
        this.prevHash = prevHash;       //   previous hash, needed to keep the blockchain going
        this.thisHash = this.hash();         //   current hash
        this.nonce = 0;                 //   nonce for proof of work
    }

    // get hash for current block
    hash(){ 
        return sha256(this.index + this.timestamp + this.data + this.prevHash);
    }
}

// the blockchain class
class Blockchain {
    constructor(genesisNode){
        this.chain = [this.addGenesis];
        this.nodes = [+genesisNode];
        this.difficulty = 4;
        this.pendingTransaction = [];
    }

    addGenesis(){
        return new Block(0, Date.now(), 'Genesis Block', '0');
    }

    getLastBlock(){
        return this.chain[this.chain.length-1];
    }

    addBlock(data){
        this.chain.push(new Block(this.chain.length, Date.now(), data, this.getLastBlock().thisHash));
    }

    checkValidity(){
        for(let index = 1; index < blockchain.length - 1; index++){ // not using 0 as we won't check genesis block
            const thisBlock = this.chain[index];
            const prevBlock = this.chain[index - 1];
            if(thisBlock.thisHash !== thisBlock.hash()){
                return false;
            }
            else if (thisBlock.prevHash !== prevBlock.thisHash){
                return false;
            }
        }
    }

    createTransaction(transaction){
        this.pendingTransaction.push(transaction);
    }

    mineBlock(difficulty){
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
 
        console.log("BLOCK MINED: " + this.hash);
    }

    minePendingTransactions(miningRewardAddress){
        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);
 
        console.log('Block successfully mined!');
        this.chain.push(block);
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];
 
            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }
 
            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
 
        return true;
    }

    getOwnership(propertyAddress){
        var lastTransferHash = '';
        var lastTransferTo = '';

        for(const block of this.chain){
            for(const transaction of block.transaction){
                if(transaction.propertyAddress === propertyAddress){
                    lastTransferHash = transaction.thisHash;
                    lastTransferTo = transaction.toAddress;
                }
            }
        }

        return [lastTransferHash, lastTransferTo];
    }
}

module.exports = Blockchain;