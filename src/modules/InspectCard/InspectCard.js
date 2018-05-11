import React, {Component} from 'react'
import DB from '@DB'
import DataCard from '@comp/DataCard'
import moment from 'moment'

class InspectCard extends Component {
	constructor(props) {
        super(props);
        this.state = {
        	loading: true,
        	viewLatest:[],
        	startTime: moment().subtract(7, 'days').startOf('day').valueOf(),
	    	endTime: moment().subtract(1, 'days').endOf('day').valueOf(), 
	    	latest: true,
	    	schoolId: '0'
        }
    }
    componentDidMount(){
    	this._getReportOpen();
    	emitter.addListener('getSchoolId', (id) => {
            this.setState({
            	schoolId: id
            },()=>{
            	this._getReportOpen();
            })
        });
	}
	_getReportOpen (){
		let { startTime, endTime, latest, schoolId } = this.state;
		DB.Report.getResourseInspect({ //调用获取
	    	startTime: startTime,
	    	endTime: endTime,
			latest: latest,
			schoolId:schoolId,	
	    }).then(async ({viewLatest})=>{
	    	// 将拿到的数据进行渲染
	    	this.setState({
  				loading: false,
  				viewLatest: viewLatest[0]
  			})
	    },(err) => {
	    	console.log(err.errorMsg)
	    });
	}
	
	render() {
		let { viewLatest, loading } = this.state;
		return (
			<div className='card'>
				<DataCard loading={loading} title='课件查看次数' num={viewLatest.courseware} YoY={viewLatest.coursewareSame} MoM={viewLatest.coursewareRing}/>
				<DataCard loading={loading} title='讲义查看次数' num={viewLatest.plan} YoY={viewLatest.planSame} MoM={viewLatest.planRing}/>
				<DataCard loading={loading} title='视频播放次数' num={viewLatest.video} YoY={viewLatest.videoSame} MoM={viewLatest.videoRing}/>
			</div>
		)
	}
}

export default InspectCard
