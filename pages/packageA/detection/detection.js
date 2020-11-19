import http from '../../../utils/http.js'
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imageurl: 'https://kingsuer-1255600302.file.myqcloud.com/',
    content:{},
    testPaperId:'',
    description:'',
    analysis:[],
    jieguo:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.id){
      this.goresult(options.id)
    }
    if(options.ticket){
      this.getlist(options.ticket)
    }
  },
  getlist(ticket){
    http.get(`${app.globalData2.url}/api/v1/test-paper/get-answer`, {ticket}, true).then(res => {
      if (res.data.code == 20000) {
        if(res.data.data){
          this.setData({content:res.data.data,testPaperId:res.data.data.testPaperId,description:res.data.data.description})
          this.getxuanxiang(res.data.data.id)
          this.getjieguo(res.data.data.id)
        }else{
          this.getlist(ticket)
        }
      }
    })
  },
  goresult(id){
    http.get(`${app.globalData2.url}/api/v1/test-paper-answer/get`, {id}, true).then(res => {
      if (res.data.code == 20000) {
        this.setData({content:res.data.data,testPaperId:res.data.data.testPaperId,description:res.data.data.description})
        this.getxuanxiang(res.data.data.id)
        this.getjieguo(res.data.data.id)
      }
    })
  },
  // 获取选项点评
  getxuanxiang(id){
    http.get(`${app.globalData2.url}/api/v1/ks-test-paper-answer/getDetail`,{id},true).then(res=>{
    // http.get(`${app.globalData2.url}/api/v1/ks-test-paper-analysis/get`,{testPaperAnswerId:id},true).then(res=>{
      var analysis=res.data.data.answerList
      analysis.forEach(item=>{
        var a=0
        item.options.forEach(val=>{
          if(val.checked){
            a++
            item.num=a
          }
        })
      })
      console.log(analysis)
      this.setData({analysis})
    })
  },
  getjieguo(id){
    http.get(`${app.globalData2.url}/api/v1/ks-test-paper-analysis/get`,{testPaperAnswerId:id},true).then(res=>{
      var data=res.data.data
      this.setData({jieguo:data})
    })
  },
  testagain(){
    wx.redirectTo({
      url: '../evaluation/evaluation?id='+this.data.testPaperId,
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
  onShareAppMessage: function (options) {
    var that = this;
    　　// 设置转发内容
    　　var shareObj = {
    　　　　title:that.data.description ,
    　　　　path: '/pages/packageA/evaluation/evaluation?id='+this.data.testPaperId, // 默认是当前页面，必须是以‘/’开头的完整路径
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
            shareObj.title=that.data.description
            shareObj.path = '/pages/packageA/evaluation/evaluation?id='+this.data.testPaperId+'&share=share';
    　　}
    　　// 返回shareObj
    　　return shareObj;
  }
})