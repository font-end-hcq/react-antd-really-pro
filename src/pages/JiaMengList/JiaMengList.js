import React, {Component} from 'react'
import { Link} from 'react-router-dom'
import {
    DatePicker,
    Select,
    Checkbox,
    Button,
    Spin,
    Modal,
    Input,
	Tag,
	message,
    Pagination,
    Alert,
    Popconfirm,
    Divider,
} from 'antd';
import moment from 'moment'
const {RangePicker} = DatePicker
const {Option} = Select
import DB from '@DB'
import ListEmpty from '@comp/ListEmpty'


class JiaMengList extends Component {
    constructor(props) {
        super(props);
        const intime = null

        const search = {}
        this.state = {
            search,
            place: null,
            provinceOptions: [],
            cityOptions: [],
            province: undefined,
            city: null,
            cityData: [],
            area: null,
            areaOption: [],
            selectTime: intime,
            default_selectTime:intime,
            default_search:{...search},
            list: [],
            count: 0,
            loading: true,
            pageNum:1,

			//modal相关
			openModal:false,
            city_modal: null,
            cityData_modal: [],
            area_modal: null,
            areaOption_modal: [],
			operate:{},
            province_modal:null,
            error:null,
        }
    }
    componentDidMount() {
        DB.Place.getList().then(place => {
            const provinceData = []
            for (let province of place) {
                provinceData.push(province.name)
            }

            let provinceOptions = provinceData.map((province,index) => <Option key={index} value={province}>{province}</Option>);

            this.setState({place, provinceOptions})
        })
        this.__getList()
    }

    __getList() {
        let {search, province, city, area,pageNum} = this.state

        if (province) {
            search.area = [province]
        }

        if(city){
            search.area.push(city)
        }

        if (area) {
            search.area.push(area)
        }

        search = {
            ...search,
            pageSize:10,
            pageNum,
        }

        this.setState({
            loading:true,
        })

        DB.School.getList(search).then(({count, list}) => {
            this.setState({count, list})
        }).then(()=>{
            this.setState({
                loading:false,
            })
        })
    }

    _cityChange(city) {
        const {cityData} = this.state
        let areaData;
        if (city) {
            const arealist = cityData.filter(itm => itm.name === city)
            areaData = arealist[0].districts
        } else {
            areaData = cityData[0].districts
            city = cityData[0].name
        }

        const areaOption = areaData.map(area =>< Option key = {
            area.name
        } > {
            area.name
        }</Option>);

        this.setState({
            city,
            areaOption,
            area: areaData[0] && areaData[0].name
        })
    }

    _cityChange_modal(city_modal) {
        const {cityData_modal,area_modal} = this.state
        let areaData,  areaOption_modal, _area;
        if (city_modal) {
            const arealist = cityData_modal.filter(itm => itm.name === city_modal)
            areaData = arealist[0].districts
        } else {
            areaData = cityData_modal[0] && cityData_modal[0].districts
            city_modal = cityData_modal[0] && cityData_modal[0].name
        }
        if(areaData){
            areaOption_modal = areaData.map(area =>< Option key = {
                area.name
            } > {
                area.name
            }</Option>);
            _area = areaData.find(itm=>itm.name===area_modal)
        }else{
            areaOption_modal = undefined
            _area = undefined
        }

        this.setState({
            city_modal,
            areaOption_modal,
            area_modal: _area?_area.name:(areaData&&areaData[0]? areaData[0].name : undefined)
        })
    }



