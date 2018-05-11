import React, {Component} from 'react'
import moment, { relativeTimeRounding, relativeTimeThreshold } from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
import DB from '@DB'
import ListEmpty from '@comp/ListEmpty'
import UploadModule from '@modules/UploadContract'

import { Spin, Modal, message, Pagination, Popconfirm, Select, DatePicker, Input, Button , Upload, Icon} from 'antd';
const {	RangePicker } = DatePicker;
const Option = Select.Option;
const { TextArea } = Input;

class ContractForm extends Component {
	constructor(props) {
        super(props);
		this.state = {
			list: [],  //存储表格数据
            count: 0,  //存储总共多少条表格数据
            loading: true,
			pageNum:1,	 //默认第一页
			pageSize:15, //每页多少数据
			operate:{},	 //查看接口拿到的数据
			seeModal:false,	//对话框显示与否
			editModal:false,
			custName:'0', //客户名称 0表示所有客户
			status:'0', //合同状态 0表示所有  1跟进中 2已完成
			hrefList:[],	//附件存储数据
			selectCustomer: [],	//下拉选项
			selectOwner: [],
			setContact:[],
			pinpaiId:'',  //品牌上传附件存储id
		}
	}
	componentWillMount () {
		emitter.removeAllListeners(); //清空所有监听
	}

	componentDidMount() {
		this.send();	//初始化渲染列表数据
		this.listenerEmiter();	//监听查询组件传来的参数
		
		//监听更新表格列表请求
		emitter.addListener('updateList', () => {
			this.send();
		})
		//监听品牌id
		emitter.addListener('pinpaiId', (obj) => {
			this.setState({
				pinpaiId:obj.pinpaiId
			})
		})
		
		this.newContract();//获取下拉菜单数据
	}
	//实现让用户不更改客户名称 只想改变联系人选项内容
	changeContact = () => {
		const { operate } = this.state;
		if(operate.customerName){
			DB.Contract.getContacts({ 
				_id:this.state.operate.kehuId,
			}).then(async (data)=>{
				let contacts = data.contacts;
				//将拿到的数据进行渲染
				let setContact = contacts.map((li, index) => {
					return(
						<Option key={li._id} value={li._id}>
							{li.name}
						</Option>
					)
				})
				this.setState({
					setContact:setContact,
				})
			},(err) => {
				message.error(err.errorMsg)	
			});
		}
	}
	//监听查询组件传来的值
	listenerEmiter = () => {
		emitter.addListener('searchList',(obj) => {
			this.setState({ 
				custName: obj.customerName,
				status: obj.status,
				pageNum:1,
			}, () => {
				this.send();
			});
			
		})
	}
	//日期选择change事件
	dateChange = (e) => {
		const {operate} = this.state
		let startTime,endTime
		if(e.length){
			startTime = e[0].startOf('days').valueOf()
			endTime = e[1].endOf('days').valueOf()
		}
		this.setState({
			operate:{
				...operate,
				startTime:startTime,
				endTime:endTime,
			}
		})
	}
	//签约日期为空时不能保存成功
	oneDateChange = (date,dateString) => {
		const {operate} = this.state
		if(date == null){
			this.setState({
				operate:{
					...operate,
					createTime:null
				}
			})
		}else{
			this.setState({
				operate:{
					...operate,
					createTime:date.startOf('days').valueOf()
				}
			})
		}
	}
	//渲染列表请求接口方法
	send = () => {
		let { pageNum,custName,status,pageSize} = this.state;
        DB.Contract.getContractList({   
			customerName:custName,
			status:status,
            pageSize:pageSize,
            pageNum:pageNum,
        }).then(async (data)=>{
            // 将拿到的数据进行渲染
            this.setState({
				list: data.list,
				count:data.total,
            })
        },(err) => {
            message.error(err.errorMsg)
        }).then(()=>{
            this.setState({
                loading:false,
            })
        });
	}
	//上传成功显示的flielist
	handleAnnex = (annex) =>{
		return annex ||	[]
    }
	//上传成功
	uploadSuccess = (file,key) =>{
		let {hrefList} = this.state;
		const annexUrl = prefix+key;
		hrefList.push({
			uid:Math.random(),
			name:__PRO__?annexUrl.substr(94):annexUrl.substr(99),
			url:annexUrl,
			status:'done',
		})

		this.setState({
			hrefList:hrefList,
		})
    }

	// 删除成功
	uploadRemove = (files) =>{
		let {hrefList} = this.state;

		hrefList = hrefList.filter(item=>{
			return item.url !== files.url
		})
		
		this.setState({
			hrefList
		})
    }

