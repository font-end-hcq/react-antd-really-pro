import React, { Component } from 'react'
import { HashRouter, Route, Switch, Link, Redirect } from 'react-router-dom'
import DB from '@DB'
import optSearch from 'opt-search'
import { Layout, Menu, Breadcrumb, Iconm,Spin } from 'antd'
const { SubMenu } = Menu
const { Header, Content, Sider } = Layout
import {hot} from 'react-hot-loader'

import Loadable from 'react-loadable'
const loading = () => <Spin/>

const Report = Loadable({
	loader: () => import('@pages/Report'),
	loading,
})

const Nav = Loadable({
	loader: () => import('@comp/Nav'),
	loading,
})

const JiaMeng = Loadable({
	loader: () => import('@pages/JiaMeng'),
	loading,
})

const Course = Loadable({
	loader: () => import('@pages/Course'),
	loading,
})

const Mall = Loadable({
	loader: () => import('@pages/Mall'),
	loading,
})

const ClassRoom = Loadable({
	loader: () => import('@pages/ClassRoom'),
	loading,
})

const Finance = Loadable({
	loader: () => import('@pages/Finance'),
	loading,
})

const Message = Loadable({
	loader: () => import('@pages/Message'),
	loading,
})

const Setting = Loadable({
	loader: () => import('@pages/Setting'),
	loading,
})


class Home extends Component {
	constructor(props) {
		super(props)
	}

	render() {
		return (
			<Layout>
				{/* 头部导航 */}
				<Nav />
				<HashRouter>
					<Layout
						style={{
							padding: '24px',
							minHeight: '900px',
							overflow: 'auto',
						}}
					>
						<Content
							style={{
								padding: '0 24px',
								minHeight: document.body.offsetHeight-112,
								width: Math.min(document.body.offsetWidth*0.9,1350),
								margin: '0 auto',
								background:'#fff',
							}}
						>
							{/* 内容区域 */}
							<Route
								path="/"
								exact
								render={() => <Redirect to={`/jiameng`} />}
							/>
							<Route path="/jiameng" component={JiaMeng} />
							<Route path="/course" component={Course} />
							<Route path="/report" component={Report} />
							{/* 商城 */}
							<Route path="/mall" component={Mall} />
							{/* 课堂 */}
							<Route path="/classroom" component={ClassRoom} />
							{/* 财务 */}
							<Route path="/finance" component={Finance} />
							{/* 消息 */}
							<Route path="/message" component={Message} />
							{/* 设置 */}
							<Route path="/setting" component={Setting} />
						</Content>
					</Layout>
				</HashRouter>
			</Layout>
		)
	}
}

export default hot(module)(Home)
