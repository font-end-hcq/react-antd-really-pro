import React, {Component} from 'react'
import {  Menu, Dropdown, Divider, Select, Table, Pagination, Spin, Button,message, Modal } from 'antd'

import DB from '@DB'
import Search from '@modules/Search'
const Option = Select.Option;

class CourseList extends Component {
	constructor(props) {
        super(props);
        this.state = {
 			loading: false,
 			columns:[],
 			pageNum: 1,
 			pageSize:15,
 			total: 0,
 			data: [],
 			optionId:'', // 将当前进行操作的courseId 存下来
 			state:'', // 记录当前操作课程状态
 			category:'',
 			searchOptions:[], // 查询条件
 			confirmLoading: false,
 			visibleDelte: false,
 			visibleState: false,
 			deleteModalText:'删除后不可恢复，确认删除吗？',
 			stateModalText:'是否确认修改课程状态？',
 			keys:[] // 保存该科目下的搜索标签名，用于在列表表头展示
        }
    }
    componentDidMount(){

	}

	_getCourseList = (category) => {
		const { pageNum, pageSize, searchOptions } = this.state;
		DB.Course.getCourseList({
			category: category,
			pageNum: pageNum,
			pageSize: pageSize,
			contents: searchOptions
		}).then(({list,count})=> {
			list.forEach((li,i) => {
				li.key = li._id;
				li.state === 1 || li.state === '1' ? li.state='上架中' : li.state = '已下架' ;
			})
			this.setState({
				category: category,
				columns: [],
				total: count,
				data: list
	    	})
	    	this.setColumns();
		},err=>{
	      console.log(err.errorMsg)
	    })
	}
	setColumns = () => {
		let { data, columns, optionId, state, keys } = this.state;
		if(data.length === 0) {
			 return;
		}
		columns = [{
			title:'课程名称',
			render:(text, record)=> (
	  			<a className='courseName' href="javascript:void(0)" onClick={()=>{window.location.href = `#/course/class_list/${record._id}`}}>{record.title}</a>
	  		),
	  		key: 'title'
		},{
			title:'科目',
			dataIndex: 'category',
	  		key: 'category'
		}];

		keys && keys.forEach((key,index) => {
			columns.push({
	  			title: key,
		  		dataIndex: key,
		  		key:key
			})
		})
		columns.push({
			title:'课次',
			dataIndex: 'times',
	  		key: 'times'
		},{
			title:'状态',
			dataIndex: 'state',
	  		key: 'state'
		},{
			title:'操作',
			key:'options',
			render: (text, record) => (
		    <span>
		      <a href="javascript:void(0)" onClick={() => window.location.href =`#/course/create/${record._id}`}>编辑</a>
		      <Divider type="vertical" />
		      <Dropdown
		      	overlay= {
		      		<Menu onClick={this.handleOptions}>
					    <Menu.Item key="0">
					     {record.state === '上架中' ? '下架' : '上架'}
					    </Menu.Item>
					    <Menu.Item key="1">
					      删除
					    </Menu.Item>
				  	</Menu>
				}
			  trigger={['click']} onClick={() => {this.setState({ optionId : record._id, state: record.state})}}>
		      	<a href="javascript:void(0)">更多</a>
		      </Dropdown>
		    </span>
		  )
		})
		this.setState({
			columns: columns
    	})
	}

	handleOptions = (e) => {
		if(e.key === '0'){ // 点击上/下架
 			this.showStateModal();
		} else if(e.key === '1'){ // 点击删除
			this.showDeleteModal();
		}
	}
	// 点击删除，出现确认删除的弹窗
	showDeleteModal = () => {
		this.setState({
	      	visibleDelte: true
	    });
	}
	// 点击上/下架，出现确认修改的弹窗
	showStateModal = () => {
		this.setState({
	      	visibleState: true
	    });
	}
	handleDelete = () => {
		let { optionId, category } = this.state;
		DB.Course.deleteOneCourse({
				_id: optionId
			}).then((res)=> {
				if(res){
					message.success('删除成功！');
					this._getCourseList(category);
					this.setState({
				      	visibleDelte: false
				    });
				} else {
					message.error('删除失败！');
					this.setState({
				      	visibleDelte: false
				    });
				}
			},err=>{
		      message.error(err.errorMsg)
		})
	}
	handleState = () => {
		let { optionId, category, state } = this.state;
		let s = 0;
		state === '上架中' ? s = 0 : s = 1;
		DB.Course.changeCourseState({
				_id: optionId,
				state: s
			}).then((res)=> {
				if(res){
					message.success('修改成功！');
					this._getCourseList(category);
					this.setState({
				      	visibleState: false
				    });
				} else {
					message.error('修改失败！');
					this.setState({
				      	visibleState: false
				    });
				}
			},err=>{
		      message.error(err.errorMsg)
		})
	}
	cancelDelete = () => {
		this.setState({
	      	visibleDelte: false
	    });
	}
	cancelState = () => {
		this.setState({
	      	visibleState: false
	    });
	}
	onChange = (pageNumber) => {
		this.setState({
			pageNum: pageNumber
		})
	}
	// 父子组件之间的数据传递
	checkTags = (key,value) =>{
	     this.setState({
	      [key]:value
	    })
	}

	render() {
		let { pageNum, pageSize, total, data, columns, loading, confirmLoading, deleteModalText, visibleDelte, stateModalText, visibleState } = this.state;
		let locale = {
		  	emptyText: '抱歉，暂无内容'
		};
		return (
		<div>
			<p>课程</p>
			<Search  checkTags={this.checkTags} _getCourseList={this._getCourseList}/>
			<p><Button type="primary" style={{margin: '5px 0'}} onClick={()=> {window.location.href = '#/course/create/new'}}>+ 新建</Button></p>
	    	<Spin key='main' spinning={loading}>
	    		<Table  columns={columns} dataSource={data} pagination={false} locale={locale} />
	    	</Spin>
	    	{
	    		total > 0 ?
	    		<Pagination showQuickJumper showTotal={total => `共 ${total} 条`} current={pageNum} pageSize={pageSize} total={total} onChange={this.onChange} style={{marginTop:'30px',textAlign:'right'}}/>
	    		: ''
	    	}
	    	<Modal title="删除课程"
          		visible={visibleDelte}
				okText ='确定'
                cancelText ='取消'
          		onOk={this.handleDelete}
          		confirmLoading={confirmLoading}
          		onCancel={this.cancelDelete}>
          		<p>{deleteModalText}</p>
        	</Modal>
        	<Modal title="修改课程状态"
          		visible={visibleState}
				okText ='确定'
                cancelText ='取消'
          		onOk={this.handleState}
          		confirmLoading={confirmLoading}
          		onCancel={this.cancelState}>
          		<p>{stateModalText}</p>
        	</Modal>
		</div>
		)
	}
}

export default CourseList
