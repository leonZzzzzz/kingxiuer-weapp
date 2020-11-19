import http from '../../../utils/http.js'
var app = getApp();

const date = new Date()
const nowYear = date.getFullYear()
const nowMonth = date.getMonth() + 1
const nowDay = date.getDate()

let daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
// 根据年月 获取当月的总天数
let getDays = function(year, month) {
    if (month === 2) {
        return ((year % 4 === 0) && ((year % 100) !== 0)) || (year % 400 === 0) ? 29 : 28
    } else {
        return daysInMonth[month-1]
    }
}
// 根据年月日设置当前月有多少天 并更新年月日数组
let getcurrentdate = function (year, month, day, _th){
  let daysNum = year === nowYear && month === nowMonth ? nowDay : getDays(year, month)
  day = day > daysNum ? 1 : day
  let monthsNum = year === nowYear ? nowMonth : 12
  let years = []
  let months = []
  let days = []
  let yearIdx = 9999
  let monthIdx = 0
  let dayIdx = 0

  // 重新设置年份列表
  for (let i = 1950; i <= nowYear; i++) {
      years.push(i)
  }
  years.map((v,idx)=> {
      if (v === year){
          yearIdx = idx
      }
  })
  // 重新设置月份列表
  for (let i = 1; i <= monthsNum; i++) {
      months.push(i)
  }
  months.map((v, idx) => {
      if (v === month) {
          monthIdx = idx
      }
  })
  // 重新设置日期列表
  for (let i = 1; i <= daysNum; i++) {
      days.push(i)
  }
  days.map((v, idx) => {
      if (v === day) {
          dayIdx = idx
      }
  })
  // console.log(yearIdx, monthIdx, dayIdx)
  _th.setData({
      years: years,//年份列表
      months: months,//月份列表
      days: days,//日期列表
      datevalue: [yearIdx, monthIdx, dayIdx],
      year: year,
      month: month,
      day: day,
      
  })
}


