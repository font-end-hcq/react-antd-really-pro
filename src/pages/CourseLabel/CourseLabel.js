import React, {Component} from 'react'
import {HashRouter, Route, Switch, Link,Redirect} from 'react-router-dom'
import { message, Input, Select, Modal, Button, Table, Divider } from 'antd'
const Option = Select.Option;
import DB from '@DB'

class CourseLabel extends Component {
	constructor(props) {
        super(props);
		this.state = {
			disable:false, //科目设置选择器是否可点击，当课程标签已经被关联，则不可点
			data:[],
			modalTitle:'',
			deleteModalText:'删除后不可恢复，确认删除吗？',
    		visible: false,
    		visibleDelte: false,
    		deleteRecord:{},
    		confirmLoading: false,
    		selectOptions:[],
    		editLabelId:'', // 记录修改的课程标签id
    		category:'', // 新增类别设置
    		labelName:'', // 新增标签名
    		labelContent:[{_id:'',name:''}], // 新增标签内容
    		isAddNewLabel: true // 是否是新增，true是新增，false是编辑
		}
    }
    componentDidMount(){
    	this._getTableData();
    	this._getCategory();
	}
	// 获取表格中的内容
	async _getTableData() {
	  	let { data } = this.state;
	  	let labels = [];
		DB.Label.getCourseLabel().then((data)=> {
			data.forEach((d,index)=>{
				d.content.map((c,index)=>(
					labels.push(c.name)
				))
				d.contents = labels.join('/');
				d.key = d._id;
				labels = [];
			})
			this.setState({
	        	data: data
	    	})
		})

	}
	// 获取类别
	async _getCategory() {
	  	let { selectOptions } = this.state;
	  	DB.Label.getCategoryList().then(({list,count})=> {
	  		list.map((li,index)=>{
	  			selectOptions.push(<Option key={li.name}>{li.name}</Option>);
	  		})
		})
	  	await this.setState({
	        	selectOptions: selectOptions
	    })
	}
	showModal = () => {
	    this.setState({
	      visible: true,
	      modalTitle: '新增课程标签',
	      isAddNewLabel: true,
	      disable:false
	    });
	}
	showDeleteModal = (record) => {
		let { deleteRecord } = this.state;
		this.setState({
			deleteRecord: record,
	      	visibleDelte: true,
	    });
	}
	showEditModal = (record) => {
		if(record.content.length === 0){ // 万一出现标签内容为空，则保证打开编辑的时候，出现标签内容输入框
			record.content = [''];
		}
		this.setState({
			disable:record.using,
			modalTitle: '编辑课程标签',
			editLabelId: record.key,
			category: record.category,
			labelName: record.name,
			labelContent: record.content,
	      	visible: true,
	      	isAddNewLabel: false
	    });
	}
	// 判断数组内是否有内容重复，主要用在课程标签内容新建时候的判断，并且做出错误提示
	isRepeat = (arr) => {
	    var hash = {};
	    for(var i in arr) {
	        if(hash[arr[i]]) {
	            return true;
	        }
	        // 不存在该元素，则赋值为true，可以赋任意值，相应的修改if判断条件即可
	        hash[arr[i]] = true;
	    }
	    return false;
	}
	// 课程标签弹窗点击确定触发的事件，此处为新增与编辑时的弹窗，注意：当提交课程标签，还须判断输入框是否为空
	handleOk = () => {
		let { category, labelName, labelContent, isAddNewLabel, editLabelId} = this.state;
		let contents = [];//将标签内容中的name单独组成数组
		labelContent.map((content,index)=>(
			contents.push(content.name)
		))
		let hasEmpty = false;
		if(category === '' || labelName === ''){
			message.error('请填写完整课程标签！');
			this.setState({
	        	confirmLoading: false
	       })
		}else {
			 	if(this.isRepeat(contents)){
			 		message.error('标签内容请勿重复！');
			 		this.setState({
			        	confirmLoading: false
			       })
			 		return;
			 	}
				labelContent.forEach((label,index) => {
					if(hasEmpty){
						return;
					}
					if(label.name === null || label.name === '' || label.name.length === 0){
						hasEmpty = true;
						message.error('请填写完整课程标签！');
						this.setState({
				        	confirmLoading: false
				       })
						return;
					}
					else if(index === labelContent.length -1){
						this.setState({
				      		confirmLoading: true,
				    	});
				    	if(isAddNewLabel){// 当点击新增时发送请求
				    		DB.Label.addCategoryLabel({
				    			category: category,
				    			name: labelName,
				    			contents: contents
				    		}).then((data)=> {
								this.setState({
									visible: false,
						        	confirmLoading: false,
						        	category:'',
		    						labelName:'',
		    						labelContent:[{_id:'',name:''}]
						    	})
						    	message.success('新增成功！')
						    	this._getTableData();
							},err=>{
						      message.error(err.errorMsg)
						      this.setState({
						        	confirmLoading: false
						      })
						    })
				    	} else{ // 当点击编辑时发送请求
				    		DB.Label.updateCategoryLabel({
				    			_id: editLabelId,
				    			category: category,
				    			name: labelName,
				    			contents: labelContent
				    		}).then((data)=> {
								this.setState({
									visible: false,
						        	confirmLoading: false,
						        	category:'',
		    						labelName:'',
		    						labelContent:[{_id:'',name:''}]
						    	})
						    	message.success('修改成功！')
						    	this._getTableData();
							},err=>{
						      message.error(err.errorMsg)
						      this.setState({
						        	confirmLoading: false
						       })
						    })
				    	}
					}
				})
		}
	}
	// 弹窗取消事件，此处为 新增与编辑弹窗
	handleCancel = () => {
		this._getTableData();
	    this.setState({
	    	confirmLoading:false,
	      	visible: false,
	      	category:'',
    		labelName:'',
    		labelContent:[{_id:'',name:''}]
	    });
	}
	// 下拉框选项更改时触发
	handleChange = (value) => {
		let { category } = this.state;
		category = value;
		this.setState({
			category: category
	    });
	}
	// 添加新的课程标签触发
	addContent = (index) => {
		let { labelContent } = this.state;
		labelContent.splice(index+1,0,{_id:'',name:''})
		this.setState({
			labelContent: labelContent
	    });
	}
	// 移除新增课程标签中的标签内容项
	removeContent = (index) => {
		let { labelContent, isAddNewLabel } = this.state;
		if(labelContent.length === 1){
			message.error('标签内容至少有一个！');
			return;
		} else{
			if(labelContent[index]._id){
				// 先判断是否可以删除
				DB.Label.isWantedDelete({
	    			_id:labelContent[index]._id
	    		}).then((res)=> {
	    			if(res){
	    				labelContent.splice(index,1);
	    				this.setState({
							labelContent: labelContent
				    	});
	    			}
				},err=>{
			      message.error(err.errorMsg)
			    })
			} else {
					labelContent.splice(index,1);
					this.setState({
						labelContent: labelContent
			    });
			}
		}
	}
	// 更改 课程标签中标签内容时触发，index: 修改的输入框下标，e.target.value: 输入框中的内容
	onChangeLabelContent = (e,index) => {
		let { labelContent } = this.state;
		let isHas = false;
		labelContent && labelContent.forEach((label,i)=>{
			if(index === i) {
				labelContent[index].name = e.target.value;
				isHas = true;
			}
		})
		if(!isHas){
			labelContent[index] = {_id:'', name: e.target.value};
		}
		this.setState({
			labelContent: labelContent
	    });
	}
	// 更改标签名时触发，e.target.value: 输入框中的内容
	onChangeLabelName = (e) =>{
		let { labelName } = this.state;
		labelName = e.target.value;
		this.setState({
			labelName: labelName
	    });
	}
	// 删除课程标签列表中的某一行，deleteRecord: 要删除的行
	deleteCourseLabel = () => {
		let { deleteRecord } = this.state;
		DB.Label.deleteCategoryLabel({
			_id:deleteRecord.key
		}).then((res)=> {
			if(res){
			    message.success('删除成功！')
			    this._getTableData();
			}
		},err=>{
	      message.error(err.errorMsg)
	    })
	    this.setState({
			visibleDelte: false,
		});
	}
	// 点击取消删除课程标签某一行，在删除弹窗中触发
	handleDeleteLabelCancel = () => {
	    this.setState({
	    	confirmLoading:false,
	      	visibleDelte: false
	    });
	}
	render() {
		const { disable, data, visible, visibleDelte, confirmLoading, deleteModalText, modalTitle, category, labelName, labelContent, selectOptions } = this.state;
		const columns = [{
  			title: '标签名',
	  		dataIndex: 'name',
	  		key:'name'
		},{
			title:'科目',
			dataIndex:'category',
			key:'category'
		},{
			title:'标签内容',
			dataIndex:'contents',
			key:'contents'
		},{
			title:'操作',
			key:'options',
			render: (text, record) => (
		    <span>
		      <a href="javascript:void(0)" onClick={() => this.showEditModal(record)}>编辑</a>
		      <Divider type="vertical" />
		      <a href="javascript:void(0)" onClick={() => this.showDeleteModal(record)}>删除</a>
		    </span>
		  ),
		}];
		let locale = {
		  	emptyText: '抱歉，暂无内容'
		};
		return (
		<div>
			<p className='courseName'>课程标签</p>
			<p><Button type="primary" style={{margin: '5px 0'}} onClick={this.showModal}>新增</Button></p>
			<Table  columns={columns} dataSource={data} pagination={false} locale={locale} />
			<Modal 	title={modalTitle}
		          	visible={visible}
					okText ='确定'
	                cancelText ='取消'
		          	onOk={this.handleOk}
		          	confirmLoading={confirmLoading}
		          	onCancel={this.handleCancel}>
		          	<div className='option'>
		          		<span className='selectTitle'>科目设置: </span>
		          		<Select
					    showSearch
					    value= {category}
					    style={{ width: 200 }}
					    placeholder="请选择"
					    optionFilterProp="children"
					    onChange={this.handleChange}
					    disabled={disable}
					    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
		    				{ selectOptions }
	  					</Select>
	  				</div>
	  				<div className='option'>
		          		<span className='selectTitle'>标签名: </span>
		          		<Input placeholder="请输入" maxLength='8' value={labelName} onChange={this.onChangeLabelName}/>
	  				</div>
	  				<div className='option' style={{ position: 'relative'}}>
		          		<span className='selectTitle' style={{position: 'absolute', top: '0px'}}>标签内容: </span>
		          		<div className='labelContent'>
		          		{
		          			labelContent.map((label,index) => (
		          				<div  key={index}>
			          				<Input placeholder="请输入" maxLength='8' value={label.name}  onChange={e =>this.onChangeLabelContent(e,index)}/>
			          				<Button shape="circle" icon="plus" onClick={()=> this.addContent(index)} />
			          				<Button shape="circle" icon="close" onClick={() => this.removeContent(index)} />
		          				</div>
							))
		          		}
		          		</div>
	  				</div>
	        </Modal>
	        <Modal title="删除课程标签"
          		visible={visibleDelte}
          		onOk={this.deleteCourseLabel}
				okText ='确定'
                cancelText ='取消'
          		confirmLoading={confirmLoading}
          		onCancel={this.handleDeleteLabelCancel}>
          		<p>{deleteModalText}</p>
        	</Modal>
		</div>
		)
	}
}

export default CourseLabel
