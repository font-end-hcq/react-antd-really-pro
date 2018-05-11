import React, { Component } from 'react'
import { Card, Icon } from 'antd'

class DataCard extends Component {
	constructor(props) {
		super(props)
		this.state = {}
	}
	componentWillMount() {}


	_setIcon = (value) => {
		if(value === '-' || value === ''){
		 return;
		}
		if (value === '0.00'){
		 return <Icon type="caret-down" style={{color:'red',fontSize: 1,visibility:'hidden'}}/>
		}
		if(value > 0){
		 return <Icon type="caret-up" style={{color:'green',fontSize: 1}}/>
		}
		return <Icon type="caret-down" style={{color:'red',fontSize: 1}} />
	   }
	  
	_setNum = (value) => {
	   if(value === '-' || value === ''){
	    return '-';
	    }
		return `${Math.abs(value)}%`
	   }


	//若是大于9999，则以万为单位，四舍五入保留2位小数;否则若为float类型,小数点第二位为0保留一位，不为0保留2位小数
	_keepTwoDecimal = num => {
		if (isNaN(num)) {
			return false
		}
		if (Math.abs(num) > 9999) {
			let result = (num / 10000).toFixed(2)
			return result + '万'
		} else {
			return Math.round(parseFloat(num) * 100) / 100
		}
	}

	render() {
		let { title, num, YoY, MoM, loading } = this.props
		return (
			<div className="cardData">
				<Card loading={loading} style={{ width: 277, height: 195 }}>
					<p className="cardTitle gray">{title}</p>
					<h1 className="cardNum">
						{isNaN(num) ? 0 : this._keepTwoDecimal(num)}
					</h1>
					{this.props.YoY === '' ? (
						''
					) : (
						<p className="cardRatio">
							<span className="gray">周同比</span>
							{this._setIcon(YoY)}
							<span>{this._setNum(YoY)}</span>
						</p>
					)}
					{this.props.MoM === '' ? (
						''
					) : (
						<p className="cardRatio">
							<span className="gray">日环比</span>
							{this._setIcon(MoM)}
							<span>{this._setNum(MoM)}</span>
						</p>
					)}
				</Card>
			</div>
		)
	}
}

export default DataCard
