import React, {Component} from 'react'
import {  Tabs, Table, Spin, Button,message, Row, Col } from 'antd'
import DB from '@DB'
const TabPane = Tabs.TabPane;

class ClassList extends Component {
	constructor(props) {
        super(props);
        this.state = {
 			loading: false,
 			_id:'', // courseId,可以从url中获取
 			data:[], // 列表数据
 			info:{} // 该课次的信息
        }
    }
    componentDidMount(){
    	const { match } = this.props;
    	this.setState({
    		_id: match.params.id
    	},()=>{
    		this._getCourseDetail();
    		this._getClassList();
    	})
	}
	
	_getClassList = () => {
		const { _id } = this.state;
		DB.Course.getClassList({
			courseId: _id
		}).then((data)=> {	
			data.forEach((d,index) => {
				d.key = d._id; 
				d.courseware.length > 0 ? d.courseware = '已上传' : d.courseware ='未上传';
				d.plan.length > 0 ? d.plan = '已上传' : d.plan = '未上传';
				d.video.length > 0 ? d.video = '已上传' : d.video = '未上传';
			})
			this.setState({
				data: data
	    	})
		},err=>{
	      message.error(err.errorMsg)
	    })
	}
	_getCourseDetail = () => {
		const { _id } = this.state;
		DB.Course.getCourseDetail({
			_id: _id
		}).then((data)=> {	
			this.setState({
				info: data
	    	})
		},err=>{
	      message.error(err.errorMsg)
	    })
	}

	render() {
		let { _id,loading, data, info } = this.state;

		const columns = [{
  			title: '课次名称',
	  		dataIndex:'name',
	  		key: 'name'
		},{
  			title: '主题',
	  		dataIndex: 'theme',
	  		key:'theme'
		},{
  			title: '课件',
	  		dataIndex: 'courseware',
	  		key:'courseware'
		},{
  			title: '教案',
	  		dataIndex: 'plan',
	  		key: 'plan',
		},{
  			title: '视频',
	  		dataIndex: 'video',
	  		key:'video'
		}];
		let locale = {
		  	emptyText: '抱歉，暂无内容'
		};
		return (
		<div>
			<p>课程管理 / {info.title}</p>
			<h3>基本信息</h3>
			<Row>
			<Col span={8} key={-1} className='infoLabel'>{'名称'}: {info.title}</Col>
			{
				info.contents && info.contents.map((content,i)=> (
					<Col span={8} key={i} className='infoLabel'>{content.name}: {content.content}</Col>
				))
			}
		    </Row>
			<Tabs type="card" defaultActiveKey="2" style={{marginTop: '20px'}}>
				<TabPane tab="详情" key="1"><div dangerouslySetInnerHTML={{__html:info.details}}/></TabPane>
			    <TabPane tab="课次" key="2">
			    	<Spin key='main' spinning={loading}>
			    		<Table  columns={columns} dataSource={data} pagination={false} locale={locale} />
			    	</Spin>
			    </TabPane>
			</Tabs>
			<p style={{width: '150px', margin: 'auto', marginTop: '20px'}}>
				<Button type="primary" style={{margin: '5px'}} onClick={()=> window.location.href =`#/course/create/${_id}`}>编辑</Button>
				<Button style={{margin: '5px'}} onClick={()=> {window.location.href = '#/course/list'}}>返回</Button>
	    	</p>
	    </div>
		)
	}
}

export default ClassList
