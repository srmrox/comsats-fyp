// COMSATS FYP
// Blockchain in daily life

// includes
const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const path = require('path');
const Blockchain = require('./blockchain');
const PubSub = require('./blockchain/pubsub');
const TransactionPool = require('./blockchain/pool');
const Entity = require('./blockchain/entity');
const TransactionMiner = require('./blockchain/miner');

// global constants
const isDevelopment = process.env.ENV === 'development';
const REDIS_URL = isDevelopment ?
    'redis://127.0.0.1:6379' :
    'redis://h:pb4fe08fe2a49416dcdbae70becb94889fde7926b623129c30f824345a56b7a46@ec2-100-24-147-74.compute-1.amazonaws.com:17839';
const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = isDevelopment ?
`http://localhost:${DEFAULT_PORT}` :
'https://comsats-fyp.herokuapp.com';

// initializations
const app = express();
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const seller = new Entity();
const pubsub = new PubSub({ blockchain, transactionPool, redisUrl: REDIS_URL });
const transactionMiner = new TransactionMiner({ blockchain, transactionPool, seller, pubsub });

// initialize express:
app.use(bodyParser.json());                                     // to use body parser
app.use(express.static(path.join(__dirname, 'client/dist')));   // to expose current directory/client/dist as front-end

// end points
app.get('/api/blocks', (req, res) => {
    res.json(blockchain.chain);
});

app.post('/api/mine', (req, res) => {
    const { data } = req.body;
    blockchain.addBlock({ data });
    pubsub.broadcastChain();
    res.redirect('/api/blocks');
});

app.post('/api/transact', (req, res) => {
    const { buyer, property } = req.body;

    let transaction = transactionPool.existingTransaction({ property });

    try {
        if(transaction) {
            transaction.update({ seller, buyer, property, blockchain });
        } else {
            transaction = seller.createTransaction({buyer, property, blockchain});
        }
    } catch(error) {
        return res.status(400).json({ type: 'error', message: error.message });
    }
    
    transactionPool.setTransaction(transaction);
    pubsub.broadcastTransaction(transaction);
    res.json({ type: 'success', transaction });
});

app.get('/api/transaction-pool-map', (req, res) => {
    res.json(transactionPool.transactionMap);
});

app.get('/api/mine-transactions', (req, res) => {
    transactionMiner.mineTransactions(blockchain);
    res.redirect('/api/blocks');
});

app.get('/api/property-info', (req, res) => {
    const { property } = req.body;
    res.json({ owner: blockchain.locateOwner(property).data[0].outputMap[property] });
});

// ---- NO END POINT BEYOND THIS LINE ---- //
//app.get('*', (req, res) => {    // * = any end point not defined yet
//    res.sendFile(path.join(__dirname, 'client/dist/index.html',));
//});

const syncWithRootState = () => {
    request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (error, response, body) => {
        if(!error && response.statusCode === 200) {
            const rootChain = JSON.parse(body);
            console.log('Replacing chain on a sync with ', rootChain);
            blockchain.replaceChain(rootChain);
        }
    });

    request({ url: `${ROOT_NODE_ADDRESS}/api/transaction-pool-map` }, (error, response, body) => {
        if(!error && response.statusCode === 200) {
            const rootTransactionPoolMap = JSON.parse(body);
            console.log('Replacing transaction pool map on a sync with', rootTransactionPoolMap);
            transactionPool.setMap(rootTransactionPoolMap);
        }
    });
}

let PEER_PORT;

if (process.env.GENERATE_PEER_PORT === 'true') {
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}
const PORT = process.env.PORT || PEER_PORT || DEFAULT_PORT;

app.listen(PORT, () => {
    console.log(`Application listening at localhost:${PORT}`);
    if(PORT !== DEFAULT_PORT) {
        syncWithRootState();
    }
});