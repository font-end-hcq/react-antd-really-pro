import React, {Component} from 'react'
import {
    Button,
    Upload,
    notification,
    message
} from 'antd'
import DB from '@DB'

export default class UploadContract extends Component {
    constructor(props){
        super(props)
        this.state = {

        }
    }

    // 上传附件
    uploadAnnex = ({file,fileList}) =>{
        let pinpaiId = this.props.pinpaiId || 'noPinpaiId'

        let UUID = Math.random().toString(36).substr(2,10);

        const fileName = file.name
        const key = `jiameng/course_accessory/${pinpaiId}/${UUID}_${fileName}`;
 
        // 上传文件
        if(file && file.status === 'uploading') {
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

    beforeUpload =  (file) => {
        
        if (file.name.split('.')[1] !== 'txt' && file.name.split('.')[1] !== 'doc' && file.name.split('.')[1] !== 'docx') {
            message.error('只能上传.txt或者.doc文件或者.docx文件格式！');
            return false
        }

        const isLtMax = file.size < 5242880;
        if (!isLtMax) {
            message.error(`文件大小超过5M限制`);
        }
        return isLtMax;
    }

    render() {
        const fileList = this.props.fileList || [];
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
                onPreview={this.props.onPreview?this.handlePreview:''}
                fileList={fileList}
                listType = {this.props.listType || null}
                onChange={this.uploadAnnex}
                beforeUpload = {this.beforeUpload}
                >
                {
                    fileList.length < (this.props.limit || -1) ? <Button type="primary">
                    上传附件
                </Button> : null}

            </Upload>
        )
    }
}
