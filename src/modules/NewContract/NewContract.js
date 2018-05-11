import React, {Component} from 'react'
import { Button , Modal , Input , Select , DatePicker , Upload , Icon , message}from 'antd';
import DB from '@DB'
import UploadModule from '@modules/UploadContract'
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
const {	RangePicker } = DatePicker;
const Option = Select.Option;
const { TextArea } = Input;

class NewContract extends Component {
	constructor(props) {
        super(props);
			this.state = {
				openModal:false, //新建对话框显示与否
				operate:{},	//存储表单里选择和输入的所有参数
				selectCustomer: [],	//下拉选项数据
				selectOwner: [],
				setContact:[],
				pinpaiId:'',  //品牌上传附件存储id
				annex:[],	//附件数组对象存储
			}
	}

	componentDidMount() {
		this.emit();
		this.newContract() //渲染新建合同下拉选项菜单
	}
	//将品牌ID传给其他组件
	emit = () => {
		let {pinpaiId} = this.state;
		DB.User.getUserInfo()
		.then(res=>{
			this.setState({
					pinpaiId:res.pinpaiId
			},()=>{
				emitter.emit('pinpaiId',{pinpaiId:this.state.pinpaiId});
			})
		})
	}
	//所有必选项选择完毕后把所有参数传给后端
	_operateContract = () =>{
		const { operate , annex , setContact } = this.state
		DB.Contract.contractAdd({
			...operate,
			annex,
		}).then(data=>{
			message.success('新建操作成功')
			this.setState({
				openModal:false,
				operate:{},
				annex:[],
				setContact:undefined,
			})
			emitter.emit('updateList');
		},({errorMsg})=>{
			message.error(errorMsg)
		})
	}
	//日期选择并存到对象里
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
		const {operate} = this.state;
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

	// 将上传文件的url转为antd upload组件认的格式
	handleAnnex = (annex) =>{
        return annex ||	[]
    }
	//上传成功
	uploadSuccess = (file,key) =>{
		let {annex} = this.state;
		const annexUrl = prefix+key;
		annex.push({
			uid:Math.random(),
			name:__PRO__?annexUrl.substr(94):annexUrl.substr(99),
			url:annexUrl,
			status:'done',
		})
		this.setState({
			annex:annex,
		})
    }

	// 删除成功
	uploadRemove = (files) =>{
		let {annex} = this.state;
		annex = annex.filter(item=>{
			return item.url !== files.url
		})
		this.setState({
			annex
		})
    }

	//提交时验证这些字段是否符合
	_checkmodal = () => {
		const {operate} = this.state
		const {
			kehuId, //对应客户
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
			this._operateContract()
		}
	}
	//获取所有下拉菜单选项数据
	newContract = () => {
		let { openModal , selectCustomer , selectOwner } = this.state;
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
	//选择对应客户显示对应联系人
	setContact = (value) => {
		let { setContact , operate} = this.state;
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
				setContact:setContact
			})
		},(err) => {
				message.error(err.errorMsg)	
		});
	}

	render() {
		let {operate, openModal ,selectCustomer ,selectOwner , setContact , pinpaiId} = this.state;
	return (
		<div>
			<Button type="primary" icon="plus"
				onClick={() =>{
					this.setState({
						openModal:true,
					})
				}}
			>新建</Button>

			<Modal title={'新建合同'}
					className="modal_box"
					visible={this.state.openModal}
					maskClosable={false}
					destroyOnClose={true}
					width={700}
					okText ='确定'
					cancelText ='取消'
					onOk={this._checkmodal}
					onCancel={()=>{
						const {operate,annex ,plan,video,up,down,load} = this.state
						this.setState({
							//关闭新建弹窗并清空所以内容
							openModal:false,
							operate:{},
							annex:[],
							setContact:undefined,
						})
				}}
				>
						<section className='contract__modal'>
								<div>
									<span className="font mandatory">对应客户:</span>
									<div className="alawys">
										<Select
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
											value={this.state.operate.contactsId}
											notFoundContent="抱歉，没有该选项"
											placeholder="请选择联系人"
											onChange={(value)=>{
												this.setState({
													operate:{
														...operate,
														contactsId:value
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
											allowClear={false}
											onChange={this.dateChange}
											placeholder={['开始日期','结束日期']}
											showTime="showTime"
										/>
									</div>
									<span className="font mandatory">签约日期:</span>

									<div className="date_sign">
										<DatePicker onChange={this.oneDateChange} placeholder="请选择签约日期" allowClear={false} />
									</div>
								</div>
								<div>
									<span className="font mandatory">合同状态:</span>
									<Select
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

									<span style={{marginLeft:16}} className="font">合同金额(元):</span>

									<Input
										value={operate.money}
										style={{ width: 250 }}
										maxLength="11"
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
									<TextArea rows={4} maxLength="10000" placeholder="请输入合同详情" onChange={({target})=>{
										this.setState({
											operate:{
												...operate,
												detail:target.value
											}
										})
									}}/>

								</div>

								<div>
									<span className="font">备注:</span>
									<TextArea rows={4} maxLength="300" placeholder="请输入备注" onChange={({target})=>{
										this.setState({
											operate:{
												...operate,
												remark:target.value
											}
										})
									}}/>
								</div>

								<div style={{marginLeft: 80,marginBottom: 10}}>
									<UploadModule
										pinpaiId={this.state.pinpaiId}
										limit={5}
										success={this.uploadSuccess}
										remove={this.uploadRemove}
										fileList={this.handleAnnex(this.state.annex)} 
									/>
								</div>
							</section>
            </Modal>
			</div>
		);
  }
}

export default NewContract
