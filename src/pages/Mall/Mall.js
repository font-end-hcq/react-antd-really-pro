import React, { Component } from 'react'
import { HashRouter, Route, Redirect } from 'react-router-dom'
import { Layout } from 'antd'
const { Content, Sider } = Layout
import MallNav from '@comp/MallNav'
import ProductCategory from '@pages/ProductCategory'
import ProductList from '@pages/ProductList'
import OrderList from '@pages/OrderList'
import ProductCreate from '@pages/ProductCreate'

class Mall extends Component {
	constructor(props) {
		super(props)
		this.state = {}
	}
	componentDidMount() {}

	render() {
		const { match } = this.props
		return (
			<Layout>
				<Sider
					width={200}
					style={{ background: '#fff'}}
				>
					<MallNav />
				</Sider>
				<Content
					style={{
						background: '#fff',
						padding: 24,
						minHeight: 800,
					}}
				>
					{/* 内容区域 */}
					<Route path={`${match.url}`} exact render={()=><Redirect to={`${match.url}/list`}></Redirect>}></Route>
					{/* 商品管理 */}
					<Route exact path={`${match.url}/list`} component={ProductList} />
					<Route exact path={`${match.url}/category`} component={ProductCategory} />
					<Route exact path={`${match.url}/create/:id`} component={ProductCreate} />
					{/* 订单管理 */}
					<Route exact path={`${match.url}/dingdan`} component={OrderList} />
				</Content>
			</Layout>
		)
	}
}

export default Mall
