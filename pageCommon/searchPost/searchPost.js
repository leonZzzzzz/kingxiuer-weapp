
import http from '../../utils/http.js'
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imagefixed:'https://kingsuer-1255600302.file.myqcloud.com',
    navInfo:[],
    sessList:[],
    pageNum:1,
    redemodel:false,
    id:'',time:'',
    showcontent:false,
    content:'',
    showlanmu:false
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
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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
   /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var navInfo=this.data.navInfo
    var daralist=wx.getStorageSync('daralist')
    console.log(daralist)
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
  getinput(e){
    console.log(e)
    this.setData({content:e.detail.value})
  },
  // 搜索
  searchcontent(){
    this.setData({navInfo:[],pageNum:1,showlanmu:true})
    this.getarticle(this.data.id)
    this.getprograma()
  },
  // 栏目列表
  getprograma(){
    http.get(`${app.globalData.url}/column/list.do`,{},true).then(res=>{
      if(res.data.errCode==0){
        var sessList=res.data.content0.rows
        sessList.unshift({name:'全部',iconUrl:'/attachments/null/ac10100d72e4dc4b0172e51e036a0041.png',id:''})
        this.setData({sessList:res.data.content0.rows})
      }
    })
  },
  // 切换栏目
  changeprograma(e){
    var id=e.currentTarget.dataset.id
    this.setData({id,navInfo:[],showcontent:false,pageNum:1})
    this.getarticle(id)
  },
  // 文章列表
  getarticle(id){
    http.get(`${app.globalData.url}/article/page.do`,{columnId:id?id:'',pageNum:this.data.pageNum,content:this.data.content,pageSize:20},true).then(res=>{
      if(res.data.errCode==0){
        wx.stopPullDownRefresh() //停止下拉刷新
        var navInfo = this.data.navInfo
        var data = res.data.content0.rows
        data.map(item=>{
          if(item.attachments!=''){
            item.imagelist=item.attachments.split(',')
          }else{
            item.imagelist=[]
          }
          navInfo.push(item)
        })
        this.setData({navInfo,showcontent:true})
      }
    })
  },
  // getprograma(){
  //   http.get(`${app.globalData.url}/article/myArticle.do`,{pageNum:this.data.pageNum},true).then(res=>{
  //     if(res.data.errCode==0){
  //       var navInfo = this.data.navInfo
  //       var row=res.data.content0.rows
  //       row.map(item=>{
  //         item.imagelist=item.attachments.split(',')
  //         navInfo.push(item)
  //       })
  //       this.setData({navInfo:navInfo,showcontent:true})
  //     }
  //   })
  // },
  // 显示删除按钮
  showdelete(e){
    var {id,time}=e.currentTarget.dataset
    this.setData({redemodel:true,id,time})
  },
  
  godetail(e){
    var id=e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../../pages/packageA/information/mation?id='+id,
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
  // 取消搜索
  deletesearch(){
    this.setData({content:''})
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
    this.getarticle()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})