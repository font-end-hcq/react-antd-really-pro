import React, { Component } from 'react'
import moment from 'moment'

import {
	Breadcrumb,
	Tag,
	Modal,
	Input,
	Select,
	Button,
	message,
	Popconfirm,
	Spin,
	Alert,
	Pagination,
} from 'antd'

import DB from '@DB'
const { Option } = Select

import ListEmpty from '@comp/ListEmpty'

export default class JiaMengDetail extends Component {
	constructor(props) {
		super()
		this.state = {
			schoolname: '',
			message: {},
			operate: {},
			count: 0,
			list: [],
			mobilecheck: 0, //0才新建   1通过   2编辑

			pageNum: 1,
			_id: props.match.params.id,
			loading: true,
			list_error: false,
		}
	}

	componentDidMount() {
		const { _id } = this.state
		DB.School.detail({
			_id,
		}).then(({ name: schoolname, ...message }) => {
			this.setState({
				schoolname,
				message,
			})
		})
		this.__getList()
	}

	__getList() {
		const { pageNum, _id: schoolId } = this.state

		this.setState({
			loading: true,
		})

		DB.Manager.list({
			schoolId,
			pageNum,
			pageSize: 10,
		})
			.then(
				({ list, total: count }) => {
					this.setState({
						list,
						count,
					})
				},
				({ errorMsg }) => {
					message.error('获取用户列表失败')
					this.state.list_error = true
				},
			)
			.then(() => {
				this.setState({
					loading: false,
				})
			})
	}

	async _operate(edit) {
		const { operate, _id } = this.state
		const { name, phone, role, onJob, status } = operate
		let err
		if (!name) {
			err = '请输入姓名'
		} else if (!role) {
			err = '请输入职位'
		}

		if (err) {
			message.error(err)
			return
		}

		const msg = {
			name,
			phone,
			role,
			onJob: !!onJob,
			status: !!status,
			schoolId: _id,
		}

		if (edit) {
			await DB.Manager.update(msg).then(
				data => {
					message.success('操作成功')
				},
				({ errorMsg }) => {
					message.success(errorMsg)
					this.__getList()
				},
			)
		} else {
			await DB.Manager.add(msg).then(
				data => {
					message.success('操作成功')
				},
				({ errorMsg }) => {
					message.success(errorMsg)
				},
			)
		}

		this.setState({
			operate: {},
		})
		this.__getList()
	}

	_delete(_id) {
		DB.Manager.delete({
			_id,
			schoolId: this.state._id,
		}).then(({ status }) => {
			message.success(status)
			this.__getList()
		})
	}

	_list() {
		const { list, loading, count, pageNum } = this.state

		if (!loading && count === 0) {
			// return <Alert style={{marginTop:30}} message="暂无数据" type="info" showIcon />
			return <ListEmpty />
		}

		return [
			<dl className="jiameng__detail__list" key="list">
				<dt>
					<ul>
						<li>姓名</li>
						<li>手机号</li>
						<li className="flex_1">角色</li>
						<li>修改时间</li>
						<li className="flex_1">在职/离职</li>
						<li className="flex_1">账号状态</li>
						<li className="flex_1 jiameng__detail__list__operate">
							操作
						</li>
					</ul>
				</dt>
				{list.map(itm => (
					<dd key={itm._id}>
						<ul>
							<li>{itm.name}</li>
							<li>{itm.phone}</li>
							<li className="flex_1">{itm.role}</li>
							<li>
								{moment(itm.updateTime).format(
									'YYYY/MM/DD HH:mm:ss',
								)}
							</li>
							<li className="flex_1">
								{itm.onJob ? '在职' : '离职'}
							</li>
							<li className="flex_1">
								{itm.status ? '启用' : '停用'}
							</li>
							<li className="flex_1 jiameng__detail__list__operate">
								<span
									onClick={() => {
										this.setState({
											operate: {
												open: true,
												name: itm.name,
												phone: itm.phone,
												role: itm.role,
												status: itm.status,
												_status: itm.status ? 1 : 0,
												onJob: itm.onJob,
												_onJob: itm.onJob ? 1 : 0,
											},
											mobilecheck: 2,
										})
									}}
								>
									编辑
								</span>
								<Popconfirm
									title="确认删除?"
									onConfirm={this._delete.bind(this, itm._id)}
									okText="删除"
									cancelText="取消"
								>
									<span>删除</span>
								</Popconfirm>
							</li>
						</ul>
					</dd>
				))}
			</dl>,
			<Pagination
				showQuickJumper
				current={pageNum}
				total={count}
				onChange={async pageNum => {
					await this.setState({
						pageNum,
					})
					this.__getList()
				}}
				key="page"
			/>,
		]
	}

