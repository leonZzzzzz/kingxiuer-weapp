import http from '../../../utils/http.js'
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imageurl:'https://kingsuer-1255600302.file.myqcloud.com',
    public:[],
    textrecord:[],
    pageNum:1,
    choose:1,
    pageNum1:1,
    showload:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function (options) {
    this.setData({textrecord:[],public:[],pageNum:1,pageNum1:1})
    this.getList()
    this.getresult()
  },
  // 问卷列表
  getList(){
    http.get(`${app.globalData2.url}/api/v1/test-paper/page`, {pageNum:this.data.pageNum,pageSize:20}, true).then(res => {
      if (res.data.code == 20000) {
        var list = res.data.data.list
        var aaa=this.data.public
        list.forEach(item=>{
          aaa.push(item)
        })
        this.setData({public:aaa,showload:true})
      }
    })
  },
  // 测试记录
  getresult(){
    http.get(`${app.globalData2.url}/api/v1/test-paper-answer/page`, {pageNum:this.data.pageNum1,pageSize:20}, true).then(res => {
      if(res.data.code==20000){
        var list=res.data.data.list
        var bbb=this.data.textrecord
        list.forEach(item=>{
          bbb.push(item)
        })
        this.setData({textrecord:bbb,showload:true})
      }
    })
  },
  changeprograma(e){
    var type=e.currentTarget.dataset.type
    this.setData({choose:type,public:[],textrecord:[],pageNum:1,pageNum1:1,showload:false})
    if(type==1){
      this.getList()
    }else{
      this.getresult()
    }
  },
  // 去测试
  goskill(e){
    var id=e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../evaluation/evaluation?id='+id,
    })
  },
  // 看结果
  goConse(e){
    var id=e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../detection/detection?id='+id,
    })
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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
    if(this.data.choose==1){
      this.data.pageNum++
      this.getList()
    }else if(this.data.choose==2){
      this.data.pageNum1++
      this.getresult()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})