import http from '../../../utils/http.js'
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imageurl:'https://kingsuer-1255600302.file.myqcloud.com',
    content:{},
    answer:[],
    punch:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    http.get(`${app.globalData2.url}/api/v1/ksMemberSurvey/getMemberResult`,{surveyId:options.id},true).then(res=>{
      if(res.data.errCode==0){
        var content=res.data.content0.survey
        var answer=res.data.content0.answer
        // content.questionList.forEach(val=>{
        //   if(val.optionList!=null&&val.optionList.length>0){
        //     val.optionList.forEach(can=>{
        //       can.percent=((can.chooseNum/content.joinNum)*100).toFixed(0)
        //       can.num=((can.chooseNum/content.joinNum)*100).toFixed(2)
        //     })
        //   }
        // })
        this.setData({content,answer})
        // this.getreview(options.id)
      }else{
        wx.showToast({
          title: res.data.msg,
          icon:'none'
        })
        setTimeout(()=>{
          wx.navigateBack({delta:1})
        },2000)
      }
      // this.setData({trainCamp:res.data.content0.rows,showcontent:true})
    })
  },
  getreview(id){
    http.get(`${app.globalData2.url}/api/v1/ksMemberSurvey/getReviews`,{surveyId:id},true).then(res=>{
      this.setData({punch:res.data.content0.content})
      // this.setData({trainCamp:res.data.content0.rows,showcontent:true})
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