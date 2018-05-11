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
				<SubMenu
					inlineCollapsed="false"
					key="order"
					title={
						<span>
							<Icon type="home" />账号管理
						</span>
					}
				>
					<Menu.Item key="">账号列表</Menu.Item>
					<Menu.Item key="">角色管理</Menu.Item>
				</SubMenu>
				<Menu.Item key="">
					<Icon type="home" />日志管理
				</Menu.Item>
				<Menu.Item key="">
					<Icon type="book" />安全设置
				</Menu.Item>
			</Menu>
		)
	}
}

export default withRouter(SideNav)
