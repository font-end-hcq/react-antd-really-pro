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
			case 'list':
				state.selectedKeys = ['list']
				break
			case 'label':
				state.selectedKeys = ['label']
				break
			case 'resource':
				state.selectedKeys = ['resource']
				break
			case 'category':
				state.selectedKeys = ['category']
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
					location.href = `#/course/${item.key}`
				}}
				defaultOpenKeys={['content', 'label']}
				selectedKeys={this.state.selectedKeys}
				mode="inline"
			>
				<SubMenu
					key="content"
					title={
						<span>
							<Icon type="home" />内容管理
						</span>
					}
				>
					<Menu.Item key="list">课程管理</Menu.Item>
					<Menu.Item key="resource">资料管理</Menu.Item>
				</SubMenu>
				<SubMenu
					key="label"
					title={
						<span>
							<Icon type="bars" />标签管理
						</span>
					}
				>
					<Menu.Item key="label">课程标签</Menu.Item>
					<Menu.Item key="category">科目设置</Menu.Item>
				</SubMenu>
				<Menu.Item key="1">
					<Icon type="bars" />报错管理
				</Menu.Item>
			</Menu>
		)
	}
}

export default withRouter(SideNav)
