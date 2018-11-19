class Transaction {
    constructor(propertyAddress ,fromAddress, toAddress, amount){
        this.propertyAddress = propertyAddress;
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }
 }

 module.exports = Transaction;