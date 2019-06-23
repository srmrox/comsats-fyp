const { cryptoHash } = require('./index');

describe('cryptoHash()', () => {
    it('generates a SHA-256 hashed output', () => {
        expect(cryptoHash('shahrukhmalik')).toEqual('4f0403c1cb59ebc3aa505ad93194f8305ae6182243f912ab3b1fe43cbf291227'); // adds single quotes to the hash as inputs
    });                                                                                                                  // are stringified and stored with the quotes

    it('produces the same hash with the same input arguments in any order', () => {
        expect(cryptoHash('one','two','three')).toEqual(cryptoHash('three','one','two'));
    });

    it('produces a unique hash when the properties have changed on an input', () => {
        const testVar = {};
        const originalHash = cryptoHash(testVar);
        testVar['a'] = 'a';

        expect(cryptoHash(testVar)).not.toEqual(originalHash);
    });
});