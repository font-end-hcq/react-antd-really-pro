import React, {Component} from 'react'
import { Table, Tag, Modal, message } from 'antd';
import DB from '@DB';
import moment from 'moment';

class ProductTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            product: [],
            pageSize: 5,
            pageNum: 1,
            total: 0,
            name: '0',                                          // 商品名称下拉选择
            createTime: ['1000000000000','5000000000000'],      // 创建日期
            category: ['0'],                                    // 选择的商品分类
            deleteId: '',                                       // 删除商品的Id
            deleteVisible: false,
            deleteModalText: '是否确认删除？',
            confirmLoading: false,
            loading: true                                       // 表格内容更新时loading
        }
    }
    componentDidMount() {
        this._getProductList();
        this._getSearchParams();
    }
    // 分页操作
    _handlePageChange = (page) =>{
        this.setState({
            pageNum: page.current,
            loading: true
        },()=>{
            // 刷新表格
            this._getProductList();
        })
    }
    // 接收查询条件
    _getSearchParams = () => {
        emitter.addListener('getSearchParams',(obj) => {
            let dates = [];
            if(obj.createTime[0] !== '1000000000000' && obj.createTime[1] !== '5000000000000'){
                // 将时间转化成时间戳
                obj.createTime.forEach((date,index) => {
                    dates.push(moment(date).valueOf());
                })
            } else {
                dates = obj.createTime;
            }
            // 将搜索条件保存下
            this.setState({
                name: obj.name,
                createTime: dates,
                category: obj.category,
                loading: true
            },()=>{
                this._getProductList();
            })
        })
    }
    // 根据条件进行查询列表
    _getProductList = () => {
        let { pageSize, pageNum, name, createTime, category, _getProductList} = this.state;
        if(category.length>1 && category[1] === '0'){
            category = category[0]
        } else {
            category = category[category.length-1];
        }
        DB.Product.getProductList({
            name: name,
            sortId: category,
            startTime: createTime[0],
            endTime: createTime[1],
            pageNum: pageNum,
            pageSize: pageSize,
        }).then(({list, count})=>{
            if(list) {
                list.forEach((li,index)=>{
                    li.key = li._id;
                    li.pic = li.images[0] && li.images[0].url;
                    li.createdate = moment(li.createTime).format('YYYY-MM-DD');
                    li.updatedate = moment(li.updateTime).format('YYYY-MM-DD');
                })
                this.setState({
                    product: list,
                    total: count,
                    loading: false
                })
            }
        },err=>{
            message.destroy();
            message.error(err.errorMsg)
        })
    }
    // 商品的上/下架操作
    _handleChangeState = (_id) => {
        DB.Product.setProductState({
            _id: _id
        }).then((res)=>{
            this.setState({
                loading: true
            },()=>{
                // 重新刷新列表
                this._getProductList()
            })
            
        },err=>{
            message.destroy();
            message.error(err.errorMsg)
        })
    }
    // 编辑商品，跳转页面
    _handleEditProduct = (_id) => {
        window.location.href = `#/mall/create/${_id}?t=`+Date.now()
    }
    // 打开删除弹窗
    _showDeleteModel = (_id) => {
        this.setState({
            deleteId: _id,
            deleteVisible: true
        });
    }
    // 删除商品
    _handleDelete = () => {
        const { deleteId } = this.state;
        this.setState({
            confirmLoading: true
        },()=>{
            DB.Product.delelteProduct({
                _id: deleteId
            }).then((res)=>{
                if(res){
                    this.setState({
                        confirmLoading: false,
                        deleteVisible: false,
                        loading: true
                    },()=>{
                        // 重新刷新列表
                        this._getProductList()
                    })
                }
            },err=>{
                message.destroy();
                message.error(err.errorMsg);
                this.setState({
                    confirmLoading: false,
                    deleteVisible: false
                })
            })   
        });
    }
    // 取消删除
    _handleDeleteCancel = () => {
        this.setState({
            deleteVisible: false,
            confirmLoading: false,
            deleteId: ''
        });
    }
    render() {
        const { product, pageSize, pageNum, total, deleteVisible, deleteModalText, confirmLoading, loading } = this.state;
        // 表格分页配置
        const pagination = {
            showQuickJumper: true,
            pageSize: pageSize,
            pageNum: pageNum,
            total: total,
            showTotal: (total)=>{
                return `共${total}条`
            }
        }
        const columns = [{
            title: 'ID',
            dataIndex: '_id',
            key: '_id',
            align: 'center'
        },{
            title: '缩略图',
            dataIndex: 'pic',
            key: 'pic',
            align: 'center',
            render: text => {
               return(<img src={text}style={{width:'32px',height:'32px'}}/>) 
            }
        },{
            title: '商品名称',
            dataIndex: 'name',
            key: 'name',
            align: 'center',
            width: 100
        },{
            title: '简介描述',
            dataIndex: 'desc',
            key: 'desc',
            align: 'center',
            render: text => {
               return(<span className='ellipsis'>{text}</span>) 
            }
        },{
            title: '单价',
            dataIndex: 'price',
            key: 'price',
            align: 'center',
            width: 80
        },{
            title: '创建日期',
            dataIndex: 'createdate',
            key: 'createdate',
            align: 'center',
            width: 110
        },{
            title: '更新日期',
            dataIndex: 'updatedate',
            key: 'updatedate',
            align: 'center',
            width: 110
        },{
            title: '上架状态',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: text => {
                return (text === '1' ? <Tag color="#108ee9" style={{margin:'0'}}>已上架</Tag>
                : <Tag color="#cccccc" style={{margin:'0'}}>已下架</Tag>)
            }
        },{
            title: '操作',
            key: 'action',
            align: 'center',
            render: (text, record) => (
                <span className="actionButton">
                    <a href="javascript:;" onClick={()=>{this._handleChangeState(record._id)}}>{record.status === '1' ? '下架' : '上架'}</a>
                    <a href="javascript:;" onClick={()=>{this._handleEditProduct(record._id)}}>编辑</a>
                    <a href="javascript:;" onClick={()=>{this._showDeleteModel(record._id)}}>删除</a>
                </span>
            ),
            width: '150px'
        }];
        let locale = {
            emptyText: '抱歉，暂无内容'
        };
        return (
            <div className='productTable'>
                <Table columns={columns} dataSource={product} pagination={false} locale={locale} pagination={pagination} onChange={this._handlePageChange} loading={loading}/>
                <Modal title="删除商品"
                    visible={deleteVisible}
                    onOk={this._handleDelete}
                    okText ='确定'
                    cancelText ='取消'
                    confirmLoading={confirmLoading}
                    onCancel={this._handleDeleteCancel}>
                    <p>{deleteModalText}</p>
                </Modal>
            </div>
        )
    }

}

export default ProductTable
