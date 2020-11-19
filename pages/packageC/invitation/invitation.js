import http from '../../../utils/http.js'
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imageURL:'https://kingsuer-1255600302.file.myqcloud.com',
    sessionKeyId:'',
    config:{},
    code:'',
    mobile:'',
    nickName:'',
    codeId:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var sessionKeyId = wx.getStorageSync('sessionKeyId')
    var config = wx.getStorageSync('config')
    this.setData({sessionKeyId,config})
    this.createCode(sessionKeyId,config)
  },
  // 生成邀请码
  createCode(sessionKeyId,config){
    http.post(`${app.globalData.url}/invitation/insert.do`, {sessionKeyId,uid:config.id}, false).then(res => {
      if (res.data.errCode == 0) {
        this.setData({
          code: res.data.content0.code,
          mobile: res.data.content0.mobile,
          nickName: res.data.content0.nickName,
          codeId: res.data.content0.id,
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
  onShareAppMessage: function( options ){
    　　var that = this;
    　　// 设置转发内容
    　　var shareObj = {
    　　　　title: "备孕不是一个人的事，赶紧邀请老公一起来吧！",
    　　　　path: '/pages/packageC/takeinvita/takeinvita', // 默认是当前页面，必须是以‘/’开头的完整路径
    　　　　imgUrl: '', //转发时显示的图片路径，支持网络和本地，不传则使用当前页默认截图。
    　　　　success: function(res){　 // 转发成功之后的回调　　　　　
    　　　　　　if(res.errMsg == 'shareAppMessage:ok'){
    　　　　　　}
    　　　　},
    　　　　fail: function(){　// 转发失败之后的回调
    　　　　　　if(res.errMsg == 'shareAppMessage:fail cancel'){
    　　　　　　　　// 用户取消转发
    　　　　　　}else if(res.errMsg == 'shareAppMessage:fail'){
    　　　　　　　　// 转发失败，其中 detail message 为详细失败信息
    　　　　　　}
    　　　　},
    　　　　complete: function(){
    　　　　　　// 转发结束之后的回调（转发成不成功都会执行）
    　　　　}
    　　};
    　　// 来自页面内的按钮的转发
    　　if( options.from == 'button' ){
    　　　　var dataid = options.target.dataset; //上方data-id=shareBtn设置的值
    　　　　// 此处可以修改 shareObj 中的内容
    　　　　shareObj.path = '/pages/packageC/takeinvita/takeinvita?codeId='+this.data.codeId+'&code='+this.data.code+'&nickName='+this.data.nickName;
    　　}
    　　// 返回shareObj
    　　return shareObj;
    }
})