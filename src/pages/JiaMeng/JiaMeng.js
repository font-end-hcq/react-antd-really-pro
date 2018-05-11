import React, {Component} from 'react'
import {HashRouter, Route, Switch, Link,Redirect} from 'react-router-dom'
import {Layout,Spin} from 'antd';
const { Content, Sider } = Layout;
import JiaMengNav from '@comp/JiaMengNav'
import JiaMengDetail from '@pages/JiaMengDetail'
import CustomerManage from '@pages/CustomerManage'
import CreateCustomer from '@pages/CreateCustomer'
import CustomerDetail from '@pages/CustomerDetail'
import ContractManage from '@pages/ContractManage'
import DB from '@DB'

import Loadable from 'react-loadable'
const loading = () => <Spin/>

const JiaMengList = Loadable({
	loader: () => import('@pages/JiaMengList'),
	loading,
})

class JiaMeng extends Component {
	constructor(props) {
        super(props);
		this.state = {}
    }

	render() {
		const { match } = this.props;
		return (
		<Layout>
			<Sider width={200} style={{ background: '#fff',minHeight:document.body.offsetHeight-112 }}>
				<JiaMengNav />
			</Sider>
			<Content style={{ background:'#fff',padding: 24, minHeight: 800 }}>
				{/* 内容区域 */}
				<Route path={`${match.url}`} exact render={()=><Redirect to={`${match.url}/customer`}></Redirect>}></Route>
				{/* 加盟校列表 */}
				<Route exact path={`${match.url}/list`} component={JiaMengList} />
				<Route exact path={`${match.url}/detail/:id`} component={JiaMengDetail} />
				{/* 加盟校客户管理 */}
				<Route exact path={`${match.url}/customer`} component={CustomerManage} />
				<Route exact path={`${match.url}/customer/create/:id`} component={CreateCustomer} />
				<Route exact path={`${match.url}/customer/detail/:id`} component={CustomerDetail} />
				{/* 合同管理列表 */}
				<Route exact path={`${match.url}/contract`} component={ContractManage} />
			</Content>
		</Layout>
		)
	}
}

export default JiaMeng
