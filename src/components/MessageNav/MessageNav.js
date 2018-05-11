import React, { Component } from 'react'
import { Menu, Icon } from 'antd'
const { SubMenu } = Menu
import { withRouter } from 'react-router-dom'
class SideNav extends Component {
	constructor(props) {
		super(props)
	}

	render() {
		let repSubnav = {
			paddingLeft: '46',
		}
		return (
			<Menu
				onClick={item => {
					// location.href = `#/report/${item.key}`
				}}
				defaultOpenKeys={['order', 'shouru']}
				// defaultSelectedKeys={['home']}
				mode="inline"
			>
				<Menu.Item key="">
					<Icon type="home" />消息列表
				</Menu.Item>
				<Menu.Item key="">
					<Icon type="book" />发送消息
				</Menu.Item>
			</Menu>
		)
	}
}

export default withRouter(SideNav)
