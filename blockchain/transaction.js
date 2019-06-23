const uuid = require('uuid/v1');
const { verifySignature } = require('../util');
const Blockchain = require('./index');
const Block = require('./block');

class Transaction {
    constructor({ seller, buyer, property, outputMap, input }) {
        this.id = uuid();
        this.outputMap = outputMap || this.createOutputMap({ buyer, property });
        this.input = input || this.createInput({seller, outputMap: this.outputMap});
    }

    createOutputMap({ buyer, property }) {
        const outputMap = {};

        outputMap[property] = buyer;    // this marks that buyer is now the owner of property - marked by the latest entry of property in the blockchain
               
        return outputMap;
    }

    createInput({ seller, proof, outputMap }){
        return {
            timestamp: Date.now(),
            proof,                                  // hash of proof block
            seller: seller.publicKey,
            signature: seller.sign(outputMap)
        };
    }

    static validTransaction(transaction, blockchain) {                          // we're getting a transaction objects directly as a parameter
        const {input: {seller, proof, signature}, outputMap} = transaction;     // so it gets to be destructured into input/output and input gets further destructured
        const property = Object.keys(outputMap)[0];

        // check that signature are valid
        if(!verifySignature({publicKey:seller, data:outputMap, signature})){
            console.error(`Invalid signature from ${seller}`);
            return false;
        }
        
        const proofBlock = blockchain.locateOwner(property);

        // if proof block could not be found, that means property does not have any owner
        //if(!proofBlock){
        //    console.error('Owner of property could not be located');
        //    return false;
        //}

        // if there is no record of seller as being the buyer, he is not the owner
        if(proofBlock !== undefined && proofBlock !== null) {
            if (proofBlock.outputMap[property] !== seller.publicKey){
                console.error('Seller is not owner of selected property');
                return false;
            }
        }

        return true;
    }

    update({ seller, buyer, property, blockchain }){
        const proofBlock = blockchain.locateOwner(property);
        
        //if (proofBlock){
            if(proofBlock.outputMap[property] === seller.publicKey) {
                this.outputMap[property] = buyer;
                this.input = this.createInput({ seller, proof: proofBlock.hash, outputMap: this.outputMap });
            } else {
                throw new Error('Seller is not owner of selected property');
            }
        //} else {
        //      throw new Error('Owner of property could not be located');
        //}
    }
}

module.exports = Transaction;