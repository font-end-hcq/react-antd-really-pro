import React, {Component} from 'react'
import { Button, Form, Input, Select } from 'antd';
const Option = Select.Option;

class ContractSearch extends Component {
	constructor(props) {
        super(props);
		this.state = {
			value:null,		//客户名称
			select:undefined, 	//合同状态
		}
    }
    componentDidMount() {

	}
	//状态改变事件
	handleSelect = (value) => {
		this.setState({
			select:value
		})
	}
	//输入框change事件
	onChange = ({target}) => {
		this.setState({
			value:target.value
		})
	}
	//查询按钮方法
	handleSubmit = () => {
		let { value , select } = this.state;
        //发送改变的值传给其他组件
        emitter.emit('searchList', {
			customerName: value ? value : '0',
			status:select ? select : '0',
		});
	}

	render() {
		let { value , select } = this.state;
	return (
		<div style={{marginTop:18}}>
			<span style={{marginRight:10}}>客户名称:</span>
			<Input
				value={this.state.value}
				placeholder='请输入客户名称'
				onChange={this.onChange}
				style={{width:250,marginBottom: 25}}
			/>
			<span style={{marginLeft:15,marginRight:8}}>合同状态:</span>
			<Select
				value={this.state.select}
				style={{width: 200,marginBottom:25}}
				onChange={this.handleSelect}
				placeholder='请选择合同状态'
			>
				<Option value="1">跟进中</Option>
				<Option value="2">完结</Option>
			</Select>
			<Button type='primary' onClick={this.handleSubmit} style={{marginLeft:10,marginRight:10,}}>查询</Button>
			<Button onClick={() => {
				this.setState({
					value: null,
					select: undefined,
				})
			}}>重置</Button>
		</div>
	);
  }
}

export default ContractSearch
