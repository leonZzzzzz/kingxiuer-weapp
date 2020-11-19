import * as echarts from '../../components/ec-canvas/echarts';

function generatePieOptions (title) {
  const option = {
    title: {
      text: title,
      x: 'center'
    },
    series: [
      {
        label: {
          normal: {
            fontSize: 10,
            position: 'inner'
          }
        },
        type: 'pie',
        center: ['50%', '50%'],
        radius: [0, '30%'],
        data: []
      }]
  }
  return option;
}

const pieOption = generatePieOptions('使用权重');


function initChart (_pieOption) {
  return function (canvas, width, height) {
    const chart = echarts.init(canvas, null, {
      width: width,
      height: height
    });
    canvas.setChart(chart);
    chart.setOption(_pieOption);
    return chart;
  }
}


Page({
  data: {
    ec: {
      onInit: initChart(pieOption)
    }
  },

  initOptions: function () {
   pieOption.series[0].data = [
      { value: 55, name: '北京' },
      { value: 20, name: '武汉' },
      { value: 10, name: '杭州' },
      { value: 20, name: '广州' },
      { value: 38, name: '上海' }
    ];
  },

  onLoad: function (options) {
    this.initOptions();
  }
})