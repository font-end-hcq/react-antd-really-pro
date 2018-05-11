import React, {Component} from 'react'
import { Button, Table, Input, Divider, Modal, message } from 'antd';
import DB from '@DB'
import moment from 'moment';

class ProductCategory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dateFormat: 'YYYY-MM-DD',   // 日期格式
            loading: true,             // 内容更新loading
            _id: '',                    // 当前正在操作的Id
            name: '',                   // 当前正在操作的分类
            parentId: '',               // 当前正在操作的父节点id
            list: [],
            deleteVisible: false,
            deleteModalText: '是否确认删除？',
            confirmLoading: false,
            isCreate: false,            // 创建新的分类
            isEdit: false               // 编辑分类
            }
        }
    componentDidMount() {
        this._getCategoryList();
    }
    // 获取分类列表
    _getCategoryList = () => {
        DB.Product.getCategoryList().then(({list})=>{
            if(list){
                list.forEach((li,index)=>{
                    li.key = li._id;
                    li.createTime = moment(li.createTime).format('YYYY-MM-DD'); // 时间转换
                    li.addChild = false;
                    li.isParent = li.parentId === '0' ? true : false;
                    li.isEdit = false;
                    li.children && li.children.forEach((child,jndex)=>{
                        child.key = child._id;
                        child.createTime = moment(child.createTime).format('YYYY-MM-DD'); // 时间转换
                        child.addChild = false;
                        child.isParent = li.parentId === '0' ? true : false;
                        child.isEdit = false;
                    })
                    let addButton = { // + 添加按钮
                        _id:'', 
                        key:index,
                        name:'',
                        createTime: '',
                        parentId: li._id,
                        addChild: false,
                        isParent: false,
                        isEdit: false,
                    }
                    li.children.push(addButton)
                })
                this.setState({
                    list,
                    loading: false
                })
            }
        },err=>{
            message.destroy();
            message.error(err.errorMsg)
        })
    }
    // 新建分类
    _handleCreate = () =>{
        let { name, parentId, list } = this.state;
        list.unshift({
            _id: '-1',
            key: '-1',
            name:'',
            parentId:'0',
            addChild: false,
            isParent: true,
            isEdit: true,
            children:[{     // + 添加按钮
                    _id:'', 
                    key: '',
                    name:'',
                    createTime: '',
                    parentId:'-1',
                    addChild: false,
                    isParent: false,
                    isEdit: false,
                }]
        })
        this.setState({
            _id: '-1',
            name: '',
            parentId: '0',
            list: list,
            isCreate: true
        },()=>{

        })
    }
    // 编辑分类
    _handleEdit = (record) => {
        let { list } = this.state;
        list.forEach((li,index)=>{
            if(li._id === record._id){     // 更改list中的内容
                li.addChild = true;
                li.isEdit = true;
            }
            li.children && li.children.forEach((child,i)=>{
                if(child._id === record._id){
                    child.addChild = true;
                    child.isEdit = true;
                    return child;
                }
            })
            return li;
        })
        this.setState({
            _id: record._id,
            name: record.name,
            parentId: record.parentId,
            list: list
        })
    }
    // 失焦保存编辑的分类
    _saveEdit = () => {
        const { _id, name, parentId, list } = this.state;
        if(!_id || _id === '-1'){               // _id不存在时，为新建分类
            if(name === '') {           // 保存内容为空时
                this.setState({
                    isCreate: false
                })
                message.destroy();
                // 子类的时候不能整个删掉
                if(parentId === '0') {
                    message.warning('未输入分类名称，保存失败。请重新新建分类。')
                    this.state.list.shift()
                    return
                }
                else {
                    message.warning('未输入子分类，保存失败。请重新添加子分类。')
                    this._getCategoryList();
                    return
                }
            }
            DB.Product.createCategory({
                name: name,
                parentId: parentId || '0'
            }).then(res=>{
                this.setState({
                    isCreate: false,
                    isEdit: false,
                    loading: true
                },()=>{
                    this._getCategoryList();
                })
            },err=>{
                message.destroy();
                message.error(err.errorMsg)
            })
        } else {                // 此时存在id,直接保存编辑的内容
            if(name === '') {           // 保存内容为空时，弹框询问是否删除
                message.destroy();
                message.warning('编辑内容不能为空，请重新编辑！');
                this._getCategoryList();
                return
            }
            DB.Product.editCategory({
                _id: _id,
                name: name,
                parentId: parentId
            }).then(res=>{
                this.setState({
                    isCreate: false,
                    isEdit: false,
                    loading: true
                },()=>{
                    this._getCategoryList();
                })
            },err=>{
                message.destroy();
                message.error(err.errorMsg)
            })
        }
    }
    // 删除分类
    _handleDelete = () => {
        const { _id, parentId } = this.state;
        DB.Product.deleteCategory({
            _id:_id
        }).then(res=>{
            this.setState({
                deleteVisible: false,
                confirmLoading: false,
                loading: true
            },()=>{
                this._getCategoryList();
            })
        },err=>{
            message.destroy();
            message.error(err.errorMsg)
            this.setState({
                deleteVisible: false,
                confirmLoading: false
            })
        })
    }
    // 编辑分类输入框更改列表里对应的内容
    _handleEditOnChange = (e, _id) => {
        let { list } = this.state;
        list.forEach((li,index)=>{
            if(li._id === _id){     // 更改list中的内容
                li.name = e.target.value;
            }
            li.children && li.children.forEach((child,i)=>{
                if(child._id === _id){
                    child.name = e.target.value;
                    return child;
                }
            })
            return li;
        })
        this.setState({ 
            name:e.target.value,
            list: list
        })
    }
    // 打开删除弹窗
    _showDeleteModel = (_id, parentId) => {
        this.setState({
            _id: _id,
            parentId: parentId,
            deleteVisible: true,
            deleteModalText: parentId === '0' ? '删除分类将会子分类同时删除，是否继续？' : '是否确认删除？'
        });
    }
    // 取消删除
    _handleDeleteCancel = () => {
        this.setState({
            deleteVisible: false,
            confirmLoading: false,
            _id: ''
        });
    }
    // 添加子类
    _handleCreateChild = (record) => {
        let { list } = this.state;
        list.forEach((li,index)=>{
            if(li._id === record.parentId){
                let child = li.children[li.children.length-1];
                child.addChild = true;
                child.isEdit = true;
                child._id = '-1'
            }
            return li;
        })
        
        this.setState({
            _id: '-1',
            name: record.name,
            parentId: record.parentId,
            list: list
        })
    }
    render() {
        const { list, _id, deleteVisible, confirmLoading, deleteModalText, loading } = this.state;
        const columns = [{
            title: '分类名称',
            dataIndex: 'name',
            key: 'name',
            width:400,
            render: (text, record) => (
                <span>
                    { record.isEdit && // 当编辑或者新建分类时
                        <Input                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
                            type="text"
                            autoFocus
                            maxLength={8}
                            value={record.name}
                            size="default"
                            style={{ width: 280 }}
                            onChange={(e)=>this._handleEditOnChange(e, record._id)}
                            onBlur={this._saveEdit}
                            onPressEnter={this._saveEdit}
                        />
                    }
                    {   // 不存在编辑的时候
                        !record.addChild && record.name!=='' && !record.isEdit && <label
                        className='categoryLabel'>{text}</label>
                    }{  // 不存在编辑并且是子类的时候
                        !record.addChild && !record.isParent && record.name==='' && !record.isEdit && <Button
                        size="default"
                        type="dashed"
                        style={{width:'280px'}}
                        onClick={()=>{this._handleCreateChild(record)}}>+ 添加子分类</Button>
                    }
                </span>
            )
        },{
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
            align: 'center',
            width:150,
        },{
            title: '操作',
            key: 'action',
            align: 'center',
            render: (text, record) => (
                <span>
                {
                    (!record.addChild && record.name!=='' && !record.isEdit) && 
                   <span> <a href="javascript:;" onClick={()=>{this._handleEdit(record)}}>编辑</a>
                    <Divider type="vertical" />
                    <a href="javascript:;" onClick={()=>{this._showDeleteModel(record._id,record.parentId)}}>删除</a></span>
                }
                </span>
            ),
            width: '150px'
        }];
        let locale = {
            emptyText: '抱歉，暂无内容'
        };
        return (
            <div className='productCategory'>
                <p>分类管理</p>
                <Button type="primary" onClick={this._handleCreate} className="newButton">+ 新建</Button>
                <Table columns={columns} dataSource={list} pagination={false} locale={locale} loading={loading} />
                <Modal title="删除分类"
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

export default ProductCategory
