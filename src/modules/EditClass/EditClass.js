import React, {Component} from 'react'
import { Button,Menu, Icon,Input,message } from 'antd';
import {withRouter} from 'react-router-dom'
import DB from '@DB'
import UploadModule from '@modules/UploadModule'

class EditClass extends Component {

    constructor(props) {
        super(props)
        this.state = this.props.classDetail
    }

    // componentWillReveiceProps(nextProps){
    //
    // }

    // 保存课次详情
    saveClass = () =>{
        if(this.state.loading) {message.error('正在保存中，请稍候');return}
        const {
            _id = '',
            name = '',
            theme = '',
            video = '',
            courseware = '',
            plan = '',
        } = this.state

        if(!name || !theme || !video || !courseware || !plan) {
            message.error('请填写完整后保存')
            return
        }

        this.setState({loading:true})
        // 如果是新建课次
        if(!_id) {
            DB.CreateCourse.editClass({
                ...this.state
            })
            .then(_id=>{
                message.success('新建课次成功');
                let classDetail = {
                    _id,
                    ...this.state
                }
                this.props.onSaveClass(classDetail,this.props.classIndex)
            })
            // .finally(res=>{
            //     this.setState({loading:false})
            // })
        }else if(this.props.classIndex === 'edit'){
            DB.CreateCourse.editClass({
                ...this.state
            })
            .then(_id=>{
                message.success('修改课次成功');
                let classDetail = {
                    _id,
                    ...this.state
                }
                this.props.onSaveClass(classDetail,this.props.classIndex)
            })
            // .finally(res=>{
            //     this.setState({loading:false})
            // })
        }
    }

    // 将上传文件的url转为antd upload组件认的格式
    handleAnnex = (url) =>{
        if(!url) {
            return [];
        }else{
            return [{
                uid: 1,
                name:__PRO__?url.substr(94):url.substr(99),
                url,
                status: 'done'
            }]
        }
    }

    // 上传成功
    uploadSuccess = (type,file,key) =>{
        const url = prefix+key;
        this.setState({
            [type]:url
        })
    }

    // 删除成功
    uploadRemove = (type,file) =>{
        this.setState({
            [type]:''
        })
    }

    render() {
        const {
            name = '',
            theme = '',
            video = '',
            courseware = '',
            plan = '',
        } = this.state
        return (<div className="">
            {/* 课次名称 */}
            <div className="create-modal-item">
                <div className="create-modal-left">
                    课次名称
                </div>
                <div className="create-modal-right">
                    <Input
                        style={{width:'400px'}}
                        maxLength={30}
                        value={name || ''}
                        onChange={e=>this.setState({name:e.target.value})}
                        placeholder="请输入课次名称" />
                </div>
            </div>

            {/* 课次主题 */}
            <div className="create-modal-item">
                <div className="create-modal-left">
                    课次主题
                </div>
                <div className="create-modal-right">
                    <Input
                        style={{width:'400px'}}
                        maxLength={30}
                        value={theme || ''}
                        onChange={e=>this.setState({theme:e.target.value})}
                        placeholder="请输入课次主题" />
                </div>
            </div>

            {/* 课件 */}
            <div className="create-modal-item">
                <div className="create-modal-left">
                    课件
                </div>
                <div className="create-modal-right create-modal-upload">
                    <UploadModule
                        pinpaiId={this.props.pinpaiId}
                        limit={1}
                        folderName = 'course_accessory'
                        success={this.uploadSuccess.bind(this,'courseware')}
                        remove={this.uploadRemove.bind(this,'courseware')}
                        fileList={this.handleAnnex(courseware)} />
                    {!this.state.courseware && <span style={{marginLeft:20}}> 请上传pdf格式文件</span>}
                </div>
            </div>

            {/* 教案 */}
            <div className="create-modal-item">
                <div className="create-modal-left">
                    教案
                </div>
                <div className="create-modal-right create-modal-upload">
                    <UploadModule
                        pinpaiId={this.props.pinpaiId}
                        limit={1}
                        folderName = 'course_accessory'
                        success={this.uploadSuccess.bind(this,'plan')}
                        remove={this.uploadRemove.bind(this,'plan')}
                        fileList={this.handleAnnex(plan)} />
                    {!this.state.plan && <span style={{marginLeft:20}}> 请上传pdf格式文件</span>}
                </div>
            </div>

            {/* 视频 */}
            <div className="create-modal-item">
                <div className="create-modal-left">
                    视频
                </div>
                <div className="create-modal-right">
                    <UploadModule
                        pinpaiId={this.props.pinpaiId}
                        limit={1}
                        folderName = 'course_accessory'
                        success={this.uploadSuccess.bind(this,'video')}
                        remove={this.uploadRemove.bind(this,'video')}
                        fileList={this.handleAnnex(video)} />
                </div>
            </div>

            <div style={{margin:'20px 0 10px 70px'}}>
                <Button
                    onClick={this.saveClass}
                    type='primary'
                    style={{marginRight:'20px'}}>保存</Button>
                <Button onClick={this.props.onClose}>取消</Button>
            </div>

        </div>)
    }
}

export default EditClass