    _search() {
        const {
            search,
            provinceOptions,
            place,
            cityOptions,
            cityData,
            areaOption,
            province,
            selectTime
        } = this.state
        return [
            <p className='jiameng__title' key='p'>加盟校</p>,
            <dl key='dl'>
                <dd>
                    <span>加盟校名称:</span>
                    <Input
                        placeholder='请输入加盟校名称'
                        value={search.name}
                        onChange={({target})=>{
							this.setState({
								search:{
									...search,
									name:target.value
								}
							})
						}}
                    />
                </dd>
                <dd className='date'>
                    <span>创建日期:</span>
                    <RangePicker
                         value={selectTime}
                         allowClear={false}
                         placeholder={['开始日期','结束日期']}
                         showTime="showTime"
                         format="YYYY/MM/DD HH:mm:ss"
                         onChange={e => {
                            let startTime,endTime
                            if(e.length){
                                startTime = e[0].valueOf()
                                endTime = e[1].valueOf()
                            }
                            this.setState({
                                selectTime: e,
                                search: Object.assign(search, {
                                    startTime,
                                    endTime,
                                })
                            })
                        }}/>
                </dd>

                <dd>
                    <span>联系人:</span>
                    <Input
                        value={search.contacts}
                        placeholder='请输入联系人'
                        onChange={({target})=>{
							this.setState({
								search:{
									...search,
									contacts:target.value
								}
							})
						}}
                    />
                </dd>
                <dd className='phone'>
                    <span>联系方式:</span>
                    <Input
                        // onKeyUp="this.value=this.value.replace(/\D/g,'')"
                        value={search.phone}
                        placeholder='请输入联系方式'
                        maxLength = {11}
                        onChange={({target})=>{
                            let phone = target.value
                            if(phone){
                                phone = phone.replace(/\D/g,'')
                            }
							this.setState({
								search:{
									...search,
									phone,
								}
							})
						}}
                    />
                </dd>

                <dd className='place'>
                    <span>地区:</span>
                    <Select
                        allowClear={true}
                        value={province}
                        style={{
                            width: 150
                        }} onChange={async province => {
                            if(province){
                                const citylist = place.filter(itm => itm.name === province)
                                const cityData = citylist[0].districts
                                const cityOptions = cityData.map(city =>< Option key = {
                                    city.name
                                } > {
                                    city.name
                                }</Option>);
                                const city = cityData[0]?cityData[0].name:undefined
                                await this.setState({
                                    province,
                                    cityOptions,
                                    cityData,
                                    city,
                                })
                                if(city){
                                    this._cityChange()
                                }else{
                                    this.setState({
                                        area:undefined,
                                    })
                                }
                            }else{
                                this.setState({
                                    province,
                                    city:'',
                                    area:'',
                                })
                            }

                        }} placeholder='请选择省份'>
                        {provinceOptions}
                    </Select>
                    <Select
                         value={this.state.city}
                         style={{
                            width: 150,
                            display: (
                                this.state.city
                                ? ''
                                : 'none')
                        }} onChange={city => this._cityChange(city)} placeholder='请选择城市'>
                        {cityOptions}
                    </Select>
                    <Select
                         value={this.state.area} style={{
                            width: 150,
                            display: (
                                this.state.area
                                ? ''
                                : 'none')
                        }} onChange={area => {
                            this.setState({area})
                        }} placeholder='请选择区域'>
                        {areaOption}
                    </Select>
                </dd>
            </dl>,
            <div className='btn' key='btn'>
                <Button type='primary' onClick={async () => {
                        await this.setState({
                            pageNum:1
                        })
                        this.__getList()
                    }}>查询</Button>
                <Button onClick={() => {
                        const {default_search,default_selectTime} = this.state
                        this.setState({
                             city: '',
                             area: '',
                             selectTime: default_selectTime,
                             search: {},
                             province:undefined,
                        })
                    }}>重置</Button>
            </div>
        ]
    }

    _delete(schoolId){
        DB.School.delete({
            schoolId
        }).then(({status})=>{
            message.success(status)
            this.__getList()
        },({errorMsg})=>{
            message.error(errorMsg)
        })
    }

    _list() {
        const {pageNum,count,place,loading} = this.state

        if(!loading&&count===0){
            return <ListEmpty/>
        }

        return [<dl className='jiameng__list' key='list'>
            <dt>
                <ul>
                    <li>加盟校名称</li>
                    <li>地区</li>
                    <li>创建日期</li>
                    <li className='countnum'>账号数</li>
                    <li className='phone'>联系人</li>
                    <li className='phone'>联系方式</li>
                    <li>关联ERP</li>
                    <li className='jiameng__list__operate'>操作</li>
                </ul>
            </dt>
            <dd>
                {
                    this.state.list.map((itm,index) =><ul key = {index}>
                        <li><Link title={itm.name} to={`detail/${itm._id}`}>{itm.name}</Link></li>
						<li>
							{
								itm.area.map((it,index)=>{
									if(index){
										return '/'+it
									}else{
										return it
									}
								})
							}
						</li>
	                    <li>{moment(itm.createTime).format("YYYY/MM/DD HH:mm:ss")}</li>
	                    <li className='countnum'>{itm.accountnum}</li>
                        <li className='phone'><span>{itm.contacts}</span></li>
	                    <li className='phone'>{itm.phone}</li>
                        <li>{itm.org_suffix}</li>
                        <li className='jiameng__list__operate'>
                            <span
                                 onClick={async ()=>{
                                     const [province_modal,city_modal,area_modal] = itm.area
                                     const citylist = place.filter(itm => itm.name === province_modal)
                                     const cityData_modal = citylist[0].districts
                                     await this.setState({
                                            openModal:true,
                                            operate:itm,
                                            province_modal,
                                            city_modal,
                                            area_modal,
                                            cityData_modal,
                                    })
                                    this._changeProvince_modal(province_modal,city_modal)
                                    // this._checkmodal()
                            }}>编辑</span>
                                <Divider type="vertical" style={{margin:0}}/>
                                <Popconfirm title="确认删除?" onConfirm = {this._delete.bind(this,itm._id)}
                                     okText="删除" cancelText="取消"
                                    >
                                        <span>删除</span>
                                </Popconfirm>
                        </li>
	                </ul>)
                }
            </dd>
        </dl>,
            <Pagination
                showQuickJumper
                current={pageNum}
                total={count}
                onChange={async pageNum=>{
                    await this.setState({
                        pageNum
                    })
                    this.__getList()
                }}
                key='page'/>
        ]
    }

