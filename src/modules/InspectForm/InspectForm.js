import React, { Component } from 'react';
import { DatePicker, Table, Button, } from 'antd';
import moment from 'moment';
import DB from '@DB';

import JSON2EXCEL from '@modules/Export';//下载表格
const RangePicker = DatePicker.RangePicker;


export default class InspectForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            query: {
                // 开始时间
                startTime: moment().subtract(7, 'days').startOf('day').valueOf(),
                // 结束时间
                endTime: moment().subtract(1, 'days').endOf('day').valueOf(), 
                latest: false,
                schoolId: '0'
            },
            // 表格的数据
            list:[],
            pageSize: 15,
            pageNum: 1,
            total: 0,
            columns: [{
                "title": "日期",
                "dataIndex": "createTime",
                "width": 200
            }, {
                "title": "课件查看次数",
                "dataIndex": "courseware",
                "width": 200

            }, {
                "title": "讲义查看次数",
                "dataIndex": "plan",
                "width": 200

            }, {
                "title": "视频播放次数",
                "dataIndex": "video",
                "width": 200

            }]

        }
    }
    componentDidMount() {
        this._getFormList();
        emitter.addListener('getSchoolId', (id) => {
            this.setState({
                query:{
                    ...this.state.query,
                    schoolId: id
                }
            },()=>{
                this._getFormList();
            })
        });
        emitter.addListener('changeViewTime', (obj) => {
            this.setState({
                query: {
                    ...this.state.query,
                    startTime: obj.startTime,
                    endTime: obj.endTime
                }
            },()=>{
                this._getFormList();
            })
        })
    }
    
    _getFormList = () => {
        let { query } = this.state;
        DB.Report.getResourseInspect({ //调用获取
            startTime: query.startTime,
            endTime: query.endTime,
            latest: query.latest,
            schoolId: query.schoolId,  
        }).then(async ({list})=>{
            list.forEach((li, index) => {
                li.createTime = moment(li.createTime).format('YYYY-MM-DD');
                li.key = index;
            })
             // 将拿到的数据进行渲染
            this.setState({
                loading: false,
                list: list,
                total: list.length
            })
        },(err) => {
            console.log(err.errorMsg)
        });
    }
    //禁止选择未来时间
    disabledDate(current) {
        return current && current.valueOf() > Date.now();
    }
    // 时间改变时触发
    changeTime = (date) => {
        this.setState({
            query: {
                ...this.state.query,
                startTime: moment(date[0]).startOf('day').valueOf(),
                endTime: moment(date[1]).endOf('day').valueOf(),
            }
        }, () => {
            this._getFormList();
        })
    }

    // 下载表格
    download = () => {
        let column = []
        let temData = []
        for (let i of this.state.columns) {
            column.push(i.title)
        }
        let excelName = '加盟校数据查看报表';
        let data = this.state.list;
        for (let item of data) {
            let resData = {}
            for (let item2 of this.state.columns) {
                resData[item2.dataIndex] = item[item2.dataIndex] || '0'
            }
            temData.push(resData)
        }
        JSON2EXCEL(temData, excelName, column)
    }

    render() {
        const locale = {
            emptyText: '抱歉，暂无内容'
        }
        const columns = this.state.columns;
        let { list, pageSize, total, loading } = this.state;        
        const pagination = {
            total: total,
            pageSize:pageSize,
            showTotal: (total) => `共 ${+total} 条`,
            onChange(current) {
            },
        };
        return (
            <div style={{ background: '#fff',marginBottom:'20px'}}>
                <div className='tableTop'>
                    <RangePicker
                        allowClear={false}
                        style={{ width: 260 }}
                        onChange={this.changeTime}
                        value={[moment(this.state.query.startTime),
                        moment(this.state.query.endTime)]}
                        disabledDate={this.disabledDate.bind(this)}
                    />
                    <Button type="ghost" key='download' onClick={this.download}>下载表格</Button>
                </div>
                <Table
                    columns={columns}
                    dataSource={list}
                    locale={locale}
                    pagination={              
                        (total < pageSize) ? false:pagination     
                    } 
                />
            </div>
        )
    }
}
