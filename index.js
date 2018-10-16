// COMSATS FYP
// Blockchain in daily life
// Simple blockchain deployed on Heroku
// Server: NodeJS
// Server engine: Express
// Template engine: Embedded JavaScript (EJS)

const sha256 = require('sha256');           // for hashing
const express = require('express');         // for serving responses
const bodyParser = require('body-parser');  // for parsing ejs template body during input POST requests

// the block class; since we don't have consensus mechanism yet, nonce is not included
class Block {

    // this gets called every time a new block is made (that's what a constructor function is)
    constructor(index, timestamp, data, prevHash) {
        this.index = index;             //   the serial number of the block; TODO this should be a hash too
        this.timestamp = timestamp;     //   time at which the block was created
        this.data = data;               //   the data stored in the block; TODO possibility to have more than one data?
        this.prevHash = prevHash;       //   previous hash, needed to keep the blockchain going
        this.thisHash = sha256(         //   hash for this block
            this.index + this.timestamp + this.data + this.prevHash);
  }
}

// create the genesis block, with index 0, data 'Genesis Block' and hash '0'
const createGenesisBlock = () => new Block(0, Date.now(), 'Genesis Block', '0');
// ...and store it in an array, i.e. our blockchain
const blockchain = [createGenesisBlock()];
// set genesis block as the last block in the chain
var lastBlock = blockchain[0];

// function to create new block
const nextBlock = (prevBlock, data) => new Block(prevBlock.index + 1, Date.now(), data, prevBlock.thisHash);

// function to add new block to the blockchain
function addBlock(data){
    const newBlock = nextBlock(lastBlock, data);    // create new block
    blockchain.push(newBlock);                      // add it to the blockchain         --- ref A
    lastBlock = newBlock;                           // update last block with new block

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Note: we can't have the new block code inside the push in ref A because then we don't have it stored anywhere //
    //       to assign to lastBlock in the line next to ref A; TODO find a possibility to do the same in one line    //
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}

// random initial blocks
addBlock("Block # 1");
addBlock("Is this working?");
addBlock("If you can see this, then it must be");
addBlock("This is a very large string made of the popular Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec auctor odio id risus porttitor auctor. Ut vehicula dolor interdum libero imperdiet, nec sodales mauris fringilla. Donec nisl metus, tincidunt vitae pharetra eget, interdum ac massa. Maecenas quam lectus, ultrices eu porta quis, elementum at augue. Phasellus consectetur lacinia augue non.");
addBlock("<a href='http://google.com'>Google</a>");
addBlock("<img src='https://trello-avatars.s3.amazonaws.com/ea9df751f3e6f6b79e3e895ab65d589c/50.png' />");

const app = express();
var port = process.env.PORT || 8081;

app.set('view engine', 'ejs');      // use ejs template engine to render HTML
app.use(express.static('public'));  // expose the public folder to enable CSS files to be accessed by visitors
app.use(bodyParser.urlencoded({ extended: true })); // setup bodyparser

app.get("/",function(req, res) {    // the initial get route
    res.render('index', {chain: blockchain});
});

app.post('/', function (req, res) { // the post route from request to add a block
    let newData = req.body.data;
    addBlock(newData);
    res.render('index', {chain: blockchain});
  })

app.listen(port);

console.log('Server running at http://127.0.0.1:' + port);