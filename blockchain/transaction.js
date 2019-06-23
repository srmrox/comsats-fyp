const uuid = require('uuid/v1');
const { verifySignature } = require('../util');

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
        const {input: {seller, signature}, outputMap} = transaction;     // so it gets to be destructured into input/output and input gets further destructured
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
        if(proofBlock) {
            let ownerFlag = false;
            for (let transaction of proofBlock.data) {
                if(transaction.outputMap[property] === seller) {
                    ownerFlag = true;
                }
            }

            if (ownerFlag == false){
                console.error('Seller is not owner of selected property');
                return false;
            }
        }

        return true;
    }

    update({ seller, buyer, property, blockchain }){
        const proofBlock = blockchain.locateOwner(property);
        
        if (proofBlock){
            let ownerFlag = false;
            for (let transaction of proofBlock.data) {
                if(transaction.outputMap[property] === this.publicKey) {
                    ownerFlag = true;
                }
            }

            if(ownerFlag == false) {
                throw new Error('Seller is not owner of selected property');
            }
        }

        // either proofBlock does not exist, i.e. there is no record of ownership of property
        // or proofBlock exists and ownerFlag was true
        this.outputMap[property] = buyer;
        this.input = this.createInput({ seller, proof: !proofBlock ? undefined : proofBlock.hash, outputMap: this.outputMap });
    }
}

module.exports = Transaction;