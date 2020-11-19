// pages/conceiveRecord/conceiveRecord.js
import http from '../../utils/http.js'
import util from '../../utils/util.js'
const app = getApp();
Page({
  data: {
    imageURL:'https://kingsuer-1255600302.file.myqcloud.com',
    btnLoading: false,
    imgUrl: '',
    source: 0,
    // 日期
    date: '0000-00-00',
    // 当前时间
    toDay: '00-00-00',
    // 时间
    time: '08:00',
    activeIndex: 5,
    stateName: [5, 10, 25, '26~44', 45, '46~64', 65, '>65']
  },

  onLoad: function (options) {
    let toDay = util.newDate('yyyy-MM-dd'), time = util.newDate('hh:mm')
    this.setData({
      imgUrl: options.imgUrl,
      source: options.source,
      date: toDay,
      toDay: toDay,
      time: time
    })
  },

  // 上传图片
  uploadFile() {
    let that = this;
    this.setData({
      btnLoading: true,
    })
    wx.uploadFile({
      url: `${app.globalData.url}/attachments/images/tencent_cloud.do`,
      filePath: that.data.imgUrl,
      name: 'file',
      formData: {
        imageType: 'ovulate',
        sessionKeyId: wx.getStorageSync('sessionKeyId')
      },
      success: function (res) {
        console.log('上传成功了吗？', res)
        let img = JSON.parse(res.data)
        that.apiAddOvulate(img)
      }
    })
  },
  apiAddOvulate(img, flag = 0) {
    this.setData({
      btnLoading: true,
    })
    let activeIndex = this.data.activeIndex
    if (this.data.activeIndex == '>65') {
      activeIndex = 66
    } else if (this.data.activeIndex == '26~44') {
      activeIndex = 35
    } else if (this.data.activeIndex == '46~64') {
      activeIndex = 55
    }
    let data = {
      type: 2,
      imageUrl: img ? img.imageUrl : '/attachments/assets/img/null.png',
      measureTime: this.data.date + ' ' + this.data.time,
      lhValue: activeIndex,
      flag: flag
    }
    http.post(`${app.globalData.url}/ovulate/insert.do`, data, true)
      .then(res => {
        if (res.data.errCode == 401) {
          app.login(() => {
            this.apiAddOvulate(img);
          })
        } else if (res.data.errCode == 3) {
          wx.showModal({
            title: '提示',
            content: res.data.errMsg,
            cancelColor: '#555',
            confirmColor: '#cca955',
            success: res => {
              if (res.confirm) {
                this.apiAddOvulate(img, 1);
              } else {
                this.setData({
                  btnLoading: false,
                })
              }
            }
          })
        } else if (res.data.errCode === 0){
          wx.showToast({
            title: '数据记录成功',
            icon: 'none'
          })
          if(res.data.content0.updateOrNo){
            // wx.setStorageSync('measureTime', this.data.date)
            wx.setStorageSync('content0', res.data.content0)
          }
          
          setTimeout(() => {
            wx.switchTab({
              url: '../ovulation/ovulation'
            })
          }, 1000)
        } else {
          this.setData({
            btnLoading: false,
          })
        }
      });
  },
  activeState(e) {
    console.log(e);
    this.setData({ activeIndex: e.target.dataset.index })
  },
  // 获取测量日期
  getDateChange(e) {
    this.setData({ date: e.detail.value })
  },

  // 获取测量时间
  getTimeChange(e) {
    let now = new Date(), choiceTimeStr = this.data.date + ' ' + e.detail.value
    let nowTime = now.getTime(), choiceTime = Date.parse(new Date(choiceTimeStr.replace(/-/g, "/")))
    if (choiceTime > nowTime) {
      // 选择时间大于当前时间
      wx.showToast({
        title: '大于当前时间',
        icon: 'none'
      })
      return
    }
    this.setData({ time: e.detail.value })
  },
  success() {
    if (this.data.imgUrl) {
      this.uploadFile()
    } else {
      this.apiAddOvulate();
    }
  }
})