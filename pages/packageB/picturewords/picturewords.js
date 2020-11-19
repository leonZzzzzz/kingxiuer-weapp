import http from '../../../utils/http.js'
var WxParse = require('../../../wxParse/wxParse.js');
import {formatRichText } from '../../../utils/util.js'
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    datalist:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading()
    this.getdetail(options.id)
  },
  // 详情
  getdetail(id){
    http.get(`${app.globalData2.url}/api/v1/singleContent/get`,{id},true).then(res=>{
      wx.hideLoading()
      if(res.data.code==20000){
        var datalist = res.data.data
        datalist.content = formatRichText(datalist.content)
        this.setData({datalist})

        // var sessList=res.data.content0.rows
        // sessList.unshift({name:'全部',iconUrl:'/attachments/null/ac10100d72e4dc4b0172e51e036a0041.png',id:''})
        // this.setData({sessList:res.data.content0.rows})
      }else{
        wx.showToast({
          title: res.data.message,
          icon:'none'
        })
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