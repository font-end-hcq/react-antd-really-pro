import React,{ Component } from 'react'
import { Prompt } from 'react-router'
import {withRouter} from 'react-router-dom'
import DB from '@DB'
import { Button, Input, Select, Divider, message, Spin, Cascader} from 'antd'
const Option = Select.Option
const {TextArea} = Input

class CreateCustomer extends Component{

    constructor(props) {
        super(props)
        this.state = {
            loading:true,
            sourceList:[],           //来源列表
            belongList:[],           //归属人列表
            lianxirenList:[],        //联系人列表
            lxridList:[],            //联系人id
            lxrphoneList:[],         //联系人手机号
            status : [{value:0,text:'潜在'},{value:1,text:'签约'}],           
            intention : [{key:2,inten:'高'},{key:1,inten:'中'},{key:0,inten:'低'},{key:-1,inten:'不确定'}],        
            createObj:{
                _id:props.match.params.id,
            },
            submitkey:true,
            options:[],                 //级联地址
            addoption:[],               //获取地址          

        }
    }
    componentDidMount(){
        this._Sourcelist()
        this._getBelong()
        this._getCascaderAddress()        
    }
    
    //获取详情
    _getdetail(){
        let { createObj ,status, addoption} = this.state;
        DB.Customer.Detail({
            _id: createObj._id
        }).then((res) =>{  
            res.province = res.province? res.province:undefined
            res.city = res.city? res.city:undefined  
            res.area = res.area? res.area:undefined 
            addoption = res.province ? [res.province, res.city, res.area] :[]  //这儿转为cascader的数据形式
            this.setState({
                loading:false,                
                createObj:{
                    ...createObj,
                    ...res,
                    addoption
                }
            }) 
        })
    }

    //编辑
    _Editsubmit = () =>{
        const { createObj } = this.state; 
        DB.Customer.EditCustomer(createObj).then((res) =>{
            message.success(res);
            this.setState({
                submitkey:false
            })
            location.replace("#/jiameng/customer?t="+Date.now())
        }, (err) => {
            message.error(err.errorMsg)
        });
    }
    
    //校验输入框并提交,防止重复提交
    _checkInput = () =>{
        let { createObj } = this.state;
        const reg = new RegExp(
    		/^(13[0-9]|15[012356789]|17[0-9]|18[0-9]|14[57]|166)[0-9]{8}$/,
    	)
        let description;
        if(!createObj.name){
            description = '请填写客户名称'
        }else if(!createObj.phone){
            description = '请填写联系方式'
        }else if(!reg.test(createObj.phone)){
            description = '手机号码格式不正确'
        }else if(!createObj.belongsId){
            description = '请选择归属人'
        }else if((createObj.province && !createObj.address)||(!createObj.province && createObj.address)){
            description = '请填写完整的地址'          
        }

        if(description){
            message.destroy()
            message.error(description)
        }else{
            this._Editsubmit()
        }
    }

    //得到归属人    
    _getBelong = () =>{
        DB.Customer.Belong().then( belong => {
        this.setState({
            belongList: belong.list
        })
        }, (err) => {
            message.error(err.errorMsg)
        });
    }

    //首要联系人列表
    _FirstContactsList = () =>{   
        const {lxridList, lxrphoneList, createObj} = this.state;
        DB.Customer.FirstContactsList({
            _id:this.state.createObj._id
        }).then( res => {
            res.list.map(async (itm,i)=>{
                lxridList.push(itm._id)
                lxrphoneList.push(itm.phone)
                await this.setState({
                    lianxirenList:res.list,
                    createObj:{
                        ...createObj,
                        lxridList,
                        lxrphoneList
                        }
                    })
                    this._getdetail()
                })
        }, (err) => {
            message.error(err.errorMsg)
        });
    }

    // 改变联系人，手机号也改变 
    handleChange=(value)=> {
        let t = this
        const {lxridList, lxrphoneList, createObj} = t.state
        const i = lxridList.indexOf(value)        
        this.setState({
            createObj:{
                ...createObj,
                lianxirenID:value,
                phone:lxrphoneList[i]
            }
        })
     }
     
