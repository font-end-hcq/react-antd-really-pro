import React,{Component} from 'react';
import { DatePicker,Select, Tabs } from 'antd';
import moment from 'moment';
import PropTypes from 'prop-types';
import LineChart from '@comp/Echarts';
import 'moment/locale/zh-cn';
import DB from '@DB';
moment.locale('zh-cn');
const TabPane = Tabs.TabPane;
const { MonthPicker, RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';
class Tabbar extends Component {

    constructor(props,context){
        super(props,context);
        this.state = {
            data:[],
            startTime:moment().subtract(7, 'days').startOf('day').valueOf(),
            endTime:moment().subtract(1, 'days').endOf('day').valueOf(), 
            activeKey:'1',
            dataForm: [],
            schoolId: '0',
            latest:false           
        }
    }
    //日期改变重新渲染图表
    onChange = (date, dateString) => {
        this.setState({
            startTime:moment(date[0]).startOf('day').valueOf(),
            endTime:moment(date[1]).endOf('day').valueOf(),
        }, ()=>{ 
            this.emit();
        })
    }

    disabledDate = (current) => {
        //禁止选择未来时间
        return current && current.valueOf() > Date.now();
    }
   
    componentDidMount () {
        //页面初始化数据
        this.send();       
        emitter.addListener('getSchoolId', (schoolId) => {
            this.setState({ schoolId: schoolId }, () => {
                this.send();
            });
        })
       
    }
        
    handleClick = (e) => {
        const $this = e.target;
        
        if( $this.dataset.days*1 == '15'){
            this.setState({
                activeKey: '2',
                startTime:moment().subtract(15, 'days').startOf('day').valueOf(),
                endTime:moment().subtract(1, 'days').endOf('day').valueOf(), 
            }, () => {
                this.emit()
            })
        }else if($this.dataset.days*1 == '7'){
            this.setState({
                activeKey: '1',
                startTime:moment().subtract(7, 'days').startOf('day').valueOf(),
                endTime:moment().subtract(1, 'days').endOf('day').valueOf(),            
            }, () => {
                this.emit()
            });
        }else if($this.dataset.days*1 == '30'){
            this.setState({
                activeKey:'3',
                startTime:moment().subtract(30, 'days').startOf('day').valueOf(),
                endTime:moment().subtract(1, 'days').endOf('day').valueOf(), 
            }, () => {
                this.emit()
            });
        }
    }

    send = () => {
        // 资料查看
        let { startTime, endTime, latest, schoolId } = this.state;
        DB.Report.getAccount({ //调用获取
            startTime: startTime,
            endTime: endTime,
            latest: latest,
            schoolId: schoolId,  
        }).then(async ({list})=>{
             // 将拿到的数据进行渲染
            this.setState({
                dataForm: list
            })
        },(err) => {
            console.log(err.errorMsg)
        });
    }
    emit = () => {
        let { startTime, endTime } = this.state;
        //图表更改时间，表格也改变时间 重新获取数据
        emitter.emit('changeAccTime',{startTime: startTime, endTime: endTime});
        this.send();
    }

    render() {
        const tabbar = [
			{name: '新增账号数(启用)', id: '1', dataname: 'add'}, 
			{name: '停用账号数', id : '2', dataname: 'reduce'}, 
			{name: '累计启用账号数', id : '3',dataname: 'addTotal'},
			{name: '累计停用账号数', id : '4', dataname: 'reduceTotal'}, 
			{name: '累计账号数', id : '5',dataname: 'total'},
		];
        return(
            <div>
                <Tabs defaultActiveKey="1" >
                    {
                        tabbar.map(item => (
                            <TabPane tab={item.name} key={item.id}>
                                <div className='dateselector' style={{marginTop:'-2px'}}>
                                    <a href="javascript:;" data-days="7" onClick={this.handleClick} className={this.state.activeKey == '1' ? "active" : ''}>最近七天</a>
                                    <a href="javascript:;" data-days="15" onClick={this.handleClick} className={this.state.activeKey == '2' ? "active" : ''}>最近十五天</a>
                                    <a href="javascript:;" data-days="30" onClick={this.handleClick} className={this.state.activeKey == '3' ? "active" : ''}>最近三十天</a>
                                </div>
                                {/* 时间选择器 */}
                                <div className="datepicker">
                                    <RangePicker
                                        style={{ width: 260 }}
                                        value={[moment(this.state.startTime),
                                        moment(this.state.endTime)]}
                                        format={dateFormat}
                                        onChange={this.onChange}
                                        disabledDate={this.disabledDate}
                                        allowClear = {false}
                                    />
                                </div>
                                <div style={{marginTop:'36px',marginLeft: '-18px'}}>
                                    {
                                    this.state.dataForm && this.state.dataForm.length ?
                                        <LineChart data={this.state.dataForm} name={item.name} dataname={item.dataname}/> : <div className="no_data">抱歉，暂无内容</div>
                                    }
                                </div>
                                
                            </TabPane>
                        ))
                    }
                </Tabs>
            </div>
        )
    }
}
export default Tabbar;