	//提交时验证这些字段是否符合
	_checkmodal = () => {
		const {operate} = this.state
		const {
			type, //签约类型
			ownerId,  //归属人
			contactsId,	//联系人
			startTime, //合同生效日期
			endTime, //合同终止日期
			createTime,	//签约日期
			status,	//合同状态
			money,	//合同金额
			detail,	//合同详情
			remark,	//合同备注
			kehuId, //客户id
		} = operate

		let description;
		if(!kehuId){
			description = '请选择对应客户'
		}else if(!type){
			description = '请选择签约类型'
		}else if(!ownerId){
			description = '请先选择归属人'
		}else if(!contactsId){
			description = '请选择联系人'
		}else if(!startTime){
			description = '请填写有效日期'
		}else if(!createTime){
			description = '请填写签约日期'
		}else if(!status){
			description = '请选择合同状态'
		}

		if(description){
			message.destroy()
			message.error(description)
		}else{
			this._sendContract()
		}
	}
	//编辑合同提交方法
	_sendContract = () => {
		const { operate , editModal , hrefList} = this.state;
		DB.Contract.getEdit({
			_id:this.state.operate._id,
			...operate,
			annex:this.state.hrefList,
		}).then(data=>{
			message.success('编辑操作成功')
			this.setState({
				editModal:false,
			},() =>{
				this.send();
			})
		},({errorMsg})=>{
			message.error(errorMsg)
		})
	}

	//删除合同方法
	_delete = (_id) => {
        DB.Contract.getDelete({
            _id
        }).then(({status})=>{
            message.success('删除成功')
            this.send()
        },({errorMsg})=>{
            message.error(errorMsg)
        })
	}
	
	//查看合同方法
	_seeContract = (_id) => {
		const { hrefList} = this.state;
		
		DB.Contract.getDetail({
            _id
        }).then((data)=>{
			this.setState({
				seeModal:true,
				operate:data,
				hrefList:data.annex,
			})
        },({errorMsg})=>{
            message.error(errorMsg)
		})
	}

	//表格数据渲染展示
	_list() {
        const {pageNum,count,loading,seeModal,list,pageSize} = this.state
        if(count===0){
            return <ListEmpty/>
        }

        return [<dl className='contract__list' key='list'>
            <dt>
                <ul>
                    <li>客户名称</li>
                    <li>签约类型</li>
                    <li>生效时间</li>
                    <li>终止时间</li>
                    <li>剩余天数</li>
                    <li>合同金额</li>
                    <li>合同状态</li>
                    <li>操作</li>
                </ul>
            </dt>
            <dd>
			{
				this.state.list.map(item =><ul key = {
					item._id
				}>
					<li>
						<a className="customerName" href="javascript:;" title={item.customerName}>
							{item.customerName}
						</a>
					</li>
					<li>{item.type == 0 ? '品牌加盟' : '课程加盟'}</li>
					<li>{moment(item.startTime).format("YYYY/MM/DD")}</li>
					<li>{moment(item.endTime).format("YYYY/MM/DD")}</li>
					<li>{item.remainDays}</li>
					<li>
						{
							item.money == null ? '' : '¥'
						}
						{item.money}
					</li>
					<li>{item.status == 1 ? '跟进中' : '完结'}</li>
					<li className='list__operate'>
							<span
								onClick={this._seeContract.bind(this,item._id)}
							>查看</span>
							<span style={{color:'#e8e8e8'}}>丨</span>
		                    <Popconfirm title="确认删除?" 
	                            onConfirm = {this._delete.bind(this,item._id)}
								okText="删除" cancelText="取消"
							>
								<span>删除</span>
							</Popconfirm>
					</li>
				</ul>)
			}
            </dd>
        </dl>,
            <Pagination
                showQuickJumper
                current={pageNum}
				total={count}
				pageSize={pageSize}
                onChange={async pageNum=>{
                    await this.setState({
                        pageNum
                    })
                    this.send()
                }}
                key='page'/>
        ]
	}
	//获取客户和归属人下拉选项数据
	newContract = () => {
		let { editModal , selectCustomer , selectOwner} = this.state;
		//先获取所有下拉选项数据
		DB.Contract.getOwner({ 

		}).then(async (data)=>{
			let customer = data.customer;
			let owner = data.owner;
			//将拿到的数据进行渲染
			let selectOwner = owner.map((li, index) => {
				return(
					<Option key={li._id} value={li._id}>
						{li.name}
					</Option>
				)
			})

			let selectCustomer = customer.map((li, index) => {
				return(
					<Option key={li.name} value={li._id}>
						{li.name}
					</Option>
				)
			})
			this.setState({
				selectCustomer:selectCustomer,
				selectOwner:selectOwner,
			})
		},(err) => {
			message.error(err.errorMsg)	
		});
	}
	//选择对应客户获取对应联系人下拉选项数据
	setContact = (value) => {
		let { setContact , operate } = this.state;
		DB.Contract.getContacts({ 
			_id:value,
		}).then(async (data)=>{
			let contacts = data.contacts;
			//将拿到的数据进行渲染
			let setContact = contacts.map((li, index) => {
				return(
					<Option key={li._id} value={li._id}>
						{li.name}
					</Option>
				)
			})
			this.setState({
				operate:{
					...operate,
					kehuId:value,
					contactsId:undefined,
				},
				setContact:setContact,
			})
		},(err) => {
			message.error(err.errorMsg)	
		});
	}

