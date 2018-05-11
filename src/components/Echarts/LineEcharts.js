import React, { Component } from 'react';
import PropTypes from 'prop-types';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/legend';
import moment from 'moment';
// import 'moment/locale/zh-cn';

class LineChart extends Component {

  static defaultProps = {
    data: [],
  };

  static propTypes = {

  };

  constructor(props) {
      super(props);
      this.state = {
          data: [],
          name: '',
          dataname: '',
          timeArr:[],
      }
  }

  componentDidMount() {
      this.handlData(this.props.data)
  }

  componentWillReceiveProps(nextProps){
      this.handlData(nextProps.data)
  }

  drawChart = () => {
    let _this = this;
    let myChart = echarts.init(this.CustomizedPie);
    let option = {
      tooltip: {
        trigger: 'axis',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true,
      },
      xAxis: {
        axisLabel: {
          textStyle: {
            color: '#999',
          },
        },
        type: 'category',
        boundaryGap: true,
        axisLine: {
          show: true,
          lineStyle: {
            color: '#ccc',
            width:1,
          },
        },
        axisTick: {
          show: true,
          lineStyle: {
            color: '#ccc',
            width:1,
          },
        },
        data: _this.state.timeArr,
      },
      yAxis: {
        axisLabel: {
          formatter: '{value}',
          textStyle: {
            color: '#999',
          },
        },
        type: 'value',
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
          },
        },
      },
      series: [
        {
          name: _this.state.name,
          type: 'line',
          symbolSize : 10,
          itemStyle: {
            normal: {
              lineStyle:{
                width: 5,
                color:'#3BA0FF',
              },
            }
          },
          data: _this.state.data,
        }],
    };
    myChart.setOption(option,555);
  };


  handlData =(dt)=>{
    let temTime = []
    let temData = []

    if(!dt) return
    dt.map((item,index)=>{
        temTime.push(moment(item.createTime).format('MM-DD'))
        temData.push(item[this.props.dataname])
    })
    this.setState({
        timeArr:temTime.reverse(),
        data:temData.reverse(),
        name:this.props.name,
    },()=>{
        this.drawChart()
    })

}

  render() {
    return (

      <div id="CustomizedPie" ref={CustomizedPie=>this.CustomizedPie=CustomizedPie}></div>
      //dom元素存储在这个class的属性变量上，之后可以随便其他地方用
    );
  }
}

export default LineChart;
