import React, {Component} from 'react'

import OpenTab from '@modules/OpenTab';
import OpenCard from '@modules/OpenCard'
import OpenForm from '@modules/OpenForm'

class ReportOpen extends Component {
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
			<p>开通数据</p>
			<OpenCard />
			<OpenTab />
			<OpenForm />
	    </div>
		)
	}
}

export default ReportOpen
