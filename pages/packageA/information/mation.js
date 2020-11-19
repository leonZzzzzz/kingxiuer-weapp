import http from '../../../utils/http.js'
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imageurl:'https://kingsuer-1255600302.file.myqcloud.com',
    shownote:false,
    showreplay:false,
    redemodel:false,
    daralist:{},
    comment:[],
    dianzanlist:[],
    content:'',
    id:'',
    sourceId:'',
    config:{},
    type:'',
    commonmemberId:'',
    deletenone:true,
    replay:false,
    parsourceid:'',
    valid:'',
    showdelete:false,
    pageNum:'1'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log('options',options)
    var config=wx.getStorageSync('config')
    this.setData({id:options.id,config})
    this.getdetail(options.id)
    this.getpinlun(options.id,1)
    this.getdianzan(options.id)
  },
  // 获取详情
  getdetail(id){
    http.get(`${app.globalData.url}/article/getDetail.do`,{id},true).then(res=>{
      if(res.data.errCode==0){
        var daralist = res.data.content0
        daralist.imagelist=daralist.attachments.split(',')
        // console.log(daralist.userId,this.data.config.id)
        if(daralist.userId==this.data.config.id){
          this.setData({showdelete:true})
        }else{
          this.setData({showdelete:false})
        }
        this.setData({daralist:daralist})
      }
    })
  },
  // 评论列表
  getpinlun(id){
    http.get(`${app.globalData2.url}/api/v1/comment/page`,{sourceId:id,auditStatus:2,pageNum:this.data.pageNum},true).then(res=>{
      if(res.data.code==20000){
        var comment=this.data.comment
        var list = res.data.data.list
        list.forEach(item=>{
          comment.push(item)
        })
        this.setData({comment})
      }
    })
  },
  // 点赞列表
  getdianzan(id){
    http.get(`${app.globalData2.url}/api/v1/praise/page`,{sourceId:id},true).then(res=>{
      if(res.data.code==20000){
        this.setData({dianzanlist:res.data.data.list})
      }
    })
  },
  // 输入留言
  getmessage(e){
    this.setData({content:e.detail.value})
  },
  // 留言/回复
  leavemessage(e){
    let {id,content,replay}=this.data
    var type=e.currentTarget.dataset.type
    if(!content){
      wx.showToast({
        title: '您还没有输入内容',
        icon:'none'
      })
      return
    }
    let params={}
    if(type==7){
      params={sourceId:id,content,sourceType:7}
    }else{
      if(replay==2){
        params={sourceId:id,content,sourceType:7,parentId:this.data.parsourceid}
      }else{
        // params={sourceId:this.data.sourceId,content,sourceType:8,parentId:this.data.sourceId}
        params={sourceId:id,content,sourceType:7,parentId:this.data.sourceId}
      }
    }
    http.post(`${app.globalData2.url}/api/v1/comment/insert`,params,true).then(res=>{
      if(res.data.code==20000){
        if(type==7){
          wx.showToast({
            title: '留言成功',
            icon:'success'
          })
          this.setData({shownote:false})
        }else{
          wx.showToast({
            title: '回复成功',
            icon:'success'
          })
          this.setData({showreplay:false})
        }
        
        setTimeout(()=>{
          this.getdetail(id)
          this.getpinlun(id)
          this.getdianzan(id)
        },1200)
      }else{
        wx.showToast({
          title: res.data.message,
          icon:'none'
        })
      }
    })
  },
  // 点击评论弹出是否回复/删除窗口
  replywrite(e){
    var {daralist}=this.data
    if(daralist.status==0||daralist.status==2){
      wx.showToast({
        title:'此文章未审核，不能回复管理员评论',
        icon:'none'
      })
      return
    }
    
    let parsourceid = e.currentTarget.dataset.parsourceid
    let id = e.currentTarget.dataset.id
    if(parsourceid){
      this.setData({parsourceid})
    }
    if(id){
      this.setData({valid:id})
    }
    
    let {sourceid,type,memberid,replay}=e.currentTarget.dataset
    if(memberid!=this.data.config.id){
      this.setData({deletenone:false})
    }else{
      this.setData({deletenone:true})
    }
    this.setData({redemodel:true,sourceId:sourceid,type:type,commonmemberId:memberid,replay})
  },
  // 确认回复
  confirmReplay(){
    this.setData({redemodel:false,showreplay:true,content:''})
  },

  // 确认删除评论/回复
  deleteReplay(){
    var {id,config,sourceId,type,commonmemberId,valid,parsourceid}=this.data
    let params={}
    if(type==7){
      params={sourceId:id,memberId:config.id,id:sourceId,sourceType:type}
    }else{
      // params={sourceId:id,memberId:config.id,id:sourceId,sourceType:type}
      params={sourceId:valid,memberId:commonmemberId,id:sourceId,sourceType:7}
    }
    http.post(`${app.globalData2.url}/api/v1/comment/delete`,params,true).then(res=>{
      if(res.data.code==20000){
        if(type==7){
          wx.showToast({
            title: '已删除评论',
            icon:'none'
          })
        }else{
          wx.showToast({
            title: '已删除回复',
            icon:'none'
          })
        }
        this.setData({redemodel:false,showreplay:false})
        this.getdetail(id)
        this.getpinlun(id)
        this.getdianzan(id)
      }
    })
  },
  // 删除文章
  deletepost(){
    wx.showModal({
      title:'确定要删除此文章吗？',
      success:(res)=>{
        if(res.confirm){
          this.getconfirm(this.data.id)
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
        wx.setStorageSync('deleteid', id)
        setTimeout(()=>{
          wx.navigateBack({delta:1})
        },1000)
      }
    })
  },
  // 点赞
  dianzan(){
    var {id,daralist}=this.data
    if(daralist.status==0){
      wx.showToast({
        title: '此文章未审核，不能点赞',
        icon:'none'
      })
      return
    }
    if(daralist.status==2){
      wx.showToast({
        title: '此文章审核不通过，不能点赞',
        icon:'none'
      })
      return
    }
    http.post(`${app.globalData2.url}/api/v1/praise/insert`,{sourceType:7,sourceId:id},true).then(res=>{
      if(res.data.code==20000){
        wx.showToast({
          title: '点赞成功',
          icon:'none'
        })
        this.getdetail(id)
        // this.getpinlun(id)
        this.getdianzan(id)
      }
    })
  },
  // 取消点赞
  disdianzan(){
    var {id,daralist}=this.data
    if(daralist.status==0){
      wx.showToast({
        title: '此文章未审核，不能点赞',
        icon:'none'
      })
      return
    }
    if(daralist.status==2){
      wx.showToast({
        title: '此文章审核不通过，不能点赞',
        icon:'none'
      })
      return
    }
    http.post(`${app.globalData2.url}/api/v1/praise/delete`,{sourceType:7,sourceId:id},true).then(res=>{
      if(res.data.code==20000){
        wx.showToast({
          title: '取消点赞',
          icon:'none'
        })
        this.getdetail(id)
        // this.getpinlun(id)
        this.getdianzan(id)
      }
    })
  },
   // 图片点击放大
   previewImage:function(event){
    var imagelist=this.data.daralist.imagelist
    var imgarray=[]
    imagelist.map(item=>{
      item=this.data.imageurl+item
      imgarray.push(item)
    })
    var current = event.currentTarget.dataset.src;
    wx.previewImage({
      current: current, // 当前显示图片的http链接
      urls: imgarray// 需要预览的图片http链接列表
    })
  },
  onmessage(e){
    var type=e.currentTarget.dataset.type
    var {daralist}=this.data
    if(daralist.status==0){
      wx.showToast({
        title: type=='share'?'此文章未审核，不能分享':'此文章未审核，不能留言',
        icon:'none'
      })
      return
    }
    if(daralist.status==2){
      wx.showToast({
        title: type=='share'?'此文章未审核，不能分享':'此文章未审核，不能留言',
        icon:'none'
      })
      return
    }
    this.setData({shownote:true,content:''})
  },
  offmessage(){
    this.setData({shownote:false,content:''})
  },
  offreplay(){
    this.setData({showreplay:false,content:''})
  },
  // 去首页
  gohome(){
    wx.switchTab({
      url: '../../calendar/calendar',
    })
  },
  // 取消评论弹窗
  cancel(){
    this.setData({redemodel:false,deletenone:true})
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
    wx.setStorageSync('daralist', this.data.daralist)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    wx.setStorageSync('daralist', this.data.daralist)
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
    this.getpinlun(this.data.id)
  },
  // 转发接口
  transmit(){
    var id = this.data.id
    http.post(`${app.globalData2.url}/api/v1/share/insert`,{sourceType:9,sourceId:id,url:'/pageCommon/information/mation'},true).then(res=>{
      if(res.data.code==20000){
        this.getdetail(id)
      }
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function( options ){
    var that = this;
    that.transmit()
　　var shareObj = {
　　　　title: "资讯信息",        // 默认是小程序的名称(可以写slogan等)
       path: '/pages/packageA/information/mation?id='+that.data.id,        // 默认是当前页面，必须是以‘/’开头的完整路径
　　　　imgUrl: '',     //自定义图片路径，可以是本地文件路径、代码包文件路径或者网络图片路径，支持PNG及JPG，不传入 imageUrl 则使用默认截图。显示图片长宽比是 5:4
　　　　success: function(res){
　　　　　// 转发成功之后的回调
　　　　　if(res.errMsg == 'shareAppMessage:ok'){
          this.transmit()
　　　　　}
　　　　},
　　　　fail: function(){
　　　　　　// 转发失败之后的回调
　　　　　　if(res.errMsg == 'shareAppMessage:fail cancel'){
　　　　　　　　// 用户取消转发
　　　　　　}else if(res.errMsg == 'shareAppMessage:fail'){
　　　　　　　　// 转发失败，其中 detail message 为详细失败信息
　　　　　　}
　　　　},
　　}
　　// 来自页面内的按钮的转发
　　if( options.from == 'button' ){
　　　　var eData = options.target.dataset;
　　　　console.log( eData.name );     // shareBtn
　　　　// 此处可以修改 shareObj 中的内容
　　　　shareObj.path = '/pages/packageA/information/mation?id='+that.data.id;
　　}
　　// 返回shareObj
　　return shareObj;
  }
})