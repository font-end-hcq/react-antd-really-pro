import React, { Component } from 'react'
import { HashRouter, Route, Redirect } from 'react-router-dom'
import { Layout } from 'antd'
const { Content, Sider } = Layout
import FinanceNav from '@comp/FinanceNav'

class Finance extends Component {
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
					<FinanceNav />
				</Sider>
				<Content
					style={{
						background: '#fff',
						padding: 24,
						minHeight: 800,
					}}
				/>
			</Layout>
		)
	}
}

export default Finance
