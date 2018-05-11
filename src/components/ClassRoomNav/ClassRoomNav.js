import React, { Component } from 'react'
import { Menu, Icon } from 'antd'
const { SubMenu } = Menu
import { withRouter } from 'react-router-dom'
class ClassRoomNav extends Component {
	constructor(props) {
		super(props)
	}

	componentWillReceiveProps(nextProps) {}

	render() {
		return (
			<Menu
				onClick={item => {
					if (!!parseInt(item.key)) {
						return
					}
					location.href = `#/report/${item.key}`
				}}
				defaultSelectedKeys={['1']}
				defaultOpenKeys={['home', 'lecture', 'comment']}
				mode="inline"
			>
				<SubMenu
					key={['home']}
					title={
						<span>
							<Icon type="home" />首页管理
						</span>
					}
				>
					<Menu.Item key="1">轮播设置</Menu.Item>
					<Menu.Item key="2">推荐设置</Menu.Item>
				</SubMenu>
				<SubMenu
					key={['lecture']}
					title={
						<span>
							<Icon type="bars" />授课设置
						</span>
					}
				>
					<Menu.Item key="3">课程分类</Menu.Item>
					<Menu.Item key="4">直播课程</Menu.Item>
					<Menu.Item key="5">视频课程</Menu.Item>
					<Menu.Item key="6">音频课程</Menu.Item>
					<Menu.Item key="7">图文课程</Menu.Item>
				</SubMenu>
				<SubMenu
					key={['comment']}
					title={
						<span>
							<Icon type="bars" />评价管理
						</span>
					}
				>
					<Menu.Item key="8">设定热评</Menu.Item>
					<Menu.Item key="9">评价设置</Menu.Item>
				</SubMenu>
				<Menu.Item key="10">
					<Icon type="bars" />订单管理
				</Menu.Item>
			</Menu>
		)
	}
}

export default withRouter(ClassRoomNav)
