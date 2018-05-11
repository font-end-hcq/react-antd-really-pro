import React,{Component} from 'react';
import { Table, Divider, Button, Modal, Row, Col, Input, Icon, Select, DatePicker, Form, message, Collapse } from 'antd';
import moment from 'moment';
import './CustomerFollowInfo.css'
import DB from '@DB';

const Panel = Collapse.Panel;
const FormItem = Form.Item;
const { TextArea } = Input;
const Option = Select.Option;

class CustomerFollowInfo extends Component {

    static propsTypes = {

    }

    constructor(props,context){
        super(props,context);
        this.state = {
            _id: '',
            execu: [],
            execuSelect: [],              // 执行人选择器
            matchCustomer:'',    
            editId: '',
            pageSize: 10,
            pageNum: 1,
            total: 0,
            visible: false,               // 新建、编辑跟进弹窗是否展示
            deleteVisible: false,         // 删除弹窗是否展示
            showTitle: '新建跟进',          // 弹窗title
            deleteModalText:'是否删除该跟进记录?',
            confirmLoading: false,
            colWidth: 12,                 // 栅格布局的宽
            typeOption: [],               // 类型选择器
            followInfo: [],
            followDetailInfo: {           // 跟进信息详情
                _id: '',                
                matchCustomer: '',        // 对应客户 
                execu: [],                // 执行人，暂时默认为当前登录用户
                followType: undefined,           // 跟进类型
                time: moment(),                 // 执行日期
                followTheme: '',          // 跟进主题
                followContent: ''         // 跟进内容
            }
        }
    }
    componentDidMount () {
      // 由于这里用的tab分页，切换分页emiter监听不到广播，所以采用属性注入，之后再做调研   
        let _id = this.props.customerId;            // 获取到id
        let customerName = this.props.customerName; // 获取到customerName
        this.setState({
            _id: _id,
            matchCustomer: customerName,
            followDetailInfo: {
                ...this.state.followDetailInfo,
                matchCustomer: customerName
            }
        },()=>{
            this._getExecuList();
            this._getFollowList();
            this._getFollowType();
        })
    }
    // 获取执行人
    _getExecuList = () => {
        let { execuSelect } = this.state;
        DB.Customer.getExecUserList().then(({list})=>{
            list.map((li,index)=>(
                execuSelect.push(<Option key={li._id} value={li._id}>{li.name}</Option>)
            ));
            this.setState({
                execu: list,
                execuSelect: execuSelect
            })
        },err=>{
            message.destroy();
            message.error(err.errorMsg)
        })
    }
    // 获取跟进信息列表
    _getFollowList = () => {
        const { _id, pageSize, pageNum } = this.state;
        DB.Customer.getFollowList({
            _id: _id,
            pageSize: pageSize,
            pageNum: pageNum
        }).then(({list, count})=>{
            if(list){
                list.forEach((li,i)=>{
                    li.key = i;
                    li.execu = li.execu.join('，');
                    li.descriptionTheme = li.followTheme || '无';
                    li.descriptionCon = li.followContent || '无';
                    li.time = moment(li.time).format('YYYY-MM-DD');
                    return li;
                })
                this.setState({
                    total: count,
                    followInfo: list
                })
            }
        },err=>{
            message.destroy();
            message.error(err.errorMsg)
        })
    }
    // 获取跟进类型
    _getFollowType = () => {
        let { typeOption } = this.state;
        DB.Customer.getFollowType().then(({list})=>{
            list.map((li,index)=>(
                typeOption.push(<Option key={li._id} value={li._id}>{li.name}</Option>)
            ))
            this.setState({
                typeOption: typeOption
            })
        },err=>{
            message.destroy();
            message.error(err.errorMsg)
        })
    }
    // 新建/编辑 弹窗
    _showNewModal = () => {
        const { matchCustomer } = this.state;
        this.props.form.resetFields()
        this.setState({
            visible: true,
            confirmLoading: false,
            showTitle: '新建跟进',
            followDetailInfo: {           // 跟进信息详情
                _id: '',                
                matchCustomer: matchCustomer,        // 对应客户 
                execu: [],                // 执行人，暂时默认为当前登录用户
                followType: undefined,           // 跟进类型
                time: moment(),                 // 执行日期
                followTheme: '',          // 跟进主题
                followContent: ''         // 跟进内容
            }
        });
    }
    // 编辑 弹窗
    _showEditModal = (_id) => {
        const { execu, matchCustomer } = this.state;
        this.props.form.resetFields()
        // 请求联系人数据，渲染Modal
        DB.Customer.getFollowDetail({
            _id: _id
        }).then((data)=>{
            if(data){
                let editExecu = [];
                data.execu.forEach((ex)=>{
                    execu.map((execu)=>(
                        execu._id === ex ? editExecu.push({_id:ex, name: execu.name}) : ''
                    ))
                })
                data.execu = editExecu;
                data.matchCustomer = matchCustomer;
                data.time = moment(data.time);
                this.setState({
                    followDetailInfo: data,
                    visible: true,
                    confirmLoading: false,
                    showTitle: '编辑跟进',
                    editId: _id
                })
            }
        },err=>{
            message.destroy();
            message.error(err.errorMsg)
            this.setState({
                confirmLoading: false
            })
        })
    }
    // 删除 弹窗
    _showDeleteModal = (_id) => {
        this.setState({
            deleteVisible: true,
            confirmLoading: false,
            editId: _id
        });
    }
    // 确认 新建或编辑跟进信息
    _handleOk = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                this.setState({
                    confirmLoading: true
                })
                let params = {
                    kehuId: this.state._id,
                    execu: values.execu,
                    followTypeId: values.followType,
                    time: moment(values.time).valueOf(),
                    followTheme: values.followTheme,
                    followContent: values.followContent|| ''
                }
                if(!!this.state.editId) params._id = this.state.editId;
                // 新建/编辑
                DB.Customer.updateFollow(params).then((res)=>{
                    if(res){
                        message.success(!!this.state.editId ? "编辑跟进信息成功！" : "新建跟进信息成功！")
                        this._getFollowList();
                        this.props.form.resetFields()
                        this.setState({ // 重置
                            visible: false,
                            confirmLoading: false,
                            followDetailInfo: {           // 跟进信息详情
                                _id: '',                
                                matchCustomer: this.state.matchCustomer,        // 对应客户 
                                execu: [],                // 执行人，暂时默认为当前登录用户
                                followType: undefined,           // 跟进类型
                                time: moment(),                 // 执行日期
                                followTheme: '',          // 跟进主题
                                followContent: ''         // 跟进内容
                            }
                        });
                    }
                },err=>{
                    message.destroy();
                    message.error(err.errorMsg)
                    this.setState({
                        confirmLoading: false
                    })
                })
            }
        });
    }
    // 取消 新建/编辑跟进
    _handleCancel = (e) => {
        const { matchCustomer } = this.state;
        this.props.form.resetFields()
        this.setState({
            visible: false,
            confirmLoading: false,
            editId: '',
            followDetailInfo: {           // 跟进信息详情
                _id: '',                
                matchCustomer: matchCustomer,        // 对应客户 
                execu: [],                // 执行人，暂时默认为当前登录用户
                followType: undefined,           // 跟进类型
                time: moment(),                 // 执行日期
                followTheme: '',          // 跟进主题
                followContent: ''         // 跟进内容
            }
        });
    }
    // 删除 跟进
    _handleDeleteFollow = (e) => {
        const { editId } = this.state;
        this.setState({
            confirmLoading: true
        })
        // 发送请求删除
        DB.Customer.deleteFollow({
           _id: editId
        }).then((res)=>{
            if(res){
                message.success('删除跟进信息成功！')
                this._getFollowList()
                this.setState({
                    deleteVisible: false,
                    confirmLoading: false
                });
            } 
        },err=>{
            message.destroy();
            message.error(err.errorMsg)
            this.setState({
                confirmLoading: false
            })
        })
    }
    // 取消删除 跟进
    _handleDeleteCancel = (e) => {
        this.setState({
            deleteVisible: false,
            confirmLoading: false,
            editId: ''
        });
    }
    _handlePageChange = (page) =>{
        this.setState({
            pageNum: page.current
        },()=>{
            this._getFollowList()
        })
    }
    // 日期选择器 禁止选择未来时间
    _disabledDate = (current) => {
        return current && current > moment().endOf('day');
    }
    // 下拉搜索匹配选项指定
    filterOption = (inputValue,option) => {
        return option.props.children.indexOf(inputValue) !== -1
    }
    render() {
        const { pageSize, pageNum, total, followInfo, followDetailInfo, followTypeList, visible, deleteVisible, showTitle, confirmLoading, colWidth, deleteModalText, execuSelect,typeOption} = this.state;
        // 配置 表单样式
        const { getFieldDecorator } = this.props.form;
        // 表单item布局样式
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 8 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 14 },
            },
        };
        const textAreaLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 4 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 19},
            },
        }
        // 表格分页配置
        const pagination = {
            showQuickJumper: true,
            pageSize: pageSize,
            pageNum: pageNum,
            total: total
        }
        // 表格列 配置
        const columns = [{
            title: '执行日期',
            dataIndex: 'time',
            key: 'time',
            align: 'center'
        }, {
            title: '跟进类型',
            dataIndex: 'followType',
            key: 'followType',
            align: 'center'
        }, {
            title: '跟进主题',
            dataIndex: 'followTheme',
            key: 'followTheme',
            align: 'center',
            render: text => {return (text && text.length > 7 ? (<span>{text.substring(0,7)}...</span>) : text)}
        },{
            title: '跟进内容',
            dataIndex: 'followContent',
            key: 'followContent',
            align: 'center',
            render: text => {return (text && text.length > 7 ? (<span>{text.substring(0,7)}...</span>) : text)}
        },{
            title: '执行人',
            dataIndex: 'execu',
            align: 'center',
            key: 'execu',
        },{
            title: '操作',
            key: 'action',
            align: 'center',
            render: (text, record) => (
                <span>
                    <a href="javascript:;" onClick={()=>{this._showEditModal(record._id)}}>编辑</a>
                    <Divider type="vertical" />
                    <a href="javascript:;" onClick={()=>{this._showDeleteModal(record._id)}}>删除</a>
                </span>
            ),
            width: '150px'
        }];
        // 当表格内容为空时
        let locale = {
            emptyText: '抱歉，暂无内容'
        };
        return(
            <div>
                <Button type="primary" className="addFollow" onClick={this._showNewModal}>添加跟进</Button>
                <Table columns={columns} dataSource={followInfo} 
                    expandedRowRender={record => 
                        <div>
                            <p style={{ margin: '0 0 10px' }}><span className="bold">跟进主题：</span>{record.descriptionTheme}</p>
                            <p style={{ margin: '0 0 10px' }}><span className="bold">跟进内容：</span>{record.descriptionCon}</p>
                        </div>}
                    pagination={pagination} onChange={this._handlePageChange} locale={locale}/>
                <Modal
                    className="followModal"
                    title={showTitle}
                    visible={visible}
                    onOk={this._handleOk}
                    onCancel={this._handleCancel}
                    confirmLoading={confirmLoading}
                    okText="保存"
                    cancelText="取消">
                    <Form>
                        <Row>
                            <Col span={colWidth}>
                                <FormItem {...formItemLayout} label="对应客户">
                                    {getFieldDecorator('matchCustomer', {
                                        initialValue:followDetailInfo.matchCustomer,
                                        rules: [{
                                            required: true, message: '请输入对应客户!',
                                        }],
                                    })(
                                        <Input disabled placeholder="请输入"/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={colWidth}>
                                <FormItem {...formItemLayout} label="执行人">
                                    {getFieldDecorator('execu', {
                                        initialValue:followDetailInfo.execu.map((e,i)=>(e._id)),
                                        rules: [{
                                            required: true, message: '请选择执行人!',
                                        }],
                                    })(<Select
                                            mode="multiple"
                                            filterOption={this.filterOption}
                                            notFoundContent ='暂无数据'
                                            placeholder="请选择执行人">
                                            {execuSelect}
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={colWidth}>
                                <FormItem {...formItemLayout} label="跟进类型">
                                    {getFieldDecorator('followType', {
                                        initialValue:followDetailInfo.followType,
                                        rules: [{
                                            required: true, message: '请选择跟进类型!',
                                        }],
                                    })(
                                        <Select
                                          showSearch
                                          allowClear ={true}
                                          filterOption={this.filterOption}
                                          notFoundContent ='暂无数据'
                                          placeholder="请选择跟进类型">
                                          {typeOption}
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={colWidth}>
                                <FormItem {...formItemLayout} label="日期">
                                    {getFieldDecorator('time', {
                                        initialValue:moment(followDetailInfo.time, 'YYYY-MM-DD'),
                                        rules: [{
                                            type: 'object', required: true, message: '请选择日期!',
                                        }],
                                    })(
                                        <DatePicker showToday={false} disabledDate={this._disabledDate} allowClear={false} placeholder="请选择日期"/>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <FormItem {...textAreaLayout} label="跟进主题">
                                    {getFieldDecorator('followTheme', {
                                        initialValue:followDetailInfo.followTheme,
                                        rules: [{
                                            required: true, message: '请输入跟进主题!',
                                        },{
                                            max: 30, message: '字数必须小于30字！'
                                        }],
                                    })(
                                        <TextArea placeholder="请输入跟进主题" rows={4} autosize={{ minRows: 4, maxRows: 4 }} maxLength={30}/>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <FormItem {...textAreaLayout} label="跟进内容">
                                    {getFieldDecorator('followContent', {
                                        initialValue:followDetailInfo.followContent,
                                        rules: [{
                                            max: 300, message: '字数必须小于300字！'
                                        }],
                                    })(
                                        <TextArea placeholder="请输入跟进内容" rows={4} autosize={{ minRows: 4, maxRows: 4 }} maxLength={300}/>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                    </Form>
                </Modal>
                <Modal title="删除跟进信息"
                    visible={deleteVisible}
                    onOk={this._handleDeleteFollow}
                    okText ='确定'
                    cancelText ='取消'
                    confirmLoading={confirmLoading}
                    onCancel={this._handleDeleteCancel}>
                    <p>{deleteModalText}</p>
                </Modal>
            </div>
        )
    }
}
export default Form.create()(CustomerFollowInfo)