	_operateSchool(){
		const {operate,province_modal,city_modal,area_modal} = this.state

		const area = []
        province_modal && (area.push(province_modal))
        city_modal &&(area.push(city_modal))

		area_modal&&(area.push(area_modal))

		operate.area = area
        this.setState({
            loading:true,
        })

		DB.School.operate(operate).then(data=>{
			message.success('操作成功')
			this.setState({
				openModal:false,
			})
			this.__getList()
		},({errorMsg})=>{
			message.error(errorMsg)
            this.setState({
                loading:false,
            })
		})
	}

    async _changeProvince_modal(province_modal,___city){
        const {place,city_modal} = this.state

        const citylist = place.filter(itm => itm.name === province_modal)
        const cityData_modal = citylist[0].districts ?  citylist[0].districts :undefined
        let cityOptions_modal;
        if(cityData_modal){
            cityOptions_modal = cityData_modal.map(city =><Option key ={city.name}> {city.name}</Option>)
        }else{
            cityOptions_modal = undefined
        }
        await this.setState({
            province_modal,
            cityOptions_modal,
            cityData_modal,
            city_modal: city_modal|| (cityData_modal[0] && cityData_modal[0].name)
         })

        this._cityChange_modal(___city)
    }

    _checkmodal(){
        const {operate,error,province_modal} = this.state
        const {
            name,
            intro,
            contacts,
            address,
            phone,
            weixin,
            remark,
            org_suffix,
            school_master_phone,
        } = operate

        const reg = new RegExp(
    		/^(0|86|17951)?(13[0-9]|15[012356789]|17[0-9]|18[0-9]|14[57]|166)[0-9]{8}$/,
    	)

        let description;
        if(!name){
            description = '请填写加盟校名称'
        }else if(!intro){
            description = '请填写简介'
        }else if(!province_modal){
            description = '请先选择地区'
        }else if(!contacts){
            description = '请填写联系人'
        }else if(!address){
            description = '请填写详细地址'
        }else if(!phone){
            description = '请填写联系方式'
        }else if(!reg.test(phone)){
            description = '手机号码格式不正确'
        }else if(!weixin){
            description = '请填写微信'
        }else if(!remark){
            description = '请填写备注'
        }else if((org_suffix&&!school_master_phone)||(!org_suffix&&school_master_phone)){
            description = '请完整填写校长手机号和机构后缀'
        }else if(school_master_phone&&!reg.test(school_master_phone)){
            description = '校长手机号格式不正确'
        }

        if(description){
             message.destroy()
             message.error(description)
        }else{
            this._operateSchool()
        }

    }