    //客户来源列表
    _Sourcelist = () =>{
        DB.Customer.Sourcelist().then(async (res) => {
            this.setState({ 
            sourceList:res.list
        })
        }, (err) => {
            message.error(err.errorMsg)
        });
    }
    //取消
    _Cancel=()=>{
        location.replace("#/jiameng/customer?t="+Date.now())   
    }

    //获取地址  
    _getCascaderAddress = ()=>{
        DB.Place.getList().then(async place => {
          let options = this._convertAddress( place);
          await this.setState({
              options
          })
          this._FirstContactsList()                 
        })        
    }
    
    //地址格式转换为级联格式
    _convertAddress = (option)=>{ 
        const { options } = this.state;
           return option.map(itm=>{
                let {districts=[],name} = itm
                let children
                let _child = {
                    label:name,
                    value:name,
                }           
                if(districts.length){
                    children = this._convertAddress(districts)
                    _child = {
                        ..._child,
                        children
                    }
                }
                return _child
            })       
    }

    /* 级联地址 */
    onChange=(value, selectedOptions)=> {
        let {createObj} = this.state;
        this.setState({
            createObj:{
                ...createObj,
                addoption:value,
                province:value[0],
                city:value[1]? value[1]:undefined,
                area:value[2]? value[2]:undefined,            
            }
        })
        }
        
    filter=(inputValue, path)=> {
        return (path.some(option => (option.label).toLowerCase().indexOf(inputValue.toLowerCase()) > -1));
    }

