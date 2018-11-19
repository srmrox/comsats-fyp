// COMSATS FYP
// Blockchain in daily life
// Simple blockchain deployed on Heroku
// Server: NodeJS
// Server engine: Express
// Template engine: Embedded JavaScript (EJS)

const express = require('express');         // for serving responses
const bodyParser = require('body-parser');  // for parsing ejs template body during input POST requests
var Blockchain = require('./modules/blockchain.js');

// define a new chain
let testChain = new Blockchain;

// random initial blocks
testChain.addBlock("Block # 1");
testChain.addBlock("Is this working?");
testChain.addBlock("If you can see this, then it must be");
testChain.addBlock("This is a very large string made of the popular Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec auctor odio id risus porttitor auctor. Ut vehicula dolor interdum libero imperdiet, nec sodales mauris fringilla. Donec nisl metus, tincidunt vitae pharetra eget, interdum ac massa. Maecenas quam lectus, ultrices eu porta quis, elementum at augue. Phasellus consectetur lacinia augue non.");
testChain.addBlock("<a href='http://google.com'>Google</a>");
testChain.addBlock("<img src='https://trello-avatars.s3.amazonaws.com/ea9df751f3e6f6b79e3e895ab65d589c/50.png' />");

const app = express();
var port = process.env.PORT || 8081;

app.set('view engine', 'ejs');      // use ejs template engine to render HTML
app.use(express.static('public'));  // expose the public folder to enable CSS files to be accessed by visitors
app.use(bodyParser.urlencoded({ extended: true })); // setup bodyparser

app.get("/",function(req, res) {    // the initial get route
    res.render('index', {chain: testChain});
});

app.post('/', function (req, res) { // the post route from request to add a block
    let newData = req.body.data;
    testChain.addBlock(newData);
    res.render('index', {chain: testChain});
  })

app.listen(port);

console.log('Server running at http://127.0.0.1:' + port);