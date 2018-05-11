import React, {Component} from 'react'
import moment from 'moment'
import DB from '@DB'
import {
    Breadcrumb,
    Select,
    Button,
    Spin,
    Modal,
    Input,
    Table,
    Pagination,
    Popconfirm,
    message,
    Divider
} from 'antd';
const {Option} = Select

const {TextArea} = Input;

class CustomerManage extends Component {
    constructor(props) {
        super(props)
        this.state = {
			loading: true,
 			pageNum: 1,
 			pageSize:15,
            total: 0,
            statuskey:undefined,          //客户状态（0潜在，1签约）
            list:[],                      //数据列表
            searchOpt:{},                 //查询条件
            createObj:{},                 //新建客户对象
            cusomerId:'',                 //快速创建返回的客户id
            iscontinue:false,             //是否继续编辑

            //modal相关
            visible: false,               //快速新建 modal是否显示
            sourceList:[]                 //来源列表
		}
    }

    componentDidMount(){
        this._Sourcelist()
        this._getCustomer()
    }
    //获取客户来源
    _Sourcelist = () =>{
        DB.Customer.Sourcelist().then(async (res) => {
            this.setState({
              sourceList:res.list,
           })
        }, (err) => {
            message.error(err.errorMsg)
        });
    }

    //获取查询状态
    _searchChange = (value) =>{
        let { searchOpt, statuskey } = this.state;
        this.setState({
            searchOpt:{
                ...searchOpt,
                status:value
            }
        },()=>{
            if(this.state.searchOpt.status === '潜在'){
                this.setState({
                    statuskey:0
                })
            }else if(this.state.searchOpt.status === '签约'){
                this.setState({
                    statuskey:1
                })
            }else{
                this.setState({
                    statuskey:undefined
                })
            }
        })
    }

    //得到客户列表 
    _getCustomer = () =>{
        const { pageSize, pageNum ,searchOpt, statuskey, loading, total} = this.state;
        DB.Customer.getList({
            pageSize: pageSize,               //单页数
            pageNum: pageNum ,
            name: searchOpt.name,             //客户名称
            status: statuskey,                 //页码
        }).then(async (res) => {   
            // 改变时间与地址格式
            res.list.forEach((li, index) => {
                li.createTime = moment(li.createTime).format('YYYY/MM/DD');
                li.province = (li.province ? li.province :'' )+(li.city ? '/'+ li.city :'')+(li.area ?'/'+ li.area :'')
                li.key = index;
                li.status ? li.status='签约':li.status='潜在'                
            })
            // 将拿到的数据进行渲染
            this.setState({
                loading: false,
                list: res.list,
                total: res.count
            })
        }, (err) => {
            message.error(err.errorMsg)
        });

    }
    // 查询
    _search = () =>{
        const { loading, total, pageSize, searchOpt, statuskey} = this.state;
        DB.Customer.getList({
            pageSize,                         //单页数            
            name: searchOpt.name,             //客户名称
            status: statuskey,                //客户状态
        }).then(async (res) => {
            // 改变时间与地址格式
            res.list.forEach((li, index) => {
                li.createTime = moment(li.createTime).format('YYYY/MM/DD');
                li.province = (li.province ? li.province :'' )+(li.city ? '/'+ li.city :'')+(li.area ?'/'+ li.area :'')
                li.key = index;
                li.status ? li.status='签约':li.status='潜在'
            })
            // 将拿到的数据进行渲染
            this.setState({
                loading: false,
                list: res.list,
                total: res.count
            })
        }, (err) => {
            message.error(err.errorMsg)
        });

    }
    //确认删除 注意：已签约用户不能删
    _delete(rows){
        DB.Customer.Delete({
            _id:rows._id
        }).then(res =>{
            message.success(res)
            this._getCustomer()
        },({errorMsg})=>{
            message.error(errorMsg)
        })
    }

    handleSelectChange = (value) =>{
        let {source,createObj} = this.state;
        this.setState({
            createObj:{
                ...createObj,
                source:value
            }
        })
    }


    showModal = () => {
        this.setState({
          visible: true,
          createObj:{}   //再次点击弹框清空输入框
        });
      }

