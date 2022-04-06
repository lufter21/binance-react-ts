import React from 'react';
import css from './OrderContainer.module.css';

class OrderContainer extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			
		}
	}

	componentDidMount() {
		
	}

	render() {
		return (
			<div>
            <button onClick={this.props.newOrder}>New Order</button>
         </div>
		);
	}
}

export default OrderContainer;