	render() {
		let { loading ,hrefList,operate ,seeModal ,editModal ,selectCustomer ,selectOwner , setContact} = this.state;
	return (
		<div>
			<Spin spinning= {loading}>
				{this._list()}
			</Spin>
			<Modal 	title={'查看合同'}
					className="modal_box"
					visible={this.state.seeModal}
					maskClosable={false}
					destroyOnClose={true}
					width={600}
					cancelText ='取消'
					okText ='编辑'
					onOk={() => {
						this.setState({
							editModal:true,
							seeModal:false,
						},() => {
							this.changeContact();
						})
					}}
					onCancel={()=>{
						this.setState({
							seeModal:false,
						})
					}}
			>
				<section className='contract__modal look__modal'>
					<div className="flex_space">
						<p className="text_overflow">
							<span className="font">对应客户:</span>
							<span className="customerName">{operate.customerName}</span>
						</p>

						<p className="contact_font">
							<span className="font">签约类型:</span>
							<span>{operate.type == 0 ? '品牌加盟' : '课程加盟'}</span>
						</p>

					</div>
					<div className="flex_space">
						<p className="text_overflow">
							<span className="font" style={{paddingLeft:13}}>归属人:</span>
							<span>{operate.ownerName}</span>
						</p>
						

						<p className="contact_font" style={{paddingLeft:14}}>
							<span className="font">联系人:</span>
							<span>{operate.contactsName}</span>
						</p>

					</div>
					<div className="flex_space">
						<p>
							<span className="font">生效日期:</span>
							<span>{moment(operate.startTime).format("YYYY/MM/DD")}</span>
						</p>
						

						<p className="contact_font">
							<span className="font">到期日期:</span>
							<span>{moment(operate.endTime).format("YYYY/MM/DD")}</span>
						</p>

					</div>
					<div className="flex_space">
						<p>
							<span className="font">签约日期:</span>
							<span>{moment(operate.createTime).format("YYYY/MM/DD")}</span>
						</p>
						

						<p className="contact_font">
							<span className="font">更新日期:</span>
							<span>{moment(operate.updateTime).format("YYYY/MM/DD")}</span>
						</p>

					</div>
					<div className="flex_space">
						<p>
							<span className="font">合同状态:</span>
							<span>{operate.status == 1 ? '跟进中' : '完结'}</span>
						</p>
						

						<p className="contact_font" style={{width: 180}}>
							<span className="font">合同金额(元):</span>
							<span>
								{
									operate.money == null ? '暂无合同金额' : 
									operate.money
								}
							</span>
						</p>
						
					</div>

					<div className={
						operate.detail == '' ?  'change_detail' : 
						'change_font'
					}>
						<span style={{flex: '0 0 70px'}}>合同详情:</span>
						<p className="font_detail">
							{
								operate.detail == '' ? '暂无详情' : 
								operate.detail
							}
						</p>
					</div>

					<div className={
						operate.detail == '' ?  'change_detail' : 
						'change_font'
					}>
						<span style={{paddingLeft:28,flex: '0 0 70px'}}>备注:</span>
						<p className="font_detail">
							{
								operate.remark == '' ? '暂无备注' : 
								operate.remark
							}
						</p>
					</div>
					
					<div>
						<span style={{flex: '0 0 70px'}}>相关附件:</span>
						<div>
							{
								this.state.hrefList.length == '0' ? '暂无附件'
								:
								this.state.hrefList.map(item =>{
									return(
									<a key={item.uid} href={item.url} target='_blank'>{item.name}<br /></a>
									)
								})
							}
							{/* react对dom做遍历的时候，会根据data-reactid生成虚拟dom树，如果没有手动的添加key值的话，react是无法记录你的dom操作的 */}
						</div>
						
					</div>
					
				</section>
			</Modal>
			<Modal title={'编辑合同'}
				className="modal_box"
				visible={this.state.editModal}
				maskClosable={false}
				destroyOnClose={true}
				width={700}
				okText ='确定'
				cancelText ='取消'
				onOk={this._checkmodal}
				onCancel={()=>{
					this.setState({
						editModal:false,
					})
				}}
			>
				<section className='contract__modal'>
					<div>
						<span className="font mandatory">对应客户:</span>
						<div className="alawys">
							<Select
								defaultValue={operate.customerName}
								showSearch
								placeholder="请选择对应客户"
								notFoundContent="抱歉，没有该选项"
								optionFilterProp="children"
								onChange={this.setContact}
								filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
							>
								{selectCustomer}
							</Select>
						</div>

						<span className="font mandatory">签约类型:</span>

						<Select
							value={operate.type == 0 ? '0' : '1'}
							style={{ width: 250 }}
							placeholder="请选择签约类型"
							onChange={(value)=>{
								this.setState({
									operate:{
										...operate,
										type:value
									}
								})
							}}
						>
							<Option value="0">品牌加盟</Option>
							<Option value="1">课程加盟</Option>
						</Select>
					</div>
					<div>
						<span className="font mandatory label">归属人:</span>
						<div className="alawys">
							<Select
								defaultValue={operate.ownerName}
								showSearch
								placeholder="请选择归属人"
								notFoundContent="抱歉，没有该选项"
								optionFilterProp="children"
								onChange={(value)=>{
									this.setState({
										operate:{
											...operate,
											ownerId:value
										}
									})
								}}
								filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
							>
								{selectOwner}
							</Select>
						</div>

						<span className="font mandatory label">联系人:</span>
						<div className="alawys2">
							<Select
								value={operate.contactsId}
								notFoundContent="抱歉，没有该选项"
								placeholder="请选择联系人"
								onChange={(value)=>{
									this.setState({
										operate:{
											...operate,
											contactsId:value,
										}
									})
								}}
							>
								{setContact}
							</Select>
						</div>
					</div>
					<div>
						<span className="font mandatory">有效日期:</span>

						<div className="date_sign" style={{marginRight:19}} >
							<RangePicker
							 	defaultValue={[moment(operate.startTime), moment(operate.endTime)]}
								allowClear={false}
								onChange={this.dateChange}
								placeholder={['开始日期','结束日期']}
								showTime="showTime"
							/>
						</div>
						<span className="font mandatory">签约日期:</span>

						<div className="date_sign">
							<DatePicker onChange={this.oneDateChange} placeholder="请选择签约日期" defaultValue={moment(operate.createTime)} allowClear={false} />
						</div>
					</div>
					<div>
						<span className="font mandatory">合同状态:</span>
						<Select
							defaultValue={operate.status == 1 ? '1' : '2'}
							style={{ width: 256 }}
							placeholder="请选择合同状态"
							onChange={(value)=>{
								this.setState({
									operate:{
										...operate,
										status:value
									}
								})
							}}
						>
							<Option value="1">跟进中</Option>
							<Option value="2">完结</Option>
						</Select>

						<span style={{marginLeft:20}} className="font">合同金额(元):</span>

						<Input
							value={operate.money}
							style={{ width: 250 }}
							maxLength="9"
							placeholder="请输入合同金额（元）"
							onChange={({target})=>{
									let money = target.value
									if(money){
										//限制金额只能输入数字和小数点后两位且开头不能输入小数点
										if(!/^[0-9]{1,}\.?[0-9]{0,2}$/g.test(money)){
											return
										}
									}
									this.setState({
										operate:{
											...operate,
											money:money
										}
									})
							}}
						/>
					</div>
					<div>
						<span className="font">合同详情:</span>
						<div className="detail_con">
							<TextArea rows={4} maxLength="10000" placeholder="请输入合同详情" value={operate.detail} onChange={({target})=>{
									this.setState({
										operate:{
											...operate,
											detail:target.value
										}
									})
							}}/>
						</div>
					</div>
					<div>
						<span className="font">备注:</span>
						<TextArea rows={4} maxLength="300" placeholder="请输入备注" value={operate.remark} onChange={({target})=>{
								this.setState({
									operate:{
										...operate,
										remark:target.value
									}
								})
						}}/>
					</div>

					<div style={{alignItems: 'flex-start',marginBottom: 0}}>
						<span className="font">相关附件:</span>
						<div style={{marginBottom: 8}}>
							<UploadModule
							pinpaiId={this.state.pinpaiId}
							limit={5}
							success={this.uploadSuccess}
							remove={this.uploadRemove}
							fileList={this.handleAnnex(this.state.hrefList)} 
							/> 
						</div>
					</div>
				</section>
            </Modal>
		</div>
	);
  }
}

export default ContractForm
