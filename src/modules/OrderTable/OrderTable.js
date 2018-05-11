import React, {Component} from 'react'
import {Table, Modal, Input, message, Spin, Popconfirm} from 'antd'
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
import DB from '@DB';
const { TextArea } = Input;
class OrderTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            expandedRow: [],    //展开行所需的数组
            openModal:false,    //完善物流信息对话框
            remarkModal:false,  //备注对话框
            remark:'', //备注信息
            editRemark:'', //编辑备注信息
            expressCompany:'', //快递公司
            courierNum:'', //快递单号
            orderInfo:[],   //存储订单数据
            status: 100,    //订单状态默认为100
            name:'0',   //商品名称,全部为 '0'
            phone:'0',  //手机号,全部为 '0'
            userName:'0',   //买家昵称,全部为 '0'
            startTime:1000000000000, //开始时期的时间戳,  选则为 1000000000000
            endTime:5000000000000,  //结束时期的时间戳, 选则为 5000000000000
            pageNum:1,  //第几页
            pageSize:5,  //每页显示多少条数据
            total:0,    //总共多少条数据
            _id:null, //存储每个订单id
            loading:true,
        }
    }
    componentDidMount() {
        this.getOrderList(); //获取订单列表数据
        this.listenerEmiter();  //监听查询组件传来的值
    }
    //在卸载的时候对所有的操作进行清除
    componentWillUnmount = () => {
        this.setState = (state,callback)=>{
          return;
        };
    }

    //监听查询组件传来的值
	listenerEmiter = () => {
        const { name, status, phone, userName, startTime, endTime, } = this.state
		emitter.addListener('searchOrder',(obj) => {
            this.setState({ 
                status: obj.status,
                name:obj.name,
                phone:obj.phone,
                userName:obj.userName,
                startTime:obj.startTime,
                endTime:obj.endTime,
                pageNum:1,
                loading:true,
            }, () => {
                this.getOrderList();
            });
        })
	}
    //获取订单列表内容
    getOrderList = () =>{
        const { pageSize, pageNum, total, orderInfo, name, status, phone, userName, startTime, endTime, } = this.state
		DB.Order.getOrderList({
            pageSize: pageSize,
            pageNum: pageNum,
            status: status,
            name: name,
            phone: phone,
            userName: userName,
            startTime: startTime,
            endTime: endTime,
		}).then(({list, count})=>{
            if(list){
                list.forEach((item,i)=>{
                    //处理数据 形成新的数据
                    item.key = i;
                    item.company = item.express.type || '暂无';
                    item.courierNum = item.express.number || '暂无';
                    item.orderRemark = item.remark || '暂无'
                    item.orderTime = moment(item.createTime).format('YYYY-MM-DD HH:mm:ss');
                    item.goodsName = item.goodslist;
                    
                    item.goodsPrice = item.goodslist;

                    item.goodsNumber = item.goodslist;

                    item.goodsSum = item.goodslist;

                    item.userNamePhone = {
                        userName:item.userName,
                        phone:item.phone,
                    };

                    item.orderStatus = ( () => {
                        if(item.status == '0'){
                            return '已取消'
                        }else if(item.status == '1'){
                            return '未支付'
                        }else if(item.status == '2'){
                            return '已支付'
                        }else if(item.status == '3'){
                            return '确认到款'
                        }else{
                            return '已发货'
                        }
                    })();
                    return item;
                })
                this.setState({
                    total: count,
                    orderInfo: list,
                    loading:false,
                })
            }
		},({errorMsg})=>{
            message.destroy();
			message.error(errorMsg);
		})
	}
    //查看详情的方法
    expandedRow = (key, html) => {
        const arr = this.state.expandedRow;
        if(arr.indexOf(key) == -1) {
            //代表key在数组里不存在
            html.innerHTML = "收起详情";
            arr.push(key);
        }else{
            //key在数组中存在 已展开 再点击需要关闭
            for(let i = 0; i < arr.length; i++) {
                if(arr[i] === key) {
                    html.innerHTML = "查看详情";
                    arr.splice(i, 1);
                }
            }
        }

        this.setState({
            expandedRow: arr
        });

    }

    //表格分页器change

    _handlePageChange = (page) =>{
        this.setState({
            pageNum: page.current,
            loading:true,
        },()=>{
            this.getOrderList()
        })
    }

    //添加备注保存订单id
    addRemark = (_id) => {
        this.setState({
            remarkModal:true,
            _id:_id,
        })
    }

    //编辑备注保存订单id
    editRemark = (_id,remark) => {
        this.setState({
            remarkEditModal:true,
            _id:_id,
            editRemark:remark,
        })
    }

    //添加备注确认请求
    checkRemark = () => {
        const { remark , _id} = this.state;
        DB.Order.addRemark({
            _id:_id,
            remark:remark,
		}).then((data) =>{
            message.success('添加备注成功');
            this.setState({
                remarkModal:false,
                loading:true,
            },() => {
                this.getOrderList();
            })
		},({errorMsg})=>{
            message.destroy();
			message.error(errorMsg);
		})
    }

    //编辑备注确认方法
    checkEditRemark = () => {
        const { editRemark , _id} = this.state;
        DB.Order.addRemark({
            _id:_id,
            remark:editRemark,
		}).then((data) =>{
            message.success('编辑备注成功');
            this.setState({
                remarkEditModal:false,
                loading:true,
            },() => {
                this.getOrderList();
            })
		},({errorMsg})=>{
            message.destroy();
			message.error(errorMsg);
		})
    }

    //确认到款按钮点击发送请求改变订单状态
    checkMoney = (_id) => {
        DB.Order.getMoney({
            _id:_id,
		}).then((data) =>{
            message.success('确认到款成功');
            this.getOrderList();
		},({errorMsg})=>{
            message.destroy();
			message.error(errorMsg);
		})
    }
    
    //点击发货获取订单id并打开完善物流对话框
    checkPay = (_id) => {
        this.setState({
            openModal:true,
            _id:_id,
        })
    }

    //物流信息提交时验证这些字段是否符合
	checkLogistics = () => {
		const { expressCompany , courierNum } = this.state;

		let description;
		if(!expressCompany){
			description = '请输入快递公司'
		}else if(!courierNum){
			description = '请输入快递单号'
		}

		if(description){
			message.destroy()
			message.error(description)
		}else{
			this.addLogistics()
		}
	}
    //完善物流信息提交方法
    addLogistics = () => {
        const { expressCompany , courierNum , openModal , _id} = this.state;
        DB.Order.addExpress({
            _id:_id,
            number:courierNum,
            type:expressCompany,
		}).then(data=>{
			message.success('完善物流信息成功')
			this.setState({
                openModal:false,
                expressCompany:'',
                courierNum:'',
                loading:true,
			},() =>{
				this.getOrderList();
			})
		},({errorMsg})=>{
			message.error(errorMsg)
		})
    }

    render() {
        const {openModal, expandedRow, pageSize, pageNum, total, orderInfo , editRemark ,loading} = this.state;
        // 表格分页配置
        const pagination = {
            showQuickJumper: true,
            pageSize: pageSize,
            current: pageNum,
            total: total,
            showTotal: (total)=>{
                return `共${total}条`
            }
        }
        // 表格列配置
        const columns = [{
            title: '商品',
            dataIndex: 'goodsName',
            key: 'goodsName',
            align: 'center',
            className:'record',
            render: (text,record,index) => {
                return(
                    text.map( (item,index) => {
                        return (
                            <div key={index}>{item.name}</div>
                        )
                    })
                )
            } 
        }, {
            title: '单价',
            dataIndex: 'goodsPrice',
            key: 'goodsPrice',
            align: 'center',
            className:'record',
            render: (text,record,index) => {
                return(
                    text.map( (item,index) => {
                        return (
                            <div key={index}>{item.price}元</div>
                        )
                    })
                )
            } 
        }, {
            title: '数量',
            dataIndex: 'goodsNumber',
            key: 'goodsNumber',
            align: 'center',
            className:'record',
            render: (text,record,index) => {
                return(
                    text.map( (item,index) => {
                        return (
                            <div key={index} className="price">{item.number}</div>
                        )
                    })
                )
            } 
        }, {
            title: '实付',
            dataIndex: 'goodsSum',
            key: 'goodsSum',
            align: 'center',
            className:'record',
            render: (text,record,index) => {
                return(
                    text.map( (item,index) => {
                        return (
                            <div key={index}>{item.sum}元</div>
                        )
                    })
                )
            } 
        }, {
            title: '订单状态',
            dataIndex: 'orderStatus',
            key: 'orderStatus',
            align: 'center',
        }, {
            title: '买家',
            dataIndex: 'userNamePhone',
            key: 'userNamePhone',
            align: 'center',
            render: (text,record,index) => {
                return(
                    <div key={index} className="user">
                        <div>{text.userName}</div>
                        <div>{text.phone}</div>
                    </div>
                )
            } 
        }, {
            title: '下单时间',
            dataIndex: 'orderTime',
            key: 'orderTime',
            align: 'center',
            render: (text,record,index) => {
                return (
                    text && text.length > 7 ?
                    <div style={{width: 80,margin: '0 auto'}}>
                        <span>{text.substring(0,10)}</span>
                        <span>{text.substring(10,20)}</span>
                    </div>
                    :
                    '暂无下单时间'
                )
            }
        },{ 
            title: '操作', 
            dataIndex: 'key', 
            align: 'center',
            render: (key,record) => {
                return(
                    <div className="handleSpan">
                        {/* 根据订单状态显示对应按钮 */}
                        {
                            record.status == "2" ?
                                <Popconfirm title="确认确认到款?" onConfirm={this.checkMoney.bind(this,record._id)} okText="确认" cancelText="取消">
                                    <a href="javascript:void(0);">确认到款</a>
                                </Popconfirm>
                            : ""
                        }

                        {
                            record.status == "3" ?
                            <a href="javascript:void(0);" onClick={this.checkPay.bind(this,record._id)}>点击发货</a >
                            : ""
                        }

                        {
                            record.remark == "" ? 
                            <a href="javascript:void(0);" onClick={this.addRemark.bind(this,record._id)}>添加备注</a >
                            :
                            <a href="javascript:void(0);" onClick={this.editRemark.bind(this,record._id,record.remark)}>编辑备注</a >
                        }

                        {/* {
                            record.express.type == "" && record.express.number == "" &&  record.remark == "" ? ''
                            :
                            <a href="javascript:void(0);" onClick={(e) => {this.expandedRow(key, e.target)}}>查看详情</a >
                        } */}

                        <a href="javascript:void(0);" onClick={(e) => {this.expandedRow(key, e.target)}}>查看详情</a >
                    </div>
                )
            } 
        },];

        // 当表格内容为空时的文字
        let locale = {
            emptyText: '抱歉，暂无内容'
        };

        return (
            <div style={{marginTop:20}}>
                <Spin spinning={this.state.loading}>
                    <Table
                        columns={columns} 
                        dataSource={orderInfo}
                        pagination={pagination}
                        expandedRowRender={record => 
                            <div>
                                <p style={{ margin: '0 0 10px' }}><span className="bold">快递公司：</span>{record.company}<span className="bold bold_left">快递单号：</span>{record.courierNum}</p>
                                <p style={{ margin: '0 0 10px' }}><span className="bold">备注：</span>{record.orderRemark}</p>
                            </div>
                        }
                        expandIconColumnIndex={-1}
                        expandedRowKeys={this.state.expandedRow}
                        expandIconAsCell={false} 
                        // scroll={{ y: 500 }}
                        locale={locale}
                        onChange={this._handlePageChange}
                        className="table"
                    />
                </Spin>
                <Modal title={'完善物流信息'}
					visible={this.state.openModal}
					maskClosable={false}
					destroyOnClose={true}
					okText ='确定'
					cancelText ='取消'
					onOk={this.checkLogistics}
					onCancel={()=>{
						this.setState({
                            //关闭弹窗并清空所有内容
                            openModal:false,
                            expressCompany:'',
                            courierNum:'',
						})
				    }}
				>
                    <section>
                        <div style={{paddingLeft:34}}>
                            <span className="mandatory">快递公司:</span>
                            <Input
                                maxLength={30}
                                value={this.state.expressCompany}
                                placeholder='请输入快递公司'
                                onChange={ ({target}) => {
                                    this.setState({
                                        expressCompany:target.value
                                    })
                                }}
                                style={{width:280}}
                            />
                        </div>
                        <div style={{paddingLeft:34,marginTop:20}}>
                            <span className="mandatory">快递单号:</span>
                            <Input
                                maxLength={30}
                                value={this.state.courierNum}
                                placeholder='请输入快递单号'
                                onChange={ ({target}) => {
                                    this.setState({
                                        courierNum:target.value
                                    })
                                }}
                                style={{width:280}}
                            />
                        </div>
                    </section>
                </Modal>

                <Modal title={"输入备注"}
					visible={this.state.remarkModal}
					maskClosable={false}
					destroyOnClose={true}
					okText ='确定'
					cancelText ='取消'
					onOk={this.checkRemark}
					onCancel={()=>{
						this.setState({
                            //关闭弹窗并清空所有内容
                            remarkModal:false,
                            remark:'',
						})
				    }}
				>
                    <section>
                        <div style={{paddingLeft:8}}>
                            <TextArea rows={4} maxLength="300" placeholder="请输入备注" onChange={({target})=>{
                                this.setState({
                                    remark:target.value
                                })
                            }}/>
                        </div>
                    </section>
                </Modal>

                 <Modal title={"编辑备注"}
					visible={this.state.remarkEditModal}
					maskClosable={false}
					destroyOnClose={true}
					okText ='确定'
					cancelText ='取消'
					onOk={this.checkEditRemark}
					onCancel={()=>{
						this.setState({
                            //关闭弹窗并清空所有内容
                            remarkEditModal:false,
                            editRemark:'',
						})
				    }}
				>
                    <section>
                        <div style={{paddingLeft:8}}>
                            <TextArea value={this.state.editRemark} rows={4} maxLength="300" placeholder="请输入备注" onChange={({target})=>{
                                this.setState({
                                    editRemark:target.value
                                })
                            }}/>
                        </div>
                    </section>
                </Modal>
            </div>
        )
    }

}

export default OrderTable
