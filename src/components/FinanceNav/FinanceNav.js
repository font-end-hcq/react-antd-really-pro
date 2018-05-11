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
							<Icon type="home" />订单列表
						</span>
					}
				>
					<Menu.Item key="">加盟订单</Menu.Item>
					<Menu.Item key="">商城订单</Menu.Item>
					<Menu.Item key="">课堂订单</Menu.Item>
				</SubMenu>
				<Menu.Item key="">
					<Icon type="book" />收入支出
				</Menu.Item>
			</Menu>
		)
	}
}

export default withRouter(SideNav)
