import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class App extends Component {

    state = { address: '', properties: [] };

    componentDidMount() {
        fetch(`${document.location.origin}/api/user-info`)
            .then(response => response.json())
            .then(json =>  this.setState({
                address: json.address,
                properties: json.properties
            }));
    }

    render() {
        const address = this.state.address;
        const properties = this.state.properties;

        return (
            <div className='App'>
                <div><h1>COMSATS FYP</h1></div>
                <br />
                <div><Link to='/blocks'>Blocks</Link></div>
                <div><Link to='/conduct-transaction'>Conduct a Transaction</Link></div>
                <div><Link to='/transaction-pool'>Transaction Pool</Link></div>
                <br />
                <div className='UserInfo'>
                    <div><label>Address:</label> {address}</div>
                    <div><label>Properties owned:</label> 
                        {
                            properties.length === 0 ? (
                                <div>None</div>
                            ) : (
                                properties.map(property => {
                                    return (
                                        <div key={property}>{property}</div>
                                    )
                                })
                            )
                        }
                    </div>
                </div>
                <br />
            </div>
        );
    }
}

export default App;