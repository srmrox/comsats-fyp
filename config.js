const MINE_RATE = 1000; // in milliseconds
const INITIAL_DIFFICULTY = 3;

const GENESIS_DATA = {
    timestamp: 1,
    lastHash: '0',
    hash: 'genesis',
    difficulty: INITIAL_DIFFICULTY,
    nonce: 0,
    data: ['genesis']
};

module.exports = { GENESIS_DATA, MINE_RATE };