Page({

  /**
   * 页面的初始数据
   */
  data: {
    years: [],
    months: [],
    days: [],
    year: nowYear,
    month: nowMonth,
    day: nowDay,

    questionlist:[],
    topic:{},
    imageurl:'https://kingsuer-1255600302.file.myqcloud.com',
    showinput:false,
    testPaperId:'',
    subjectId:'',
    ticket:'',
    subjectQuantity:'',
    sortNumber:'',
    imgurl:'',
    value:'',
    value1:[],
    answer:[],
    questindex:'0',
    preid:'',
    datearray:[],
    region:[],
    scrollTop:'',
    share:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('分享',options)
    getcurrentdate(2000, 1, 1, this)
    var config = wx.getStorageSync('config')
    this.setData({testPaperId:options.id,imgurl:config.imgUrl,share:options.share})
    this.getlist(options.id)
  },

  // 第一题
  getlist(id){
    http.get(`${app.globalData2.url}/api/v1/test-paper/get-first-subject`, {testPaperId:id}, true).then(res => {
      if (res.data.code == 20000) {
        var topic=res.data.data
        topic.preid=''
        var questionlist=this.data.questionlist
        questionlist.push(topic)
        console.log(questionlist)
        this.setData({questionlist,topic,subjectId:topic.id,ticket:topic.ticket,subjectQuantity:topic.subjectQuantity})
      }else{
        wx.showToast({
          title:res.data.message,
          icon:'none'
        })
        if(this.data.share=='share'){
          setTimeout(()=>{
            wx.redirectTo({
              url: '../examlist/list',
            })
          },1000)
          this.setData({share:''})
        }else{
          setTimeout(()=>{
            wx.navigateBack({
              delta:1,
            })
          },1000)
        }
        
      }
    })
  },
  write(){
    this.setData({showinput:true})
  },
  // 获取文本
  gettextanswer(e){
    var {index,preid}=e.currentTarget.dataset
    var {questionlist}=this.data
    if(Number(index+1)<questionlist.length){
      this.setData({region:[]})
      questionlist = questionlist.slice(0,Number(index+1))
    }
    this.setData({questionlist,value:e.detail.value,questindex:index,preid:preid})
  },
  // 获取单选id
  radioChange(e){
    // console.log(e)
    var {index,preid}=e.currentTarget.dataset
    var {questionlist}=this.data
    if(Number(index+1)<questionlist.length){
      this.setData({region:[]})
      questionlist = questionlist.slice(0,Number(index+1))
    }
    this.setData({questionlist,value:e.detail.value,questindex:index,preid:preid})
  },
  // 获取多选id
  checkboxChanges(e){
    var {index,preid}=e.currentTarget.dataset
    var {questionlist}=this.data
    if(Number(index+1)<questionlist.length){
      this.setData({region:[]})
      questionlist = questionlist.slice(0,Number(index+1))
    }
    this.setData({questionlist,value1:e.detail.value,questindex:index})
    // this.setData({questionlist,value:e.detail.value,questindex:index,preid:preid})
  },
  // 获取日期
  dateChange(e) {
    const val = e.detail.value
    var {index,preid}=e.currentTarget.dataset
    var {questionlist}=this.data
    if(Number(index+1)<questionlist.length){
      this.setData({region:[]})
      questionlist = questionlist.slice(0,Number(index+1))
    }
    this.setData({questionlist,questindex:index,preid:preid,datearray:val})
    getcurrentdate(this.data.years[val[0]], this.data.months[val[1]], this.data.days[val[2]], this)
    // this.setData({
    //   year: this.data.years[val[0]],
    //   month: this.data.months[val[1]],
    //   day: this.data.days[val[2]],
    //   isDaytime: !val[3]
    // })
  },
  //获取省市区
  bindRegionChange: function (e) {
    var region = e.detail.value
    var {index,preid}=e.currentTarget.dataset
    var {questionlist}=this.data
    if(Number(index+1)<questionlist.length){
      this.setData({region:[]})
      questionlist = questionlist.slice(0,Number(index+1))
    }
    this.setData({
      questionlist,
      region,
      value:region[0]+'-'+region[1]+'-'+region[2],
      questindex:index
    })
  },
  onPageScroll(e){
    this.setData({scrollTop:e.scrollTop})
  },

  // 获取下一题
  nexttick(){
    var {questionlist,scrollTop,questindex,value1,datearray,years,months,days,topic,testPaperId,subjectId,ticket,value,subjectQuantity,sortNumber,year,month,day}=this.data
    console.log(value1,value)
    console.log(questionlist)
    var answer=[]
    // if(Number(questindex)>0){
      var type=questionlist[questionlist.length-1].type
      if(type=='birth_ym'){
        month = month<10?'0'+month:month
        day = day<10?'0'+day:day
        var date = year+'-'+month+'-'+day
        answer.push(date)
      }else{
        if(value1.length==0&&value==""){
          wx.showToast({
            title: '答案不能为空',
            icon:'none'
          })
          return
        }
        if(value1.length>0){
          answer=value1
        }else{
          answer.push(value)
        }
        // if(typeof value=='object'){
        //   answer=value
        // }else{
        //   answer.push(value)
        // }
      }
    // }else{
    //   if(topic.type=='birth_ym'){
    //     month = month<10?'0'+month:month
    //     day = day<10?'0'+day:day
    //     var date = year+'-'+month+'-'+day
    //     answer.push(date)
    //   }else{
    //     if(typeof value=='object'){
    //       answer=value
    //     }else{
    //       answer.push(value)
    //     }
    //   }
    // }
    
    var params={}
    if(Number(questindex)>0){
      params={testPaperId,subjectId:questionlist[questionlist.length-1].id,ticket,answer}
    }else if(Number(questindex)==0){
      params={testPaperId,subjectId:questionlist[0].id,ticket,answer}
    }
      
    http.post(`${app.globalData2.url}/api/v1/ks-test-paper/get-next-subject`, {json:JSON.stringify(params)}, true).then(res => {
      this.setData({value:'',value1:[],answer:[]})
      if (res.data.code == 20000) {
        var query = wx.createSelectorQuery();
        query.select('#all').boundingClientRect(function (rect) {
          var height=rect.height
          wx.pageScrollTo({
            scrollTop: height
          })
        }).exec();
        
        // if(subjectQuantity==sortNumber){
        if(res.data.message=='答题完毕'){
          wx.showToast({
            title: '答题完毕',
          })
          setTimeout(()=>{
            wx.redirectTo({
              url: '../detection/detection?ticket='+ticket,
            })
          },1000)
        }else{
          this.setData({topic:{},value:'',showinput:false})
          var topic=res.data.data
          topic.preid=subjectId
          var questionlist=this.data.questionlist
          questionlist.push(topic)
          console.log(questionlist)
          this.setData({questionlist,topic,subjectId:topic.id,sortNumber:topic.sortNumber})
        }
      }else{
        wx.showToast({
          title: res.data.message,
          icon:'none'
        })
      }
      if(datearray.length==0){
        getcurrentdate(2000, 1, 1,this)
      }else{
        getcurrentdate(years[datearray[0]], months[datearray[1]], days[datearray[2]], this)
      }
    })
  },


  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})