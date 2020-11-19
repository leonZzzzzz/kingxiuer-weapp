// pages/Towishing/Towishing.js
import http from '../../utils/http.js'
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    InputValue:'',
    isWishing:false,
    // content:'',
    // 已许愿的内容
    myWishing:''
  },


// 输入时触发
  Binput(value, cursor, keyCode){  
    this.setData({
    InputValue:value.detail.value
    })
  },

// 提交愿望
  subWishing(){
    http.post(`${app.globalData.url}/desire/insert.do`,{content:this.data.InputValue},true).then(res=>{
      console.log(res)
      if(res.data.errCode==0){
      wx.setStorageSync('wishing_status',true)
      wx.navigateTo({
      url:'/pages/wishingTree/wishingTree'
      })
      }
      if(res.data.errCode==1){
        wx.showToast({
          title: res.data.errMsg,
          icon: 'none'
        })
      }
    })
  },
  // 修改愿望
  modWishing(){
    console.log(this.data.InputValue);
    console.log(this.data.content);
    http.post(`${app.globalData.url}/desire/update.do`,{id:this.data.myWishing.id,content:this.data.InputValue},true).then(res=>{
      console.log(res);
      if(res.data.errCode==0){
        wx.showToast({
          title:res.data.content0,
          icon:'none'
        })
        this.isWishing()
      }
    })
    
  },

  // 是否许愿，显示许愿内容
  isWishing(){
    http.get(`${app.globalData.url}/desire/myDesire.do`,{},true).then(res=>{
      // console.log('iswishing',res.data.content0.contentes);  
      if(res.data.content0==null){
        this.setData({
          isWishing:false
        })
      }else{
        console.log(res);
        this.setData({
          isWishing:true,
          myWishing:res.data.content0
        })
      }
    
      
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.isWishing()
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