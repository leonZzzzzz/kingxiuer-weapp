import http from '../../../utils/http.js'
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imageurl:'https://kingsuer-1255600302.file.myqcloud.com',
    navInfo:[],
    proindex:'',
    content:'',
    attachments:[],
    tempFilePaths:[],
    columnId:'',
    btnLoading:false,
    id:'',
    btnsuccess:true,
    lenshow:false,
    src:'',
    showcamera:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options){
    this.ctx = wx.createCameraContext()
    this.setData({id:options.id})
    this.getprograma(options.id)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  //拍照
  takePhoto() {
    this.ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        this.setData({
          src: res.tempImagePath
        })
      }
    })
  },
  // 栏目列表
  getprograma(id){
    http.get(`${app.globalData.url}/column/list.do`,{},true).then(res=>{
      if(res.data.errCode==0){
        var navInfo=res.data.content0.rows
        this.setData({navInfo:navInfo})
        navInfo.map((item,index)=>{
          if(item.id==id){
            console.log(index)
            this.setData({proindex:index,columnId:item.id})
          }
        })
      }
    })
  },
  bindPickerChange(e){
    console.log(e)
    this.setData({proindex:e.detail.value,columnId:this.data.navInfo[e.detail.value].id})
  },
  // 获取内容
  getputcontent(e){
    var content = e.detail.value
    console.log(content)
    var len = parseInt(content.length)
    console.log(len)
    if(len<1000){
      this.setData({lenshow:false})
    }
    if(len==1000){
      this.setData({lenshow:true})
      wx.showToast({
        title: '您输入的内容已超过1000字',
        icon:'none'
      })
    }
    // http.get(`https://api.weixin.qq.com/cgi-bin/token`,{grant_type:'client_credential',appid:'wx03ea2c16df2be02c',secret:'1c4e95f78b61fd9eb525b5a104e37e08'},true).then(res=>{
    //   console.log(res)  
    //   var access_token=res.data.access_token
    //   console.log(access_token)
    //   http.post(`https://api.weixin.qq.com/wxa/msg_sec_check`,{access_token:access_token,content},true).then(res=>{
      
    //   })
    // })
    
    this.setData({content})
  },
 


  //上传图片
  uploadpic: function(e) {
    var that = this;
    var sessionKeyId=wx.getStorageSync('sessionKeyId')
    var sessionId=wx.getStorageSync('sessionId')
    var attachments=that.data.attachments
    wx.chooseImage({
      count: Math.abs(attachments.length - 9), // 最多可以选择的图片张数 8
      sizeType: ['compressed'], // original 原图，compressed 压缩图，默认二者都有
      sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
      success: function(res) {
        var tempFilePaths = res.tempFilePaths
        that.setData({tempFilePaths})
        var successUp = 0; //成功，初始化为0
        var failUp = 0; //失败，初始化为0
        var length = tempFilePaths.length; //总共上传的数量
        var count = 0; //第几张，初始化为0 
        that.uploadonebyeone(tempFilePaths,successUp,failUp,count,length)
      }
    })
  },
  uploadonebyeone(tempFilePaths,successUp,failUp,count,length){
    console.log(tempFilePaths)
    var that = this
    var sessionKeyId=wx.getStorageSync('sessionKeyId')
    var sessionId=wx.getStorageSync('sessionId')
    var attachments = that.data.attachments
    wx.uploadFile({
      url: `${app.globalData.url}/attachments/images/tencent_cloud.do`,
      filePath: tempFilePaths[count],
      // filePath:'https://yunchengsaas.oss-cn-beijing.aliyuncs.com/lhcut/rectget_0_F31DA716-92F3-41F2-A199-6C57779A3564.jpg',
      name: 'file',
      header:{
        'Accept': 'application/json',
        'content-type': 'multipart/form-data',
        'WPGSESSID':sessionId
      },
      formData: {
        'sessionKeyId':sessionKeyId,
        'file': '(binary)',
        'imageType':'compound'
      },
      success: (res) => {
        console.log(res)
        if(res.statusCode!='500'){
          successUp++
          let resData=JSON.parse(res.data)
          attachments.push(resData.imageUrl)
          that.setData({attachments})
        }else{
          wx.showToast({
            title:'系统错误请联系管理员',
            icon:'none',
            duration: 2000
          })
        }
      },
      fail: (res)=> {
        failUp++
        wx.hideLoading();
      },
      complete:(res)=>{
        console.log(res)
        count++
        if(count==length){
          wx.showToast({
            title: '上传成功',
          })
        }else{
          that.uploadonebyeone(that.data.tempFilePaths,successUp,failUp,count,length)
        }
      }
    });
  },
  //删除图片
  deleteImg (e) {
   let index = e.currentTarget.dataset.index
   let attachments = this.data.attachments;
   attachments.splice(index, 1);
    this.setData({ attachments: attachments });
  },
  // 发布
  publish(){
    this.setData({btnsuccess:false})
    var sessionKeyId=wx.getStorageSync('sessionKeyId')
    const {content,columnId,attachments}=this.data
    if(!columnId){
      this.setData({btnsuccess:true})
      wx.showToast({
        title: '请选择栏目',
        icon:'none'
      })
      return 
    }
    if(!content){
      this.setData({btnsuccess:true})
      wx.showToast({
        title: '请输入内容',
        icon:'none'
      })
      return
    }
    // if(attachments.length==0){
    //   wx.showToast({
    //     title: '请上传图片',
    //     icon:'none'
    //   })
    //   return
    // }
    wx.showLoading({
      title: '正在发布...',
    })
    var image=attachments.toString()
    let params = {type:'user',content,columnId,attachments:image}
    http.post(`${app.globalData.url}/article/insert.do`,params,true).then(res=>{
      wx.hideLoading({})
      if(res.data.errCode==0){
        // wx.showToast({
        //   title: '提交成功，请等待审核',
        //   icon:'none'
        // })
        wx.showModal({
          content:'发布成功，请等待审核',
          showCancel:false,
          success:(res)=>{
            wx.navigateBack({
              delta:1
            })
          }
        })        
      }else{
        this.setData({btnsuccess:true})
        if(res.data.status==500){
          wx.showToast({
            title: '您发布的文章含有违法违规内容',
            icon:'none'
          })
        }
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

  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {

  // }
})