import React, { Component } from 'react'
import { Menu, Icon } from 'antd'
const { SubMenu } = Menu
import { withRouter } from 'react-router-dom'

class SideNav extends Component {
	state = {}

	constructor(props) {
		super(props)
		this.state = this.getCurrentRoute(this.props)
	}

	componentDidMount() {}

	componentWillReceiveProps(nextProps) {
		this.setState(this.getCurrentRoute(nextProps))
	}

	getCurrentRoute(props) {
		let state = {}
		let location = props.location
		let index = location.pathname.lastIndexOf('/')
		let pathName = location.pathname.split('/')[2]

		switch (pathName) {
			case 'customer':
				state.selectedKeys = ['customer']
				break
			case 'contract':
				state.selectedKeys = ['contract']
				break
			case 'list':
				state.selectedKeys = ['list']
				break;
			case 'detail':
				state.selectedKeys = ['list']
				break
			default:
				state.selectedKeys = ['customer']
		}
		return state
	}

	render() {
		return (
			<Menu onClick={item => {
					if (!!parseInt(item.key)) {
						this.setState({
							selectedKeys: [item.key],
						})
						return
					}
					location.href = `#/jiameng/${item.key}`
				}}
				defaultOpenKeys={['jm']}
				selectedKeys={this.state.selectedKeys}
				mode="inline"
			>
				<SubMenu key={['jm']}  title={<span> <Icon type="mail" />加盟管理 </span>}>
					<Menu.Item key="customer">客户管理</Menu.Item>
					<Menu.Item key="contract">合同管理</Menu.Item>
					<Menu.Item key="list">盟校管理</Menu.Item>
				</SubMenu>
			</Menu>
		)
	}
}

export default withRouter(SideNav)
