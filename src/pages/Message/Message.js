import React, { Component } from 'react'
import { HashRouter, Route, Redirect } from 'react-router-dom'
import { Layout } from 'antd'
const { Content, Sider } = Layout
import MessageNav from '@comp/MessageNav'

class Message extends Component {
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
					style={{ background: '#fff' }}
				>
					<MessageNav />
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

export default Message
