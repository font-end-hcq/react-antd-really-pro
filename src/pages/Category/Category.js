import React,{PureComponent} from 'react'
import DB from '@DB'
import './Category.scss'
import {Button,Icon,Tag,Input,message,Alert,Spin,Popconfirm} from 'antd'

export default class Category extends PureComponent{
    state = {
        categoryList:[],
        // 是否是输入状态
        inputTag: false,
        inputValue:'',
        loading:true,
    }
    constructor(props){
        super(props)
    }

    componentDidMount(){
        this.getList()
    }

    getList(){
        this.setState({
            loading:true,
        })
        DB.Category.getCategoryList().then(data=>{
            this.setState({
                categoryList:data.list || [],
                loading:false,
            })
        })
    }

    showInput = () => {
	  	this.setState({ inputTag: true }, () => this.refs.addinput.focus());
	}

	removeCategory = (_id) =>{
		DB.Category.removeCategory({
			_id,
		})
		.then((data)=>{
            this.getList()
		},(res)=>{
			message.error(res.errorMsg);
		})
	}

	addCategory = () =>{
		const categoryName = this.state.inputValue;
		if(categoryName === '') {
			this.setState({
				inputTag: false,
      			inputValue: '',
			})
			return
		}
		DB.Category.addCategory({
			name:categoryName,
		})
		.then((data)=>{
			this.setState({
				inputTag: false,
      			inputValue: '',
			})
            this.getList()
		},(res)=>{
			message.error(res.errorMsg);
		})
	}

    render(){
        const {categoryList} = this.state
        return (<div className="category-wrap">
            <div className="title">
                科目设置
            </div>
            <div className="list">
                {
					categoryList.map((item,index)=>{
						return (
							<Popconfirm
								key={index}
								title="确认删除本科目吗？"
								onConfirm={this.removeCategory.bind(null,item._id)}
								// onCancel={cancel}
								okText="删除"
								cancelText="取消">
									<Tag
										key={index}
										closable
										color="#1890ff"
										onClose={(e)=>{
											e.preventDefault()
										}}
										>
										{item.name}
									</Tag>
							</Popconfirm>
							)
					})
				}

                {
					this.state.inputTag && <Input
						ref='addinput'
			            type="text"
                        maxLength={8}
			            size="default"
			            style={{ width: 78 }}
			            onChange={(e)=>this.setState({ inputValue:e.target.value})}
			            onBlur={this.addCategory}
			            onPressEnter={this.addCategory}
			        />
			  	}
				{
					!this.state.inputTag && <Button
					size="default"
					type="dashed"
					onClick={this.showInput}>+ 新科目</Button>
				}
            </div>
        </div>)
    }
}
