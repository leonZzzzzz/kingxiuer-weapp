
import http from '../../../utils/http.js'
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imagefixed:'https://kingsuer-1255600302.file.myqcloud.com',
    navInfo:[],
    pageNum:1,
    redemodel:false,
    id:'',time:'',
    showcontent:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getprograma()
  },
   /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var navInfo=this.data.navInfo
    var daralist=wx.getStorageSync('daralist')
    var deleteid=wx.getStorageSync('deleteid')
    navInfo.map((item,i)=>{
      if(deleteid){
        if(item.id==deleteid){
          navInfo.splice(i, 1)
        }
      }
      if(item.id==daralist.id){
        item.praiseQuantity=daralist.praiseQuantity
        item.isPraise=daralist.isPraise
        item.newisPraise=daralist.isPraise
        item.readQuantity=daralist.readQuantity
        item.commentQuantity=daralist.commentQuantity
        item.shareQuantity=daralist.shareQuantity
      }
    })
    console.log(navInfo)
    this.setData({navInfo})
    wx.removeStorageSync('daralist')
  },
  // 图片放大
  previewImage(event){
    var current = event.currentTarget.dataset.src;
    var img = event.currentTarget.dataset.img;
    var imgarray=[]
    img.map(item=>{
      item=this.data.imagefixed+item
      imgarray.push(item)
    })
    console.log(imgarray)
    wx.previewImage({
      current: current, // 当前显示图片的http链接
      urls: imgarray// 需要预览的图片http链接列表
    })
  },

  getprograma(){
    http.get(`${app.globalData.url}/article/myArticle.do`,{pageNum:this.data.pageNum},true).then(res=>{
      if(res.data.errCode==0){
        var navInfo = this.data.navInfo
        var row=res.data.content0.rows
        row.map(item=>{
          item.imagelist=item.attachments.split(',')
          navInfo.push(item)
        })
        this.setData({navInfo:navInfo,showcontent:true})
      }
    })
  },
  // 显示删除按钮
  showdelete(e){
    var {id,time}=e.currentTarget.dataset
    this.setData({redemodel:true,id,time})
  },
  // 删除
  deletepost(e){
    var id=e.currentTarget.dataset.id
    wx.showModal({
      title:'确定要删除此文章吗？',
      success:(res)=>{
        if(res.confirm){
          this.getconfirm(id)
        }
      }
    })
  },
  getconfirm(id){
    http.post(`${app.globalData.url}/article/delete.do`,{id},true).then(res=>{
      if(res.data.errCode==0){
        wx.showToast({
          title: '删除成功',
          icon:'none'
        })
        this.setData({redemodel:false,navInfo:[]})
        this.getprograma()
      }
    })
  },
  godetail(e){
    var id=e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../information/mation?id='+id,
    })
  },
  // 点赞
  dianzan(e){
    console.log(e)
    var sourceId=e.currentTarget.dataset.id
    var status=e.currentTarget.dataset.status
    if(status==0){
      wx.showToast({
        title: '此文章未审核，不能点赞',
        icon:'none'
      })
      return
    }
    if(status==2){
      wx.showToast({
        title: '此文章审核不通过，不能点赞',
        icon:'none'
      })
      return
    }
    http.post(`${app.globalData2.url}/api/v1/praise/insert`,{sourceType:7,sourceId:sourceId},true).then(res=>{
      if(res.data.code==20000){
        wx.showToast({
          title: '点赞成功',
          icon:'none'
        })
        var navInfo=this.data.navInfo
        navInfo.map(item=>{
          if(item.id==sourceId){
            item.isPraise=true
            item.newisPraise=true
            item.praiseQuantity+=1
          }
        })
        console.log(navInfo)
        this.setData({navInfo})
        // this.getarticle(this.data.id)
      }
    })
  },
  // 取消点赞
  disdianzan(e){
    var sourceId=e.currentTarget.dataset.id
    var status=e.currentTarget.dataset.status
    if(status==0){
      wx.showToast({
        title: '此文章未审核，不能点赞',
        icon:'none'
      })
      return
    }
    if(status==2){
      wx.showToast({
        title: '此文章审核不通过，不能点赞',
        icon:'none'
      })
      return
    }
    http.post(`${app.globalData2.url}/api/v1/praise/delete`,{sourceType:7,sourceId:sourceId},true).then(res=>{
      if(res.data.code==20000){
        wx.showToast({
          title: '取消点赞',
          icon:'none'
        })
        var navInfo=this.data.navInfo
        navInfo.map((item,index)=>{
          if(item.id==sourceId){
            console.log(item.isPraise)
            item.isPraise=false
            item.newisPraise=false
            item.praiseQuantity-=1
          }
        })
        console.log(navInfo)
        this.setData({navInfo})
        // this.getarticle(this.data.id)
      }
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
    this.data.pageNum++
    this.getprograma()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})