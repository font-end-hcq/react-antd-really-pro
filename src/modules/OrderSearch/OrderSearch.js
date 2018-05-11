import React, {Component} from 'react';
import { Button, Input, Select, DatePicker } from 'antd';
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
import { LocaleProvider } from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
const Option = Select.Option;
class OrderTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            startValue: null,   //开始时间
            endValue: null, //结束时间
            endOpen: false, //结束时间是否展开
            OrderSelect:undefined,  //订单状态默认值
            shopName:null,    //商品名称
            phoneNumber:null, //手机号码
            nickName:null,    //买家昵称
        }
    }
    componentDidMount() {

    }
    //约束开始时间大于结束时间
    disabledStartDate = (startValue) => {
        const endValue = this.state.endValue;
        if (!startValue || !endValue) {
            return false;
        }
        return startValue.valueOf() > endValue.valueOf();
    }
    //禁止结束时间选择比开始时间小
    disabledEndDate = (endValue) => {
        const startValue = this.state.startValue;
        if (!endValue || !startValue) {
          return false;
        }
        return endValue.valueOf() <= startValue.valueOf();
    }

    //开始时间获取值
    onStartChange = (value) => {
        const { startValue } = this.state;
        if(value == null){
            this.setState({
                startValue:null
            })
		}else{
			this.setState({
                startValue:value.valueOf()
            })
		}
    }

    //结束时间获取值
    onEndChange = (value) => {
        const { endValue } = this.state;
        if(value == null){
            this.setState({
                endValue:null
            })
		}else{
			this.setState({
                endValue:value.valueOf()
            })
		}
    }

    //确认开始时间后 结束时间自动打开
    handleStartOpenChange = (open) => {
        if (!open) {
          this.setState({ endOpen: true });
        }
    }
    //结束时间的展开可以根据开始时间来
    handleEndOpenChange = (open) => {
        this.setState({ endOpen: open });
    }
    //订单状态选择
    handleSelect = (value) => {
		this.setState({
			OrderSelect:value
		})
    }
    //查询点击事件
    handleSubmit = () => {
        const { OrderSelect , shopName , phoneNumber, nickName , startValue , endValue ,} = this.state;
        //发送改变的值传给其他组件
        emitter.emit('searchOrder', {
            status: OrderSelect ? OrderSelect : 100,
            name:shopName ? shopName : 0,
            phone:phoneNumber ? phoneNumber: 0, 
            userName:nickName ? nickName : 0, 
            startTime:startValue ? startValue : 1000000000000, 
            endTime:endValue ? endValue : 5000000000000,
        });
	}

    render() {
        const { startValue, endValue, endOpen ,OrderSelect } = this.state;
        return (
            <div>
                <div style={{marginTop:20,marginLeft:10,}}>
                    <span style={{marginRight:10}}>订单状态:</span>
                    <Select
                        value={this.state.OrderSelect}
                        style={{width: 250}}
                        onChange={this.handleSelect}
                        placeholder='请选择订单状态'
                    >
                        <Option value="0">已取消</Option>
                        <Option value="1">未支付</Option>
                        <Option value="2">已支付</Option>
                        <Option value="3">确认到款</Option>
                        <Option value="4">已发货</Option>
                    </Select>
                    <span style={{marginRight:10,marginLeft:15}}>商品名称:</span>
                    <Input
                        value={this.state.shopName}
                        placeholder='请输入商品名称'
                        onChange={ ({target}) => {
                            this.setState({
                                shopName:target.value
                            })
                        }}
                        style={{width:250}}
                    />
                </div>
                <div style={{marginTop:25,marginLeft:10,}}>
                    <span style={{marginRight:10}}>手机号码:</span>
                    <Input
                        maxLength={11}
                        value={this.state.phoneNumber}
                        placeholder='请输入手机号码'
                        onChange={ ({target}) => {
                            let phone = target.value

                            if(phone){
                                phone = phone.replace(/\D/g,'')
                            }
                            this.setState({
                                phoneNumber:phone
                            })
                        }}
                        style={{width:250}}
                    />
                    <span style={{marginRight:10,marginLeft:15}}>买家昵称:</span>
                    <Input
                        value={this.state.nickName}
                        placeholder='请输入买家昵称'
                        onChange={ ({target}) => {
                            this.setState({
                                nickName:target.value
                            })
                        }}
                        style={{width:250}}
                    />
                </div>
                <LocaleProvider locale={zh_CN}>
                    <div style={{marginTop:25,marginLeft:10,}}>
                        <span style={{marginRight:10}}>下单时间:</span>
                        <DatePicker
                            disabledDate={this.disabledStartDate}
                            showTime
                            format="YYYY-MM-DD HH:mm:ss"
                            value={this.state.startValue? moment(this.state.startValue): null}
                            placeholder="请输入开始时间"
                            onChange={this.onStartChange}
                            onOpenChange={this.handleStartOpenChange}
                            allowClear={false}
                        />
                        <span style={{marginRight:4,marginLeft:4}}>至</span>
                        <DatePicker
                            disabledDate={this.disabledEndDate}
                            showTime
                            format="YYYY-MM-DD HH:mm:ss"
                            value={this.state.endValue? moment(this.state.endValue): null}
                            placeholder="请输入结束时间"
                            onChange={this.onEndChange}
                            open={endOpen}
                            onOpenChange={this.handleEndOpenChange}
                            allowClear={false}
                        />
                    </div>
                </LocaleProvider>
                <div className='btn' key='btn'>
                    <Button type='primary' onClick={this.handleSubmit}>搜索</Button>
                    <Button onClick={() => {
                        this.setState({
                            OrderSelect: undefined,
                            shopName:null,
                            phoneNumber:null,
                            nickName:null,
                            startValue: null,
                            endValue: null,
                        })
                    }}>重置</Button>
                </div>

            </div>
        )
    }

}

export default OrderTable
