// pages/forum/forum.js
import http from '../../utils/http.js'
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navInfo:[],
    imagefixed:'https://kingsuer-1255600302.file.myqcloud.com',
    swiperlist:[],
    essaylist:[],
    id:'',
    page:1,
    showcontent:false,
    content:'',
    showscroll:false,
  },

  conference(){
    wx.navigateTo({
      url: '../packageA/newinfor/newinfor?id='+this.data.id,
    })
  },
  gowrite(){
    wx.navigateTo({
      url: '../packageA/newinfor/newinfor?id='+this.data.id,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({id:'',essaylist:[],showcontent:false,page:1})
    this.getprograma()
    
    // var onshow=wx.getStorageSync('onshow')
    // if(onshow&&onshow=='onshow'){
      
    // }else{
    //   this.getarticle()
    // }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var essaylist=this.data.essaylist
    var daralist=wx.getStorageSync('daralist')
    var deleteid=wx.getStorageSync('deleteid')
    
    essaylist.map((item,i)=>{
      if(deleteid){
        if(item.id==deleteid){
          essaylist.splice(i, 1)
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
    this.setData({essaylist})
    wx.removeStorageSync('daralist')
    wx.showLoading()
    this.getswiper()
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
  // 获取轮播图
  getswiper(){
    http.get(`${app.globalData.url}/carousel/list.do`,{},true).then(res=>{
      wx.hideLoading()
      if(res.data.errCode==0){
        this.setData({swiperlist:res.data.content0.rows})
      }
    })
  },
  // 栏目列表
  getprograma(){
    http.get(`${app.globalData.url}/column/list.do`,{},true).then(res=>{
      wx.hideLoading()
      if(res.data.errCode==0){
        var navInfo=res.data.content0.rows
        console.log(navInfo[0].id)
        // navInfo.unshift({name:'全部',iconUrl:'/attachments/null/ac10100d72e4dc4b0172e51e036a0041.png',id:''})
        this.setData({navInfo,id:navInfo[0].id})
        this.getarticle(navInfo[0].id)
      }
    })
  },
  getinput(e){
    this.setData({content:e.detail.value})
  },
  // 搜索
  searchcontent(){
    this.setData({essaylist:[],page:1})
    this.getarticle(this.data.id)
  },
  // 文章列表
  getarticle(id){
    http.get(`${app.globalData.url}/article/page.do`,{columnId:id?id:'',pageNum:this.data.page,content:this.data.content,pageSize:20},true).then(res=>{
      if(res.data.errCode==0){
        wx.stopPullDownRefresh() //停止下拉刷新
        var essaylist = this.data.essaylist
        var data = res.data.content0.rows
        if(data.length==0){
          wx.showToast({
            title: '数据加载完毕',
            icon:'none'
          })
          return
        }
        data.map(item=>{
          // item.content= item.content.replace(/\n/g,'\\n')
          if(item.attachments!=''){
            item.imagelist=item.attachments.split(',')
          }else{
            item.imagelist=[]
          }
          essaylist.push(item)
        })
        this.setData({essaylist,showcontent:true})
      }
    })
  },
  // 切换栏目
  changeprograma(e){
    var id=e.currentTarget.dataset.id
    this.setData({id,essaylist:[],showcontent:false,page:1})
    this.getarticle(id)
  },
  // 点赞
  dianzan(e){
    var sourceId=e.currentTarget.dataset.id
    http.post(`${app.globalData2.url}/api/v1/praise/insert`,{sourceType:7,sourceId:sourceId},true).then(res=>{
      if(res.data.code==20000){
        wx.showToast({
          title: '点赞成功',
          icon:'none'
        })
        var essaylist=this.data.essaylist
        essaylist.map(item=>{
          if(item.id==sourceId){
            item.isPraise=true
            item.newisPraise=true
            item.praiseQuantity+=1
          }
        })
        console.log(essaylist)
        this.setData({essaylist})
        // this.getarticle(this.data.id)
      }
    })
  },
  // 取消点赞
  disdianzan(e){
    var sourceId=e.currentTarget.dataset.id
    http.post(`${app.globalData2.url}/api/v1/praise/delete`,{sourceType:7,sourceId:sourceId},true).then(res=>{
      if(res.data.code==20000){
        wx.showToast({
          title: '取消点赞',
          icon:'none'
        })
        var essaylist=this.data.essaylist
        essaylist.map((item,index)=>{
          if(item.id==sourceId){
            console.log(item.isPraise)
            item.isPraise=false
            item.newisPraise=false
            item.praiseQuantity-=1
          }
        })
        console.log(essaylist)
        this.setData({essaylist})
        // this.getarticle(this.data.id)
      }
    })
  },
  goxiangq(e){
    var id=e.currentTarget.dataset.id
    var type=e.currentTarget.dataset.type
    // var skip=e.currentTarget.dataset.skip
    // if(skip){
    //   wx.navigateTo({
    //     url: '../packageB/picturewords/picturewords?id='+id,
    //   })
    // }
    if(type=='graphic'){
      wx.navigateTo({
        url: '../packageB/picturewords/picturewords?id='+id,
      })
    }else if(type=='program'){
      http.get(`${app.globalData.url}/skipProgram/get.do`,{id:id},true).then(res=>{
        wx.navigateToMiniProgram({
          appId: res.data.content0.appId,
          path: res.data.content0.skipUrl,
          envVersion: 'release',// 打开正式版
          success(res) {
              // 打开成功
          },
          fail: function (err) {
            // console.log(err);
          }
        })
      })
    }
  },
  gosearch(){
    wx.navigateTo({
      url: '../../pageCommon/searchPost/searchPost',
    })
  },
  godetail(e){
    var id=e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../packageA/information/mation?id='+id,
    })
  },
  // 转发接口
  transmit(){
    var id = this.data.id
    http.post(`${app.globalData2.url}/api/v1/share/insert`,{sourceType:9,sourceId:id,url:'/pages/forum/forum'},true).then(res=>{
      if(res.data.code==20000){
        wx.showToast({
          title: '取消点赞',
          icon:'none'
        })
      }
    })
  },
  onPageScroll(e){
    if(e.scrollTop>=100){
      this.setData({showscroll:true})
    }else{
      this.setData({showscroll:false})
    }
  },
  // 回到顶部
  backscrolltop(){
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: 0
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
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
    // wx.showNavigationBarLoading()
    this.setData({essaylist:[],page:1,showcontent:false})
    this.getarticle(this.data.id)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.data.page++;
    this.getarticle(this.data.id)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    this.transmit()
    // return {
    //   title: '论坛', //转发的标题。当前小程序名称
    //   path: `pages/forum/forum`, //转发的路径
    //   imageUrl: '',//自定义图片路径 支持PNG及JPG。显示图片长宽比是 5:4。
    //   success: function (res) {
    //     console.log(res)
    //   },
    //   fail: function (res) {
    //     console.log(res)
    //   }
    // }
  }
})