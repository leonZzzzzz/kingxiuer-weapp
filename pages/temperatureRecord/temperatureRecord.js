// pages/recordTemperature/recordTemperature.js
import http from '../../utils/http.js'
import util from '../../utils/util.js'
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    btnLoading: false,
    // 温度
    degree: 37,
    // 日期
    date: '0000-00-00',
    // 当前时间
    toDay: '00-00-00',
    // 时间
    time: '08:00',
    // 所选日期是否是今天
    isToday: false,
    // 是否是现在
    isNow: false,
    // 是否录入体温
    isPost: true,
    data: [],
    type:'insert',
    id:'',
    ymonthDay:[]
  },

  onLoad(options) {
    console.log(options)
    if(options.date){
      var date=new Date();var year=date.getFullYear()
      this.setData({date:options.date,degree:options.temp,time:options.time,id:options.id,type:'updata'})
    }else{
      var oklist=wx.getStorageSync('oklist')
      var okdate = oklist.okdate
      if(okdate){
        let toDay = util.newDate('yyyy-MM-dd'), time = util.newDate('hh:mm')
        var ok = okdate.split(' ')
        this.setData({date:toDay, toDay: toDay,time:time,degree:oklist.degree})
      }else{
        let toDay = util.newDate('yyyy-MM-dd'), time = util.newDate('hh:mm')
        this.setData({
          date: toDay,
          toDay: toDay,
          time: time
        })
      }
      if(options.ymonthDay){
        var ymonthDay = options.ymonthDay.split(',')
        console.log(ymonthDay)
        this.setData({ymonthDay})
      }
      
    }
  },

  // 录入体温接口
  apiInputTemperature(e, flag = 0) {
    let {date,ymonthDay}=this.data
    let a=0
    ymonthDay.forEach(item=>{
      if(item==date){
        a++
      }
    })
    if(a>0){
      wx.showModal({
        content:'温馨小提示：您已经记录过一次体温啦，建议以起床前平躺在床上测量的数据为准哦！',
        confirmText:'保存',
        success:(res)=>{
          if(res.confirm){
            this.savetemp(flag)
          }
        }
      })
    }else{
      this.savetemp(flag)
    }
  },
  savetemp(flag){
    this.setData({
      btnLoading: true
    })
    if (!(this.data.degree >= 35 && this.data.degree <= 41 && this.data.isPost)) {
      wx.showToast({
        title: '正常体温为35~41',
        icon: 'none'
      })
      this.setData({
        btnLoading: false
      })
      return;
    }
    var url='',data={}
    if(this.data.type=='updata'){
      url='/temperature/update.do';
      data={degree:this.data.degree,id:this.data.id}
    }else{
      url='/temperature/insert.do';
      data = {
        degree: this.data.degree,
        measureTime: this.data.date + ' ' + this.data.time,
        flag: flag
      }
    }
    
    http.post(`${app.globalData.url}${url}`, data, true).then(res => {
      if (res.data.errCode == 401) {
        this.setData({
          btnLoading: false
        })
        app.login(() => {
          this.apiInputTemperature()
        });
      } else {
        if (res.data.errCode == 0) {
          var okdate=this.data.date + ' ' + this.data.time
          let oklist={}
          oklist.okdate=okdate
          oklist.degree=this.data.degree
          wx.setStorageSync('oklist', oklist)
          wx.showToast({
            title: '记录成功',
            icon: 'none'
          })
          wx.setStorageSync('recordtem', 1)
          wx.setStorageSync('content0', res.data.content0)
          setTimeout(() => {
            wx.switchTab({
              url: '../temperature/temperature'
            })
          }, 2000)
        } else if (res.data.errCode == 3) {
          this.setData({
            btnLoading: false
          })
          wx.showModal({
            title: '提示',
            content: res.data.errMsg,
            cancelColor: '#555',
            confirmColor: '#cca955',
            success: res => {
              if (res.confirm) {
                this.apiInputTemperature(null, 1)
              }
            }
          })
        } else {
          this.setData({
            btnLoading: false
          })
          wx.showToast({
            title: res.data.errMsg,
            icon: 'none'
          })
          return;
        }
      }
    })
    .catch(() => {
      this.setData({
        btnLoading: false
      })
    })
  },

  // 获取测量温度
  getDegree(e) {
    this.setData({ degree: e.detail.value, isPost: true })
  },

  // 获取测量日期
  bindDateChange(e) {
    this.setData({ date: e.detail.value })
  },

  // 获取测量时间
  bindTimeChange(e) {
    let now = new Date(), choiceTimeStr = this.data.date + ' ' + e.detail.value
    let nowTime = now.getTime(), choiceTime = Date.parse(new Date(choiceTimeStr.replace(/-/g, "/")))
    console.log(choiceTime, nowTime)
    if (choiceTime > nowTime) {
      // 选择时间大于当前时间
      wx.showToast({
        title: '大于当前时间',
        icon: 'none'
      })
      setTimeout(function () {
        wx.hideToast()
      }, 1500)
      return;
    }
    this.setData({ time: e.detail.value })
  }
})
