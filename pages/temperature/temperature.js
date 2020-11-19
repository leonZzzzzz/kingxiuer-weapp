import http from '../../utils/http.js'
import { getMonthday, getMonthFirstDay, getDateArray, newDate, dateInterval, isNeedZero } from '../../utils/util.js'
import { menses, ovluate, ovluateDay, mlDay, theDayBefore,getNowDays,format,oldovluate ,oldmlDay} from '../../utils/menses.js'
import wxCharts from '../../utils/wxcharts.js';
import * as echarts from '../../components/ec-canvas/echarts';
import uuid from '../../utils/uuid.js'
import YCFam from 'yc-fam-js'
let update = null
const app = getApp();
let chart;
Page({
  data: {
    ec: {
      // onInit: initChart
      lazyLoad: true
    },
    // 选中的日期
    selected: '',
    //紧张操作
    lock: false,
    // 年
    year: 0,
    // 月
    month: 0,
    // 当前月有多少天
    day: 0,
    // 一号与周日间隔几天
    firstInterval: 0,
    lastInterval: 0,
    //今日
    toDay: 0,
    //当前月
    thisMonth: 0,
    //配置信息
    config: {},
    makeLoveList: [],
    mensesList: [],
    leucorrheaList:[],
    ovluateList: [],
    ovluateDay: [],
    mlDay: [],
    isToDay: true,
    ymonthDay:[],

    // 画布的高度
    domHeight: Math.floor(wx.getSystemInfoSync().windowHeight / 1.8),
    // 滑动元素
    current: 0,
    // 日期
    date: [],
    nyr:[],
    // 一天温度记录条数
    number: [1, 2, 3, 4, 5, 6],
    data: [],
    dataList: '',
    ymdate:[],
    // 是否有数据
    isData: false,
    // 表格数据
    tableData: {},
    // 表格宽度
    tableWidth: 0,
    // 数据个数
    dataNum: 0,
    // 滚动条位置
    scrollLeft: 0,
    // 显示当前元素的年份
    nowIndex: 0,
    animationData:{},
    isbox:false,//关注默认显
    ec_charts:'',
    tooltip:{},
    tooptipLeft: '',
    tooptipTop:'',
    tooltipContainerWidth:'',
    monthDay:[],
    degree:[],
    ismodel:false,
    diffdate:[],
    weater:'/api/v1/config/recommend_buy_temperature',
    prethreemonth:'',
    nowtomonth:'',
    sny:'',
    eny:'',
    middleData:[],
    hideright:false,
    dayList:[],
    isShow:true
  },

  receiveSrc(e){
    this.setData({echartsSrc:e.detail})
  },
  onChangeData(e){
    var date = e.detail.value
    date=date.split('-')
    this.setData({year:date[0],month:date[1]})
  },
  checkcart(e){
    console.log(e.detail)
    this.setData({isShow:e.detail})
  },

  //获取两日期之间日期列表函数
  getMiddle(stime,etime){
    var middleData = this.data.middleData;
    var i=0;
    while(stime<=etime){
      var stime_ts = new Date(stime).getTime();
      var next_date = stime_ts + (24*60*60*1000);
      //拼接年月日，这里的月份会返回（0-11），所以要+1
      var next_dates_y = new Date(next_date).getFullYear()+'-';
      var next_dates_m = (new Date(next_date).getMonth()+1 < 10)?'0'+(new Date(next_date).getMonth()+1)+'-':(new Date(next_date).getMonth()+1)+'-';
      var next_dates_d = (new Date(next_date).getDate() < 10)?'0'+new Date(next_date).getDate():new Date(next_date).getDate();
      stime = next_dates_y+next_dates_m+next_dates_d;
      i++;
      var obj = {time :stime,degree:''}
      middleData.push(obj)
    }
    return middleData
  },
  
  //查询上一月
  prevMonth() {
    this.setData({ymdate:[],middleData:[]})
    // 是否等于当前月份
    if (this.data.month == 1) {
      this.setData({
        year: this.data.year - 1,
        month: 12,
        selected: 0
      })
    } else {
      this.setData({
        month: this.data.month - 1,
        selected: 0
      })
    }
    let thisMonth = `${this.data.year}-${isNeedZero(this.data.month)}`
    this.setData({
      isToDay: thisMonth == this.data.thisMonth
    })
    let prethreemonth = `${this.data.year}-${this.data.month<=9?'0'+this.data.month:this.data.month}-01`
    let nowtomonth = `${this.data.year}-${this.data.month<=9?'0'+this.data.month:this.data.month}-${getMonthday(this.data.year, this.data.month)}`
    
    var ymdate=this.getMiddle(prethreemonth,nowtomonth)
    ymdate.unshift({time :prethreemonth,degree:''})
    ymdate.pop()
    if(this.data.month<Number(this.data.toDay.substr(5,2))){
      this.setData({hideright:true})
    }else{
      this.setData({hideright:false})
    }
    this.setData({prethreemonth,nowtomonth,ymdate})
    this.apiGetRecordGraph(prethreemonth,nowtomonth)

    //以当前月份为基准。如果日期大于当前月，是预测功能的。小于当前月份输入历史记录，查询后台。
    // if (this.data.thisMonth < thisMonth) {
    //   let menstrual = this.searchMenstrual(this.data.config.recentMenstrual, this.data.config.shortPeriod, this.data.year, this.data.month)
    //   this.getMenses(menstrual, this.data.config.intervalDay, this.data.config.shortPeriod, this.data.config.longPeriod)
    // } else if (this.data.thisMonth > thisMonth) {
    //   this.apiGetMenstrual()
    // } else if (this.data.thisMonth = thisMonth) {
    //   this.apiGetMenstrual(true)
    // }
  },
  //查询下一月
  nextMonth() {
    this.setData({ymdate:[],middleData:[]})
    if (this.data.month == 12) {
      this.setData({
        year: this.data.year + 1,
        month: 1,
        selected: 0
      })
    } else {
      this.setData({
        month: this.data.month + 1,
        selected: 0
      })
    }
    let thisMonth = `${this.data.year}-${isNeedZero(this.data.month)}`
    this.setData({
      isToDay: thisMonth == this.data.thisMonth
    })
    let prethreemonth = `${this.data.year}-${this.data.month<=9?'0'+this.data.month:this.data.month}-01`
    let nowtomonth = `${this.data.year}-${this.data.month<=9?'0'+this.data.month:this.data.month}-${getMonthday(this.data.year, this.data.month)}`
    
    var ymdate=this.getMiddle(prethreemonth,nowtomonth)
    ymdate.unshift({time :prethreemonth,degree:''})
    ymdate.pop()
    if(this.data.month<Number(this.data.toDay.substr(5,2))){
      this.setData({hideright:true})
    }else{
      this.setData({hideright:false})
    }
    this.setData({prethreemonth,nowtomonth,ymdate})
    this.apiGetRecordGraph(prethreemonth,nowtomonth)
    //以当前月份为基准。如果日期大于当前月，是预测功能的。小于当前月份输入历史记录，查询后台。
    // if (this.data.thisMonth >= thisMonth) {
    //   this.apiGetMenstrual()
    // } else if (this.data.thisMonth < thisMonth) {
    //   let menstrual = this.searchMenstrual(this.data.config.recentMenstrual, this.data.config.shortPeriod, this.data.year, this.data.month)
    //   this.getMenses(menstrual, this.data.config.intervalDay, this.data.config.shortPeriod, this.data.config.longPeriod)
    // }
  },

  onShow() {
    this.setData({ymdate:[],middleData:[]})
    let now = new Date()
    let prethreemonth = `${now.getFullYear()}-${now.getMonth()+1<=9?'0'+(now.getMonth()+1):(now.getMonth()+1)}-01`
    let nowtomonth = `${now.getFullYear()}-${now.getMonth()+1<=9?'0'+(now.getMonth()+1):(now.getMonth()+1)}-${getMonthday(now.getFullYear(), now.getMonth()+1)}`
    var ymdate=this.getMiddle(prethreemonth,nowtomonth)
    // if(eny!=today.substr(0,7)){
    //   this.setData({hideright:true})
    // }
    ymdate.unshift({time :prethreemonth,degree:''})
    ymdate.pop()

    this.ec_charts = this.selectComponent('#mychart');
    this.setData({
      prethreemonth,nowtomonth,
      // sny,eny,
      // nowday:today,
      isToDay: true,
      year: now.getFullYear(),
      month:now.getMonth() + 1,
      toDay: newDate('yyyy-MM-dd'),
      thisMonth: newDate('yyyy-MM-dd').substr(0, 7),
      diffdate:[],
      ymdate,
      nyr:[],
      tooltip:{},
      domHeight: Math.floor(wx.getSystemInfoSync().windowHeight / 1.8),
      config:wx.getStorageSync('config')
    })
    // 获取曲线图数据
    wx.showLoading()
    this.apiGetRecordGraph(prethreemonth,nowtomonth)

  },


  // 获取体温记录曲线图
  apiGetRecordGraph(prethreemonth,nowtomonth) {
    let degree = [], monthDay = [], ymdate = [],ymonthDay =[];
    // 获取数据
    let fd = `${this.data.year}-${isNeedZero(this.data.month)}-01`
    let ld = `${this.data.year}-${isNeedZero(this.data.month)}-${getMonthday(this.data.year, this.data.month)}`
    http.get(`${app.globalData.url}/temperature/getList.do`, { data: null }, true).then(res => {
    // http.get(`${app.globalData.url}/temperature/getList.do`, { data: null,startDate:prethreemonth,endDate:nowtomonth }, true).then(res => {
      wx.hideLoading()
      if (res.data.errCode == 401) {
        app.login(() => {
          this.apiGetRecordGraph()
        });
      } else {
        // 传入录入的数据degree，想要记录的时间monthday
        if (res.data.content0.total == 0){
          this.apiGetMenstrual()
          return;
        }  
        var data = res.data.content0.rows   
        if(res.data.content0.rows.length>0){
          for (let i = 0; i < res.data.content0.rows.length; i++) {
            // 截取日期
            let str = res.data.content0.rows[i].measureTime
            // 截取新的日期形式date和mothDay，录入每一个对象中
            let monthDayStr = str.substr(5, 5), dateStr = str.substr(0, 10)
            res.data.content0.rows[i].date = dateStr
            res.data.content0.rows[i].monthDay = monthDayStr
  
            degree.push(res.data.content0.rows[i].degree)
            monthDay.push(res.data.content0.rows[i].monthDay)
            ymonthDay.push(res.data.content0.rows[i].date)
          }
        }
        this.setData({
          data:data,
          degree,
          monthDay,
          ymonthDay
          // ymdate
        })
        // that.chart(degree, monthDay);
        // that.thisDay()
       
        this.apiGetMenstrual()
      }
    })
  },

  // 月经期数接口
  apiGetMenstrual() {
    let {prethreemonth,nowtomonth}=this.data
    // if(ymdate.length==0||ymdate[ymdate.length-1]!=this.data.nowday){
    //   ymdate.push(this.data.nowday)
    // }
    // this.setData({ymdate})
    // let sd=''
    // if(ymdate.length>0){
    //   sd=ymdate[0].substr(0,7)
    //   sd = sd+'-01'
    // }
    // this.apiGetMakeLove();
    // this.apiGetLeucorrhea();
    // let fd = `${this.data.year}-${isNeedZero(this.data.month)}-01`
    let ld = `${this.data.year}-${isNeedZero(this.data.month)}-${getMonthday(this.data.year, this.data.month)}`
    // http.get(`${app.globalData.url}/menstrual/getList.do`, { startDate:sd?sd:fd, endDate: ld }, true).then(res => {
    http.get(`${app.globalData.url}/menstrual/getAllList.do`, { startDate:prethreemonth, endDate:nowtomonth }, true).then(res => {
      if (res.data.errCode == 401) {
        app.login(() => {
          this.apiGetMenstrual()
        })
      } else {
        var rows = res.data.content0.menstruals
        var s=0
        if(rows.length>0){
          rows.forEach(item=>{
            if(item.forecastOvulation&&item.forecastOvulation.startDate){
              s++
            }
          })
        }
        this.setData({rows})
        let lastMenstrualStartDate = [], ovluateList = [],ovluateDay=[] 
        this.data.mlDay=[]
        this.data.folliclelist=[]
        rows.forEach(data => {
          lastMenstrualStartDate.push({
            date: getDateArray(data.startDate, data.endDate),
            id: data.id
          });
          if(data.forecastOvulation){
            ovluateList.push(getDateArray(data.forecastOvulation.startDate,data.forecastOvulation.endDate))
            if(data.forecastOvulation.ovulateDate){
              ovluateDay.push(data.forecastOvulation.ovulateDate)
            }
          }
        })
        
        if(res.data.content0.forecastMenstruals.length>0){
          rows = res.data.content0.forecastMenstruals
          rows.forEach(data => {
            lastMenstrualStartDate.push({
              date: getDateArray(data.startDate, data.endDate),
              id: undefined,
              type:'forecast'
            });
            if(data.forecastOvulation){
              // this.data.ovluateList.push(oldovluate(parent.date[0], shortPeriod, longPeriod))
              ovluateList.push(getDateArray(data.forecastOvulation.startDate,data.forecastOvulation.endDate))
              if(data.forecastOvulation.ovulateDate){
                ovluateDay.push(data.forecastOvulation.ovulateDate)
              }
            }
          })
        }
        ovluateDay.forEach((parent, i) => {
          this.data.mlDay.push(mlDay(parent, 2, 4))
        })
        // 旧算法的预测数据----start
        // 当线上用户初次进入页面时没有获取到最新的预测数据就先显示旧的预测数据
        if(res.data.content0.forecastMenstruals.length==0){
          var oldlastMenstrualStartDate = []
          var rows = res.data.content0.menstruals
          rows.forEach(data => {
            oldlastMenstrualStartDate.push({
              date: getDateArray(data.startDate, data.endDate),
              id: data.id
            });
          })
  
          if (rows.length > 0) {
            let nextTime = dateInterval(rows.pop().startDate, this.data.config.shortPeriod)
            if (nextTime <= ld) {
              oldlastMenstrualStartDate.push({
                date: getDateArray(nextTime, dateInterval(nextTime, this.data.config.intervalDay - 1))
              })
            } else {
              //获取上一个月的时间
              var year = '', month = '', selected = 0;
              if (this.data.month == 1) {
                year = this.data.year - 1
                month = 12
                selected = 0
              } else {
                year = this.data.year
                month = this.data.month - 1
                selected = 0
              }
              // 调用上一个月的接口
              let fd2 = `${year}-${isNeedZero(month)}-01`
              let ld2 = `${year}-${isNeedZero(month)}-${getMonthday(year, month)}`
              http.get(`${app.globalData.url}/menstrual/getAllList.do`, { startDate: fd2, endDate: ld2 }, true).then(res => {
                rows.forEach(data => {
                  oldlastMenstrualStartDate.push({
                    date: getDateArray(data.startDate, data.endDate),
                    id: data.id
                  });
                })
              })
            }
          }else if (rows.length == 0 && `${this.data.year}-${isNeedZero(this.data.month)}` == this.data.thisMonth) {
            oldlastMenstrualStartDate = this.searchMenstrual(this.data.config.recentMenstrual, this.data.config.shortPeriod, this.data.year, this.data.month)
          }
        }
         // 旧算法的预测数据----end

        if(res.data.content0.forecastMenstruals.length>0){
          this.setData({mensesList:lastMenstrualStartDate,ovluateList,ovluateDay})
        }else{
          if(s>0){
            this.setData({mensesList:lastMenstrualStartDate,ovluateList,ovluateDay})
          }else{
            this.getMenses(oldlastMenstrualStartDate, this.data.config.intervalDay, this.data.config.shortPeriod, this.data.config.longPeriod)
          }
        }
        this.init()

        var recordtem = wx.getStorageSync('recordtem')
        if(recordtem&&recordtem==1){
          var content0 = wx.getStorageSync('content0')
          var {updateOrNo,json}=content0
          if(updateOrNo){
            if(json){
              if(json.daysInput.length>0){
                this.testFAMDays(json)
              }else{
                this.apiGetMenstrual()
              }
            }
          }
        }
      }
    })
  },

  async testFAMDays(alInput) {
    let debugId = uuid()
    let fam = new YCFam('100022', 'da7564b887596ba56068271de072c0b8', this.data.config.openId)
    try {
      const { data } = await fam.getFAMDays(debugId, alInput)
      // console.log(cycle,'算法算法算法',data)
      wx.removeStorageSync('recordtem')
      wx.removeStorageSync('content0')
      var params={
        reqJson:alInput,
        result:data.daysOutput
      }
      
      this.getForecast(params)
    } catch (error) {
      console.log(error)
    }
  },
  // 本地化预计经期和排卵期
  getForecast(params){
    http.post(`${app.globalData.url}/menstrual/insertForecast1.do`, {json:JSON.stringify(params)}, true).then(res => {
      if (res.data.errCode == 0) {
        this.apiGetMenstrual()
        // that.setData({
        //   rilipic: that.data.imageurl2 + res.data.data.value
        // })
      }else if(res.data.errCode == 1){
        wx.showToast({
          title: '您已清除掉此条经期',
          icon:'none'
        })
        this.apiGetMenstrual()
      }
    })
  },
  init() {
    var that = this
		this.ec_charts.init((canvas, width, height,dpr) => {
			// 在这里初始化图表
			chart = echarts.init(canvas, null, {
				width: width,
        height: height,
        devicePixelRatio: dpr 
			});
			setOption(chart,that);
			// 注意这里一定要返回 chart 实例，否则会影响事件处理等
			return chart;
		})
  },
  /**
   * 获取月经期，排卵期，排卵日，建议同房日
   * @param {lastMenstrualStartDate} Array 当前经期的开始日期
   * @param {MenstrualDuration} 经期持续时间
   * @param {shortPeriod} 最短间隔日期
   * @param {longPeriod} 最长间隔日期
   */
  getMenses(lastMenstrualStartDate, MenstrualDuration, shortPeriod, longPeriod,bool) {
    console.log('旧数据的lastMenstrualStartDate',lastMenstrualStartDate)
    this.data.mensesList = []
    this.data.ovluateList = []
    this.data.ovluateDay = []
    this.data.mlDay = []//建议同房日
    // this.data.folliclelist = []
    lastMenstrualStartDate.forEach((parent, i) => {
      this.data.mensesList.push({ 'date': menses(parent.date[0], parent.date.length), id: parent.id })
      // ovluateList.push(getDateArray(data.forecastOvulation.startDate,data.forecastOvulation.endDate))
      this.data.ovluateList.push(oldovluate(parent.date[0], shortPeriod, longPeriod))
      // this.data.ovluateList.push({ 'date': oldovluate(parent.date[parent.date.length-1], shortPeriod, longPeriod), id: parent.id  })
      this.data.ovluateDay.push(ovluateDay(parent.date[0], shortPeriod, longPeriod))
      
      
    })
    console.log('旧的预测数据',this.data.mensesList, this.data.ovluateList, this.data.ovluateDay, this.data.mlDay, this.data.folliclelist)
    // this.calendar(this.data.year, this.data.month,bool);
  },
  /**
   * 经期查询
   * @param {lastMenstrualDate} 最后一次月经的时间
   * @param {MenstrualCycle} 月经的周期
   * @param {year} 当前年份
   * @param {month} 当前月份
   */
  searchMenstrual(lastMenstrualDate, MenstrualCycle, year, month) {
    let searchDate = `${year}-${isNeedZero(month)}-01`;
    let searchMenstrualDay;
    if (lastMenstrualDate.substr(0, 7) == `${year}-${isNeedZero(month)}`) {
      searchMenstrualDay = lastMenstrualDate
    } else {
      let IntervalNum = getDateArray(lastMenstrualDate, searchDate).length;
      let num = MenstrualCycle - IntervalNum % MenstrualCycle
      searchMenstrualDay = dateInterval(searchDate, num)
    }
    // 查询的月份
    let lastTime = getDateArray(dateInterval(searchMenstrualDay, -MenstrualCycle), dateInterval(dateInterval(searchMenstrualDay, -MenstrualCycle), this.data.config.intervalDay - 1))
    let nowTime = getDateArray(searchMenstrualDay, dateInterval(searchMenstrualDay, this.data.config.intervalDay - 1))
    let nextTime = getDateArray(dateInterval(searchMenstrualDay, MenstrualCycle), dateInterval(dateInterval(searchMenstrualDay, MenstrualCycle), this.data.config.intervalDay - 1))
    let searchMenstrual = [{ date: lastTime }, { date: nowTime }, { date: nextTime }]
    return searchMenstrual
  },
    /**
   * 渲染日历
   * @param {year} 当前年份
   * @param {month} 当前月份
   */
  calendar(year, month) {
    let firstInterval, day, lastInterval, dayList = [];
    // 保存当前月份的天数的间隔时间
    firstInterval = getMonthFirstDay(year, month)
    day = getMonthday(year, month)
    // 获取后面间隔时间
    if (35 - (day + firstInterval) >= 0) {
      lastInterval = 35 - (day + firstInterval)
    } else {
      lastInterval = 42 - (day + firstInterval)
    }
    //返回日历数组
    for (let i = 1; i <= day; i++) {
      dayList.push({
        day: `${year}-${isNeedZero(month)}-${isNeedZero(i)}` === this.data.toDay ? '今' : i,
        full: `${year}-${isNeedZero(month)}-${isNeedZero(i)}`,
        index: i - 1,
      })
    }
    let index = 0;
    dayList.forEach((date, i) => {
      // 判断是否月经期
      this.data.mensesList.forEach(parent => {
        parent.date.forEach((child, childIndex) => {
          if (date.full === child) {
            if (parent.id != null) {
              date.mensesId = parent.id
              date.mensesindex = childIndex + 1
              if (childIndex === 0) {
                // console.log(dateInterval(date.full, 15));
                date.mensesType = 'start'
              } else if (childIndex === parent.date.length - 1) {
                date.mensesType = 'end'
              } else {
                date.mensesType = 'update'
              }
            } else {
              date.menses = true
            }
          }
        })
      });
      // 判断是否排卵期
      this.data.ovluateList.forEach(parent => {
        parent.forEach((child, childIndex) => {
          if (date.full === child) {
            date.ovluate = true
            // if (childIndex === 0) {
            //   date.ovluateType = 'start'
            // } else if (childIndex === parent.length - 1) {
            //   date.ovluateType = 'end'
            // }
          }
        })
      })
      // 判断是否同房
      this.data.makeLoveList.forEach(res => {
        
        if (date.full === res.loveDate) {
          date.ml = res.id
        }
      })
      // 判断是否白带增多
      this.data.leucorrheaList.forEach(res => {
        if (date.full === res.recordDate) {
          date.leu = res.id
        }
      })
      // 判断是否排卵日
      this.data.ovluateDay.forEach(ovluateDay => {
        if (date.full == ovluateDay) {
          date.ovluateDay = true
        }
      })
      // 建议同房日期
      this.data.mlDay.forEach(mlDay => {
        if (date.full == mlDay) {
          date.mlDay = true
        }
      })
      if (date.full == this.data.toDay) {
        index = i
      }
    })
    this.setData({
      selected: dayList[index],
      firstInterval: firstInterval,
      lastInterval: lastInterval,
      day: dayList
    })
  },
  
  chart(degree, monthDay) {
    degree.reverse()
    monthDay.reverse()
    this.lineChart = new wxCharts({
      canvasId: 'lineCanvas',
      type: 'area',
      // categories: monthDay,
      categories:['5-22', '5-23', '5-24', '5-25', '5-26', '5-27', '5-28'],
      // 是否动画显示
      animation: true,
      // background :'#66ccff',
      // 数据列表
      series: [
        {
          name: '',
          // data: degree,
          data: [36.2, 36.3, 37, 36.5, 36.7, 36, 36.8],
          itemStyle: {
            normal: {
                color: function(params){
                    if(params.data < 36.3){
                        return '#C1232B';
                    }else if(params.data>=36.5 && params.data<36.6){
                        return '#FE8463';
                    }else if(params.data>=36.6 && params.data<37){
                        return '#FCCE10';
                    }
                }
            }
          },
          type: 'line'
        }
      ],
      xAxis: {
        // disableGrid: true,
        type:'calibration',
        gridColor: '#7cb5ec',
        fontColor: '#FF8C8C',
        splitLine: {
          show: true,
          lineStyle:{
             color: ['red'],
             width: 1,
             type: 'solid'
          }
        }
      },
      yAxis: {
        // disabled:true,
        min: 36,
        max: 38,
        gridColor: '#FCC8C8', 
        fontColor: '#FF8C8C',
        type:'value',
        splitLine: {
          show: true,
          lineStyle: {
            color: ['blue'],
            width: 1,
            type: 'solid'
          }
        },
      },
      // 是否显示图表下方各类别的标识
      legend: false,
      // legend:true,
      width: wx.getSystemInfoSync().windowWidth,
      height: this.data.domHeight,
      // 是否在图表中显示数据内容值
      dataLabel: true,
      enableScroll: true
    });
  },
  // 删除体温
  canceltemp(){
    // var id=e.currentTarget.dataset.id
    var {tooltip} = this.data
    if(tooltip.id){
      wx.showModal({
        title: '提示',
        content: '确定要删除吗？',
        cancelColor: '#555',
        confirmColor: '#cca955',
        success: res => {
          if (res.confirm) {
           this.sure(tooltip.id)
          }
        }
      })
    }else{
      wx.showToast({
        title: '请选择日期',
        icon:'none'
      })
    }
  },
  // 编辑体温
  updatatemp(){
    var {tooltip} = this.data
    if(tooltip.id){
      wx.navigateTo({
        url:`../temperatureRecord/temperatureRecord?date=${tooltip.name}&temp=${tooltip.value}&id=${tooltip.id}&time=${tooltip.time}`
      })
    }else{
      wx.showToast({
        title: '请选择日期',
        icon:'none'
      })
    }
    
  },
  // 删除弹窗
  cleartoop(){
    this.setData({tooltip:{}})
  },
  sure(id){
    http.post(`${app.globalData.url}/temperature/delete.do`,{id},true).then(res=>{
      if(res.data.errCode==0){
        wx.showToast({
          title: '删除成功',
          icon:'none'
        })
        this.onShow()
      }
    })
  },
  // 滑块事件
  swiper(e) {
    if (e.currentTarget.dataset.current) {
      this.setData({ current: e.currentTarget.dataset.current })
    } else {
      this.setData({ current: e.detail.current })
    }
  },
  // 表格滚动事件
  scrollChange(e) {
    this.showYear(e.detail.scrollLeft + 20)
  },
  /**
   * 设置显示年份的方法
   * 根据滚动条位置判断是第几条数据
   * @  left值
   * @  宽度
   */
  showYear(num = 0, width = 50) {
    let nowIndex = Math.floor(num / width), key, keyArr = []
    for (key in this.data.tableData) {
      keyArr.push(key)
    }
    let keyIndex = keyArr[nowIndex], year;
    year = this.data.tableData[keyIndex][0].year
    this.setData({
      nowIndex: nowIndex,
      year: year
    })
  },
  // 触碰到的时候
  touchHandler(e) {
    this.lineChart.scrollStart(e);
  },
  // 移动的时候
  moveHandler(e) {
    this.lineChart.scroll(e);
  },
  // 触碰结束的时候
  touchEndHandler(e) {
    this.lineChart.scrollEnd(e);
    this.lineChart.showToolTip(e, {
      format: function (item, category) {
        let a = category.split('-')
        return a[0] + '月'+a[1]+'日'+'    ' + item.name + '体温:' + item.data+'℃'
      }
    });
  },

  onShareAppMessage() {
    return {
      title: '备孕记录',
      path: 'pages/login/login?jumpType=/pages/temperature/temperature'
    }
  },
  // 获取体温记录表格
  // apiGetRecordTable() {
  //   let that = this, liWidth = 50, numberWidth = 31, dataNum, tableWidth, scrollLeft
  //   http.get(`${app.globalData.url}/temperature/getPage.do`, { data: null }, true).then(res => {
  //     if (res.data.errCode == 401) {
  //       app.login(() => {
  //         this.apiGetRecordTable()
  //       });
  //     } else {
  //       if (res.data.content0.total == 0) return;
  //       // 每天的数据不满足6条 自动追加空数据进去
  //       let arr = { createTime: "", 'degree': "", id: "", measureDate: "", measureTime: "", monthDay: "", userId: "", year: "" }, key;
  //       for (key in res.data.content0.map) {
  //         res.data.content0.map[key].forEach((item, index) => {
  //           // 截取年份和月份
  //           let str = res.data.content0.map[key][index].measureTime
  //           let strMonthDay = str.substr(5, 5), strYear = str.substr(0, 4)
  //           res.data.content0.map[key][index].monthDay = strMonthDay
  //           res.data.content0.map[key][index].year = strYear
  //         })
  //         if (res.data.content0.map[key].length < 6) {
  //           let nums = 6 - res.data.content0.map[key].length;
  //           for (let i = 1; i <= nums; i++) {
  //             res.data.content0.map[key].push(arr);
  //           }
  //         }
  //       }
  //       // 根据返回数据的数量计算出表格的宽度
  //       dataNum = res.data.content0.total
  //       tableWidth = dataNum * liWidth + numberWidth
  //       this.setData({
  //         tableData: res.data.content0.map,
  //         dataNum: dataNum,
  //         tableWidth: tableWidth
  //       })
  //       this.setData({ scrollLeft: (this.data.dataNum - 5) * 50 })
  //       this.showYear()
  //     }
  //   })
  // },

  getNextDate(date, day) { 
　　var dd = new Date(date);
　　dd.setDate(dd.getDate() + day);
　　var y = dd.getFullYear();
　　var m = dd.getMonth() + 1 < 10 ? "0" + (dd.getMonth() + 1) : dd.getMonth() + 1;
　　var d = dd.getDate() < 10 ? "0" + dd.getDate() : dd.getDate();
　　return y + "-" + m + "-" + d;
  }

})

