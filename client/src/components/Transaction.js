import React from 'react';

const Transaction = ({ transaction }) => {
    const { input, outputMap } = transaction;
    const seller = input.seller;
    const property = Object.keys(outputMap)[0];
    const buyer = outputMap[property];

    return (
        <div className="Transaction">
            <div>Seller: {`${seller.substring(0, 20)}...`}</div>
            <div>Buyer: {`${buyer.substring(0, 20)}...`}</div>
            <div>Property: {`${property.substring(0, 20)}...`}</div>
        </div>
    );
}

export default Transaction;