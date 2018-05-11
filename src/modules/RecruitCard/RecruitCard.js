import React, {Component} from 'react'
import DB from '@DB'
import DataCard from '@comp/DataCard'
import moment from 'moment'

export default class InspectCard extends Component {
	constructor(props) {
        super(props);
        this.state = {
        	loading: true,
        	recLatest:[],
        	startTime: moment().subtract(7, 'days').startOf('day').valueOf(),
	    	endTime: moment().subtract(1, 'days').endOf('day').valueOf(), 
	    	latest: true,
	    	schoolId: '0'
        }
    }
    componentDidMount(){
    	this._getReportOperate();
    	emitter.addListener('getSchoolId', (id) => {
            this.setState({
            	schoolId: id
            },()=>{
            	this._getReportOperate();
            })
        });
	}
	_getReportOperate (){
		let { startTime, endTime, latest, schoolId } = this.state;
		DB.Report.getOperateLatest({ //调用获取
			schoolId:schoolId,
			type: '1'				
	    }).then(async ({latest})=>{
	    	// 将拿到的数据进行渲染
	    	this.setState({
  				loading: false,
  				recLatest: latest
  			})
	    },(err) => {
	    	console.log(err.errorMsg)
	    });
	}
	
	render() {
		let { recLatest, loading } = this.state;		
		return (
			<div className='card'>
				<DataCard loading={loading} title='新增咨询量' num={recLatest.consult} YoY={recLatest.consultSame} MoM={recLatest.consultRing}/>
				<DataCard loading={loading} title='新增沟通量' num={recLatest.communication} YoY={recLatest.communicationSame} MoM={recLatest.communicationRing}/>
				<DataCard loading={loading} title='新增试听量' num={recLatest.listen} YoY={recLatest.listenSame} MoM={recLatest.listenRing}/>
				<DataCard loading={loading} title='累计咨询量' num={recLatest.consultTotal} YoY='' MoM='' />
				<DataCard loading={loading} title='累计沟通量' num={recLatest.communicationTotal} YoY='' MoM='' />
				<DataCard loading={loading} title='累计试听量' num={recLatest.listenTotal} YoY='' MoM=''/>
            </div>
		)
	}
}

