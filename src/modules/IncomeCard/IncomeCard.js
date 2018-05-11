import React, {Component} from 'react'
import DB from '@DB'
import DataCard from '@comp/DataCard'
import moment from 'moment';

export default class IncomeCard extends Component {
	constructor(props) {
        super(props);
        this.state = {
			loading: true,
			latest:true,			
			incLatest: [],
			schoolId: '0',			
			startTime: moment().subtract(7, 'days').startOf('day').valueOf(),
            endTime: moment().subtract(1, 'days').endOf('day').valueOf(), 
        }
	}
	
    componentDidMount(){
		this.getOperateLate();
		//监听getSchoolId,并且更新查询
		emitter.addListener('getSchoolId', (schoolId) => {
            this.setState({ schoolId: schoolId }, () => {
                this.getOperateLate();
            });
        })
		
	}
	// 页面初始化获取数据，渲染三个模块
	getOperateLate = () => {		
		let { startTime, endTime, latest, schoolId } = this.state;
		DB.Report.getOperateLatest({
			type:'0',
			schoolId: schoolId
		}).then(async ({ latest }) => {
			// 将拿到的数据进行渲染
			this.setState({
				loading: false,
				incLatest: latest
			})
		}, (err) => {
			console.log(err.errorMsg)
		});
	}  
	
	render() {
		let { incLatest, loading } = this.state;
		return (
			<div className='card' style={{display:'flex'}}>			
				<DataCard loading={loading} title='昨日收入' num={incLatest.income} YoY={incLatest.incomeSame} MoM={incLatest.incomeRing}/>
				<DataCard loading={loading} title='累计收入' num={incLatest.incomeTotal} YoY='' MoM=''/>
			</div>
		)
	}
}

