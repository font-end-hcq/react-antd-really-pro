import React, {Component} from 'react'
import { Select, Button, Row, Col } from 'antd'

import DB from '@DB'
const Option = Select.Option;

class Search extends Component {
	constructor(props) {
        super(props);
        this.state = {
 			categoryOptions:[], // 科目下拉列表内容
 			origin: '', // 记录下 科目最初的内容，重置时用到
 			category:'',
 			selectList:[],
 			contents:[], // 将其他下拉列表的选择标签id都放到这里
        }
    }
    componentWillMount(){
    	this._getCategory();
	}
	_getCategory(){
		let { categoryOptions, category, origin} = this.state;
	  	DB.Label.getCategoryList().then(async({list,count})=> {
	  		list.forEach((li,index)=>{
	  			if(index === 0){
	  				category = li.name;
	  				origin = li.name
	  			}
	  			categoryOptions.push(<Option key={li.name}>{li.name}</Option>);
	  		})
	  		await this.setState({
		        categoryOptions: categoryOptions,
		        category: category,
		        origin: origin
		    })
		    // 同时去查询可选标签，更新选项
		    let keys = [];
			  DB.Category.getLabelList({
			  	category:category
			  }).then((data)=> {	
			  	data.map((d,i)=>(
			  		keys.push(d.label)
			  	))
				this.setState({
					selectList: data
		    	})
				},err=>{
			      console.log(err.errorMsg)
			    })
			this.props.checkTags('keys',keys);
		    this.props._getCourseList(category);
		})
	}
	// 数组去重方法
	unique = (array) => {
	 	let unique = {};
	   	array.forEach(function(item){
	     	unique[JSON.stringify(item)]=item;//键名不会重复
	   	})
	   	array = Object.keys(unique).map(function(u){ 
	     	return JSON.parse(u);
	   	})
	   	return array;
	}
	handleChange = (value) => {
	  this.setState({
	  	category: value,
	  	selectList: [],
		contents:[]
	  })
	  let keys = [];
	  // 查询相应的可选标签，更新选项
	  DB.Category.getLabelList({
	  	category:value
	  }).then((data)=> {
	  		data.map((d,i)=>(
			  		keys.push(d.label)
			  	))	
			this.setState({
				selectList: data
	    	})
		},err=>{
	      console.log(err.errorMsg)
	    })
	  this.props.checkTags('keys',keys);
	  this.props._getCourseList(value);
	}
	cancelSelect = (value) => {
		console.log(value)
	}
	handleOptions = (select,value) => {
		let { contents } = this.state;
		let isUnique = true;let isClear = false;
		let searchOptions = [];
		if(value === undefined){
			isClear = true;
		}
		contents && contents.forEach((con,index)=>{
			if(con.label === select.label){
				if(!isClear){
					isUnique = false;
					con.content = value.label;
					con.id = value.key;
				} else {
					contents.splice(index,1); // 清除这个选项，就移除
				}
				
			}
		})
		isUnique && !isClear && contents.push({
			label:select.label,
			content: value.label,
			id: value.key
		})
		this.unique(contents); //给选择的数组对象去重 
		contents.forEach((con,index) => { // 将所有选择的id遍历出来，用作查询参数
			searchOptions.push(con.id)
		})
		this.props.checkTags('searchOptions', searchOptions);
	}

	handleSearch = () => {
		let { category } = this.state;
		this.props._getCourseList(category);
	}
	handleReset = () => {
		let { origin } = this.state;
		this.props.checkTags('searchOptions', []);
		this.setState({
			category: origin,
			selectList: [],
			contents:[]
		},()=>{
			
		})
		let keys = [];
		DB.Category.getLabelList({ // 根据原始条件，重置搜索下拉框
		  	category:origin
		  }).then((data)=> {
		  		data.map((d,i)=>(
			  		keys.push(d.label)
			  	))	
				this.setState({
					selectList: data
		    	})
		    	this.props.checkTags('keys',keys);
		    	this.props._getCourseList(origin);
			},err=>{
		      console.log(err.errorMsg)
		    })
	}
	render() {
		let { categoryOptions, category, selectList } = this.state;
		return (
			<div style={{ margin: '40px 0'}}>
				<Row className='extends' type="flex" justify="space-between">
				<Col span={12} key={'catogory'} className='select'>
						<label>科目: </label>
						<Select
						    showSearch
						    value={category}
						    style={{ width: 200 }}
						    placeholder="请选择"
						    optionFilterProp="children"
						    onChange={this.handleChange}
						    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
						  >
						    {categoryOptions}
						  </Select>
				</Col>
				{
					selectList.map((select,i)=>(
						<Col span={12} key={i} className='select'>
							<label key={select.value}>{select.value}: </label>
							<Select
							key={i}
							allowClear
						    showSearch
						    labelInValue
						    style={{ width: 200 }}
						    placeholder="请选择"
						    optionFilterProp="children"
						    onChange={this.handleOptions.bind(this,select)}
						    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
						  >
						    {
						    	select.children && select.children.map((child,index)=> (
						    		<Option key={child.value}>{child.label}</Option>
						    	))
							}
						  </Select>
					  </Col>
					))
					}
				</Row>
				<div className='button'>
					<Button type="primary" onClick={()=> this.handleSearch()}>查询</Button>
					<Button onClick={()=> this.handleReset() }>重置</Button>
				</div>
			</div>
		)
	}
}

export default Search
