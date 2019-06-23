const { ec, cryptoHash } = require('../util');
const Transaction = require('./transaction');

class Entity {
    constructor() {
        this.keyPair = ec.genKeyPair();
        this.publicKey = this.keyPair.getPublic().encode('hex');
    }

    sign(data) {
        return this.keyPair.sign(cryptoHash(data));
    }

    createTransaction({ buyer, property, blockchain }) {
        const proofBlock = blockchain.locateOwner(property);
        
        if (proofBlock){
            let ownerFlag = false;
            for (let transaction of proofBlock.data) {
                if(transaction.outputMap[property] === this.publicKey) {
                    ownerFlag = true;
                }
            }

            if(ownerFlag == true) {
                return new Transaction({ seller: this, buyer, property });
            } else {
                throw new Error('Seller is not owner of selected property');
            }
        } else {
            //throw new Error('Owner of property could not be located');
            // if no previous owner set, we can claim to be the owner
            // TODO: add verification system
            return new Transaction({ seller: this, buyer, property });
        }
    }
}

module.exports = Entity;