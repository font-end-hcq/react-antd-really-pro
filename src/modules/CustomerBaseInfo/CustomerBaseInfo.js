import React,{Component} from 'react';
import { Row, Col, message, Button } from 'antd';
import './CustomerBaseInfo.css'
import DB from '@DB';

class CustomerBaseInfo extends Component {

    static propsTypes = {

    }

    constructor(props,context){
        super(props,context);
        this.state = {
            colWidth: 8,                            // 控制col的宽度（上半部分的栅格布局）
            _id: '',                            
            baseInfo: {                             // 基本信息内容
                name: '',
                abb: '',
                source: '',
                address: '',
                firstContact: '',
                tel: '',
                stuNum: '',
                scale: '',
                intention: '',                      // -1： 不确定， 0：低，1：中，2：高
                introduce: '',                      // 简介
                remark: ''                         // 备注
            }
        }
    }
    componentDidMount () {
        let _id = this.props.customerId;
        this.setState({
            _id: _id
        },()=>{
            this._getBaseInfo()
        })
        
    }
    _getBaseInfo = () => {
        const { _id } = this.state;
        DB.Customer.getBaseInfo({
             _id: _id
        }).then((data)=>{
            if(data){
                switch(data.intention){
                    case -1: data.intention = '不确定'
                             break;
                    case  0: data.intention = '低'
                             break;
                    case  1: data.intention = '中'
                             break;
                    case  2: data.intention = '高'
                             break;
                    default: break;
                }
                data.address = `${data.province || ''}${data.city || ''}${data.area || ''}${data.address || ''}`
                this.setState({
                    baseInfo: data
                })
            }
        },err=>{
            message.destroy();
            message.error(err.errorMsg)
        })
    }
    _handleEditDetail = () => {
        const { _id } = this.state;
        window.location.href=`#jiameng/customer/create/${_id}`
    }
    render() {
        const { colWidth, baseInfo } = this.state;

        return(
            <div className="customerBaseInfo">
                <Button type="primary" className="editDetails" onClick={this._handleEditDetail}>编辑详情</Button>
                <Row>
                    <Col span={colWidth}><span className="bold text-top">客户名称：</span><p className='inline'>{baseInfo.name}</p></Col>
                    <Col span={colWidth}><span className="bold text-top">简称：</span><p className='inline'>{baseInfo.abb}</p></Col>
                    <Col span={colWidth}><span className="bold text-top">客户来源：</span><p className='inline'>{baseInfo.source}</p></Col>
                </Row>
                <Row>
                    <Col span={colWidth}><span className="bold text-top">所在地址：</span><p className='inline'>{baseInfo.address}</p></Col>
                    <Col span={colWidth}><span className="bold text-top">首要联系人：</span><p className='inline'>{baseInfo.firstContact}</p></Col>
                    <Col span={colWidth}><span className="bold text-top">手机：</span><p className='inline'>{baseInfo.tel}</p></Col>
                </Row>
                <Row>
                    <Col span={colWidth}><span className="bold text-top">学生人数：</span><p className='inline'>{baseInfo.stuNum}</p></Col>
                    <Col span={colWidth}><span className="bold text-top">规模：</span><p className='inline'>{baseInfo.scale}</p></Col>
                    <Col span={colWidth}><span className="bold text-top">意向：</span><p className='inline'>{baseInfo.intention}</p></Col>
                </Row>
                <Row>
                    <Col span={24}><span className="bold text-top">简介：</span><p className='inline'>{baseInfo.introduce}</p></Col>
                </Row>
                <Row>
                    <Col span={24}><span className="bold text-top">备注：</span><p className='inline'>{baseInfo.remark}</p></Col>
                </Row>
            </div>
        )
    }
}
export default CustomerBaseInfo
