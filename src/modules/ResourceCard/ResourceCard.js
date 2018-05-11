import React, {Component} from 'react';
import DB from '@DB';
import DataCard from '@comp/DataCard';
import moment from 'moment';

class ResourceCard extends Component {
	constructor(props) {
        super(props);
        this.state = {
        	loading: true,
        	couLatest:[],
        	startTime: moment().subtract(7, 'days').startOf('days').valueOf(),
	    	endTime: moment().subtract(1, 'days').endOf('days').valueOf(),
	    	latest: true,
        }
    }
    componentDidMount(){
		this._getReportOpen();
	}
	_getReportOpen(){
		let { startTime, endTime, latest } = this.state;
		DB.Report.getResourseManage({ //调用获取
	    	startTime: startTime,
	    	endTime: endTime,
			latest: latest,
	    }).then(async ({couLatest})=>{
	    	// 将拿到的数据进行渲染
	    	this.setState({
  				loading: false,
  				couLatest: couLatest[0]
  			})
	    },(err) => {
	    	console.log(err.errorMsg)
	    });
	}
	
	render() {
		let { couLatest, loading } = this.state;
		return (
			<div className='card'>
				<DataCard loading={loading} title='新增课程数' num={couLatest.add} YoY={couLatest.addSame} MoM={couLatest.addRing}/>
				<DataCard loading={loading} title='删除课程数' num={couLatest.delete} YoY={couLatest.deleteSame} MoM={couLatest.deleteRing}/>
				<DataCard loading={loading} title='累计课程数' num={couLatest.total} YoY={couLatest.totalSame} MoM={couLatest.totalRing}/>
			</div>
		)
	}
}

export default ResourceCard
