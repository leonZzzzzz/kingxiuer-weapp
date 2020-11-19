import { newDate } from '../../utils/util.js'
import http from '../../utils/http.js'
const app = getApp()
Page({
  data: {
    step: 1,
    mobile: '',
    // 生日
    birth: '2000-01',
    // 最近一次经期
    recentMenstrual: '',
    //两次月经间隔天数
    intervalDay: 5,
    //每次月经最短天数
    shortPeriod: 28,
    //每次月经最长天数
    longPeriod: 28,
    toDay: '',
    theMonth: '',
    mobileData: {},
    user: {},
    showModel: false,
    userType: '3'
  },
  onshow(){
    
    
  },
  onLoad(options) {
    this.setData({
      mobile: options.mobile || '',
      userType: wx.getStorageSync('userType'),
      theMonth: newDate('yyyy-MM'),
      toDay: newDate('yyyy-MM-dd'),
      // birth: newDate('yyyy-MM'),
      recentMenstrual: newDate('yyyy-MM-dd'),
      mobileData: wx.getStorageSync('mobileData')
    })
  },
  fastRegister(formData) {
    wx.showLoading({
      title: '数据提交中',
      icon: "loading"
    })
    http.post(`${app.globalData.url}/loginSmallProgram.do`, formData, true).then(res => {
      if (res.data.errCode == 401) {
        app.login(() => {
          this.fastRegister(formData)
        });
      } else if (res.data.errCode != 0) {
        wx.hideLoading()
        wx.showToast({
          title: '登录失败，请重试',
          icon: 'none'
        })
      } else {
        wx.hideLoading()
        wx.showToast({title: '登录成功', icon: 'none'})
        wx.setStorageSync('userType', '3')
        this.setData({
          userType: '3'
        })
        wx.switchTab({
          url: '../calendar/calendar',
        })
      }
    })
  },
  apiAddUser(formData) {
    http.post(`${app.globalData.url}/user/insert.do`, formData, true).then(res => {
      if (res.data.errCode == 401) {
        app.login(() => {
          this.apiAddUser(formData)
        });
      } else if (res.data.errCode != 0) {
        wx.showToast({
          title: '提交失败，请重试',
          icon: 'none'
        })
      } else {
        if (res.data.content0 && res.data.content0.user) {
          app.globalData.userInfo = res.data.content0.user
        }
        if (this.data.userType == '1') {
          wx.setStorageSync('userType', '2')
        }
        wx.switchTab({
          url: '../calendar/calendar',
        })
      }
    })
  },
  onChangeData(e) {
    console.log(e.detail.value);
    this.setData({
      [e.target.dataset.type]: e.detail.value
    })
  },
  perv() {
    this.setData({
      step: this.data.step -= 1
    })
  },
  next() {
    this.setData({
      step: this.data.step += 1
    })
  },
  getUserInfo(e) {
    console.log(e);
    wx.getUserInfo({
      lang:"zh_CN",
      success: (res) => {
        console.log(res)
        if (res.userInfo) return
        wx.setStorageSync('userInfo',res.userInfo)
        app.globalData.userInfo = res.userInfo
        this.setData({
          showModel: false,
          user: app.globalData.userInfo
        })
      }
  })
    // if (e.detail.userInfo) {
    //   app.globalData.userInfo = e.detail.userInfo
    //   this.setData({
    //     showModel: false,
    //     user: app.globalData.userInfo
    //   })
    // }
  },
  onCancel(e) {
    console.log(e)
    this.setData({
      showModel: false
    })
  },
  success(e) {
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
    if (this.data.longPeriod < 15 || this.data.longPeriod > 90) {
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
    if (e.detail.userInfo) {
      app.globalData.userInfo = e.detail.userInfo
    }
    let formData = {
      nickName: app.globalData.userInfo.nickName || '',
      imgUrl: app.globalData.userInfo.avatarUrl || '',
      intervalDay: this.data.intervalDay,
      shortPeriod: this.data.shortPeriod,
      longPeriod: this.data.longPeriod,
      birth: this.data.birth,
      recentMenstrual: this.data.recentMenstrual,
    };
    if (this.data.mobile != 0 && this.data.mobile !== '1') {
      formData.mobile = this.data.mobile
    }
    // console.log(formData)
    // this.apiAddUser(formData)
    // return

    if (this.data.userType == '1' && this.data.mobile !== '1') {
      formData = Object.assign(formData, this.data.mobileData)
      console.log(formData)
      this.fastRegister(formData)
    } else {
      console.log(formData)
      this.apiAddUser(formData)
    }
  }
})