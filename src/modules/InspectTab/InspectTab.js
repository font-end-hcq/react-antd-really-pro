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
            startTime:moment().subtract(7, 'days').startOf('day').valueOf(),
            endTime:moment().subtract(1, 'days').endOf('day').valueOf(), 
            activeKey:'1',
            dataForm: [],
            latest: false,
            schoolId: '0'
        }
    }
    componentDidMount () {
        this.send();
        emitter.addListener('getSchoolId', (id) => {
            this.setState({
                schoolId: id
            },()=>{
                this.send();
            })
        });
    }
    // 转换时间戳
    _getStartTime = (value) => {
        return moment(value).startOf('day').valueOf();
    }
    _getEndTime = (value) => {
        return moment(value).endOf('day').valueOf();
    }
    _getSubStartTime = (value) => {
        return moment().subtract(value, 'days').startOf('day').valueOf();
    }
    _getSubEndTime = (value) => {
        return moment().subtract(value, 'days').endOf('day').valueOf();
    }
    //日期改变重新渲染图表
    onChange = (date, dateString) => {
        this.setState({
            startTime: this._getStartTime(date[0]),
            endTime:this._getEndTime(date[1]),
            query:{
                startTime:this._getStartTime(date[0]),
                endTime:this._getEndTime(date[1])
            }
        }, ()=>{
            this.emit();

        })
    }
    send = () => {
        // 资料查看
        let { startTime, endTime, latest, schoolId } = this.state;
        DB.Report.getResourseInspect({ //调用获取
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
        emitter.emit('changeViewTime',{startTime: startTime, endTime: endTime});
        this.send();
    }
    disabledDate = (current) => {
        //禁止选择未来时间
        return current && current.valueOf() > Date.now();
    }
    handleClick = (e) => {
        const $this = e.target;
        if( $this.dataset.days*1 == '15'){
            this.setState({
                activeKey: '2',
                startTime: this._getSubStartTime(15),
                endTime:this._getSubEndTime(1), 
                query:{
                    startTime:this._getSubStartTime(15),
                    endTime:this._getSubEndTime(1),  
                }
            }, () => {
                this.emit()
            })
        }else if($this.dataset.days*1 == '7'){
            this.setState({
                activeKey: '1',
                startTime:this._getSubStartTime(7),
                endTime:this._getSubEndTime(1),  
                query:{
                    startTime:this._getSubStartTime(7),
                    endTime:this._getSubEndTime(1), 
                }
            }, () => {
                this.emit()
            });
        }else if($this.dataset.days*1 == '30'){
            this.setState({
                activeKey:'3',
                startTime:this._getSubStartTime(30),
                endTime:this._getSubEndTime(1), 
                query:{
                    startTime:this._getSubStartTime(30),
                    endTime:this._getSubEndTime(1), 
                }
            }, () => {
                this.emit()
            });
        }
    }

    render() {
        const tabbar = [
            {name: '课件查看次数', id: '1', dataname: 'courseware'}, 
            {name: '讲义查看次数', id : '2', dataname: 'plan'}, 
            {name: '视频查看次数', id : '3',dataname: 'video'},
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
