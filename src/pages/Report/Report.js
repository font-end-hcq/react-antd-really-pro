import React, {Component} from 'react'
import {HashRouter, Route, Redirect} from 'react-router-dom'
import { Layout } from 'antd';
const { Content, Sider } = Layout;
import ReportNav from '@comp/ReportNav'
import ReportOpen from '@pages/ReportOpen'
import ReportAccount from '@pages/ReportAccount'
import ReportResource from '@pages/ReportResource'
import ReportInspect from '@pages/ReportInspect'
import ReportIncome from '@pages/ReportIncome'
import ReportRecruit from '@pages/ReportRecruit'

class Report extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }
    componentDidMount() {

    }

    render() {        
        const { match } = this.props;        
        return (
        <Layout>
            <Sider width={200} className='reportSlider'>
                <ReportNav />
            </Sider>
            <Content className='reportContent'>
                {/* 内容区域 */}
                <Route path={`${match.url}`} exact render={()=><Redirect to={`${match.url}/open`}></Redirect>}></Route>
                {/* 开通数据 */}
                <Route exact path={`${match.url}/open`} component={ReportOpen} />
                {/* 账号数据 */}
                <Route exact path={`${match.url}/account`} component={ReportAccount} />
                {/* 资料管理 */}
                <Route exact path={`${match.url}/represource`} component={ReportResource} />
                {/* 资料查看 */}
                <Route exact path={`${match.url}/inspect`} component={ReportInspect} />
                {/* 收入数据 */}
                <Route exact path={`${match.url}/income`}  component={ReportIncome} />
                {/* 招生数据 */}
                <Route exact path={`${match.url}/recruit`} component={ReportRecruit} />
            </Content>
        </Layout>
        )
    }
}

export default Report