	render() {
		const {
			schoolname,
			operate,
			list,
			mobilecheck,
			loading,
			list_error,
		} = this.state
		const {
			contacts,
			phone,
			area = [],
			address,
			intro,
			weixin,
			remark,
			school_master_phone,
			org_suffix,
		} = this.state.message

		area.push('')

		return (
			<div>
				<section className="jiameng__detail">
					<Breadcrumb>
						<Breadcrumb.Item>加盟校</Breadcrumb.Item>
						<Breadcrumb.Item>{schoolname}</Breadcrumb.Item>
					</Breadcrumb>
					<span className="jiameng__detail__base">基本信息</span>
					<dl>
						<dd>
							<span>名称:</span>
							<label title={schoolname}>{schoolname}</label>
						</dd>
						<dd>
							<span>联系人:</span>
							<label title={contacts}>{contacts}</label>
						</dd>
						<dd>
							<span>联系方式:</span>
							<label title={phone}>{phone}</label>
						</dd>
						<dd>
							<span>简介:</span>
							<label title={intro}>{intro}</label>
						</dd>
						<dd>
							<span>微信:</span>
							<label title={weixin}>{weixin}</label>
						</dd>
						<dd>
							<span>备注:</span>
							<label title={remark}>{remark || '无'}</label>
						</dd>
						<dd>
							<span>ERP机构后缀:</span>
							<label title={org_suffix}>
								{org_suffix || '暂无'}
							</label>
						</dd>
						<dd>
							<span>ERP校长手机号:</span>
							<label title={school_master_phone}>
								{school_master_phone || '暂无'}
							</label>
						</dd>
						<dd
							style={{
								display: phone ? '' : 'none',
							}}
						>
							<span>常用地址:</span>
							<label
								title={`${area[0]}${area[1]}${
									area[2]
								}${address}`}
							>{`${area[0]}${area[1]}${
								area[2]
							}${address}`}</label>
						</dd>
					</dl>

					<Button
						type="primary"
						icon="plus"
						disabled={list_error}
						onClick={() => {
							this.setState({
								operate: {
									open: true,
									onJob: true,
									_onJob: 1,
									status: true,
									_status: 1,
								},
								mobilecheck: 0,
							})
						}}
					>
						新建
					</Button>

					<Spin spinning={loading}>{this._list()}</Spin>
				</section>

				<Modal
					title={mobilecheck === 2 ? '编辑角色' : '新增角色'}
					okText="确定"
					cancelText="取消"
					maskClosable={false}
					visible={operate.open}
					onOk={() => {
						if (!mobilecheck) {
							const reg = new RegExp(
								/^(0|86|17951)?(13[0-9]|15[012356789]|17[0-9]|18[0-9]|14[57]|166)[0-9]{8}$/,
							)
							if (!reg.test(operate.phone)) {
								message.error('手机号码格式不正确')
								return
							}
							//验证手机
							DB.Manager.checkMobile({
								schoolId: this.props.match.params.id,
								phone: operate.phone,
							}).then(
								() => {
									this.setState({
										mobilecheck: 1,
									})
								},
								({ errorMsg }) => {
									message.error(errorMsg)
								},
							)
						} else if (mobilecheck === 1) {
							//新建
							this._operate(false)
						} else {
							//编辑
							this._operate(true)
						}
					}}
					className="jiameng__detail__modal"
					onCancel={() => {
						this.setState({
							operate: {},
						})
					}}
				>
					<Input
						style={{
							display: mobilecheck === 1 ? 'none' : '',
						}}
						disabled={mobilecheck === 2}
						addonBefore="手机号"
						maxLength={11}
						value={operate.phone}
						placeholder="请输入手机号码"
						onChange={({ target }) => {
							this.setState({
								operate: {
									...operate,
									phone: target.value,
								},
							})
						}}
					/>
					<div
						style={{
							display: mobilecheck ? '' : 'none',
						}}
					>
						<Input
							addonBefore="姓名"
							placeholder="请输入姓名"
							value={operate.name}
							onChange={({ target }) => {
								this.setState({
									operate: {
										...operate,
										name: target.value,
									},
								})
							}}
						/>
						<Input
							addonBefore="职位"
							placeholder="请输入职位"
							value={operate.role}
							onChange={({ target }) => {
								this.setState({
									operate: {
										...operate,
										role: target.value,
									},
								})
							}}
						/>
						<Tag>在职状态</Tag>
						{operate.open ? (
							<Select
								value={operate._onJob}
								onChange={onJob => {
									this.setState({
										operate: {
											...operate,
											onJob,
											_onJob: onJob ? 1 : 0,
										},
									})
								}}
								style={{ width: 120 }}
							>
								<Option value={1}>在职</Option>
								<Option value={0}>离职</Option>
							</Select>
						) : (
							''
						)}

						<br />
						<Tag>账号状态</Tag>
						<Select
							value={operate._status}
							onChange={status => {
								this.setState({
									operate: {
										...operate,
										status,
										_status: status ? 1 : 0,
									},
								})
							}}
							style={{ width: 120 }}
						>
							<Option value={1}>启用</Option>
							<Option value={0}>停用</Option>
						</Select>
					</div>
				</Modal>
			</div>
		)
	}
}
