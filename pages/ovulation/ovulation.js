import http from '../../utils/http.js'
import { getMonthday, getMonthFirstDay, getDateArray, newDate, dateInterval, isNeedZero } from '../../utils/util.js'
import { menses, ovluate, ovluateDay, mlDay, theDayBefore ,format} from '../../utils/menses.js'
import wxCharts from '../../utils/wxcharts.js'
import * as echarts from '../../components/ec-canvas/echarts';
import WxCanvas from '../../components/ec-canvas/wx-canvas.js';
import uuid from '../../utils/uuid.js'
import YCFam from 'yc-fam-js'
var app = getApp();
let chart;
Page({
  data: {
    imageurl:app.globalData.imgPrefix,
    ec: {lazyLoad: true},
    domHeight: Math.floor(wx.getSystemInfoSync().windowHeight / 2),
    stateName: [{ index: 1, state: '阴性' }, { index: 2, state: '弱阳' }, { index: 3, state: '阳性' }, { index: 4, state: '强阳' }, { index: 0, state: '无效' }],
    left: 0,
    //页面下标 1普通 2 半定量 3验孕
    pageIndex: 1,
    // 普通页面的滑动下标 0 报表 1列表 2验孕
    normalPageCurrent: 0,
    systemInfo: {},
    rows:[],
    // 插入验孕部分js
    // 是否显示海报
    showPoster: false,
    pageShow: false,
    // 定义删除按钮子组件传入的值
    isShowDelModal:'none',
    ec_charts:'',
    tooltip:{},
    tooptipLeft: '',
    tooptipTop:'',
    tooltipContainerWidth:'',
    ovluateList: [],
    ovluateDay: [],
    config:{},
    isToDay: true,
    month:0,
    toDay: 0,
    thisMonth:0,nyr:[],
    ymdate:[],
    degree:[],monthDay:[],
    diffdate:[],
    ismodel:false,
    // 加一个滑动删除
    startX: 0, //开始坐标
    startY: 0,
    isTouchMove: true, //默认全隐藏删除
    // 原本的
    year:'',
    time:'10:00',
    styleBgColor: {
      positive: '#d38989',
      negative: '#d4bbbb',
      qiangyang:'#bc4949',
      invalid: 'rgba(0,0,0,.5)'
    },
    nowIndex: 0,
    domHeight: 0,
    // 获取当前删除的index
    currentIndex:0,
    prethreemonth:'',
    nowtomonth:'',
    sny:'',
    eny:'',
    middleData:[],
    mensesList:[],ovluateList:[],ovluateDay:[],
    hideright:false,
    baoxicode:'',
    weater1:'/api/v1/config/recommend_buy_test_paper',
    weater2:'/api/v1/config/recommend_buy_half_test_paper',
    weater3:'/api/v1/config/recommend_buy_pre_test_paper',
    isShow:true,
    isShow2:true,
    isShow3:true,
    showpic:false
  },
  checkcart(e){
    console.log(e.detail)
    this.setData({isShow:e.detail})
  },
  checktwo(e){
    console.log(e.detail)
    this.setData({isShow2:e.detail})
  },
  checkthree(e){
    console.log(e.detail)
    this.setData({isShow3:e.detail})
  },
  // 滚动事件
  scrollChange(e) {
    this.showYear(e.detail.scrollTop + 15)
  },

  longPress(e){
    let {id,date,time}=e.currentTarget.dataset
    wx.showModal({
      content:`确定删除${date}   ${time}的数据？`,
      success:(res)=>{
        if(res.confirm){
          this.toFatherPage(id)
        }
      }
    })
  },
  /**
   * 设置显示年份的方法
   * 根据滚动条位置判断是第几条数据
   * @  滚动条top值
   * @  每行高度
   */
  showYear(top = 0, height = 40) {
    let nowIndex = Math.floor(top / height);
    var year = ''
    if(this.data.rows.length>0){
      year= this.data.rows[nowIndex].year
    }
    this.setData({
      nowIndex: nowIndex,
      year: year
    })
  },

  // 添加滑动删除功能
  //手指触摸动作开始 记录起点X坐标
  touchstart: function (e) {
    //开始触摸时 重置所有删除
    this.data.rows.forEach(function (v, i) {
    if (v.isTouchMove)//只操作为false的
      v.isTouchMove = true;
    })
    this.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,
      rows: this.data.rows
    })
  },
  //滑动事件处理
  touchmove: function (e) {
    var that = this,
      index = e.currentTarget.dataset.index,//当前索引
      startX = that.data.startX,//开始X坐标
      startY = that.data.startY,//开始Y坐标
      touchMoveX = e.changedTouches[0].clientX,//滑动变化坐标
      touchMoveY = e.changedTouches[0].clientY,//滑动变化坐标
      //获取滑动角度
      angle = that.angle({ X: startX, Y: startY }, { X: touchMoveX, Y: touchMoveY });
      that.data.rows.forEach(function (v, i) {
      v.isTouchMove = true
      //滑动超过30度角 return
      if (Math.abs(angle) > 30) return;
      if (i == index) {
        if (touchMoveX > startX) //右滑
        v.isTouchMove = true
        else //左滑
        v.isTouchMove = false
      }
    })
    //更新数据
    that.setData({
      rows: that.data.rows
    })
  },
  /**
* 计算滑动角度
* @param {Object} start 起点坐标
* @param {Object} end 终点坐标
*/
  angle: function (start, end) {
    var _X = end.X - start.X,
    _Y = end.Y - start.Y
   //返回角度 /Math.atan()返回数字的反正切值
   return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
  },
  
  //删除表格
  toFatherPage(id){
    let newid=''
    if(typeof id =='object'){
      newid=id.currentTarget.dataset.id
    }else{
      newid=id
    }
    // var id = e.currentTarget.dataset.id
    let {pageIndex}=this.data
    let url=''
    if(pageIndex==3){
      url='/pregnancy/delete.do'
    }else{
      url='/ovulate/delete.do'
    }
    http.post(`${app.globalData.url}${url}`,{id:newid},true).then(res=>{
      console.log(res)
      if(res.data.errCode==0){
        wx.showToast({
          title:'删除成功',
          icon:'none'
        })
        setTimeout(()=>{
          this.apiGetList()
        },1000)
        
      }
    })
  },

  // 获取当前时间
  getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = year + seperator1 + month + seperator1 + strDate;
    return currentdate;
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
      var obj = {time :stime,lhValue:''}
      middleData.push(obj)
    }
    return middleData
  },

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
    console.log(ymdate)
    if(this.data.month<Number(this.data.toDay.substr(5,2))){
      this.setData({hideright:true})
    }else{
      this.setData({hideright:false})
    }
    this.setData({prethreemonth,nowtomonth,ymdate})
    this.apiGetList(prethreemonth,nowtomonth)

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
    console.log(ymdate)
    if(this.data.month<Number(this.data.toDay.substr(5,2))){
      this.setData({hideright:true})
    }else{
      this.setData({hideright:false})
    }
    this.setData({prethreemonth,nowtomonth,ymdate})
    this.apiGetList(prethreemonth,nowtomonth)
    //以当前月份为基准。如果日期大于当前月，是预测功能的。小于当前月份输入历史记录，查询后台。
    // if (this.data.thisMonth >= thisMonth) {
    //   this.apiGetMenstrual()
    // } else if (this.data.thisMonth < thisMonth) {
    //   let menstrual = this.searchMenstrual(this.data.config.recentMenstrual, this.data.config.shortPeriod, this.data.year, this.data.month)
    //   this.getMenses(menstrual, this.data.config.intervalDay, this.data.config.shortPeriod, this.data.config.longPeriod)
    // }
  },
  onShow() {
    wx.getSystemInfo({
      success: (res) => {
        // rpx to px
        // let cha = res.screenWidth / 750
        this.setData({
          systemInfo: res,
        })
      },
    })
    this.ctx = wx.createCameraContext()
    this.setData({ymdate:[],middleData:[]})
    // var today = this.getNowFormatDate()//今天的年月日
    // var myDate=new Date();
    // // var nowtomonth  = myDate.getFullYear() + "-" + (myDate.getMonth()+1<=9?'0'+(myDate.getMonth()+1):myDate.getMonth()+1) + "-" + (myDate.getDate()<=9?'0'+myDate.getDate():myDate.getDate())
    // var nowtomonth  = myDate.getFullYear() + "-" + (myDate.getMonth()+1<=9?'0'+(myDate.getMonth()+1):myDate.getMonth()+1) + "-" + getMonthday(myDate.getFullYear(), myDate.getMonth()+1)
    // myDate.setMonth(myDate.getMonth()-2);
    // var prethreemonth = myDate.getFullYear() + "-" + (myDate.getMonth()+1<=9?'0'+(myDate.getMonth()+1):myDate.getMonth()+1) + '-01'
    // var sny = prethreemonth.substr(0,7)
    // var eny = nowtomonth.substr(0,7)
    let now = new Date()
    let prethreemonth = `${now.getFullYear()}-${now.getMonth()+1<=9?'0'+(now.getMonth()+1):(now.getMonth()+1)}-01`
    let nowtomonth = `${now.getFullYear()}-${now.getMonth()+1<=9?'0'+(now.getMonth()+1):(now.getMonth()+1)}-${getMonthday(now.getFullYear(), now.getMonth()+1)}`
    console.log(prethreemonth,nowtomonth)
    var ymdate=this.getMiddle(prethreemonth,nowtomonth)
    ymdate.unshift({time :prethreemonth,lhValue:''})
    ymdate.pop()
    console.log(now.getFullYear())
    // 开始验孕部分代码
    this.setData({
      showpic:false,
      prethreemonth,nowtomonth,
      // sny,eny,
      // nowday:today,
      isToDay: true,
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      toDay: newDate('yyyy-MM-dd'),
      thisMonth: newDate('yyyy-MM-dd').substr(0, 7),
      diffdate:[],
      ymdate,
      nyr:[],
      config:wx.getStorageSync('config'),
      domHeight: Math.floor(wx.getSystemInfoSync().windowHeight / 2.1)
    })
    // wx.showLoading()
    
    var testResult = wx.getStorageSync('testResult')
    if(testResult&&testResult.code){
      var value = testResult.data.enums[0].value
      var time = testResult.data.record.createTime
      var img = testResult.data.record.ossUrl
      http.post(`${app.globalData.url}/ovulate/insert.do`, { lhValue:value,measureTime:time,type:2,imageUrl:img }, true).then(res => {
        wx.removeStorageSync('testResult')
        this.apiGetList(prethreemonth,nowtomonth);
      })
    }else{
      this.apiGetList(prethreemonth,nowtomonth);
    }
  },

  // 获取列表
  apiGetList(prethreemonth,nowtomonth) {
    if(this.data.normalPageCurrent==1){
      this.ec_charts = this.selectComponent('#mychart1');
    }
    let {pageIndex}=this.data
    this.setData({tooltip:{}})
    var url='',type=0
    if(pageIndex==1){
      // url='/ovulate/getList.do'
      url='/ovulate/getPage.do'
      type=1
    }else if(pageIndex==2){
      console.log(this.data.normalPageCurrent)
      if(this.data.normalPageCurrent == 0){
        url='/ovulate/getPage.do'
      }else{
        url='/ovulate/getList.do'
      }
      type=2
    }else if(pageIndex==3){
      url='/pregnancy/getPage.do'
      type=2
    }else if(pageIndex==4){
      url='/ovulate/getPage.do'
      type=3
    }
    http.get(`${app.globalData.url}${url}`, { type:type }, true).then(res => {
      wx.hideLoading()
      if (res.data.errCode == 401) {
        app.login(() => {
          this.apiGetList();
        })
      } else {
        let data = [], date = [],times=[],ymdate=[];
        res.data.content0.rows.forEach(res => {
          data.push(res.lhValue)
          date.push(res.measureTime.substr(5, 5))
          times.push(res.measureTime.substr(5, 11))
          // ymdate.push(res.measureTime.substr(0, 10))
          let str = res.measureTime
          let year = str.substr(0, 4),
            monthDay = str.substr(5, 5),
            time = str.substr(11, 5)
          var itype=res.imageUrl.substring(0,4);
          let img = res.imageUrl == 'undefined' ? '/attachments/assets/img/null.png' : res.imageUrl
          if (res.valueClocation) {
            res.valueClocation_2 = (53.55 - res.valueClocation).toFixed(2)
          }
          res.year = year
          res.monthDay = monthDay
          res.time = time
          if(itype=='http'){
            res.fullImg = img
          }else{
            res.fullImg = app.globalData.imgPrefix + img
          }
          // 增加一个touchmove
          // item.isTouchMove=true
          res.isTouchMove = true
        })
        wx.setStorageSync('canvasData', res.data.content0.rows)
        this.setData({rows:res.data.content0.rows,degree:data,monthDay:date})
        if (this.data.pageIndex == 1) {
          this.normalChart(data, date)
        } else {
          // this.allChart(data, date)
          // var that = this
          if(this.data.normalPageCurrent==1){
            // this.init(this,data, date,times)
            this.thisDay(data, date,ymdate)
          }
        }
        var content0 = wx.getStorageSync('content0')
        if(content0&&content0.updateOrNo){
          var {updateOrNo,json}=content0
          if(json){
            if(json.daysInput.length>0){
              this.testFAMDays(json)
            }else{
              this.apiGetMenstrual()
            }
          }
        }
        // this.showYear()
      }
    })
  },
  async testFAMDays(alInput) {
    let debugId = uuid()
    let fam = new YCFam('100022', 'da7564b887596ba56068271de072c0b8', this.data.config.openId)
    try {
      const { data } = await fam.getFAMDays(debugId, alInput)
      // console.log(cycle,'算法算法算法',data)
      wx.removeStorageSync('content0')
      var params={
        reqJson:alInput,
        result:data.daysOutput
      }
      console.log(params)
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
  // 显示拍照选项弹窗

  thisDay(degree, monthDay,ymdate) {
    let newny=''
    if(ymdate.length>0){
      newny = ymdate[0].substr(0,7)
      newny = newny+'-01'
    }else{
      newny = ''
    }
    
    this.apiGetMenstrual(degree, monthDay,newny);
  },
  // 月经期数接口
  apiGetMenstrual(degree, monthDay,newny) {
    let {prethreemonth,nowtomonth}=this.data
    // let fd = `${this.data.year}-${isNeedZero(this.data.month)}-01`
    // let ld = `${this.data.year}-${isNeedZero(this.data.month)}-${getMonthday(this.data.year, this.data.month)}`
    // http.get(`${app.globalData.url}/menstrual/getList.do`, { startDate: newny?newny:fd, endDate: ld }, true).then(res => {
    http.get(`${app.globalData.url}/menstrual/getList.do`, { startDate: prethreemonth, endDate: nowtomonth }, true).then(res => {
      if (res.data.errCode == 401) {
        app.login(() => {
          this.apiGetMenstrual()
        })
      } else {
        let lastMenstrualStartDate = []
        res.data.content0.rows.forEach(data => {
          lastMenstrualStartDate.push({ date: getDateArray(data.startDate, data.endDate), id: data.id });
        })
        if (res.data.content0.rows.length > 0) {
          let nextTime = dateInterval(res.data.content0.rows.pop().startDate, this.data.config.shortPeriod)
          // if (nextTime <= ld) {
          if (nextTime <= nowtomonth) {
            lastMenstrualStartDate.push({ date: getDateArray(nextTime, dateInterval(nextTime, this.data.config.intervalDay - 1)) })
          }
        } else if (res.data.content0.rows.length == 0 && `${this.data.year}-${isNeedZero(this.data.month)}` == this.data.thisMonth) {
          lastMenstrualStartDate = this.searchMenstrual(this.data.config.recentMenstrual, this.data.config.shortPeriod, this.data.year, this.data.month)
        }
        console.log(lastMenstrualStartDate)
        this.getMenses(lastMenstrualStartDate, this.data.config.intervalDay, this.data.config.shortPeriod, this.data.config.longPeriod)
        // this.init()
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
  getMenses(lastMenstrualStartDate, MenstrualDuration, shortPeriod, longPeriod) {
    this.data.mensesList = []
    this.data.ovluateList = []
    this.data.ovluateDay = []
    this.data.mlDay = []
    lastMenstrualStartDate.forEach((parent, i) => {
      this.data.mensesList.push({ 'date': menses(parent.date[0], parent.date.length), id: parent.id })
      this.data.ovluateList.push(ovluate(parent.date[0], shortPeriod, longPeriod))
      this.data.ovluateDay.push(ovluateDay(parent.date[0], shortPeriod, longPeriod))
      this.data.mlDay.push(mlDay(parent.date[0], shortPeriod, longPeriod))
    })
    console.log(this.data.mensesList,this.data.ovluateList,this.data.ovluateDay)
    // this.calendar(this.data.year, this.data.month);
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
  // 尝试接收子组件传过来的值
  isShowDelModal(e) {
    this.setData({ isShowDelModal: e.detail.isShowDelModal }) 
  },
  closeDelModal(){
    this.setData({
      isShowDelModal:'none'
    })
  },
  // 确认删除
  delData(){
    // 父组件使用selectComponent调用子组件里面的函数
    this.selectComponent('#scroll-photo').del()
    this.setData({
      isShowDelModal:'none'
    })
  },
  // 删除排卵记录
  canceltemp(){
    var {tooltip}=this.data
    // var id=e.currentTarget.dataset.id
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
  sure(id){
    http.post(`${app.globalData.url}/ovulate/delete.do`,{id},true).then(res=>{
      if(res.data.errCode==0){
        wx.showToast({
          title: '删除成功',
          icon:'none'
        })
        // this.apiGetList()
        this.onShow()
      }
    })
  },
  cleartoop(){
    this.setData({tooltip:{}})
  },
  // 插入验孕部分代码
  onHide() {
    this.setData({
      pageShow: false
    })
  },
  oppenPoster() {
    var url='/api/v1/config/qr_code_staff'
    http.get(`${app.globalData2.url}${url}`,{},true).then(res=>{
      if(res.data.code==20000){
        this.setData({
          showPoster: true,
          baoxicode:res.data.data.value,
          isShowKefuCode:'flex',
          isShowSuccessHuanyuan:'none',
        })
      }
    })
   
  },
  closePoster() {
    this.setData({
      showPoster: false
    })
  },
  download() {
    wx.getImageInfo({
      src: this.data.imageurl+this.data.baoxicode,
      success(e) {
        wx.saveImageToPhotosAlbum({
          filePath: e.path,
          success(res) {
            wx.showToast({
              title: '图片已保存',
            })
          }
        })
      }
    })
  },
   // 转发
  onShareAppMessage(res) {
    return {
      title: '金秀儿',
      path: '/pages/packageA/share/share?img=https://kingsuer-1255600302.file.myqcloud.com/attachments/assets/img/share.jpg',
      success: function (res) {
        wx.showToast({
          title: '转发成功',
        })
      },
      fail: function (res) {
        wx.showToast({
          title: '转发失败',
          icon: 'none'
        })
      }
    }
  },
  
  chuangeShowPage(e) {
    console.log(e)
    var normalPageCurrent=''
    if (e.currentTarget.dataset.current) {
      normalPageCurrent= e.currentTarget.dataset.current
    } else {
      normalPageCurrent= e.detail.current
    }
    this.setData({ normalPageCurrent})
    // if(normalPageCurrent==1){
      
    // }
    this.apiGetList()
    this.setData({tooltip:{}})
  },
  //画布
  allChart(degree, monthDay) {
    degree.reverse()
    monthDay.reverse()
    this.lineChart = new wxCharts({
      canvasId: 'all',
      type: 'area',
      categories: monthDay,
      animation: true,
      series: [{
        name: '半定量',
        data: degree,
      }],
      xAxis: {
        disableGrid: true,
        gridColor: '#ff8c8c',
        fontColor: '#ff8c8c'
      },
      yAxis: {
        min: 0,
        max: 80,
        gridColor: '#FC9CC0',
        fontColor: '#FF8C8C'
      },
      legend: false,
      width: wx.getSystemInfoSync().windowWidth,
      height: this.data.domHeight,
      dataLabel: true,
      enableScroll: true,
    });
  },
  normalChart(degree, monthDay) {
    degree.reverse()
    monthDay.reverse()
    this.lineChart = new wxCharts({
      canvasId: 'normal',
      type: 'area',
      categories: monthDay,
      animation: true,
      series: [{
        name: '',
        data: degree,
      }],
      xAxis: {
        disableGrid: true,
        gridColor: '#ff8c8c',
        fontColor: '#ff8c8c'
      },
      yAxis: {
        min: 5,
        max: 80,
        gridColor: '#FC9CC0',
        fontColor: '#FF8C8C'
      },
      legend: false,
      width: wx.getSystemInfoSync().windowWidth,
      height: this.data.domHeight,
      dataLabel: true,
      enableScroll: true,
    });
  },
  touchHandler(e) {
    this.lineChart.scrollStart(e);
  },
  moveHandler(e) {
    this.lineChart.scroll(e);
  },
  touchEndHandler(e) {
    this.lineChart.scrollEnd(e);
    this.lineChart.showToolTip(e, {
      format: function (item, category) {
        return `${category} ${item.name} ${item.data} LH`
      }
    });
  },
  // 切换标签
  toggleTab(e) {
    console.log(e.target.dataset.index)
    wx.setStorageSync('canvasData', [])
    // 判断切换时的下杠
    let leftNum=0
    if (e.target.dataset.index == 1) {
      leftNum="0"
    }else if(e.target.dataset.index == 2){
      leftNum="33.3%"
    }else{
      leftNum="66.6%"
    }
    this.setData({
      pageIndex: e.target.dataset.index,
      normalPageCurrent: 0,
      left: leftNum
    })
    this.apiGetList();
  },
  // 跳转到拍照
  jumpCamera() {
    var i = this.data.pageIndex
    if(i==1){
      let url='../camera/camera?source=1'
      wx.navigateTo({
        url: url,
      })
    }else if(i==2){
      this.setData({showpic:true})
    }
    // else if(i==2){
    //   url='../camera/camera?source=3'
    // }else if(i==4){
    //   url='../methods/methods'
    // }
  },
  twopic(){
    wx.navigateTo({
      url: '../camera/camera?source=3',
    })
  },
  threepic(){
    wx.navigateTo({
      url: '../methods/methods',
    })
  },
  hidepicmodel(e){
    this.setData({showpic:false})
  },
  // 跳转到记录
  jumpRecord() {
    let url = this.data.pageIndex == 1 ? '../conceiveRecord/conceiveRecord?source=1&isImg=1' : '../ovulationRecord/ovulationRecord'
    wx.navigateTo({
      url: url,
    })
  },
  // 跳转到图片合成
  jumpPage() {
    if(this.data.rows.length==0){
      wx.showToast({
        title: '当前无导图数据,请记录数据后再试',
        icon:'none'
      })
      return
    }else{
      wx.navigateTo({
        url: '../superPhoto/superPhoto',
      })
    }
    
  },
  onShareAppMessage() {
    return {
      title: '备孕记录',
      path: 'pages/login/login?jumpType=/pages/ovulation/ovulation'
    }
  },

 //获取两日期之间日期列表函数
  getdiffdate(stime,etime){
    //初始化日期列表，数组
    var diffdate = this.data.diffdate;
    var i=0;
    //开始日期小于等于结束日期,并循环
    while(stime<=etime){
        // diffdate[i] = stime;
        //获取开始日期时间戳
        var stime_ts = new Date(stime).getTime();
        // console.log('当前日期：'+stime   +'当前时间戳：'+stime_ts);   
        //增加一天时间戳后的日期
        var next_date = stime_ts + (24*60*60*1000);
        //拼接年月日，这里的月份会返回（0-11），所以要+1
        var next_dates_y = new Date(next_date).getFullYear()+'-';
        var next_dates_m = (new Date(next_date).getMonth()+1 < 10)?'0'+(new Date(next_date).getMonth()+1)+'-':(new Date(next_date).getMonth()+1)+'-';
        var next_dates_d = (new Date(next_date).getDate() < 10)?'0'+new Date(next_date).getDate():new Date(next_date).getDate();
        stime = next_dates_y+next_dates_m+next_dates_d;
        //增加数组key
        i++;
        var obj = {time :stime,lhValue:''}
        diffdate.push(obj)
    }
    console.log(diffdate);
    this.setData({diffdate})
  },
  getNextDate(date, day) { 
　　var dd = new Date(date);
　　dd.setDate(dd.getDate() + day);
　　var y = dd.getFullYear();
　　var m = dd.getMonth() + 1 < 10 ? "0" + (dd.getMonth() + 1) : dd.getMonth() + 1;
　　var d = dd.getDate() < 10 ? "0" + dd.getDate() : dd.getDate();
　　return y + "-" + m + "-" + d;
  }

})

function setOption(e,that) {
  let {ovluateList,ovluateDay,mensesList,degree, monthDay,rows,ymdate}=that.data
  console.log('9999',degree, monthDay)
  console.log('8888',mensesList,ovluateList,ovluateDay)
  console.log(ymdate,rows)
 
  var newMonthDay = ymdate
  console.log(newMonthDay,rows)
 newMonthDay.forEach(item=>{
  rows.forEach(val=>{
     if(item.time==val.measureDate){
       item.lhValue = val.lhValue
     }
   })
 })
 let newdegree =[],newtime=[]
 newMonthDay.forEach(item=>{
  newdegree.push(item.lhValue)
  var time = item.time
  // time.split('-')
  // var a = time.substr(5,5)
  newtime.push(time)
 })
  var xstart =0, xend=0
  var date = new Date();
  var now = date.getDate()
  console.log(now)
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
  console.log(PlanStartTime)
  var _PlanStartTime = new Date(PlanStartTime)//x轴最大日期
  let markArea=[]
  // 排卵期
  var ovulatestart='', ovulateend='';
  let list=[]
  ovluateList.forEach(item=>{
    if(item.length>0){ 
      var newl=that.getNextDate(item[item.length-1],1)
      item.push(newl)
      console.log(item)
      var ovulate = item
      var ovu=ovulate[0].split('-')
      var ovul=ovulate[ovulate.length-1].split('-')
      ovulatestart = ovu[1]+'-'+ovu[2]
      ovulateend = ovul[1]+'-'+ovul[2]
      var ovllast = year+'-'+ovulateend
      console.log(ovllast)
      var lastdat = new Date(ovllast)//排卵期最后一天
      // 判断排卵期开始时间是否大于x轴时间
      if(new Date(ovulate[0]).getTime()>_PlanStartTime.getTime()){
        ovulatestart = newtime[newtime.length-1]
        ovulateend = newtime[newtime.length-1]
      }else{
        ovulatestart= ovulate[0]
        // 判断排卵期结束时间是否大于x轴时间
        if(lastdat.getTime()>_PlanStartTime.getTime()){
          console.log(newtime[newtime.length-1])
          ovulateend = newtime[newtime.length-1]
        }else{
          ovulateend = ovulate[ovulate.length-1]
        }
      }
      // obj={start:ovulatestart,end:ovulateend}
      // ovulateList.push(obj)
      console.log('排卵期',ovulatestart,ovulateend)
      list=[{xAxis:ovulatestart,itemStyle:{color:'rgba(91, 172, 23, 0.2)'}},{xAxis:ovulateend}]
      markArea.push(list)
    }
  })
  console.log(markArea)
  
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
      console.log('排卵日',ovdaystart,ovdayend)
      list=[{xAxis:ovdaystart,itemStyle:{color:'rgba(174, 219, 136, 0.2)'}},{xAxis:ovdayend}]
      markArea.push(list)
    }
  })
  console.log(markArea)

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
      console.log('姨妈期',starttime,endtime)
      list=[{xAxis:starttime,itemStyle:{color:'rgba(252, 156, 192, 0.2)'}},{xAxis:endtime}]
      markArea.push(list)
    }
  })
  console.log(markArea)

  var option = {
    color: ["#FF8C8C"],
    legend: {
      top: 50,
      left: 'center',
      // color:'#FF8C8C',
      // backgroundColor: '#FF8C8C',
      z: 100
    },
    grid: {
      // containLabel: true
      x:30,
      y:15,
      x2:10,
      y2:50,
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
      },
      formatter:(params)=>{
        var row = that.data.rows
        console.log(params[0],row)
        let obj = {
          name: params[0].name,
          value: params[0].value,
          id:'',
          degree:''
        };
        row.forEach(val=>{
          console.log(val)
          let time=val.measureTime
          time = time.split(' ')
          // var day = time.split('-')
          // var day1 = day[1]+'-'+day[2]
          if(time[0]==obj.name){
            obj.id=val.id
            obj.degree = val.degree?val.degree:''
            obj.name=val.measureTime,
            obj.date=time[2]
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
        console.log(obj)
        that.setData({tooltip:obj}) 

        var data = obj.name
        let a = data.split(' ')
        let b = a[0].split('-')
        // let c= b[1]+'-'+b[2]+' '+a[1]
        let txt = b[1] + '月'+b[2]+'日'+' '+a[1]+'\n';
        txt+='体温:' + obj.degree+'℃'+'\n';
        txt+='LH值:' + obj.value+'LH'
        return ''
      }
      // position: [0, '-1000%', 0, 0],
      // formatter: params => {
      //   console.log(params[0])
        // var row = that.data.rows
        // let obj = {
        //   name: params[0].name,
        //   value: params[0].value,
        //   id:'',
        //   degree:''
        // };
        // row.forEach(val=>{
        //   let time=val.measureDate
        //   time = time.split(' ')
        //   var day = time[0].split('-')
        //   day = day[1]+'-'+day[2]
        //   console.log(day)
        //   if(day==obj.name){
        //     obj.id=val.id
        //     obj.degree = val.degree?val.degree:''
        //     obj.name=val.measureTime
        //   }
        // })
        // console.log(obj)
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
      min:0,
      max:75,
      splitNumber:15,
      x: 'center',
      type: 'value',
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
      // data: [36.2, 36.3, 37, 36.5, 36.7, 36, 36.8],
      data:newdegree,
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