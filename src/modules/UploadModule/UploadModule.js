import React, {Component} from 'react'
import {
    Icon,
    Button,
    Upload,
    notification,
} from 'antd'
import DB from '@DB'

export default class UploadModule extends Component {
    constructor(props){
        super(props)
    }

    // 上传附件
    uploadAnnex = ({file,fileList}) =>{
        let pinpaiId = this.props.pinpaiId || 'noPinpaiId'
        let folderName = this.props.folderName || 'noFolderName'
        let UUID = Math.random().toString(36).substr(2,10);

        const fileName = file.name;
        const key = `jiameng/${folderName}/${pinpaiId}/${UUID}_${fileName}`;

        // 上传文件
        if(file && file.status === 'uploading') {
            this.props.changeState&&this.props.changeState('uploading',true)
            this.ossAnnex(file.originFileObj,key);
        }

        // 删除文件
        if(file && file.status === 'removed') {
            this.props.remove(file)
            // this.props.removeVipAnnex(this.props.data.uuid,file.url)
        }
    }

    ossAnnex(file, key) {
        const t = this;

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
                    if(t.props.process) {
                        t.props.process(p);
                    }
                }
            }).then(res=>{
                // 上传成功
                if(res.res.status === 200) {
                    t.props.success(file,key)
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

    handlePreview = (file) =>{
        if(this.props.onPreview) this.props.onPreview(file)
    }
    beforeUpload = (file) => {
        console.log(file.type)
        const isCard = this.props.type && this.props.type === 'card' || false;
        if(!isCard) {
            return true;
        }
        else {
            if(!(file.type === 'image/jpeg' || file.type === 'image/png')){
                notification.error({
                    message: '警告',
                    description: '仅支持图片格式为jpeg、jpg、png',
                });
                return false
            }
        }
    }

    render() {
        const fileList = this.props.fileList || [];
        const onStart = this.props.onStart || false;
        const isCard = this.props.type && this.props.type === 'card' || false;
        // 上传按钮,默认为button,当类型是card时，则为方块样式
        let uploadButton = ( <Button> <Icon type="upload" /> 点击上传 </Button>)
        if(isCard){
            uploadButton = (
                <div>
                    <Icon type={onStart ? 'loading' : 'plus'} />
                    <div className="ant-upload-text">上传</div>
                </div>
            );
        }
        return (
            <Upload
                // 这个设置了才会不走默认的发送
                customRequest={data =>{
                    notification.success({
                        message: '提示',
                        description: '开始上传，请耐心等待'
                    });
                //   this.setState({ossFile:data.file})
                }}
                disabled={onStart}
                onPreview={this.props.onPreview?this.handlePreview:''}
                fileList={fileList}
                listType = {this.props.listType || null}
                beforeUpload={this.beforeUpload}
                onChange={this.uploadAnnex}>
                {
                    fileList.length < (this.props.limit || -1) ? uploadButton: null
                }

            </Upload>
        )
    }
}
