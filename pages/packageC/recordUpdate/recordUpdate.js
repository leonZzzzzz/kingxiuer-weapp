import { newDate } from '../../../utils/util.js'
import http from '../../../utils/http.js'
const app = getApp()
Page({
  data: {
    intervalDay: 5,
    //每次月经最短天数
    shortPeriod: 28,
    //每次月经最长天数
    longPeriod: 28,
    id: ''
  },
  onLoad(options) {
    this.apiGetUser();
  },
  apiGetUser() {
    http.get(`${app.globalData.url}/user/get.do`, {}, true).then(res => {
      if (res.data.errCode == 0) {
        wx.setStorageSync('config', res.data.content0);
        this.setData({
          id: res.data.content0.id,
          intervalDay: res.data.content0.intervalDay,
          shortPeriod: res.data.content0.shortPeriod,
          longPeriod: res.data.content0.longPeriod
        })
      }
    })
  },
  apiUpdateUser(formData) {
    http.post(`${app.globalData.url}/user/update.do`, formData, true).then(res => {
      if (res.data.errCode == 401) {
        app.login(() => {
          this.apiAddUser(formData)
        });
      } else if (res.data.errCode != 0){
        wx.showToast({
          title: '提交失败，请重试',
          icon: 'none'
        })
      } else {
        wx.showToast({
          title: '设置成功',
          icon:'none'
        })
        setTimeout(function(){
          wx.switchTab({
            url: '../../my/my',
          })
        },1000)
        
      }
    })
  },
  onChangeData(e) {
    console.log(e.detail.value);
    this.setData({
      [e.target.dataset.type]: e.detail.value
    })
  },
  success() {
    if (this.data.intervalDay < 2 || this.data.intervalDay > 15) {
      wx.showToast({
        title: '每次月经天数范围2~15',
        icon: 'none'
      })
      return
    }
    if (this.data.shortPeriod < 15 || this.data.shortPeriod > 90) {
      wx.showToast({
        title: '最短间隔范围15~90',
        icon: 'none'
      })
      return
    }
    if (this.data.longPeriod < 15 || this.data.longPeriod > 90 ) {
      wx.showToast({
        title: '最长间隔范围15~90',
        icon: 'none'
      })
      return
    }
    if (this.data.longPeriod < this.data.shortPeriod) {
      wx.showToast({
        title: '最长周期不能小于最短周期',
        icon: 'none'
      })
      return
    }
    let formData = {
      intervalDay: this.data.intervalDay,
      shortPeriod: this.data.shortPeriod,
      longPeriod: this.data.longPeriod,
      id: this.data.id
    };
    wx.showToast({
      title: '数据提交中',
      icon: "loading"
    })
    this.apiUpdateUser(formData);
  }
})