    render() {
        const {
            search,
            provinceOptions,
            place,
            cityOptions,
            cityData,
            areaOption,
            selectPlace,
            province,
            selectTime,
			areaOption_modal,
			cityOptions_modal,
			operate,
			openModal,
            province_modal,
            loading,
            error,
        } = this.state

        return (
        <div>
            <section className='jiameng'>
                {this._search()}
				<Button type="primary" icon="plus"
					onClick={async ()=>{
						await this.setState({
							openModal:true,
                            operate:{},
                            province_modal:undefined,
                            city_modal:undefined,
                            area_modal:undefined,
						})
                        // this._checkmodal()
					}}
				>新建</Button>
                <Spin spinning= {loading}>
                    {this._list()}
                </Spin>
            </section>
            <Modal title={(operate._id?"编辑":"新建")+'加盟校'}
				visible={openModal}
				maskClosable={false}
				width={600}
                // afterClose={()=>{
                //     if(error){
                //         message.destroy()
                //     }
                //
                //     this.setState({
                //         error:''
                //     })
                // }}
                okText ='确定'
                cancelText ='取消'
                onOk={this._checkmodal.bind(this)}
                confirmLoading={loading}
                // footer={[
                //     <Button type='danger' key='cancel' onClick={()=>{
    			// 		this.setState({
    			// 			openModal:false,
    			// 		})
    			// 	}}>取消</Button>,
                //     <Button
                //         type='primary'
                //         loading={loading}
                //         key='ok'
                //         onClick={this._operateSchool.bind(this)}
                //         disabled={error}>确定</Button>
                // ]}
                onCancel={()=>{
					this.setState({
						openModal:false,
					})
				}}
            >
                <section className='jiameng__modal'>
                    <div>
                        <span>加盟校名称:</span>
                        <Input
                            value={operate.name}
                            onChange={({target})=>{
                                this.setState({
                                    operate:{
                                        ...operate,
                                        name:target.value
                                    }
                                })
                            }}
                            placeholder="请输入加盟校名称"/>
                    </div>

                    <div>
                        <span>简介:</span>
                        <Input
                            value={operate.intro}
    						onChange={({target})=>{
    								this.setState({
    									operate:{
    										...operate,
    										intro:target.value
    									}
    								})
    							}}
    					 placeholder="请输入简介"/>
                    </div>

                    <div>
                        <span>选择地区:</span>
                        <Select style={{
                                width: 150
                            }}
                            value={province_modal}
    						placeholder='请选择省份'
    						onChange={province_modal =>{
                                this._changeProvince_modal(province_modal)
                                // this._checkmodal()
                            }}
                            placeholder='请选择省份'>
                            {provinceOptions}
                        </Select>
                        <Select
                            value={this.state.city_modal} style={{
                                width: 150,
                                display: (
                                    this.state.city_modal
                                    ? ''
                                    : 'none')
                            }}
    						onChange={city_modal => this._cityChange_modal(city_modal)} placeholder='请选择城市'>
                            {cityOptions_modal}
                        </Select>
                        <Select value={this.state.area_modal} style={{
                                width: 150,
                                display: (
                                    this.state.area_modal
                                    ? ''
                                    : 'none')
                            }} onChange={area_modal => {
                                this.setState({area_modal})
                            }} placeholder='请选择区域'>
                            {areaOption_modal}
                        </Select>
                    </div>

                    <div>
                        <span>联系人:</span>
                        <Input
                            value={operate.contacts}
                            placeholder="请输入联系人名称"
    						onChange={({target})=>{
    							this.setState({
    								operate:{
    									...operate,
    									contacts:target.value
    								}
    							})
    						}}
    					/>
                    </div>
                    <div>
                        <span>详细地址:</span>
                        <Input
                            value={operate.address}
                            placeholder="请输入详细地址"
    						onChange={({target})=>{
    							this.setState({
    								operate:{
    									...operate,
    									address:target.value
    								}
    							})
    						}}
    					/>
                    </div>
                    <div>
                        <span>联系方式:</span>
                        <Input
    						maxLength={11}
                            value={operate.phone}
    						placeholder="联系人手机号码"
    						onChange={({target})=>{
                                let phone = target.value

                                if(phone){
                                    phone = phone.replace(/\D/g,'')
                                }

    							this.setState({
    								operate:{
    									...operate,
    									phone,
    								}
    							})
    						}}
    					/>
                    </div>


                    <div>
                        <span>微信:</span>
                        <Input
                            value={operate.weixin}
                            placeholder="请输入微信账号"
    						onChange={({target})=>{
    							this.setState({
    								operate:{
    									...operate,
    									weixin:target.value
    								}
    							})
    						}}
    					/>
                    </div>

                    <div>
                        <span>备注:</span>
                        <Input
                            value={operate.remark}
                            placeholder="可以添加备注"
    						onChange={({target})=>{
    							this.setState({
    								operate:{
    									...operate,
    									remark:target.value
    								}
    							})
    						}}
    					/>
                    </div>
                    <div className="">
                        关联ERP
                    </div>
                    <Divider />
                    <div>
                        <span>机构后缀:</span>
                        <Input
                            value={operate.org_suffix}
                            placeholder="请添加机构后缀"
                            onChange={({target})=>{
                                this.setState({
                                    operate:{
                                        ...operate,
                                        org_suffix:target.value
                                    }
                                })
                            }}
                        />
                    </div>
                    <div>
                        <span>校长手机号:</span>
                        <Input
                            maxLength={11}
                            value={operate.school_master_phone}
                            placeholder="请输入校长手机号"
                            onChange={({target})=>{
                                let phone = target.value

                                if(phone){
                                    phone = phone.replace(/\D/g,'')
                                }

                                this.setState({
                                    operate:{
                                        ...operate,
                                        school_master_phone:phone,
                                    }
                                })
                            }}
                        />
                    </div>
                </section>
            </Modal>
        </div>
        )
    }
}

export default JiaMengList
