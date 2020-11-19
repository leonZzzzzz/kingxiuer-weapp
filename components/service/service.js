// components/service/service.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isshow:{
      type:String
    },
    paramAtoB:{
      type:Boolean
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    ismodel:false,
    isShowKefuCode:'none',
    kefuCode:'https://athena-1255600302.cosgz.myqcloud.com/attachments/null/fd23c19a2d884733a6024149bc60f6c3.png',
    top:0,
    left:0,
    bottom: 100,
    right: 0
  },
 
  ready:function(){
    console.log(this.data.paramAtoB)
  },
  /**
   * 组件的方法列表
   */
  methods: {
    kefuCode(){
      this.setData({isShowKefuCode:'flex'})
    },
    closeSuccessHuanyuanModal(){
      this.setData({ismodel:false})
      var isshow='flex'
      this.triggerEvent('checkshow',isshow)
    },
    click(){
      this.setData({ismodel:true})
      var isshow='none'
      this.triggerEvent('checkshow',isshow)
    },
    cancel(){
      this.setData({ismodel:false})
    },
    closeKefuCode(){
      this.setData({
        isShowKefuCode:'none'
      })
    },
    // 保存客服二维码、诊所二维码到手机
    downImage(e){
      console.log(e)
      let url='https://athena-1255600302.cosgz.myqcloud.com/attachments/null/fd23c19a2d884733a6024149bc60f6c3.png' 
      wx.downloadFile({
        url:url, //模拟客服二维码
        success: function (res) {
          // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
          if (res.statusCode === 200) {
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: function (data) {
                console.log(data);
              },
              fail: function (err) {
                console.log(err);
                if (err.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
                console.log("用户一开始拒绝了，我们想再次发起授权")
                  // alert('打开设置窗口')
                    wx.openSetting({
                      success(settingdata) {
                        console.log(settingdata)
                        if (settingdata.authSetting['scope.writePhotosAlbum']) {
                          console.log('获取权限成功，给出再次点击图片保存到相册的提示。')
                        } else {
                          console.log('获取权限失败，给出不给权限就无法正常使用的提示')
                        }
                      }
                    })
                }
              }
            })
          }
        }
      })
    },

    setTouchMove: function (e) {
      console.log("---------------- e.touches[0].clientX----------------8==" + e.touches[0].clientX)
      console.log("---------------- e.touches[0].clientY----------------8=======" + e.touches[0].clientY)
       //此处clientY与clientX为拖动悬浮窗超过设定的大小会返回默认显示位置
      if (e.touches[0].clientX < 350 && e.touches[0].clientY < 550 && e.touches[0].clientX > 0 && e.touches[0].clientY > 0){
        this.setData({
          right: 350-e.touches[0].clientX,
          bottom: 550-e.touches[0].clientY
        })
      } else {
           this.setData({
            right: 0, //默认显示位置 left距离
            bottom: 70  //默认显示位置 top距离
          })
      }
    },
  }
})
