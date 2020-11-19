// pageCommon/clockout/clockout.js
import http from '../../../utils/http.js'
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imageurl:'https://kingsuer-1255600302.file.myqcloud.com',
    navInfo:[
      {type:"train",name: "训练营"},
      {type:"movement",name: "运动"},
      {type:"diet",name:"饮食"},
      {type:"drink",name:"喝水"},
      {type:"temperature",name:"体温"},
      {type:"weight",name:"体重"}
    ],
    datalist:[],
    clockCategory:'movement',
    showcontent:false,
    trainCamp:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },
    /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getclockList()
    wx.createSelectorQuery().select('#right').boundingClientRect((res)=>{
      console.log(res)
      
    })
  },

  // 获取打卡列表
  getclockList(){
    http.get(`${app.globalData.url}/clock/myClock.do`, {clockCategory:this.data.clockCategory}, true).then(res => {
      if (res.data.errCode == 0) {
        var data=res.data.content0.rows
        console.log(data)
        data.forEach(item=>{
          item.imageurl = item.attachments.split(',')
          item.value=JSON.parse(item.value)
          if(item.category=='diet'){item.name='饮食'}
          else if(item.category=='movement'){item.name='运动'}
          else if(item.category=='drink'){item.name='喝水'}
          else if(item.category=='temperature'){item.name='体温'}
        })
 
        this.setData({
          datalist: data,showcontent:true
        })
        this.getheight()
      }
    })
  },
  getheight(){
    wx.createSelectorQuery().select('#right').boundingClientRect((res)=>{
      console.log(res)
      wx.createSelectorQuery().selectAll('.rightcontent').boundingClientRect((rects)=>{
        rects.forEach(rect=>{
          console.log(rect)
        })
      })
    })
  },
  changeprograma(e){
    console.log(e)
    var type=e.currentTarget.dataset.type
    this.setData({clockCategory:type,datalist:[],showcontent:false})
    if(type=='train'){
      this.getTrainList()
    }else{
      this.getclockList()
    }
    
  },
  // 获取训练营列表
  getTrainList(){
    http.get(`${app.globalData.url}/camp/getMyCamp.do`,{},true).then(res=>{
      if(res.data.content0!=null){
        var trainCamp=res.data.content0.rows
        trainCamp.forEach(item=>{
          item.suggests.forEach(val=>{
            if(val.clockCategory=='movement'){
              val.name='运动'
            }else if(val.clockCategory=='diet'){
              val.name='饮食'
            }else if(val.clockCategory=='drink'){
              val.name='喝水'
            }else if(val.clockCategory=='temperature'){
              val.name='体温'
            }else if(val.clockCategory=='weight'){
              val.name='体重'
            }
          })
        })
        this.setData({trainCamp:res.data.content0.rows,showcontent:true})
        console.log(this.data.trainCamp)
      }else{
        this.setData({trainCamp:[],showcontent:true})
      }
    })
  },
 
  promPunch(){
    // this.setData({showModel:true})
    wx.navigateTo({
      url: '../clockPunch/clockPunch?type='+this.data.clockCategory,
    })
  },
  hidemodel(){
    this.setData({showModel:false})
  },
  // 查看问卷结果
  questResult(e){
    console.log(e)
    wx.navigateTo({
      url: '../quest-result/result?id='+e.currentTarget.dataset.id,
    })
  },

  //预览图片
  preview: function(e){
    var that = this;
    var imgs = e.currentTarget.dataset.imgs;
    var url = e.currentTarget.dataset.url;
    var imgarr=[]
    imgs.forEach(item=>{
      item = that.data.imageurl+item
      imgarr.push(item)
    })
    wx.previewImage({
      current: url, // 当前显示图片的http链接
      urls: imgarr // 需要预览的图片http链接列表
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})