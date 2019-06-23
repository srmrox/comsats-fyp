const Blockchain = require('./index');
const Block = require('./block');
const { cryptoHash } = require('../util');
const Transaction = require('./transaction');

describe('Blockchain', () => {
    let blockchain, originalChain, newBlockchain, errMock;

    // fresh copy of a blockchain for each test
    beforeEach(() => {
        blockchain = new Blockchain();
        originalChain = blockchain.chain;
        newBlockchain = new Blockchain();

        errMock = jest.fn();
        global.console.error = errMock;
    });

    it('contains a `chain` Array instance', () => {
        expect(blockchain.chain instanceof Array).toBe(true);
    });

    it('starts with a genesis block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    it('allows adding a new block', () => {
        const newData = 'test data';
        blockchain.addBlock({ data: newData });

        expect(blockchain.chain[blockchain.chain.length-1].data).toEqual(newData);
    });

    describe('isValidChain()', () => {
        describe('when the chain does not start with the genesis block', () => {
            it('returns false', () => {
                blockchain.chain[0] = { data: 'tampered genesis block'};

                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
        });

        describe('when the chain starts with the genesis block and has multiple blocks', () => {

            // since we are testing with multiple blocks, these have to be added in each case
            beforeEach(() => {
                blockchain.addBlock({ data: 'Shahrukh' });
                blockchain.addBlock({ data: 'Malik' });
            });

            describe('and a lastHash reference has changed', () => {
                it('returns false', () => {
                    blockchain.chain[2].lastHash = 'not a hash';

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and the chain contain a block with an invalid field', () => {
                it('returns false', () => {
                    blockchain.chain[2].data = 'not the right data';

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and the chain contains a block with a jumped difficulty', () =>{
                it('returns false', () => {
                    const lastBlock = blockchain.chain[blockchain.chain.length - 1];
                    const lastHash = lastBlock.hash;
                    const timestamp = Date.now();
                    const nonce = 0;
                    const data = [];
                    const difficulty = lastBlock.difficulty - 3;

                    const hash = cryptoHash(timestamp, lastHash, difficulty, nonce, data);

                    const badBlock = new Block({timestamp, lastHash, hash, nonce, difficulty,data});
                    blockchain.chain.push(badBlock);

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and the chain does not contain any invalid blocks', () => {
                it('returns true', () => {
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
                });
            });
        });
    });


    describe('replaceChain()', () => {

        let logMock;

        // quites down the console output from the replaceChain function
        beforeEach(() => {
            logMock = jest.fn();
            global.console.log = logMock;
        });

        describe('when the new chain is not longer', () => {

            beforeEach(() => {
                // add new property to genesis block so that length of blockhain
                // does not increase but it's not the same chain
                newBlockchain.chain[0] = { new: 'chain' };

                blockchain.replaceChain(newBlockchain.chain);
            });

            it('does not replace the chain', () => {
                expect(blockchain.chain).toEqual(originalChain);
            });

            it('logs an error', () => {
                expect(errMock).toHaveBeenCalled();
            });
        });

        describe('when the new chain is longer', () => {

            beforeEach(() => {
                newBlockchain.addBlock({ data: 'Partners' });
                newBlockchain.addBlock({ data: 'In' });
                newBlockchain.addBlock({ data: 'Growth' });
            });

            describe('and the new chain is invalid', () => {

                beforeEach(() => {
                    newBlockchain.chain[2].hash = 'wrong hash';
                    blockchain.replaceChain(newBlockchain.chain);
                });

                it('does not replace the chain', () => {
                    expect(blockchain.chain).toEqual(originalChain);
                });

                it('logs an error', () => {
                    expect(errMock).toHaveBeenCalled();
                });
            });

            describe('and the new chain is valid', () => {

                beforeEach(() => {
                    blockchain.replaceChain(newBlockchain.chain);
                });

                it('replaces the chain', () => {                   
                    expect(blockchain.chain).toEqual(newBlockchain.chain);
                });

                it('logs chain replacement', () => {
                    expect(logMock).toHaveBeenCalled();
                });
            });
        });

        describe('`validateTransactions` flag is true', () => {
            it('calls `validTransactionData()', () => {
                const validTransactionDataMock = jest.fn();
                blockchain.validTransactionData = validTransactionDataMock;

                newBlockchain.addBlock({ data: 'dummy data' });
                blockchain.replaceChain(newBlockchain.chain, true);

                expect(validTransactionDataMock).toHaveBeenCalled();
            });
        });
    });

    describe('validTransactionData()', () => {
        let transaction, rewardTransaction, wallet;

        beforeEach(() => {
            transaction = wallet.createTransaction({ recipient: 'random-person', amount: 65 });
            rewardTransaction = Transaction.rewardTransaction({ minerWallet: wallet });
        });

        describe('the transaction data is valid', () => {
            it('returns true', () => {
                newBlockchain.addBlock({ data: [transaction, rewardTransaction] });
                expect(blockchain.validTransactionData({ chain: newBlockchain.chain })).toBe(true);
                expect(errMock).not.toHaveBeenCalled();
            });
        });

        describe('the transaction data has multiple rewards', () => {
            it('returns false and logs an error', () => {
                newBlockchain.addBlock({ data: [transaction, rewardTransaction, rewardTransaction ]});
                expect(blockchain.validTransactionData({ chain: newBlockchain.chain })).toBe(false);
                expect(errMock).toHaveBeenCalled();
            });
        });

        describe('the transaction data has at least one malformed output map', () => {
            describe('and transaction is not a reward transaction', () => {
                it('returns false and logs an error', () => {
                    transaction.outputMap[wallet.publicKey] = 999999;
                    newBlockchain.addBlock({ data: [transaction, rewardTransaction] });
                    expect(blockchain.validTransactionData({ chain: newBlockchain.chain })).toBe(false);
                    expect(errMock).toHaveBeenCalled();
                });
            });

            describe('and transaction is a reward transaction', () => {
                it('returns false and logs an error', () => {
                    rewardTransaction.outputMap[wallet.publicKey] = 999999;
                    newBlockchain.addBlock({ data: [transaction, rewardTransaction ]});
                    expect(blockchain.validTransactionData({ chain: newBlockchain.chain })).toBe(false);
                    expect(errMock).toHaveBeenCalled();
                });
            });
        });
    
        describe('the transaction data has at least one malformed input', () => {
            it('returns false and logs an error', () => {
                wallet.balance = 9000;

                const badOutputMap = {
                    [wallet.publicKey]: 8900,
                    recipient: 100
                };

                const badTransaction = {
                    input: {
                        timestamp: Date.now(),
                        amount: wallet.balance,
                        address: wallet.publicKey,
                        signature: wallet.sign(badOutputMap)
                    },
                    outputMap: badOutputMap
                }

                newBlockchain.addBlock({ data: [badTransaction, rewardTransaction ]});
                
                expect(blockchain.validTransactionData({ chain: newBlockchain.chain })).toBe(false);
                expect(errMock).toHaveBeenCalled();
            });
        });

        describe('the transaction contains multiple identical transactions', () => {
            it('returns false and logs an error', () => {
                newBlockchain.addBlock({
                    data: [transaction, transaction, transaction, rewardTransaction]
                });
                expect(blockchain.validTransactionData({ chain: newBlockchain.chain })).toBe(false);
                expect(errMock).toHaveBeenCalled();
            });
        });
    });
});