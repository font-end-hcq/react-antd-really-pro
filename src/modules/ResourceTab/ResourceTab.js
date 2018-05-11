import React,{Component} from 'react';
import { DatePicker,Select, Tabs } from 'antd';
import moment from 'moment';
import LineChart from '@comp/Echarts';
import 'moment/locale/zh-cn';
import DB from '@DB';

moment.locale('zh-cn');
const TabPane = Tabs.TabPane;
const { MonthPicker, RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';
class Tabbar extends Component {

    static propsTypes = {

    }

    constructor(props,context){
        super(props,context);
        this.state = {
            data:[],
            startTime: moment().subtract(7, 'days').startOf('days').valueOf(),
            endTime: moment().subtract(1, 'days').endOf('days').valueOf(), 
            latest: false,
            activeKey:'1',
            dataForm: [],
        }
    }
    //日期改变重新渲染图表
    onChange = (date, dateString) => {
        this.setState({
            startTime:moment(date[0]).startOf('days').valueOf(),
            endTime:moment(date[1]).endOf('days').valueOf(),
        }, ()=>{
            this.emit();
        })
    }

    disabledDate = (current) => {
        //禁止选择未来时间
        return current && current.valueOf() > Date.now();
    }

    componentDidMount () {
        this.send();
    }

    handleClick = (e) => {
        const $this = e.target;
        if( $this.dataset.days*1 == '15'){
            this.setState({
                activeKey: '2',
                startTime:moment().subtract(15, 'days').startOf('days').valueOf(),
                endTime:moment().subtract(1, 'days').endOf('days').valueOf(), 
            }, () => {
                this.emit()
            })
        }else if($this.dataset.days*1 == '7'){
            this.setState({
                activeKey: '1',
                startTime:moment().subtract(7, 'days').startOf('days').valueOf(),
                endTime:moment().subtract(1, 'days').endOf('days').valueOf(), 
            }, () => {
                this.emit()
            });
        }else if($this.dataset.days*1 == '30'){
            this.setState({
                activeKey:'3',
                startTime:moment().subtract(30, 'days').startOf('days').valueOf(),
                endTime:moment().subtract(1, 'days').endOf('days').valueOf(), 
            }, () => {
                this.emit()
            });
        }
    }

    emit = () => {
        let { startTime, endTime } = this.state;
        //图表更改时间，表格也改变时间 重新获取数据
        emitter.emit('changeViewTime',{startTime: startTime, endTime: endTime});
        this.send();
    }

    send = () => {
        //资料管理 db请求
        let { startTime, endTime, latest } = this.state;
        DB.Report.getResourseManage({ //调用获取
            startTime: startTime,
            endTime: endTime,
            latest: latest,
        }).then(async ({list})=>{
             // 将拿到的数据进行渲染
            this.setState({
                dataForm: list
            })
        },(err) => {
            console.log(err.errorMsg)
        });
    }

    render() {
        const tabbar = [
			{name: '新增课程数', id:'1', dataname: 'add'}, 
			{name: '删除课程数', id:'2', dataname: 'delete'},
		 	{name: '累计课程数', id:'3',dataname: 'total'},
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
