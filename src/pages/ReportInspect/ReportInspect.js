import React, {Component} from 'react';
import { Select } from 'antd';
import DB from '@DB';

import InspectTab from '@modules/InspectTab';
import InspectCard from '@modules/InspectCard'
import InspectForm from '@modules/InspectForm'
const Option = Select.Option;

class ReportInspect extends Component {
	constructor(props) {
        super(props);
        this.state = {
        	select:[]
        }
        //页面初始化的时候先清空所有的Listener
        emitter.removeAllListeners();
    }
    componentDidMount(){
    	this._getSchool();
	}
	_getSchool () {
		let { select } = this.state;
		select.push(<Option key={'0'} value={'0'}>全部加盟校</Option>);

		DB.Report.getSchoolList().then(async (list)=>{
	    	list.map((li,index)=>{
	  			select.push(<Option key={li._id} value={li._id}>{li.name}</Option>);
	  		})
	  		this.setState({
	  			select : select
	  		})
	    },(err) => {
	    	console.log(err.errorMsg)
	    });
	}
	// 下拉框选择改选之后
	 handleChange = (value) => {
	 	emitter.emit('getSchoolId', value);
	}
	render() {
		let {select} = this.state;
		
		return (
		<div className='report'>
			<p>资料查看</p>
			<Select
			    showSearch
			    defaultValue="全部加盟校"
			    style={{ width: 200, marginBottom: 25 }}
			    placeholder="请选择加盟校"
				optionFilterProp="children"
				notFoundContent="抱歉，没有该选项"
				onChange={this.handleChange}
			    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
			  >
			    {select}
			</Select>
			<InspectCard />
			<InspectTab />
			<InspectForm />
	    </div>
		)
	}
}

export default ReportInspect