    handleCancel = () => {
       this.setState({ visible: false });
    }


    //快速新建 & 继续完善
    _createEdit = () =>{
        const { createObj,visible ,iscontinue } = this. state;
        DB.Customer.createCustomer(createObj).then(async (res) => {
            this.setState({
               visible: false,
               createObj:{
                   ...createObj,
                   cusomerId:res._id
               }
            },()=>{
              iscontinue ?
              (window.location.href =  `#/jiameng/customer/create/${this.state.createObj.cusomerId}`):(this._getCustomer())
            });
        }, (err) => {
            this.setState({
                createObj:{
                    ...createObj,
                    error:true
                }
            })
            //提示用户名是否重复
            message.error(err.errorMsg)

        });
     }

    //点击保存，快速新建 并校验输入框
    _checkInput = () => {
        let { createObj } = this.state
        const {
            name,
            source,
            lianxiren,
            phone
        } = createObj
        const reg = new RegExp(
    		/^(13[0-9]|15[012356789]|17[0-9]|18[0-9]|14[57]|166)[0-9]{8}$/,
    	)
        let description;
        if(!name){
            description = '请输入客户名称'
        }else if(!source){
            description = '请选择来源'
        }else if(!lianxiren){
            description = '请输入首要联系人'
        }else if(!phone){
            description = '请输入手机号码'
        }else if(!reg.test(phone)){
            description = '手机号码格式不正确'
        }

        if(description){
            message.destroy()
            message.error(description)
        }else{
            this._createEdit()
        }
    }

   
    render(){
        const {loading, sourceList, searchOpt, list, pageNum, pageSize ,total, visible, createObj, status, statuskey} = this.state
        let locale = {
            emptyText: '抱歉，暂无内容'
        };
        const columns = [{
            title: '客户名称',
            key:'name',
            width:230,
            render:(cust)=>(
            <a href={`#/jiameng/customer/detail/${cust._id}`} style={{color:"rgba(0,0,0,.65)"}} className='khname' title={cust.name}>{cust.name}</a> 
            )
        },{
            title:'地区',
            dataIndex:'province',
            key:'province',
            width:260
        },{
            title:'创建日期',
            dataIndex:'createTime',
            key:'createTime'
        },{
            title:'来源',
            dataIndex:'source',
            key:'source'
        },{
            title:'状态',
            dataIndex:'status',
            key:'status'
        },{
            title:'操作',
            key:'options',
            align:'center',
            render: (itm) => (
            <span>
                <a href={`#/jiameng/customer/detail/${itm._id}`}>查看</a>
                <Divider type="vertical" />

                {
                itm.status === '签约' ?
                (
                    <a href="javascript:void(0)" style={{ color:'#ccc'}}>删除</a>
                ): (
                    <Popconfirm title="删除后不可恢复,确定要删除吗？"
                        okText ="确认"
                        cancelText="取消"
                        onConfirm = {this._delete.bind(this,itm)}>
                        <a href="javascript:void(0)" >删除</a>
                    </Popconfirm>
                    )
            }
            </span>
            ),
        }];


        return (
            <div>
                <Breadcrumb>
                    <Breadcrumb.Item>客户管理</Breadcrumb.Item>
                    <Breadcrumb.Item>我的客户</Breadcrumb.Item>
                </Breadcrumb>
                <div className="search" style={{marginTop:18}}>
                    <div className="inps custname">
                        <label style={{marginLeft:15,marginRight:8}}>客户名称:</label>
                        <Input
                        placeholder="请输入客户名称"
                        maxLength={30}
                        style={{width:250,marginBottom: 25}}
                        value={searchOpt.name}
                        onChange={(e)=>{
                            this.setState({
                                searchOpt:{
                                    ...searchOpt,
                                    name:e.target.value
                                }
                            })
                        }}/>
                    </div>
                    <div className="inps">
                        <label style={{marginLeft:15,marginRight:8}}>状态:</label>
                        <Select
                            placeholder="请选择状态"
                            style={{ width: 200 }}
                            style={{width: 200,marginBottom:25}}                        
                            value={searchOpt.status}
                            onChange={this._searchChange}
                        >
                            <Option value="签约">签约</Option>
                            <Option value="潜在">潜在</Option>
                        </Select>
                    </div>
                    <div className="inps btns">
                    <Button type="primary" style={{marginLeft:10,marginRight:10}} onClick={this._search}>查询</Button>
                    <Button onClick={() => {
                        let { searchOpt } = this.state;
                        this.setState({
                            searchOpt:{},
                            statuskey:undefined
                        })
                        }}>重置</Button>
                </div>

                </div>
                <p className='newcreate'><Button type="primary" onClick={this.showModal}>
                    <i className="anticon anticon-plus"></i>
                新建</Button></p>
                <Modal
                    title="快速新建客户"
                    wrapClassName="vertical-center-modal"
                    visible={visible}
                    onOk={this._checkInput}
                    onCancel={this.handleCancel}
                    footer={[
                        <Button key="back" onClick={this.handleCancel}>取消</Button>,
                        <Button key="submit" type="primary"  
                        disabled={createObj.error}                    
                        onClick={ ()=>{
                            this.setState({
                                iscontinue:false
                            },()=>{  
                                this._checkInput()
                             })
                        }}>
                        保存
                        </Button>,
                        <Button key="continue"
                        disabled={createObj.error} 
                        type="primary"
                        onClick={()=>{
                            this.setState({
                                iscontinue:true
                            },()=>{  
                                this._checkInput()
                            })
                        }
                    }
                        >继续完善</Button>,

                    ]}
                    >
                    <ul className="createkh">
                        <li >
                            <label><i>*</i>客户名称：</label>
                            <Input placeholder="请输入客户名称"
                            maxLength={30}
                            value={createObj.name}
                            onChange= {e=>{
                                this.setState({
                                    createObj:{
                                        ...createObj,
                                        name:e.target.value,
                                        error:'',
                                    }
                                })
                        }}/>
                        </li>
                        <li className="khsource"><label><i>*</i>来源：</label>
                            <Select id="select" style={{ width: 296 }}
                                placeholder="请选择来源"
                                value={createObj.source}
                                onChange={this.handleSelectChange}>
                            {
                                sourceList.map((it,i) => <Option key={it._id} value={it.name}>{it.name}</Option>)
                            }
                            </Select>
                        </li>
                        <li className="firstconcat">
                            <label><i>*</i>首要联系人：</label>
                            <Input placeholder="请输入首要联系人"
                            maxLength={30}
                            value={createObj.lianxiren}
                            onChange= {e=>{
                                this.setState({
                                    createObj:{
                                        ...createObj,
                                        lianxiren:e.target.value,
                                        error:'',
                                    }
                                })
                            }}/>
                        </li>
                        <li>
                            <label><i>*</i>手机：</label>
                            <Input placeholder="请输入手机号码"
                                maxLength={11}
                                value={createObj.phone}
                                onChange= {e=>{
                                this.setState({
                                    createObj:{
                                        ...createObj,
                                        phone:e.target.value,
                                        error:'',
                                    }
                                })
                            }}/>
                        </li>
                        <li className="beizhu">
                            <label>备注：</label>
                            <TextArea
                            autosize={{ minRows: 3, maxRows:4 }}
                            placeholder="请输入备注（300字以内）"
                            maxLength={300}
                            value={createObj.remark}
                            onChange= {e=>{
                                this.setState({
                                    createObj:{
                                        ...createObj,
                                        remark:e.target.value
                                    }
                                })
                        }}/>
                        </li>
                    </ul>
                </Modal>
                <Spin spinning= {loading}>
                    <Table
                        columns={columns}
                        dataSource={list}
                        locale={locale}
                        key={list._id}
                        pagination={false}
                    />
                    {
                    total > 0 ?
                    <Pagination
                        showQuickJumper
                        showTotal={total => `共 ${total} 条`}
                        current={pageNum}
                        pageSize={pageSize}
                        total={total}
                        onChange={async pageNum=>{
                            await this.setState({
                                pageNum
                            })
                            this._getCustomer()                            
                        }}
                        key='page'
                        style={{marginTop:'30px',textAlign:'right'}}/>
                        : ''
                    }
                </Spin>
            </div>
        )
    }
}
export default CustomerManage
