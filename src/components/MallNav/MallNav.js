import React, { Component } from 'react'
import { Menu, Icon } from 'antd'
const { SubMenu } = Menu
import { withRouter } from 'react-router-dom'
class MallNav extends Component {
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
		let pathName = location.pathname.split('/')[2];

		switch (pathName) {
			case 'list':
				state.selectedKeys = ['list']
			break
			case 'category':
				state.selectedKeys = ['category']
			break
			case 'dingdan':
				state.selectedKeys = ['dingdan']
			break
			default:
				state.selectedKeys = ['list']
		}
		return state
	}


	render() {
		return (
			<Menu
				onClick={item => {
					if (!!parseInt(item.key)) {
						this.setState({
							selectedKeys: [item.key],
						})
						return
					}
					location.href = `#/mall/${item.key}`
				}}
				defaultOpenKeys={['goods','orderManagement']}
				selectedKeys={this.state.selectedKeys}
				mode="inline"
			>
				<SubMenu
					key={['goods']}
					title={
						<span>
							<Icon type="shop" />商品管理
						</span>
					}
				>
					<Menu.Item key="list">商品列表</Menu.Item>
					<Menu.Item key="category">分类管理</Menu.Item>
				</SubMenu>
				<SubMenu
					key={['orderManagement']}
					title={
						<span>
							<Icon type="profile" />订单管理
						</span>
					}
				>
					<Menu.Item key="dingdan">订单列表</Menu.Item>
				</SubMenu>
				{/* <Menu.Item key="4">
					<Icon type="bars" />页面管理
				</Menu.Item>
				<Menu.Item key="5">
					<Icon type="bars" />优惠管理
				</Menu.Item> */}
			</Menu>
		)
	}
}

export default withRouter(MallNav)
