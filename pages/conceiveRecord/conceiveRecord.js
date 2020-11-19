
// pages/conceiveRecord/conceiveRecord.js
import http from '../../utils/http.js'
import util from '../../utils/util.js'
const app = getApp();
Page({
  data: {
    btnLoading: false,
    imgUrl: '',
    source: 0,
    // 日期
    date: '0000-00-00',
    // 当前时间
    toDay: '00-00-00',
    // 时间
    time: '08:00',
    stateName: [{ index: 1, state: '阴性' }, { index: 2, state: '弱阳' }, { index: 3, state: '阳性' }, { index: 4, state: '强阳' }, { index: 0, state: '无效' }],
    activeIndex: 1
  },

  onLoad(options) {
    let now = new Date(), year = now.getFullYear(), month = now.getMonth() + 1, day = now.getDate(), time = util.isNeedZero(now.getHours()) + ':' + util.isNeedZero(now.getMinutes());
    let toDay = `${year}-${util.isNeedZero(month)}-${util.isNeedZero(day)}`;
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
    let that = this
    this.setData({
      btnLoading: true,
    })
    wx.uploadFile({
      url: `${app.globalData.url}/attachments/images/tencent_cloud.do`,
      filePath: that.data.imgUrl,
      name: 'file',
      formData: {
        imageType: that.data.source == 1 ? 'ovulate' : 'pregnancy',
        sessionKeyId: wx.getStorageSync('sessionKeyId')
      },
      success: function (res) {
        console.log(res);
        if (res.data.errCode == 401) {
          app.login(() => {
            that.uploadFile()
          });
        } else {
          let img = JSON.parse(res.data);
          if (that.data.source == 1) {
            that.apiAddOvulate(img);
          } else {
            that.apiAddConceive(img);
          }
        }
      }
    })
  },
  // 添加排卵数据
  apiAddOvulate(img, flag = 0) {
    this.setData({
      btnLoading: true,
    })
    let data = {
      type: 1,
      imageUrl: img ? img.imageUrl : '/attachments/assets/img/null.png',
      measureTime: this.data.date + ' ' + this.data.time,
      lhValue: this.data.activeIndex,
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
          // wx.setStorageSync('content0', res.data.content0)
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
  apiAddConceive(img, flag = 0) {
    this.setData({
      btnLoading: true,
    })
    let data = {
      imageUrl: img.imageUrl,
      measureTime: this.data.date + ' ' + this.data.time,
      pregnant: this.data.activeIndex,
      flag: flag
    }
    http.post(`${app.globalData.url}/pregnancy/insert.do`, data, true)
      .then(res => {
        if (res.data.errCode == 401) {
          app.login(() => {
            this.apiAddConceive(img);
          })
        } else if (res.data.errCode == 3) {
          wx.showModal({
            title: '提示',
            content: res.data.errMsg,
            cancelColor: '#555',
            confirmColor: '#cca955',
            success: res => {
              if (res.confirm) {
                this.apiAddConceive(img, 1);
              } else {
                this.setData({
                  btnLoading: false,
                })
              }
            }
          })
        } else if (res.data.errCode === 0) {
          wx.showToast({
            title: '数据记录成功',
            icon: 'none'
          })
          setTimeout(() => {
            wx.switchTab({
              // url: '../conceive/conceive'
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
    this.setData({ activeIndex: e.currentTarget.dataset.index })
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
      return;
    }
    this.setData({ time: e.detail.value })
  },
  // 确认事件
  success() {
    // 判断 如果有图片就走文件上传
    if (this.data.imgUrl) {
      this.uploadFile()
    } else {
      this.apiAddOvulate()
    }
  }
})