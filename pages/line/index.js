import * as echarts from '../../components/ec-canvas/echarts';

const app = getApp();

function initChart(canvas, width, height, dpr) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr // new
  });
  canvas.setChart(chart);
  var schema = [
    {name: 'Income', index: 0, text: '人均收入', unit: '美元'},
    {name: 'LifeExpectancy', index: 1, text: '人均寿命', unit: '岁'},
    {name: 'Population', index: 2, text: '总人口', unit: ''},
    {name: 'Country', index: 3, text: '国家', unit: ''}
];
  var option = {
    title: {
      text: '测试下面legend的红色区域不应被裁剪',
      left: 'center'
    },
    color: ["#FF8C8C", "#FF8C8C", "#FF8C8C"],
    legend: {
      data: ['A', 'B', 'C'],
      top: 50,
      left: 'center',
      color:'#FF8C8C',
      backgroundColor: '#FF8C8C',
      z: 100
    },
    grid: {
      containLabel: true
    },
    tooltip: {
      show: true,
      trigger: 'axis'
    },
   
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      // show: false
      axisLine:{
        lineStyle:{
            color:'#FF8C8C',
        }
    } 

    },
    yAxis: {
      min:36,
      max:39,
      splitNumber:30,
      x: 'center',
      type: 'value',
      axisLine:{
        lineStyle:{
            color:'#FCC8C8',
        }
      }, 

      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed'
        }
      },
      
    },
    series: [{
      // name: 'A',
      type: 'line',
      // smooth: true,
      data: [36.2, 36.3, 37, 36.5, 36.7, 36, 36.8]
    }]
  };

  chart.setOption(option);
  return chart;
}

Page({
  onShareAppMessage: function (res) {
    return {
      title: 'ECharts 可以在微信小程序中使用啦！',
      path: '/pages/index/index',
      success: function () { },
      fail: function () { }
    }
  },
  data: {
    ec: {
      onInit: initChart
    }
  },
   

  onReady() {
  }
});
