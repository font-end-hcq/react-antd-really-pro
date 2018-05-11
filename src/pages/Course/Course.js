import React, {Component} from 'react'
import {HashRouter, Route, Switch, Link,Redirect} from 'react-router-dom'
import { Layout } from 'antd';
const { Content, Sider } = Layout;
import CourseNav from '@comp/CourseNav'
import CourseList from '@pages/CourseList'
import ClassList from '@pages/ClassList'
import Label from '@pages/CourseLabel'
import Category from '@pages/Category'
import CreateCourse from '@pages/CreateCourse'

import DB from '@DB'



class Course extends Component {
	constructor(props) {
        super(props);
		this.state = {

		}
    }
    componentDidMount() {

    }

	render() {
		const { match } = this.props;
		return (
		<Layout>
			<Sider width={200} style={{ background: '#fff'}}>
				<CourseNav />
			</Sider>
			<Content style={{ background:'#fff',padding: 24, minHeight: 800 }}>
				{/* 内容区域 */}
				<Route path={`${match.url}`} exact render={()=><Redirect to={`${match.url}/list`}></Redirect>}></Route>
				{/* 课程列表 */}
				<Route exact path={`${match.url}/list`} component={CourseList} />
				{/* 课次列表 */}
				<Route exact path={`${match.url}/class_list/:id`} component={ClassList} />
				{/* 课程标签 */}
				<Route exact path={`${match.url}/label`} component={Label} />
				{/* 科目 */}
				<Route exact path={`${match.url}/category`} component={Category} />
				{/* 新建课程 */}
				<Route exact path={`${match.url}/create/:id`} component={CreateCourse} />
			</Content>
		</Layout>
		)
	}
}

export default Course
