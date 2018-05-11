import React, {Component} from 'react'
import DB from '@DB'
import DataCard from '@comp/DataCard'
import moment from 'moment';

class AccountCard extends Component {
	constructor(props) {
        super(props);
        this.state = {
			loading: true,
			latest:true,			
			accLatest: [],
			schoolId: '0',			
			startTime: moment().subtract(7, 'days').startOf('day').valueOf(),
            endTime: moment().subtract(1, 'days').endOf('day').valueOf(), 
        }
	}
	
    componentDidMount(){
		this.getAccount();
		//监听getSchoolId,并且更新查询
		emitter.addListener('getSchoolId', (schoolId) => {
            this.setState({ schoolId: schoolId }, () => {
                this.getAccount();
            });
        })
		
	}
	// 页面初始化获取数据，渲染三个模块
	getAccount = () => {
		let { startTime, endTime, latest, schoolId } = this.state;
		DB.Report.getAccount({
			startTime: startTime,
			endTime: endTime,
			schoolId: schoolId,
			latest: latest,
		}).then(async ({ accLatest }) => {
			// 将拿到的数据进行渲染
			this.setState({
				loading: false,
				accLatest: accLatest[0]
			})
		}, (err) => {
			console.log(err.errorMsg)
		});
	}    
	
	render() {
		let { accLatest, loading } = this.state;
		return (
			<div className='card'>
				<DataCard loading={loading} title='新增账号数（启用）' num={accLatest.add} YoY={accLatest.addSame} MoM={accLatest.addRing}/>
				<DataCard loading={loading} title='停用账号数' num={accLatest.reduce} YoY={accLatest.reduceSame} MoM={accLatest.reduceRing}/>
				<DataCard loading={loading} title='累计启用账号数' num={accLatest.addTotal} YoY={accLatest.addTotalSame} MoM={accLatest.addTotalRing}/>
				<DataCard loading={loading} title='累计停用账号数' num={accLatest.reduceTotal} YoY={accLatest.reduceTotalSame} MoM={accLatest.reduceTotalRing}/>
				<DataCard loading={loading} title='累计账号数' num={accLatest.total} YoY={accLatest.totalSame} MoM={accLatest.totalRing}/>
			</div>
		)
	}
}

export default AccountCard