    render(){
        const {loading, options, submitkey, createObj ,sourceList, belongList, intention, status, lianxirenList } = this.state        
        return (
            <div>  
                <Prompt when={submitkey} message="离开当前页面所填写的信息会被清空呦,确定离开吗?"/>     
                <Spin spinning= {loading}>                       
                    <section className='customer'>
                        <p style={{marginBottom:'20px' }}>编辑客户</p>    
                        <h3>基本信息</h3>
                        <div>
                            <span><i>*</i>客户名称:</span>
                            <Input
                                placeholder="请输入客户名称"                                                
                                maxLength={30}                        
                                value={createObj.name}
                                onChange={e=>{
                                    this.setState({
                                        createObj:{
                                            ...createObj,
                                            name:e.target.value
                                        }
                                    })
                                }}
                            />
                        </div>

                        <div className="firstconcat">
                            <span><i>*</i>首要联系人:</span>
                            <Select
                                placeholder="请输入首要联系人" 
                                maxLength={30}
                                value={createObj.lianxirenID}
                                onChange={this.handleChange}
                            >
                                {
                                    lianxirenList.map(contact =>
                                    < Option key = {contact._id} value={ contact._id } > { contact.name }</Option>)     
                                }
                            </Select>
                
                        </div>

                        <div>
                            <span>客户简称:</span>
                            <Input 
                                placeholder="请输入客户简称"                        
                                maxLength={30}
                                value={createObj.abb}
                                onChange={e=>{
                                    this.setState({
                                    createObj:{
                                        ...createObj,
                                        abb: e.target.value
                                    }
                                    })
                                }}
                            />
                        </div>

                        <div>
                            <span><i>*</i>手机:</span>
                            <Input
                                disabled={true}
                                maxLength={11}
                                placeholder="请输入格式正确的手机号"
                                value={createObj.phone}                            
                            />
                        </div>
                        <div>
                            <span>规模大小:</span>
                            <Input
                                maxLength={30}
                                placeholder="请输入规模大小"                            
                                value={createObj.scale}
                                onChange={e=>{
                                    this.setState({
                                        createObj:{
                                            ...createObj,
                                            scale: e.target.value
                                        }
                                    })
                                }}
                            />
                        </div>
                        <div>
                            <span>学生人数:</span>
                            <Input
                                maxLength={30}
                                placeholder="请输入学生人数"
                                value={createObj.stuNum}
                                onChange={e=>{
                                    this.setState({
                                        createObj:{
                                            ...createObj,
                                            stuNum:e.target.value
                                        }
                                    })
                                }}
                            />
                        </div>
                        
                        <div className="khaddress">
                            <span>客户地址:</span>
                            <Cascader
                                value={createObj.addoption}
                                allowClear={true}
                                options={options}
                                onChange={this.onChange}
                                placeholder="请选择客户地址"
                                showSearch={this.filter}
                            />
                            <Input 
                                value={createObj.address}                        
                                placeholder="请输入街道地址"
                                maxLength={30}
                                onChange={e=>{
                                    this.setState({
                                        createObj:{
                                            ...createObj,
                                            address:e.target.value
                                        }
                                    })
                                }}
                                />
                        </div>
                        <div className="intro">
                            <span>客户简介:</span>
                            <TextArea autosize={{ minRows: 4, maxRows: 6 }}
                                value={createObj.introduce}                        
                                maxLength={300}                  
                                placeholder=" 请输入客户简介（300字以内）"
                                onChange={e=>{
                                    this.setState({
                                        createObj:{
                                            ...createObj,
                                            introduce:e.target.value
                                        }   
                                    })
                                }}
                            />
                        </div>
                        <Divider />
                        
                        <h3>商务信息</h3>
                        <div>
                            <span><i>*</i>来源:</span>
                            <Select
                                value={createObj.source}
                                placeholder="请选择来源"
                                onChange={e=>{
                                    this.setState({
                                        createObj:{
                                            ...createObj,
                                        source:e
                                        }
                                    })
                                }}
                            >
                            {
                                sourceList.map((it,i) => <Option key={it._id} value={it.name}>{it.name}</Option>)
                            } 
                            </Select>
                        </div>
                        <div>
                            <span>意向:</span>
                            <Select
                                value={createObj.intention}
                                placeholder="请选择意向"
                                onChange={e=>{
                                    this.setState({
                                        createObj:{
                                            ...createObj,
                                            intention:e
                                        }
                                    })
                                }} >
                            {
                                intention.map(yx => <Option key={yx.key} value={yx.key}>{yx.inten}</Option>)
                            }    
                            </Select>
                        </div>
                        <div>
                            <span><i>*</i>状态:</span>
                            <Select
                                value={createObj.status}
                                placeholder="请选择状态"
                                onChange={e=>{                             
                                    this.setState({
                                    createObj:{
                                        ...createObj,
                                        status:e
                                    }
                                    })
                                }} >
                            {
                                status.map((sts,i) => <Option key={i} value={sts.value}>{sts.text}</Option>)
                            }    
                            </Select>
                        </div>
                        <div>
                            <span><i>*</i>归属人:</span>
                            <Select
                                showSearch
                                value={createObj.belongsId}                        
                                placeholder="请选择归属人"
                                optionFilterProp="children"
                                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                onChange={e=>{
                                    this.setState({
                                    createObj:{
                                        ...createObj,
                                        belongsId:e
                                    }
                                    })
                                }}
                            >
                            {
                                belongList.map(belong =>
                                <Option key={belong._id} value={belong._id}>{belong.name}</Option>
                                )
                            } 
                            </Select>
                        </div>
                        <div className="beizhu">
                            <span>备注:</span>
                            <TextArea 
                                autosize={{ minRows: 4, maxRows:6 }}
                                value={createObj.remark}
                                maxLength={300}                  
                                placeholder=" 请输入备注（300字以内）"
                                onChange={e=>{
                                    this.setState({
                                        createObj:{
                                            ...createObj,
                                            remark:e.target.value
                                        }                                    
                                    })
                                }}
                            />
                        </div>
                        <div className="btns" >  
                        <Button type="default" onClick={this._Cancel}>取消</Button>
                        <Button type="primary" 
                        onClick={()=>{
                            if(submitkey){
                                this._checkInput()
                            }
                        }}
                        >提交</Button>               
                        </div>
                    </section>
                </Spin>                
            </div>
        )
    }
}

export default withRouter(CreateCustomer)


 
