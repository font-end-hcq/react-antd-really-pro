import React, { Component } from 'react'
import { Layout, Menu, Icon, Avatar, Dropdown, Button } from 'antd'
import DB from '@DB'

const { Header } = Layout

class Nav extends Component {
	state = {
		name: '未登录',
		avatar:
			'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
	}

	constructor(props) {
		super(props)
	}

	componentDidMount() {
		DB.User.getUserInfo().then(res => {
			this.setState({
				name: res.name,
			})
		})
	}
	handleMenuClick = e => {
		DB.User.logout().then(res => {
			window.location.href = '/buc'
		})
	}
	render() {
		//nav刷新保持当前的菜单
		let defaultSelectedKeys = ''
		if (/jiameng/.test(location.hash)) {
			defaultSelectedKeys = 'jiameng'
		} else if (/course/.test(location.hash)) {
			defaultSelectedKeys = 'course'
		} else if (/report/.test(location.hash)) {
			defaultSelectedKeys = 'report'
		} else if (/mall/.test(location.hash)) {
			defaultSelectedKeys = 'mall'
		} else if (/classroom/.test(location.hash)) {
			defaultSelectedKeys = 'classroom'
		} else if (/finance/.test(location.hash)) {
			defaultSelectedKeys = 'finance'
		} else if (/message/.test(location.hash)) {
			defaultSelectedKeys = 'message'
		} else if (/setting/.test(location.hash)) {
			defaultSelectedKeys = 'setting'
		} else {
			defaultSelectedKeys = 'jiameng'
		}
		let { name, avatar } = this.state
		const menu = (
			<Menu onClick={() => this.handleMenuClick()}>
				<Menu.Item key="1">退出登录</Menu.Item>
			</Menu>
		)

		return (
			<div>
				<Header style={{ width: '100%' }}>
					<div className="logo" >
						<span>{name}</span>
					</div>
					<div className="right">
						<Icon type="search" />
						<Icon type="bell" />
						<Avatar src={avatar} />
						<Dropdown overlay={menu}>
							<span>{name}</span>
						</Dropdown>
					</div>
					<Menu
						theme="dark"
						mode="horizontal"
						defaultSelectedKeys={[defaultSelectedKeys]}
						style={{ lineHeight: '64px' }}
					>
						<Menu.Item key="jiameng">
							<a href="#/jiameng">加盟</a>
						</Menu.Item>
						<Menu.Item key="course">
							<a href="#/course">课程</a>
						</Menu.Item>
						<Menu.Item key="report">
							<a href="#/report">报表</a>
						</Menu.Item>
						<Menu.Item key="mall">
							<a href="#/mall">商城</a>
						</Menu.Item>
						<Menu.Item key="classroom">
							<a href="#/classroom">课堂</a>
						</Menu.Item>
						<Menu.Item key="finance">
							<a href="#/finance">财务</a>
						</Menu.Item>
						<Menu.Item key="message">
							<a href="#/message">消息</a>
						</Menu.Item>
						<Menu.Item key="setting">
							<a href="#/setting">设置</a>
						</Menu.Item>
					</Menu>
				</Header>
			</div>
		)
	}
}

export default Nav
