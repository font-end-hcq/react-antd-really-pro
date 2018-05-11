import React,{ Component } from 'react'
import moment from 'moment';

import DB from '@DB'
import './CustomerDetail.css'
import { Icon, Row, Col, Tabs, message } from 'antd'

import CustomerBaseInfo from '@modules/CustomerBaseInfo'
import CustomerContactInfo from '@modules/CustomerContactInfo'
import CustomerFollowInfo from '@modules/CustomerFollowInfo'

const TabPane = Tabs.TabPane;

class CustomerDetail extends Component{

    constructor(props){
        super(props)

        this.state = {
            colWidth: 8, // 控制col的宽度（上半部分的栅格布局）
            loading:true,
            _id: '',
            contractTime:'',
            customerInfo:{
                customerName: '',
                createInfo:{
                    personName: '',
                    crateTime: '',
                },
                belong: '',
                status: 0,          // 1：已签约，0：潜在
                contractDate: [],
                jiamengType: []
            }
        }
    }
    componentWillMount () {
        let location = this.props.location;
        let index = location.pathname.lastIndexOf('/');
        let _id = location.pathname.slice(index + 1);
        this.setState({
            _id: _id
        },()=>{
            this._getCustomerInfo();
        })
    }
    _getCustomerInfo = () => {
        let { _id, contractTime } = this.state;
        DB.Customer.getCustomerInfo({
             _id: _id
        }).then((data)=>{
            if(data){
                let crateTime = data.createInfo.crateTime;
                data.createInfo.crateTime = crateTime && moment(crateTime).format('YYYY-MM-DD');
                data.contractDate.forEach((time,i)=>{
                    data.contractDate[i] = !!time && moment(time).format('YYYY-MM-DD') || null
                })
                contractTime = !!data.contractDate[0] ? `${data.contractDate[0] + '~' + data.contractDate[1]}` : '暂无'
                if(data.jiamengType){
                    data.jiamengType = data.jiamengType === '1' ? '课程签约' : '品牌加盟';
                } else {
                    data.jiamengType = '暂无'
                }
                
                this.setState({
                    customerInfo: data,
                    contractTime: contractTime
                })
            }
        },err=>{
          message.error(err.errorMsg)
        })
    }
    render(){
        const { colWidth, customerInfo, _id, contractTime } = this.state;
        const createInfo = customerInfo.createInfo;
        return (
            <div className="customerDetail">
                <h1><Icon type="idcard" />{customerInfo.customerName}</h1>
                <div className="customerInfo">
                    <Row>
                      <Col span={colWidth}><span className="bold">创建人：</span>{createInfo.personName}</Col>
                      <Col span={colWidth}><span className="bold">归属人：</span>{customerInfo.belong}</Col>
                    </Row>
                    <Row>
                      <Col span={colWidth}><span className="bold">创建时间：</span>{createInfo.crateTime}</Col>
                      <Col span={colWidth}><span className="bold">客户状态：</span>{customerInfo.status === 1 ? '已签约' : '潜在'}</Col>
                    </Row>
                    {
                        customerInfo.status ?
                        <Row>
                          <Col span={colWidth}><span className="bold">合同日期：</span>{contractTime}</Col>
                          <Col span={colWidth}><span className="bold">加盟类型：</span>{customerInfo.jiamengType}</Col>
                        </Row>
                        :''
                    }
                </div>
                <Tabs defaultActiveKey="base" className="tabInfo" >
                    <TabPane tab={<span><Icon type="home" />基本信息</span>} key="base">
                        <CustomerBaseInfo customerId={_id} customerName={customerInfo.customerName} />
                    </TabPane>
                    <TabPane tab={<span><Icon type="mail" />联系人信息</span>} key="contact">
                        <CustomerContactInfo customerId={_id} customerName={customerInfo.customerName}/>
                    </TabPane>
                    <TabPane tab={<span><Icon type="hdd" />跟进信息</span>} key="follow">
                        <CustomerFollowInfo customerId={_id} customerName={customerInfo.customerName} />
                    </TabPane>
                </Tabs>
            </div>
        )
    }
}
export default CustomerDetail
