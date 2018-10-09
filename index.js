// COMSATS FYP
// Blockchain in daily life
// Simple blockchain with NodeJS, deployed on Heroku

// This application uses NodeJS to serve the JavaScript code
// Since we will be hashing stuff, we need to install a hashing package (sha256 in this case)
// We must make sure it exists in the installation, so that our code works once deployed
const sha256 = require('sha256');

// The class definition of our block; since we don't have consensus mechanism yet, nonce is not included
class Block {

    // The constructor function is run wheneve a new object of this class in instantiated (created)
    constructor(index, timestamp, data, prevHash) {
                                        // Represents:
        this.index = index;             //   the serial number of the block
        this.timestamp = timestamp;     //   when the block was created
        this.data = data;               //   the data stored in the block
        this.prevHash = prevHash;       //   previous hash, needed to keep the blockchain going
        this.thisHash = sha256(         //   hash for this block, need for previous hash in next block
            this.index + this.timestamp + this.data + this.prevHash);    
  }
}

// The function to create the first block in the blockchain, the Genesis Block
// It has the serial number and previous hash of 0; this is passed to it manually through this function
const createGenesisBlock = () => new Block(0, Date.now(), 'Genesis Block', '0');

// This function is used to create a new block in the blockchain
const nextBlock = (prevBlock, data) => new Block(prevBlock.index + 1, Date.now(), data, prevBlock.thisHash);

// This creates the blockchain and the Genesis Block and assigns the blockchain
// we created to the constant 'blockchain' (we can name this anything)
const blockchain = [createGenesisBlock()];

// This defines the previousBlock variable and gives it the block we just created
var lastBlock = blockchain[0];

// This functions creates a new block and adds it to the blockchain
// It also updates the lastBlock variable
function addBlock(data){
    const newBlock = nextBlock(lastBlock, data);    // create new block
    blockchain.push(newBlock);                      // add it to the blockchain
    lastBlock = newBlock;                           // update last block with new block
}

// Since we have a functional blockchain now, we add random data elements to see how it works
addBlock("Block # 1");
addBlock("Is this working?");
addBlock("If you can see this, then it must be");
addBlock("This is a very large string made of the popular Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec auctor odio id risus porttitor auctor. Ut vehicula dolor interdum libero imperdiet, nec sodales mauris fringilla. Donec nisl metus, tincidunt vitae pharetra eget, interdum ac massa. Maecenas quam lectus, ultrices eu porta quis, elementum at augue. Phasellus consectetur lacinia augue non.");
addBlock("<a href='http://google.com'>Google</a>");
addBlock("<img src='https://trello-avatars.s3.amazonaws.com/ea9df751f3e6f6b79e3e895ab65d589c/50.png' />");

// Display our blockchain
// TODO: make results pretty
console.log("|| ---------- STARTING BLOCKCHAIN DATA ---------- ||");
console.log(blockchain);
console.log("|| ---------- BLOCKCHAIN DATA ENDED ---------- ||");

////////////////////////////////////////////
// Code to output results as an HTML file //
////////////////////////////////////////////

// make the response text
var resText =   '<!doctype html>\n' +
                    '<html lang="en">\n'+
                        '<head>\n' +
                            '<meta charset="utf-8">\n' + 
                            '<title>Simple Blockchain</title>\n' +
                            '<style type="text/css">* {font-family:arial, sans-serif;}</style>\n'+
                        '</head>\n' +
                        '<body><h1>Blockchain data:</h1>\n' +
                        '<div id="content">';

// loop through the blockchain and print every block
for (var i = 0; i < blockchain.length; i++){
    resText += '<p><b>Index:</b> ' + blockchain[i].index + '<br>';
    resText += '<b>Timestamp:</b> ' + blockchain[i].timestamp + '<br>';
    resText += '<b>Hash:</b> ' + blockchain[i].thisHash + '<br>';
    resText += '<b>Previous Hash:</b> ' + blockchain[i].prevHash + '<br>';
    resText += '<b>Data:</b> ' + blockchain[i].data + '</p>';
}
resText += '</div></body></html>';

// standard code to make server via Express
var express = require('express');
var app = express();
var port = process.env.PORT || 8081;

app.get("/",function(req, res) {
    res.send(resText);   // and send a response text
});

app.listen(port);

console.log('|| ---------- Server running at http://127.0.0.1:' + port + ' ---------- ||');