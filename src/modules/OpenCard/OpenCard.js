import React, {Component} from 'react'
import DB from '@DB'
import DataCard from '@comp/DataCard'
import moment from 'moment'

class OpenCard extends Component {
	constructor(props) {
        super(props);
        this.state = {
        	startTime: moment().subtract(7, 'days').startOf('day').valueOf(),
	    	endTime: moment().subtract(1, 'days').endOf('day').valueOf(), 
        	loading: true,
        	latest: true,
        	schLatest: []
        }
    }
    componentDidMount(){
    	this._getReportOpen();
	}
	_getReportOpen(){
		let { startTime, endTime, latest, schLatest } = this.state;
		DB.Report.getSchoolOpen({ //调用获取
	    	startTime: startTime,
	    	endTime: endTime,
	    	latest: latest
	    }).then(async ({schLatest})=>{
	    	// 仅在页面初始化的时候进行渲染第一个模块
	    	this.setState({
	    		loading: false,
	    		schLatest: schLatest[0]
	    	})	
	    },(err) => {
	    	console.log(err.errorMsg)
	    });
	}
	
	render() {
		let { schLatest, loading } = this.state;
		return (
			<div className='card'>
				<DataCard loading={loading} title='新增加盟校' num={schLatest.add} YoY={schLatest.addSame} MoM={schLatest.addRing}/>
				<DataCard loading={loading} title='删除加盟校' num={schLatest.delete} YoY={schLatest.deleteSame} MoM={schLatest.deleteRing}/>
				<DataCard loading={loading} title='累计开通加盟校' num={schLatest.total} YoY={schLatest.totalSame} MoM={schLatest.totalRing}/>
			</div>
		)
	}
}

export default OpenCard
