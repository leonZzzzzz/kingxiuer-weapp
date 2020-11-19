import http from '../../../utils/http.js'
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    iftrain:false,
    surveyId:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.istrain()
  },
  // 是否训练营成员
  istrain(){
    http.get(`${app.globalData.url}/camp/getLatestCamp.do`, {}, true).then(res => {
      if (res.data.errCode == 0) {
        // wx.navigateTo({
        //   url: '../topic/topic?surveyId='+res.data.content0.surveyId,
        // })
        if(res.data.content0==null){
          this.setData({iftrain:false})
        }else{
          if(res.data.content0.isCollect){
            this.setData({iftrain:false,surveyId:res.data.content0.surveyId})
          }else{
            this.setData({iftrain:true})
            wx.navigateTo({
              url: '../topic/topic?surveyId='+res.data.content0.surveyId,
            })
          }
        }
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