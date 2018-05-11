import React, { Component } from 'react'
import { Menu, Icon } from 'antd'
const { SubMenu } = Menu
import { withRouter } from 'react-router-dom'
class SideNav extends Component {
	constructor(props) {
		super(props)
		this.state = this.getCurrentRoute(this.props)
	}

	componentWillReceiveProps(nextProps) {
		this.setState(this.getCurrentRoute(nextProps))
	}

	getCurrentRoute(props) {
		let state = {}
		let location = props.location
		let index = location.pathname.lastIndexOf('/')

		switch (location.pathname.slice(index + 1)) {
			case 'open':
				state.selectedKeys = ['open']
				break
			case 'account':
				state.selectedKeys = ['account']
				break
			case 'represource':
				state.selectedKeys = ['represource']
				break
			case 'inspect':
				state.selectedKeys = ['inspect']
				break
			case 'income':
				state.selectedKeys = ['income']
				break
			case 'recruit':
				state.selectedKeys = ['recruit']
				break
			default:
				state.selectedKeys = ['open']
		}
		return state
	}

	render() {
		let repSubnav = {
			paddingLeft: '46',
		}
		return (
			<Menu
				onClick={item => {
					if (!!parseInt(item.key)) {
						this.setState({
							selectedKeys: [item.key],
						})
						return
					}
					location.href = `#/report/${item.key}`
				}}
				defaultOpenKeys={[
					'jiameng',
					'lesson',
					'operate',
					'shixun',
					'caiwu',
					'contacts',
					'user',
					'page',
				]}
				selectedKeys={this.state.selectedKeys}
				mode="inline"
			>
				<SubMenu
					inlineCollapsed="false"
					key="jiameng"
					title={
						<span>
							<Icon type="home" />加盟数据
						</span>
					}
				>
					<Menu.Item key="open">开通数据</Menu.Item>
					<Menu.Item key="account">账号数据</Menu.Item>
				</SubMenu>
				<SubMenu
					inlineCollapsed="false"
					key="lesson"
					title={
						<span>
							<Icon type="book" />课程数据
						</span>
					}
				>
					<Menu.Item key="represource">资料管理</Menu.Item>
					<Menu.Item key="inspect">资料查看</Menu.Item>
				</SubMenu>
				<SubMenu
					inlineCollapsed="false"
					key="operate"
					title={
						<span>
							<Icon type="contacts" />运营数据
						</span>
					}
				>
					<Menu.Item key="income">收入数据</Menu.Item>
					<Menu.Item key="recruit">招生数据</Menu.Item>
				</SubMenu>
				<SubMenu
					inlineCollapsed="false"
					key="shixun"
					title={
						<span>
							<Icon type="contacts" />师训数据
						</span>
					}
				>
					<Menu.Item key="1">用户数据</Menu.Item>
					<SubMenu
						inlineCollapsed="false"
						key="user"
						title={<span>授课数据</span>}
					>
						<Menu.Item key="2">课程汇总</Menu.Item>
						<Menu.Item key="3">课程单例</Menu.Item>
						<Menu.Item key="4">课程时间</Menu.Item>
					</SubMenu>
					<Menu.Item key="10">页面数据</Menu.Item>
				</SubMenu>
				<SubMenu
					inlineCollapsed="false"
					key="caiwu"
					title={
						<span>
							<Icon type="contacts" />财务数据
						</span>
					}
				>
					<Menu.Item key="5">综合数据</Menu.Item>
					<Menu.Item key="6">商城数据</Menu.Item>
					<Menu.Item key="7">加盟数据</Menu.Item>
					<Menu.Item key="8">课堂营收</Menu.Item>
					<Menu.Item key="9">其他营收</Menu.Item>
				</SubMenu>
			</Menu>
		)
	}
}

export default withRouter(SideNav)
