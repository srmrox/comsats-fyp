import React, { Component } from 'react';
import { FormGroup, FormControl, Button } from "react-bootstrap";
import { Link } from 'react-router-dom';
import history from '../history';

class ConductTransaction extends Component {
    state = { buyer: '', property: '' }

    updateBuyer = event => {
        this.setState({ buyer: event.target.value });
    }

    updateProperty = event => {
        this.setState({ property: event.target.value });
    }

    conductTransaction = () => {
        const { buyer, property } = this.state;
        fetch(`${document.location.origin}/api/transact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ buyer, property })
        }).then(response => response.json())
            .then(json => {
                alert(json.message || json.type);
                history.push('/transaction-pool');
            });
    }

    render() {
        return (
            <div className='ConductTransaction'>
                <Link to='/'>Home</Link>
                <h3>Conduct a transaction</h3>
                <br />
                <FormGroup>
                    <label>Buyer</label>
                    <FormControl input='text' placeholder='Enter public key' value={this.state.buyer} onChange={this.updateBuyer} />
                </FormGroup>
                <FormGroup>
                    <label>Property</label>
                    <FormControl input='text' placeholder='Enter public key' value={this.state.property} onChange={this.updateProperty} />
                </FormGroup>
                <div><Button onClick={this.conductTransaction}>Submit</Button></div>
            </div>
        )
    }
};

export default ConductTransaction;