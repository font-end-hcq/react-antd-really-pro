import React, { Component } from 'react';
import { DatePicker, Table, Button, } from 'antd';
import moment from 'moment';
import DB from '@DB';
import JSON2EXCEL from '@modules/Export';//下载表格
const RangePicker = DatePicker.RangePicker;


export default class AccountForm extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: true,
            latest: false,
            schoolId: '0',
            query: {
                // 开始时间
                startTime: moment().subtract(7, 'days').startOf('day').valueOf(),
                // 结束时间
                endTime: moment().subtract(1, 'days').endOf('day').valueOf(), 
            },
            pageSize: 15,
            total: 0,
            // 表格的数据            
            list: [],
            columns: [{
                "title": "日期",
                "dataIndex": "createTime",
                "width": 130
            }, {
                "title": "新增账号数（启用）",
                "dataIndex": "add",
                "width": 130

            }, {
                "title": "停用账号数",
                "dataIndex": "reduce",
                "width": 130

            }, {
                "title": "累计启用账号数",
                "dataIndex": "addTotal",
                "width": 130

            }, {
                "title": "累计停用账号数",
                "dataIndex": "reduceTotal",
                "width": 130

            }, {
                "title": "累计账号数",
                "dataIndex": "total",
                "width": 130

            }]
        }

    }
    componentDidMount() {
        //页面初始化数据
        this.getAccount();
        emitter.addListener('changeAccTime', (obj) => {
            this.setState({ query: obj }, () => {
                this.getAccount();
            });
        })
        emitter.addListener('getSchoolId', (schoolId) => {
            this.setState({ schoolId: schoolId }, () => {
                this.getAccount();
            });
        })
    }

    // 页面初始化获取数据，渲染三个模块
    getAccount = () => {
        const { query, latest, schoolId } = this.state;
        DB.Report.getAccount({
            startTime: query.startTime,
            endTime: query.endTime,
            schoolId: schoolId,
            latest: latest,
        }).then(async ({ list }) => {
            // 改变时间格式
            list.forEach((li, index) => {
                li.createTime = moment(li.createTime).format('YYYY-MM-DD');
                li.key = index;
            })
            // 将拿到的数据进行渲染
            this.setState({
                loading: false,
                list: list,
                total: list.length,
            })
        }, (err) => {
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
                startTime: moment(date[0]).valueOf(),
                endTime: moment(date[1]).valueOf(),
            }
        }, () => {
            this.getAccount();
        })
    }

    // 下载表格
    download = () => {
        let column = []
        let temData = []
        for (let i of this.state.columns) {
            column.push(i.title)
        }
        let excelName = '加盟校账号数据报表';
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
        const locale = { emptyText: '抱歉，暂无内容' }
        const columns = this.state.columns;
        let { pageSize, total, loading, schoolId, list } = this.state;
        const pagination = {
            total: total,
            pageSize: pageSize,
            showTotal: (total) => `共 ${+total} 条`,
            onChange(current) {
            },
        };

        return (
            <div style={{ background: '#fff', marginBottom: '20px' }}>
                <div className='tableTop'>
                    <RangePicker
                        allowClear={false}
                        style={{ width: 260 }}
                        onChange={this.changeTime}
                        value={[moment(this.state.query.startTime),
                        moment(this.state.query.endTime)]}
                        disabledDate={this.disabledDate.bind(this)}
                    />
                    <Button type="ghost" onClick={this.download} key='download'>下载表格</Button>
                </div>
                <Table
                    columns={columns}
                    dataSource={this.state.list}
                    locale={locale}
                    pagination={
                        (total < pageSize) ? false : pagination
                    }
                 />

            </div>
        )
    }
}