// degree:体温, monthDay：x轴日期,mensesList：姨妈时间，ovluateList：排卵期，ovluateDay：排卵日
function setOption(e,that) {
  let {degree, monthDay,ovluateList,ovluateDay,mensesList,ymdate,data}=that.data
 var newMonthDay = ymdate
 newMonthDay.forEach(item=>{
   data.forEach(val=>{
     if(item.time==val.date){
       item.degree = val.degree
     }
   })
 })
 let newdegree =[],newtime=[]
 newMonthDay.forEach(item=>{
   if(item.degree>38){
     item.degree=38
   }
  newdegree.push(item.degree)
  var time = item.time
  // time.split('-')
  // var a = time.substr(5,5)
  newtime.push(time)
 })
 var xstart =0, xend=0
 var date = new Date();
 var now = date.getDate()
 if(now<=10){
  xstart=0
  xend=33
 }else if(now>10&&now<=20){
  xstart=34
  xend=66
 }else if(now>20){
  xstart=67
  xend=100
 }
//  if(newdegree.length<10){
//   xstart=0
//  }else if(newdegree.length>=10&&newdegree.length<15){
//   xstart=20
//  }else if(newdegree.length>=15&&newdegree.length<20){
//   xstart=30
// }else if(newdegree.length>=20&&newdegree.length<30){
//   xstart=40
//  }else if(newdegree.length>=30&&newdegree.length<40){
//   xstart=50
//  }else if(newdegree.length>=40&&newdegree.length<50){
//   xstart=60
//  }else if(newdegree.length>=50&&newdegree.length<60){
//   xstart=70
//  } else if(newdegree.length>=60&&newdegree.length<70){
//   xstart=80
//  }else if(newdegree.length>=70&&newdegree.length<100){
//   xstart=90
//  }else {
//    xstart=95
//  }

 console.log('新x轴和坐标',newtime,newdegree)
  var year = new Date().getFullYear()
  var PlanStartTime = newtime[newtime.length-1]
  var _PlanStartTime = new Date(PlanStartTime)//x轴最大日期
  let markArea=[]
  // 排卵期
  var ovulatestart='', ovulateend='';
  let list=[]
  ovluateList.forEach(item=>{
    if(item.length>0){ 
      var newl=that.getNextDate(item[item.length-1],1)
      item.push(newl)
      var ovulate = item
      var ovu=ovulate[0].split('-')
      var ovul=ovulate[ovulate.length-1].split('-')
      ovulatestart = ovu[1]+'-'+ovu[2]
      ovulateend = ovul[1]+'-'+ovul[2]
      var ovllast = year+'-'+ovulateend
      var lastdat = new Date(ovllast)//排卵期最后一天
      // 判断排卵期开始时间是否大于x轴时间
      if(new Date(ovulate[0]).getTime()>_PlanStartTime.getTime()){
        ovulatestart = newtime[newtime.length-1]
        ovulateend = newtime[newtime.length-1]
      }else{
        ovulatestart= ovulate[0]
        // 判断排卵期结束时间是否大于x轴时间
        if(lastdat.getTime()>_PlanStartTime.getTime()){
          ovulateend = newtime[newtime.length-1]
        }else{
          ovulateend = ovulate[ovulate.length-1]
        }
      }
      // obj={start:ovulatestart,end:ovulateend}
      // ovulateList.push(obj)
      list=[{xAxis:ovulatestart,itemStyle:{color:'rgba(91, 172, 23, 0.2)'}},{xAxis:ovulateend}]
      markArea.push(list)
    }
  })
  // 排卵日
  var ovdaystart='',ovdayend=''
  ovluateDay.forEach(item=>{
    let obj={}
    if(item!="NaN-NaN-NaN"){
      var vation = item.split('-')
      var day1 = new Date(item);
      day1.setTime(day1.getTime()+24*60*60*1000);
      var nowmonth= day1.getMonth()+1
      nowmonth= nowmonth<=9?'0'+nowmonth:nowmonth
      var day = day1.getDate()
      day=day<=9?'0'+day:day
      var ovend = day1.getFullYear()+"-" + nowmonth + "-" + day;
      // var a=ovend.split('-')
      // ovdayend = a[1]+'-'+a[2]
      // ovdaystart = vation[1]+'-'+vation[2]
      // 判断排卵日开始时间是否大于x轴时间
      if(new Date(item).getTime()>_PlanStartTime.getTime()){
        // 当开始时间大于x轴时，开始时间和结束时间均为x轴最大时间
        ovdaystart = newtime[newtime.length-1]
        ovdayend = newtime[newtime.length-1]
      }else{
        // 排卵日结束日期是否大于x轴时间
        ovdaystart=item
        if(new Date(ovend).getTime()>_PlanStartTime.getTime()){
          ovdayend = newtime[newtime.length-1]
        }else{
          ovdayend = ovend
        }
      }
      // obj = {start:ovdaystart,end:ovdayend}
      // dayList.push(obj)
      list=[{xAxis:ovdaystart,itemStyle:{color:'rgba(174, 219, 136, 0.2)'}},{xAxis:ovdayend}]
      markArea.push(list)
    }
  })

  // 姨妈期
  var starttime='',endtime=''
  mensesList.forEach(item=>{
    let obj={}
    var mate = item.date
    if(mate.length>0){
      var newl=that.getNextDate(mate[mate.length-1],1)
      mate.push(newl)
      // var start = mate[0].split('-')
      // var end = mate[mate.length-1].split('-')
      // starttime = start[1]+'-'+start[2]
      var PlanEndTime = mate[mate.length-1]
      var _PlanEndTime = new Date(PlanEndTime)//姨妈结束时间
      // 姨妈开始时间大于x轴最大时间时
      if(new Date(mate[0]).getTime()>_PlanStartTime.getTime()){
        starttime = newtime[newtime.length-1]
        endtime=newtime[newtime.length-1]
      }else{
        starttime =mate[0]
        // 姨妈结束时间大于x轴最大时间时
        if(_PlanEndTime.getTime() > _PlanStartTime.getTime()){
          endtime=newtime[newtime.length-1]
        }else{
          endtime = mate[mate.length-1]
        }
      }
      // obj={start:starttime,end:endtime}
      // mensList.push(obj)
      list=[{xAxis:starttime,itemStyle:{color:'rgba(252, 156, 192, 0.2)'}},{xAxis:endtime}]
      markArea.push(list)
    }
  })

  var option = {
    color: ["#FF8C8C"],
    legend: {
      top: 50,
      left: 'center',
      // color:'#FF8C8C',
      // backgroundColor:'rgba(128, 128, 128, 0.1)', //rgba设置透明度0.1
      z: 1
    },
    grid: {
      // containLabel: true
      x:30,
      y:20,
      x2:15,
      y2:60,
      // borderWidth:1
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor:'rgba(250, 164, 163, 0.8)',//通过设置rgba调节背景颜色与透明度
      color:'#fff',
      borderWidth:'2',
      borderColor:'#000',
      padding: 10,
      textStyle:{
        color:'#fff',
        textAlign:'center'
      },
      formatter:(params)=>{
        var row = that.data.data
        let obj = {
          name: params[0].name,
          value: params[0].value,
          id:'',
          lhValue:'',
          date:''
        };
        row.forEach(val=>{
          let time=val.measureTime
          time = time.split(' ')
          var day = time[0]
          var date = time[0].split('-')
          // date = date[1]+'-'+date[2]
          if(day==obj.name){
            obj.id=val.id
            obj.lhValue = val.lhValue?val.lhValue:'',
            obj.date = date[2],
            obj.ovulateType = val.ovulateType,
            obj.time=time[1]
          }
          if(obj.name==that.data.toDay){
            obj.date = '今'
          }
        })
        
        mensesList.forEach(data=>{
          data.date.forEach(item=>{
            if(item==obj.name){
              obj.type='showmens'
              // that.setData({showmens:true,showovl:false,showovluate:false})
            }
          })
        })
        ovluateList.forEach(data=>{
          data.forEach(cal=>{
            if(cal==obj.name){
              obj.type='showovl'
              // that.setData({showovl:true,showmens:false,showovluate:false})
            }
          })
        })
        ovluateDay.forEach(data=>{
          if(data==obj.name){
            obj.type='showovluate'
            // that.setData({showovluate:true,showovl:false,showmens:false})
          }
        })
        that.setData({tooltip:obj})
        var data = params[0].name
        let a = data.split('-')
        let txt = a[0] + '月'+a[1]+'日'+'\n';
        txt+='体温:' + params[0].data+'℃'
        return ''
      }
      // position: [0, '-1000%', 0, 0],
      // formatter: params => {
        // var row = that.data.data
        // let obj = {
        //   name: params[0].name,
        //   value: params[0].value,
        //   id:'',
        //   lhValue:''
        // };
        // row.forEach(val=>{
        //   let time=val.measureTime
        //   time = time.split(' ')
        //   var day = time[0].split('-')
        //   day = day[1]+'-'+day[2]
        //   if(day==obj.name){
        //     obj.id=val.id
        //     obj.lhValue = val.lhValue?val.lhValue:''
        //   }
        // })
        
        // that.setData({tooltip:obj})
      //   return "";//将原来的提示框清空
      // }
    },
    
    xAxis: {
      type: 'category',
      boundaryGap: false,
      // data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      data:newtime,
      scale:true,
      axisLabel:{ 
        interval:'auto',
        rotate:45,
        formatter:(params)=>{
          var a = params.substr(5,5)
          return a
        },
      },
      axisTick: {
        interval:'auto',
        alignWithLabel: true
      },
      axisLine:{
        show:true,
        lineStyle:{
          color:'#FF8C8C',
        }
      },
      splitLine: {
        interval:'0',
        show: true,
        lineStyle:{
           color: ['#FCC8C8'],
           width: 1,
           type: 'solid'
        }
  　　},
      axisPointer:{
        type:'line',
        lineStyle:{
          color:['#FCC8C8']
        }
      }
    },
    yAxis: {
      min:35.7,
      max:38,
      splitNumber:30,
      x: 'center',
      type: 'value',
      scale: true,//只在数值轴中有效
      axisLabel: {
        formatter: (params)=>{  //刻度标签的内容格式器，支持字符串模板和回调函数两种形式，按照自己需求设置
          var y = String(params).indexOf(".") + 1;//获取小数点的位置
          let txt=''
          if(y>0){
            txt = String(params).substr(2,2)
          }else{
            txt = params
          }
          return txt;
        }
      },
      axisLine:{
        lineStyle:{
            color:'#FF8C8C',
        }
      }, 
      splitLine: {
        show: true,
        lineStyle: {
          color: ['#FCC8C8'],
          width: 1,
          type: 'solid'
        }
      },
      
    },
    series: [{
      type: 'line',
      itemStyle: {
        normal: {
          color: "#E86589",
          lineStyle: {
              color: "#E86589"
          }
        }
      },
      // smooth: true,
      // data: [36.3],
      data:newdegree,
      // label: {
      //   normal: {
      //   show: true,
      //   formatter: function (params) {
      //     let name=''
      //     if(params.data>38){
      //       name=38
      //     }
      //     return name
      //    }
      //   }
      // },
      connectNulls: true,   //这个是重点，将断点连接
      markArea: {data: markArea}
    }],
    dataZoom : [
      {
        type: 'inside',
        show: true,
        start: 0,
        end: 100,
        handleSize: 10
      }   
    ]
  };
  chart.getZr().on('mousemove', (e) => {
    // 获取自定义提示框的宽度
    wx
      .createSelectorQuery()
      .select(".tooltipContainer")
      .boundingClientRect(rect => { })
      .exec(res => {
        if (res[0] != null) {
          that.data.tooltipContainerWidth = res[0].width;
        }
      });
    // 获取左侧坐标
    let x = e.offsetX;
    let y = e.offsetY
    if (x < that.data.tooltipContainerWidth) {
      that.data.tooptipLeft = x + 20;
    } else {
      that.data.tooptipLeft = x - that.data.tooltipContainerWidth- 20;
    }
    that.setData({tooptipLeft:that.data.tooptipLeft,tooptipTop:y})
  })
  //设置tooltip隐藏
  chart.getZr().on('mouseup', (e) => {
    that.data.tooltip = [];
    chart.dispatchAction({
      type: 'updateAxisPointer',
      currTrigger: 'leave'
    })
  })
  chart.setOption(option);
}