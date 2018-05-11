import React, {Component} from 'react'
import { Prompt } from 'react-router'
import { Form, Input, Button, InputNumber, Upload, Icon, Modal, Cascader, Spin, message } from 'antd';
import DB from '@DB';
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import UploadModule from '@modules/UploadModule'

const FormItem = Form.Item;

class ProductList extends Component {
    constructor(props) {
        super(props);
        let id = this.props.match.params.id || 'new'
        this.state = {
            id: id,
            uploading: false,               // 图片上传状态
            loading: false,
            submitkey:true,                 // 判断提交状态
            isNew: id === 'new' ? true : false,
            previewVisible: false,          // 是否展示预览
            previewImage: '',               // 预览图片
            fileList: [],                   // 当前上传的图片数组
            maxPic: 5,                      // 图片上传最大数量
            modules: {                      // 富文本编辑器格式
                toolbar: {
                    container:[
                     [{ 'header': [1, 2,3,4,5, false] }],
                     ['bold', 'italic', 'underline','strike', 'blockquote'],
                     [{ 'size': ['small', false, 'large', 'huge'] }],
                     [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
                     ['link', 'image'],
                     [{ 'align': [] }],
                     [{ 'color': [] }, { 'background': [] }],
                     ['clean']
                    ],
                    handlers: {
                        // handlers object will be merged with default handlers object
                        'image': (e)=> {
                            let input = document.createElement('input')
                            input.type = 'file'

                            input.onchange = this.uploadCallback
                            input.click()
                        }
                    }
                }
            },
            product:{                       // 商品信息
                name: '',
                desc: '',
                sortId: ['0'],
                price: null,
                stock: null,
                buyLimit: null,
                images: [],
                detail: ''                 // 商品详情，富文本编辑器
            },
            typeOption: []
        }
    }
   async componentDidMount() {
            await this._getCategoryList()
            let id = this.state.id
            // 如果有课程_id说明是编辑课程，发请求请求课程详情
            if(id !== 'new') {
                this.setState({
                    loading: true
                },()=>{
                    this._getProductDetail(id)
                })
            }
    }
    // 富文本编辑器上传图片
    uploadCallback = (e) =>{
        const t = this;
        const file = e.target.files[0]
        let pinpaiId = this.state.pinpaiId || 'noPinpaiId'
        let UUID = Math.random().toString(36).substr(2,10);
        const fileName = file.name
        const key = `jiameng/product/detailImage/${UUID}_${fileName}`;

        DB.CreateCourse.getToken()
        .then(async (result)=>{
            var client = new OSS.Wrapper({
                accessKeyId: result.Credentials.AccessKeyId,
                accessKeySecret: result.Credentials.AccessKeySecret,
                stsToken: result.Credentials.SecurityToken,
                endpoint: 'https://oss-cn-hangzhou.aliyuncs.com',
                bucket: __PRO__?'jiaopeitoutiao':'jiaopeitoutiao-test'
            });
            client.multipartUpload(key, file,{
                progress:function*(p){
                    // if(t.props.process) {
                    //     t.props.process(p);
                    // }
                }
            }).then(res=>{
                // 上传成功
                if(res.res.status === 200) {
                    // t.props.success(file,key)
                    const url = prefix+key
                    let editor = t.editor.getEditor()
                    let sel = editor.getSelection()
                    editor.clipboard.dangerouslyPasteHTML(sel.index, `<img src="${url}"/>` || '');
                }else{
                    notification.error({
                        message: '警告',
                        description: '上传失败，请重试',
                    });
                    // 上传失败
                }
            })
            .catch(function (err) {
                notification.error({
                    message: '警告',
                    description: '上传失败，请重试',
                });
                console.log('onerror',err);
            });
        })
    }
    // 获取商品详情信息
    _getProductDetail = (_id) => {
        let { product, typeOption } = this.state;
        DB.Product.getProductDetail({
            _id:_id
        }).then(data=>{
            if(data){
                
                data.images && data.images.forEach((img,index)=>{
                    img.status = 'done',
                    img.uid = index;
                })
                // 处理商品类型
                if(data.sortId === '0'){
                    data.sortId = ['0']
                } else{
                    let sortId = data.sortId;
                    data.sortId = ['0'];
                    typeOption.forEach((option,jndex)=>{    // 级联选择初始化值必须是一个数组，找到前后值
                        if(option._id === sortId){   // 如果直接匹配，则直接返回
                            if(option.children){
                                data.sortId = [sortId,'0'];
                            } else{
                                data.sortId = [sortId];
                            }
                            
                            return
                        }
                        // 查找子节点下对应值，并且返回父节点和子节点的值所组成的数组
                        option.children && option.children.forEach((child,i)=>{
                            if(child._id === sortId){
                                data.sortId = [child.parentId, child._id];
                                return
                            }
                        })
                    })
                }
                this.setState({
                    loading: false,
                    product: data,
                    fileList: data.images
                })
            }
        },err=>{
            message.destroy();
            message.error(err.errorMsg)
            this.setState({
                loading: false
            })
        })
    }
        // 获取分类下拉内容
    _getCategoryList = async () => {
        let { typeOption } = this.state;
        typeOption.push({ value: '0', label: '全部', key: 'all', _id: '0'});
        await DB.Product.getCategoryList().then(({list})=>{
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
                        key: 'all',
                        _id: '0',
                        parentId: li._id
                    })
                    typeOption.push(li)
                })
                this.setState({
                    typeOption: typeOption
                })
            }
        },err=>{
            message.destroy();
            message.error(err.errorMsg)
        })
    }
    // 新建 / 编辑保存
    _handleEditProduct = () => {
        const { isNew, id, product, fileList } = this.state;
        let images = []; let params = {};
        fileList.forEach((list,index)=>{
            images.push({
                name: list.name,
                url: list.url || list.thumbUrl
            })
        })
        // 当商品分类选择的是子分类中的全部时
        if(product.sortId.length === 2 && product.sortId[1] === '0'){
            product.sortId = product.sortId[0]
        } else {
            product.sortId = product.sortId[product.sortId.length-1]
        }
        params = {
            name: product.name,
            desc: product.desc,
            sortId: product.sortId,
            price: parseFloat(product.price),
            stock: parseInt(product.stock),
            buyLimit: parseInt(product.buyLimit),
            images: images,
            mainImage: images[0].url,
            detail: product.detail
        }
        if(!isNew){       //编辑
            params._id = id;
            DB.Product.editProduct(params).then(res=>{
                message.success('编辑商品成功！');
                //提交清空输入框
                this.setState({
                    loading: false,
                    submitkey:false
                })
                location.replace("#/mall/list?t="+Date.now())
            },err=>{
                message.destroy();
                message.error(err.errorMsg)
                this.setState({
                    loading: false
                })
            })
        } else {        // 新建
            DB.Product.createProduct(params).then(res=>{
                message.success('新建商品成功！');
                //提交清空输入框
                this.setState({
                    loading: false,
                    submitkey:false
                })
                location.replace("#/mall/list?t="+Date.now())
            },err=>{
                message.destroy();
                message.error(err.errorMsg)
                this.setState({
                    loading: false
                })
            })
        }
    }
    // 取消预览
    handleCancel = () => this.setState({ previewVisible: false })
    // 图片预览
    handlePreview = (file) => {
        this.setState({
          previewImage: file.url || file.thumbUrl,
          previewVisible: true,
        });
    }
    // 上传缩略图事件
    handleChange = ({ fileList }) => {
        let images = [];
        fileList.forEach((file,index)=>{
            images.push({
                uid: file.uid,
                name: file.name,
                status: file.status,
                thumbUrl: file.thumbUrl
            })
        })
        this.setState({ 
            fileList,
            product:{
                ...this.state.product,
                images: images
            } 
        })
    }
    // 提交
    _handleSubmit = (e) => {
        const { isNew } = this.state;
            e.preventDefault();
            this.props.form.validateFieldsAndScroll((err, values) => {
                if (!err) {
                    this.setState({
                        loading: true,
                        product: values
                    },()=>{
                        this._handleEditProduct()
                    })
                }
            })
    }
    // 取消提交
    _handleCancleSubmit = () => {
        location.replace("#/mall/list?t="+Date.now())
    }
    // 搜索匹配选项指定
    filter = (inputValue, path) => {
        return (path.some(option => (option.label).toLowerCase().indexOf(inputValue.toLowerCase()) > -1));
    }
    // 输入框内容更改回调。本来是不用这个的，但是由于 form 的组件根节点必须只有一个，要在后面加单位，默认值就渲染不上去，只好通过修改value渲染
    _handleInputChange = (value, type) => {
        this.setState({
            product:{
                ...this.state.product,
                [type]: value
            }
        })
    }
    // 图片上传
    uploadImg = (obj,file,key) =>{
        let { fileList } = this.state;
        const t = this;
        const image = prefix+key;
        const img = new Image;
        img.src = image;
        img.onload = ()=>{
            fileList.push({
                name: file.name,
                url: image,
                uid: file.uid,
                status: 'done'
            })
            this.setState({
                fileList: fileList,
                uploading: false
            })
        }

        img.onerror = ()=>{
          message.error('上传失败');
        }
    }
    // 移除图片
    removeImg = (obj,file) =>{
        let { fileList } = this.state;
        fileList.map((list,index)=>(
            list.uid === file.uid ? fileList.splice(index, 1) : ''
        ))
        this.setState({
            fileList,
            uploading: false
        })
    }
    // 父子组件之间的数据传递
    changeState = (key,value) =>{
         this.setState({
          [key]:value
        })
    }
   
    render() {
        const { loading, uploading, submitkey, isNew, previewVisible, previewImage, fileList, maxPic, modules,product, typeOption } = this.state;
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: { span: 4 },
                sm: { span: 4 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 18 },
            },
        };
        
        return (
            <div className="productCreate">
                <Prompt when={submitkey} message="离开当前页面所填写的信息会被清空呦,确定离开吗?"/>
                <p>{ isNew ? '新建商品' : '编辑商品' }</p>
                <Spin spinning= {loading}> 
                    <Form>
                        <FormItem {...formItemLayout} label="商品名称">
                          {getFieldDecorator('name', {
                            initialValue: product.name,
                            rules: [{
                              required: true, message: '请输入商品名称',
                            },{
                                max: 30, message:'最多输入30个字!'
                            }],
                          })(
                            <Input maxLength={30} placeholder='请输入商品名称'/>
                          )}
                        </FormItem>
                        <FormItem {...formItemLayout} label="简介描述">
                          {getFieldDecorator('desc', {
                            initialValue: product.desc,
                            rules: [{
                              required: true, message: '请输入简介描述',
                            },{
                                max: 100, message:'最多输入100个字'
                            }],
                          })(
                            <Input maxLength={100} placeholder='请输入简介描述' />
                          )}
                        </FormItem>
                        <FormItem {...formItemLayout} label="商品分类">
                            {getFieldDecorator('sortId', {
                                initialValue: product.sortId,
                                rules: [{
                                    required: true, message: '请选择商品分类!',
                                }],
                            })(
                                <Cascader options={typeOption} allowClear={false}  showSearch={true} placeholder='请选择' style={{ width: '280px' }}/>
                            )}
                        </FormItem>
                        <FormItem {...formItemLayout} label="价格">
                          {getFieldDecorator('price', {
                            initialValue: product.price,
                            rules: [{ 
                                required: true, message: '请输入金额' 
                            }],
                          })(
                            <span>
                                <InputNumber
                                  placeholder='请输入正确金额'
                                  step={0.01}
                                  value = {product.price}
                                  style={{width: '350px', marginRight:'5px'}}
                                  max={99999.99}
                                  maxLength={8}
                                  onChange={(value)=>{this._handleInputChange(value,'price')}}
                                  />元
                            </span>
                          )}
                        </FormItem>
                        <FormItem {...formItemLayout} label="库存数量">
                          {getFieldDecorator('stock', {
                            initialValue: product.stock,
                            rules: [{ 
                                required: true, message: '请输入库存数量' 
                            }],
                          })(
                          <span>
                            <InputNumber                // 注释掉的内容是将数字超过1000则用 1,000展示
                              placeholder = "0-99999"
                              // formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              // parser={value => value.replace(/\￥\s?|(,*)/g, '')}
                              value = {product.stock}
                              style={{width: '350px', marginRight:'5px'}}
                              max={99999}
                              min={0}
                              onChange={(value)=>{this._handleInputChange(value,'stock')}}
                              />件
                            </span>
                          )}
                        </FormItem>
                        <FormItem {...formItemLayout} label="购买限制数量">
                          {getFieldDecorator('buyLimit', {
                            initialValue: product.buyLimit,
                            rules: [{ 
                                required: true, message: '请输入购买限制数量' 
                            }],
                          })(
                          <span>
                            <InputNumber
                              placeholder = "0-9999"
                              // formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              // parser={value => value.replace(/\￥\s?|(,*)/g, '')}
                              value={product.buyLimit}
                              style={{width: '350px', marginRight:'5px'}}
                              max={9999}
                              min={0}
                              onChange={(value)=>{this._handleInputChange(value,'buyLimit')}}
                              />件
                            </span>
                          )}
                        </FormItem>
                        <FormItem {...formItemLayout} label="展示缩略图片上传">
                          {getFieldDecorator('images', {
                            initialValue: product.images,
                            rules: [{ 
                                required: true, message: '请上传商品展示缩略图' 
                            }],
                          })(
                            <div>
                                <UploadModule
                                    limit={5}
                                    type='card'
                                    listType="picture-card"
                                    onStart = { uploading }
                                    onPreview={this.handlePreview}
                                    success={this.uploadImg.bind(null,'abbImage')}
                                    remove={this.removeImg.bind(null,'abbImage')}
                                    folderName = 'product'
                                    fileList={fileList}
                                    changeState = {this.changeState}
                                    />
                                <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                                  <img style={{ width: '100%' }} src={previewImage} />
                                </Modal>
                            </div>
                          )}
                        </FormItem>
                        <FormItem {...formItemLayout} label="商品详情">
                           {getFieldDecorator('detail', {
                            initialValue: product.detail,
                          })(
                            <ReactQuill
                                ref={(editor)=>this.editor=editor}
                                modules={this.state.modules}
                                // value={details}
                                // onChange={(details)=>this.setState({
                                //         details,
                                //     })}
                                />
                          )}
                        </FormItem>
                        <div className='center'>
                            <Button onClick={this._handleCancleSubmit} style={{marginRight: '10px'}}>取消</Button>
                            <Button onClick={this._handleSubmit} type="primary">提交</Button>
                        </div>
                  </Form>
                </Spin>
            </div>
        )
    }

}

export default Form.create()(ProductList)
