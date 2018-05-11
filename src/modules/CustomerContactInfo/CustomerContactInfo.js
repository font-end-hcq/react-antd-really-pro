import React,{Component} from 'react';
import { Table, Divider, Button, Modal, Row, Col, Input, Icon, message, Form, Dropdown, Menu } from 'antd';
import './CustomerContactInfo.css'
import DB from '@DB';
const { TextArea } = Input;
const FormItem = Form.Item;

class CustomerContactInfo extends Component {
    static propsTypes = {

    }

    constructor(props,context){
        super(props,context);
        this.state = {
            _id: '',                // 客户id
            editId: '',
            matchCustomer: '',      // 保存下，用于重置viewInfo
            visible: false,         // 新建、编辑联系人弹窗是否展示
            viewVisible: false,     // 查看联系人弹窗是否展示
            deleteVisible: false,   // 删除弹窗是否展示
            showTitle: '新建联系人',  // 新建、编辑联系人弹窗title
            deleteModalText:'是否删除该联系人?',
            confirmLoading: false,  // 弹窗按钮点击是否 loading
            colWidth: 12,           // 栅格布局的宽
            contactInfo: [],
            viewInfo:{              // 联系人详细信息
                _id:'',
                name: '',
                important: false,
                matchCustomer: '',
                phone: '',
                wx: '',
                qq: '',
                position: '',
                email: '',
                address: '',
                remarks: ''
            }
        }
    }
    componentDidMount () {
      // 由于这里用的tab分页，切换分页emiter监听不到广播，暂时采用属性注入，之后再做调研
      
        let _id = this.props.customerId;            // 获取到id
        let customerName = this.props.customerName; // 获取到customerName
        this.setState({
            _id: _id,
            matchCustomer: customerName,
            viewInfo: {
                ...this.state.viewInfo,
                matchCustomer: customerName
            }
        },()=>{
            this._getContactList()
        })
    }
    // 获取联系人列表
    _getContactList = () => {
        const { _id } = this.state;
        DB.Customer.getContactList({
            _id: _id,
            all: true
        }).then(({list})=>{
            if(list && list.length>0){
                list.map((l,i)=>(
                    l.key = l._id
                ))
                this.setState({
                    contactInfo: list
                })
            }
        },err=>{
            message.destroy();
            message.error(err.errorMsg)
        })
    }
    // 获取联系人详情
    _getContactDetail = (_id, operate) => {
        const { viewInfo } = this.state;
        DB.Customer.getContactDetail({
           _id: _id
        }).then((data)=>{
            data.matchCustomer = viewInfo.matchCustomer;
            if(operate === 'isView'){
                for(let a in viewInfo) {
                    data[a] = data[a] || '无'
                }
            }
            this.setState({
                viewInfo: data
            })
        },err=>{
            message.destroy();
            message.error(err.errorMsg)
        })
    }

