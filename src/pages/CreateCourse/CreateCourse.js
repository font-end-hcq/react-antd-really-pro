import React,{PureComponent} from 'react'
import DB from '@DB'
import './CreateCourse.scss'
import {Form,Button,Icon,Input,message,Alert,Spin,Select,Cascader,Tag,Divider,Table,Modal,Dropdown,Menu,notification,Popconfirm} from 'antd'
const FormItem = Form.Item;
const Option = Select.Option;
import {Link} from 'react-router-dom'
import theme from 'react-quill/dist/quill.snow.css'
import ReactQuill from 'react-quill'
import EditClass from '@modules/EditClass'
function log(value){
    console.log(value)
}

class CreateCourse extends PureComponent{

    constructor(props){
        super(props)
        let id = this.props.match.params.id || 'new'

        this.state = {
            loading:true,
            id,  // 课程id,如果没有,为new
            ifNew:id==='new' ?true:false, // 如果id为new，说明是新建课程，如果是id，说明要修改课程
            // 科目列表
            categoryList:[],
            // 标签列表
            labelList:[],
            // 是否显示新增或修改课次的弹框
            showClassModal:false,
            // 当前正在修改的课次内容
            classDetail:{},
            // 将要添加的课次位置
            classIndex:'new',    // new: 代表新建课次  edit:修改课次  数字:要填加的位置
            // 富文本编辑器格式
            modules: {
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


            // 课程标题
            title:'',
            // 科目
            category:'',
            // 当前选中的标签
            choosedLabel:[],
            // 课程详情，富文本编辑器
            details:'',
            // 课次列表
            classList:[],

        }
    }

    // 富文本编辑器上传图片
    uploadCallback = (e) =>{
        const t = this;
        const file = e.target.files[0]
        let pinpaiId = this.state.pinpaiId || 'noPinpaiId'
        let UUID = Math.random().toString(36).substr(2,10);
        const fileName = file.name
        const key = `jiameng/course_accessory/${pinpaiId}/${UUID}_${fileName}`;

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

    componentDidMount(){
        // 获取科目列表
        this.getCategoryList()

        // 获取品牌id
        DB.User.getUserInfo()
        .then(res=>{
            this.setState({
                pinpaiId:res.pinpaiId
            })
        })

        let id = this.state.id
        // 如果有课程_id说明是编辑课程，发请求请求课程详情
        if(id !== 'new') {
            DB.CreateCourse.getCourseDetail2({
                _id:id
            })
            .then(res=>{
                const {
                    category,
                    detail:details,
                    title,
                    class:classList  = [],
                    contents:choosedLabel = [],
                } = res
                // 获取当前课程科目的标签列表
                this.getLabelList(category,false)
                this.setState({
                    category,
                    details,
                    title,
                    classList,
                    choosedLabel,
                })
            })
        }
    }

    // 获取科目列表
    getCategoryList(){
        DB.Category.getCategoryList().then(data=>{
            this.setState({
                categoryList:data.list || [],
                loading:false,
            })
            // 如果是新建课程，默认选择第一个科目。如果是编辑，不选科目
            if(data && data.list && data.list[0] && data.list[0].name && this.state.id === 'new') {
                // 默认选择第一个
                this.getLabelList(data.list[0].name,true)
            }

        })
    }

    // 获取label列表,第二个参数表明是否需要清除当前已选标签
    getLabelList(category,needClear){
        this.setState({
            category,
        })
        DB.Category.getLabelList({
            category,
        }).then(data=>{
            let state = {
                labelList:data || [],
                loading:false,
            }
            if(needClear) {state.choosedLabel = []}
            this.setState(state)
        })
    }

    // 修改标签
    changeLabel = (arr) =>{
        // 查询当前标签是否已被添加
        let choosedLabel = this.state.choosedLabel
        choosedLabel = choosedLabel.filter(item=>{
            return item.label !== arr[0]
        })

        // 根据标签id查出标签的名字
        let data = {}
        this.state.labelList.map(item=>{
            if(item.label === arr[0]) {
                data.label = arr[0]
                item.children.map(item2=>{
                    if(item2.value === arr[1]){
                        data.contentId = arr[1]
                        data.content = item2.label
                    }
                })
            }
        })
        choosedLabel.push(data)

        this.setState({
            choosedLabel:choosedLabel.slice(),
        })
    }

    // 删除标签
    removeLabel = (contentId,e) =>{
        e.preventDefault()
        let choosedLabel = this.state.choosedLabel
        choosedLabel = choosedLabel.filter(item=>{
            return item.contentId !== contentId
        })
        this.setState({
            choosedLabel,
        })
    }

    // 关闭课次编辑的弹框
    closeClassModal = () =>{
        this.setState({
            classDetail:{},
            showClassModal:false,
        })
    }



    // 保存课次
    saveClass = (classDetail,classIndex) =>{
        let classList = this.state.classList
        // 如果这个课次是新建的，添加到最后面
        if(classIndex === 'new') {
            this.setState({
                classList:[...classList,classDetail],
                classDetail:{},
                showClassModal:false,
            })
        }else if(classIndex === 'edit'){
            classList = classList.map(item=>{
                if(item._id === classDetail._id) {
                    return classDetail
                }else{
                    return item
                }
            })
            this.setState({
                classList:[...classList],
                classDetail:{},
                showClassModal:false,
            })
        }else if(typeof classIndex === 'number') {
            classList.splice(classIndex,0,classDetail)
            this.setState({
                classList:[...classList],
                classDetail:{},
                showClassModal:false,
            })
        }
    }

    // 删除指定课次
    deleteClass = (_id)=>{
        let {classList} = this.state
        classList = classList.filter((item)=>{
            return item._id !== _id
        })
        this.setState({
            classList,
        })
    }

    // 新建或者下方添加课次
    createClass = (classIndex,_id) =>{
        if(classIndex === 'edit') {
            // 根据课次id查询课次详情
            DB.CreateCourse.getClassDetail({
                _id,
            })
            .then(res=>{
                this.setState({
                    showClassModal:true,
                    classDetail:res,
                    classIndex,
                })
            })
        }else if(classIndex === 'new'){
            // 新建
            this.setState({
                showClassModal:true,
                classDetail:{},
                classIndex,
            })
        }else if(typeof classIndex === 'number'){
            // 下方新建
            this.setState({
                showClassModal:true,
                classDetail:{},
                classIndex,
            })
        }

    }

    // 保存课程 如果没id代表新增，如果有代表修改
    saveCourse = () =>{
        let {
            title = '',
            category = '',
            choosedLabel:contents = [],
            details = '',
            classList:classes = [],
            id = 'new',
        } = this.state


        let error = false
        if(!title) {error = '请填写课程名称';}
        else if(!category) {error = '请选择课程科目';}
        else if(contents.length === 0) {error = '请添加课程标签';}
        if(error) {message.error(error);return;}

        contents = contents.map(item=>{
            return item.contentId
        })
        classes = classes.map(item=>{
            return item._id
        })

        if(this.state.loading) {message.error('课程保存中，请稍候');return;}
        this.setState({loading:true})

        let query = {
            title,
            category,
            contents,
            details,
            classes,
        }
        if(id!=='new'){query._id = id}
        DB.CreateCourse.createCourse(query)
        .then(res=>{
            if(id!=='new'){
                message.success('课程编辑成功')
            } else{
                message.success('课程添加成功')
            }
            this.setState({loading:false})
            window.location.href = '#/course/list'
        },err=>{
            this.setState({loading:false})
        })
    }

    render(){
        const {
            id,
            ifNew = true,
            title = '',
            category = '',
            categoryList = [],
            labelList = [],
            choosedLabel = [],
            details = '',
            classDetail = {},
            showClassModal = false,
            classList = [],
            classIndex = 'new',
            pinpaiId = '',
        } = this.state


        let columns = [
			{ width:'120px',title:'课次名称',dataIndex:'name' },
			{ width:'120px',title:'主题',dataIndex:'theme' },
			{ width:'120px',title:'课件',dataIndex:'courseware',render: (text, record,index) => (<span>{__PRO__?text.substr(94):text.substr(99)}</span>) },
			{ width:'120px',title:'教案',dataIndex:'plan',render: (text, record,index) => (<span>{__PRO__?text.substr(94):text.substr(99)}</span>)  },
			{ width:'120px',title:'视频',dataIndex:'video',render: (text, record,index) => (<span>{__PRO__?text.substr(94):text.substr(99)}</span>)  },
            { width:'120px',title:'操作',dataIndex:'opt',render: (text, record,index) => (
                <span>
                    <a onClick={this.createClass.bind(this,'edit',record._id)}>编辑 </a>
                    <Divider type="vertical" />
                    <Dropdown
                        trigger={['click']}
                        overlay={<Menu>
                            <Menu.Item>
                                <Popconfirm title="确定删除课次吗?"
                                    onConfirm={this.deleteClass.bind(this,record._id || '')}
                                    okText="确定"
                                    cancelText="取消">
                                    <a>删除</a>
                                </Popconfirm>

                            </Menu.Item>
                            <Menu.Item>
                                <a onClick={this.createClass.bind(this,index+1)}>下方添加</a>
                            </Menu.Item>
                        </Menu>}>
                        <a className="ant-dropdown-link">
                          更多 <Icon type="down" />
                        </a>
                    </Dropdown>
                </span>
            )
          },
		]

        return (<div className="create-wrap">
            <div className='title'>
                课程管理 / <span className='side-title'>{ifNew?"新建":'修改'}课程</span>
            </div>

            <div className="content">
                {/* 课程名称 */}
                <div className="c-item">
                    <div className="c-left">
                        课程名称
                    </div>
                    <div className="c-right">
                        <Input
                            style={{width:'400px'}}
                            maxLength={30}
                            value={title}
                            onChange={(e)=>this.setState({title:e.target.value})}
                            placeholder="请输入课程名称" />
                    </div>
                </div>

                {/* 选择科目 */}
                <div className="c-item">
                    <div className="c-left">
                        科目设置
                    </div>
                    <div className="c-right">
                        <Select
                            // notFoundContent='选择科目'
                            dropdownMatchSelectWidth
                            value={category}
                            // size='default'
                            placeholder="选择科目"
                            onChange={(value)=>this.getLabelList(value,true)}
                        >
                            {
                                categoryList.map((item,index)=>(<Option
                                    key={index}
                                    value={item.name}>{item.name || ''}
                                </Option>))
                            }
                        </Select>
                    </div>
                </div>

                {/* 添加标签 */}
                <div className="c-item">
                    <div className="c-left">
                        添加标签
                    </div>
                    <div className="c-right">
                        <Cascader
                            // allowClear={false}
                            value={[]}
                            options={labelList}
                            // notFoundContent='暂无标签'
                            onChange={this.changeLabel}
                            placeholder={labelList.length === 0?"暂无标签":"添加标签"}
                        />
                    </div>
                </div>

                {/* 已选标签 */}
                <div className="c-item2">
                    <div className="c-left2">
                        已选标签
                    </div>
                    <div className="c-right2">
                        {
                            choosedLabel.map((item,index)=>(<Tag
                                key={index}
                                closable
                                onClose={this.removeLabel.bind(this,item.contentId)}
                                color="#108ee9">
                                {item.label} : {item.content}
                            </Tag>))
                        }

                    </div>
                </div>

                {/* 课程详情 */}
                <div className="c-item2">
                    <div className="c-left2">
                        课程详情
                    </div>
                    <div className="c-right2">
                        <ReactQuill
                            ref={(editor)=>this.editor=editor}
                            modules={this.state.modules}
                            value={details}
                            onChange={(details)=>this.setState({
                                    details,
                                })}/>
                    </div>
                </div>

                <Divider />

                {/* 新建课次 */}
                <Button
                    onClick={this.createClass.bind(this,'new')}
                    style={{marginBottom:'20px'}}
                    type="primary">+添加课次</Button>

                <Table
					// loading={this.state.loadingClass}
					// scroll={{ x: '180%'}}
			        columns={columns}
                    rowKey='_id'
			        dataSource={classList}
			        pagination={false}
			    />

                <div className='opt-wrap'>
                    <Button
                        onClick={this.saveCourse}
                        type='primary'
                        style={{marginRight:'20px'}}>保存</Button>
                    <Link to='/course/list'><Button >取消</Button></Link>
                </div>

                <Modal
                    maskClosable={false}
                    title="课次"
                    visible={showClassModal}
                    okText ='确定'
                    cancelText ='取消'
                    footer={null}
                    onCancel={this.closeClassModal}
                >
                    {
                        showClassModal?<EditClass
                            pinpaiId={pinpaiId}
                            onSaveClass={this.saveClass}
                            classIndex={classIndex}
                            onClose={this.closeClassModal}
                            classDetail={classDetail || {}}/>:null
                    }
                </Modal>
            </div>
        </div>)
    }
}
export default CreateCourse
