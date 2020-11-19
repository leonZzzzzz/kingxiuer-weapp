// pages/adress/adress.js
import http from '../../../utils/http.js'
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    region: ['', '', '']
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  bindRegionChange: function (e) {
    this.setData({
      region: e.detail.value
    })
  },
  confirm(){
    var region = this.data.region
    if(!region[0]){
      wx.showToast({
        title: '请选择省市区',
        icon:'none'
      })
      return
    }
    var location = region[0]+'-'+region[1]+'-'+region[2]
    var config = wx.getStorageSync('config')
    this.apiUpdateUser(config.remind?config.remind:'1',config.id,location)
  },
  apiUpdateUser(remind, id,location) {
    http.post(`${app.globalData.url}/user/update.do`, {
      remind,
      id,
      location
    }, true).then(res => {
      wx.switchTab({
        url: '../../calendar/calendar',
      })
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