    // 新建弹窗,初始化 界面内容
    showNewModal = () => {
        this.props.form.resetFields()
        const { contactInfo } = this.state;
      
        if(contactInfo.length >= 5) {
            message.destroy();
            message.warning('最多只能有5个联系人！');
            return;
        }
        this.setState({
            visible: true,
            confirmLoading: false,
            viewInfo: {
                _id:'',
                name: '',
                important: false,
                matchCustomer: this.state.matchCustomer,
                phone: '',
                wx: '',
                qq: '',
                position: '',
                email: '',
                address: '',
                remarks: ''
            },
            showTitle: '新建联系人',
            editId: ''      // 重置下正在操作的联系人
        })
    }
    // 编辑弹窗,初始化 界面内容
    showEditModal = (_id) => {
        this.setState({
            visible: true,
            confirmLoading: false,
            showTitle: '编辑联系人',
            editId: _id,
            viewInfo:{
                _id:'',
                name: '',
                important: false,
                matchCustomer: this.state.matchCustomer,
                phone: '',
                wx: '',
                qq: '',
                position: '',
                email: '',
                address: '',
                remarks: ''
            }
        },()=>{
            // 请求联系人数据，渲染Modal
            this._getContactDetail(_id,'isEdit')
        });
    }
    // 查看弹窗
    showViewModal = (_id) => {
        this.setState({
            viewVisible: true,
            confirmLoading: false,
            showTitle: '查看联系人',
            editId: _id
        },()=>{
            // 请求联系人数据，渲染Modal
            this._getContactDetail(_id,'isView')
        });
    }
    // 删除弹窗
    showDeleteModal = (_id) => {
        this.setState({
            deleteVisible: true,
            confirmLoading: false,
            editId: _id
        });
    }
    // 保存 新建或编辑联系人
    handleOk = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                this.setState({
                    confirmLoading: true
                })
                let params = {
                    name: values.name || '',
                    kehuId: this.state._id,
                    important: this.state.viewInfo.important,
                    phone: values.phone || '',
                    wx: values.wx || '',
                    qq: values.qq || '' ,
                    position: values.position || '',
                    email: values.email || '',
                    address: values.address || '',
                    remarks: values.remarks || ''
                }
                if(!!this.state.editId) params._id = this.state.editId;
                // 新建/编辑
                DB.Customer.updateContact(params).then((res)=>{
                    if(res){
                        message.destroy();
                        message.success(!!this.state.editId ? "编辑联系人成功！" : "新建联系人成功！")
                        this._getContactList()
                        this.props.form.resetFields()
                        this.setState({ // 重置
                            visible: false,
                            confirmLoading: false,
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
    // 取消 新建/编辑联系人
    handleCancel = () => {
        this.props.form.resetFields()
        this.setState({
            visible: false,
            confirmLoading: false,
            editId: '',
            viewInfo:{
                _id:'',
                name: '',
                important: false,
                matchCustomer: this.state.matchCustomer,
                phone: '',
                wx: '',
                qq: '',
                position: '',
                email: '',
                address: '',
                remarks: ''
            }
        });
    }
    // 编辑 查看联系人
    handleViewOk = () => {
      const { editId } = this.state;
        this.setState({
            viewVisible: false,
            confirmLoading: true
        },()=>{
            this.showEditModal(editId);
        });
    }
    // 取消 查看联系人
    handleViewCancel = () => {
        this.props.form.resetFields()
        this.setState({
            viewVisible: false,
            confirmLoading: false,
            editId: ''
        });
    }
    // 确认 删除联系人
    handleDeleteContact = (e) => {
        const { editId } = this.state;
        this.setState({
            confirmLoading: true
        })
        // 发送请求删除
        DB.Customer.deleteContact({
           _id: editId
        }).then((res)=>{
            if(res){
                message.destroy();
                message.success('删除联系人成功！')
                this._getContactList()
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
    // 取消 删除联系人
    handleDeleteCancel = () => {
        this.props.form.resetFields()
        this.setState({
            deleteVisible: false,
            confirmLoading: false,
            editId: ''
        });
    }
    // 将联系人设为 首要联系人
    _handleSetImportant = (_id) => {
        // 发送请求，将该联系人设为首要联系人
        DB.Customer.setContactImportant({
           _id: _id
        }).then((res)=>{
            if(res){
                message.destroy();
                message.success('首要联系人设置成功！')
                this._getContactList()
            } 
        },err=>{
            message.destroy();
            message.error(err.errorMsg)
        })
    }
    render() {
        const {contactInfo, visible, viewVisible, deleteVisible, showTitle, confirmLoading, colWidth, viewInfo, deleteModalText} = this.state
        const { getFieldDecorator } = this.props.form;
        // 表单item的布局样式
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
        // “备注”item的布局样式
        const remarksLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 4 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 19},
            },
        }
        const columns = [{
            title: '',
            dataIndex: 'important',
            key: 'important',
            render: text => {return (text ? (<Icon type="star" />) : '')},
            align: 'right'
        },{
            title: '姓名',
            dataIndex: 'name',
            key: 'name',
            align: 'center'
        },{
            title: '手机',
            dataIndex: 'phone',
            key: 'phone',
            align: 'center'
        },{
            title: '职位',
            dataIndex: 'position',
            key: 'position',
            align: 'center'
        },{
            title: '邮件',
            dataIndex: 'email',
            key: 'email',
            align: 'center'
        },{
            title: '微信',
            dataIndex: 'wx',
            key: 'wx',
            align: 'center'
        },{
            title: '操作',
            key: 'action',
            align: 'center',
            render: (text, record) => (
                <span>
                    <a href="javascript:;" onClick={()=> {this._handleSetImportant(record._id)}} disabled={record.important}>设为首要</a>
                    <Divider type="vertical" />
                    <Dropdown overlay={(
                        <Menu>
                            <Menu.Item>
                                <a href="javascript:;" onClick={() => {this.showEditModal(record._id)}}>编辑</a>
                            </Menu.Item>
                            <Menu.Item>
                              <a href="javascript:;" onClick={() => {this.showViewModal(record._id)}}>查看</a>
                            </Menu.Item>
                            <Menu.Item className="menu-delete" disabled={record.important}>
                              <a href="javascript:;" onClick={() => {this.showDeleteModal(record._id)}} disabled={record.important}>删除</a>
                            </Menu.Item>
                        </Menu>
                    )}>
                        <a>
                          更多<Icon type="down" />
                        </a>
                    </Dropdown>
                </span>
            ),
            width: '150px'
        }];
        let locale = {
            emptyText: '抱歉，暂无内容'
        };
        return(
            <div>
                <Button type="primary" className="addContact" onClick={this.showNewModal}>添加联系人</Button>
                <Table columns={columns} dataSource={contactInfo} pagination={false} locale={locale}/>
                <Modal
                    className="contactModal"
                    title={showTitle}
                    visible={visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    confirmLoading={confirmLoading}
                    okText="保存"
                    cancelText="取消">
                    <Form >
                        <Row>
                            <Col span={colWidth}>
                                <FormItem {...formItemLayout} label="姓名">
                                    {getFieldDecorator('name', {
                                        initialValue:viewInfo.name,
                                        rules: [{
                                            required: true, message: '请输入姓名!',
                                        },{
                                            max: 30, message: '字数必须小于30字!'
                                        }],
                                    })(
                                        <Input placeholder="请输入姓名" maxLength={30}/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={colWidth}>
                                <FormItem {...formItemLayout} label="对应客户">
                                    {getFieldDecorator('matchCustomer', {
                                        initialValue:viewInfo.matchCustomer,
                                        rules: [{
                                            required: true, message: '请输入对应客户!',
                                        }],
                                    })(
                                        <Input disabled placeholder="请输入对应客户"/>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={colWidth}>
                                <FormItem {...formItemLayout} label="手机">
                                    {getFieldDecorator('phone', {
                                        initialValue:viewInfo.phone,
                                        rules: [{
                                            required: true, message: '请输入手机号!',
                                        },{
                                            pattern:/^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57]|166)[0-9]{8}$/,message: '手机号格式不正确!'
                                        }],
                                    })(
                                        <Input placeholder="请输入手机号" maxLength={11}/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={colWidth}>
                                <FormItem {...formItemLayout} label="微信">
                                    {getFieldDecorator('wx', {
                                        initialValue:viewInfo.wx,
                                        rules: [{
                                            max:30, message: '字数必须小于30字!',
                                        }],
                                    })(
                                        <Input placeholder="请输入微信" maxLength={30}/>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={colWidth}>
                                <FormItem {...formItemLayout} label="QQ">
                                    {getFieldDecorator('qq', {
                                        initialValue:viewInfo.qq,
                                        rules: [{
                                            pattern:/^[1-9]\d{4,9}$/, message: '请输入正确QQ号!'
                                        }],
                                    })(
                                        <Input placeholder="请输入QQ"/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={colWidth}>
                                <FormItem {...formItemLayout} label="职位">
                                    {getFieldDecorator('position', {
                                        initialValue:viewInfo.position,
                                        rules: [{
                                            max:30, message: '字数必须小于30字!',
                                        }],
                                    })(
                                        <Input placeholder="请输入职位" maxLength={30}/>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                         <Row>
                            <Col span={colWidth}>
                                <FormItem {...formItemLayout} label="邮件">
                                    {getFieldDecorator('email', {
                                        initialValue:viewInfo.email,
                                        rules: [{
                                            type: 'email', message: '请输入邮箱正确格式！'
                                        }],
                                    })(
                                        <Input placeholder="请输入邮件"/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={colWidth}>
                                <FormItem {...formItemLayout} label="联系地址">
                                    {getFieldDecorator('address', {
                                        initialValue:viewInfo.address,
                                        rules: [{
                                            max:30, message: '字数必须小于30字',
                                        }],
                                    })(
                                        <Input placeholder="请输入联系地址" maxLength={30}/>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <FormItem {...remarksLayout} label="备注">
                                    {getFieldDecorator('remarks', {
                                        initialValue:viewInfo.remarks,
                                        rules: [{
                                            max:300, message: '字数必须小于300字',
                                        }],
                                    })(
                                        <TextArea placeholder="请输入备注" rows={4} autosize={{ minRows: 4, maxRows: 4 }} maxLength={300}/>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                    </Form>
                </Modal>
                <Modal
                    className="viewContactModal"
                    title={showTitle}
                    visible={viewVisible}
                    onOk={this.handleViewOk}
                    onCancel={this.handleViewCancel}
                    confirmLoading={confirmLoading}
                    okText="编辑"
                    cancelText="取消">
                    <Row>
                        <Col span={colWidth}><span className="bold leftLabel">姓名：</span><span className="rightLabel">{viewInfo.name}</span></Col>
                        <Col span={colWidth}><span className="bold leftLabel">对应客户：</span><span className="rightLabel">{viewInfo.matchCustomer}</span></Col>
                    </Row>
                    <Row>
                        <Col span={colWidth}><span className="bold leftLabel">手机：</span><span className="rightLabel">{viewInfo.phone}</span></Col>
                        <Col span={colWidth}><span className="bold leftLabel">微信：</span><span className="rightLabel">{viewInfo.wx}</span></Col>
                    </Row>
                    <Row>
                        <Col span={colWidth}><span className="bold leftLabel">QQ：</span><span className="rightLabel">{viewInfo.qq}</span></Col>
                        <Col span={colWidth}><span className="bold leftLabel">职位：</span><span className="rightLabel">{viewInfo.position}</span></Col>
                    </Row>
                    <Row>
                        <Col span={colWidth}><span className="bold leftLabel">邮件：</span><span className="rightLabel">{viewInfo.email}</span></Col>
                        <Col span={colWidth}><span className="bold leftLabel">联系地址：</span><span className="rightLabel">{viewInfo.address}</span></Col>
                    </Row>
                    <Row>
                        <Col span={24}><span className="bold" style={{width:'12%',textAlign:'right',display:'inline-block',verticalAlign:'top'}}>备注：</span><p className='inline'>{viewInfo.remarks}</p></Col>
                    </Row>
                </Modal>
                <Modal title="删除联系人信息"
                    visible={deleteVisible}
                    onOk={this.handleDeleteContact}
                    okText ='确定'
                    cancelText ='取消'
                    confirmLoading={confirmLoading}
                    onCancel={this.handleDeleteCancel}>
                    <p>{deleteModalText}</p>
                </Modal>
            </div>
        )
    }
}

export default Form.create()(CustomerContactInfo)
