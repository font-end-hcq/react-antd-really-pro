import React, {Component} from 'react'
import { DatePicker, Input, Cascader, Button, message } from 'antd';
import DB from '@DB';
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');


const { RangePicker } = DatePicker;

class ProductSearch extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dateFormat: 'YYYY-MM-DD',   // 日期格式
            options: [{                 // 初始化选择
                    value: '0',
                    label: '全部',
                    key: 'all'
                }],                
            name: '',                   // 商品名称下拉选择
            createTime: [],             // 创建日期
            category: ['0']                // 选择的商品分类
        }
    }
    componentDidMount() {
        this._getCategoryList();
    }
    // 获取分类下拉内容
    _getCategoryList = () => {
        let { options } = this.state;
        DB.Product.getCategoryList().then(({list})=>{
            if(list) {
                list.forEach((li,index)=> {
                    li.value = li.key = li._id;
                    li.label = li.name;
                    li.children.forEach((child,i)=>{
                        child.value = child.key = child._id;
                        child.label = child.name;
                    })
                    li.children.unshift({
                        value: '0',
                        label: '全部',
                        key: 'all'
                    })
                    options.push(li)
                })
                this.setState({
                    options: options
                })
            }
        },err=>{
            message.destroy();
            message.error(err.errorMsg)
        })
    }
    // 输入商品名称
    _handleName = (e) => {
        this.setState({
            name: e.target.value
        })
    }
    // 选择商品分类
    _handleCategory = (value, selectedOptions) => {
        this.setState({
            category: value
        })
    }
    // 选择创建日期
    _handleCreateTime = (dates, dateStrings) => {
        this.setState({
            createTime: dates
        })
    }
    // 查询
    _handleSearch = () => {
        let { name, createTime, category } = this.state;
        if (createTime.length < 1){
            createTime = ['1000000000000','5000000000000'];
        }
        emitter.emit('getSearchParams', {
            name: name || '0',
            createTime: createTime,
            category: category
        });
    }
    // 重置
    _handleReset = () => {
        this.setState({
            name: '',
            createTime: [],
            category: ['0']
        },()=>{
            this._handleSearch()
        })
    }
    // 日期选择器 禁止选择未来时间
    _disabledDate = (current) => {
        return current && current > moment().endOf('day');
    }
    render() {
        const { dateFormat, options, name, createTime, category } = this.state;
        return (
            <div className='bold search'>
                <div className='row'>
                    <div className='col'>商品名称：<Input placeholder="请输入商品名称" value={name} style={{ width: '280px' }} onChange={this._handleName}/></div>
                    <div className='col'>创建日期：<RangePicker format={dateFormat} placeholder={['开始日期','结束日期']} value={createTime} disabledDate={this._disabledDate} style={{ width: '300px' }} onChange={this._handleCreateTime}/></div>
                </div>
                <div className='row'>
                    <div className='col'>商品分类：<Cascader options={options} allowClear={false} onChange={this._handleCategory} placeholder='请选择' defaultValue={['0']} value={category} style={{ width: '280px' }}/></div>
                </div>
                <div className='row center'>
                    <Button type="primary" onClick={this._handleSearch} style={{marginRight: '10px'}}>查询</Button>
                    <Button onClick={this._handleReset}>重置</Button>
                </div>
            </div>
        )
    }

}

export default ProductSearch
