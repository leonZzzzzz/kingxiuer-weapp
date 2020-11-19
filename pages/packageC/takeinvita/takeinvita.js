import http from '../../../utils/http.js'
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    codeId:'',
    code:'',
    nickName:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('邀请人信息',options)
    this.setData({codeId:options.codeId,code:options.code,nickName:options.nickName})
    this.getsession()
  },
  // 获取session
  getsession(){
    http.get(`${app.globalData.url}/authorize.do`, {code:login.code}, true).then(res => {
      if (res.data.errCode == 0) {
        wx.setStorageSync('sessionId', res.data.content0.sessionId)
      }
    })
  },
  getcode(e){
    this.setData({code:e.detail.value})
  },
  // 确定
  confirm(){
    wx.login({
      success: rej => {
        http.get(`${app.globalData.url}/invitation/auth.do`, {code:rej.code,inviteCode:this.data.code,inviteId:this.data.codeId}, true).then(res=> {
          if (res.data.errCode == 0) {
            wx.setStorageSync('sessionKeyId', res.data.content0.sessionKeyId)
            wx.setStorageSync('userType', res.data.content0.userType)
            wx.setStorageSync('config', res.data.content0.user)
            wx.setStorageSync('loginType', 0)
            wx.showToast({
              title: '确认成功',
            })
            setTimeout(()=>{
              wx.switchTab({
                url: '../../calendar/calendar',
              })
            },1000)
            
          }else{
            wx.showToast({
              title: res.data.errMsg,
              icon:'none'
            })
          }
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