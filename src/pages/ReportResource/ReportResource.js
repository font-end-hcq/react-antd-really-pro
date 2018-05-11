import React, {Component} from 'react';

import ResourceCard from '@modules/ResourceCard';
import ResourceTab from '@modules/ResourceTab';
import ResourceForm from '@modules/ResourceForm';

class ReportResource extends Component {
	   constructor(props) {
        super(props);
        this.state = {

        }
    }
    componentDidMount(){

	}

	render() {
		
		return (
		<div className='report'>
			<p>资料管理</p>
			<ResourceCard />
			<ResourceTab />
			<ResourceForm />
	    </div>
		)
	}
}

export default ReportResource
