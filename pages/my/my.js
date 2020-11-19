const app = getApp()
var http = require('../../utils/http')
Page({
  //事件处理函数
  onLoad: function () {
    const userType = wx.getStorageSync('userType')
    this.setData({
      userType,
      number: wx.getStorageSync('NO')
    })

  },
  data: {
    userType:'',
    imageurl1: app.globalData.imgPrefix,
    menzhencode: '',
    officialcode:'',
    number: '',
    userInfo: {},
    hasUserInfo: false,
    isshowcode: false,
    isshowofficial:false
  },
  // 打卡
  punchClass(){
    // 是否训练营成员
    http.get(`${app.globalData.url}/camp/getLatestCamp.do`, {}, true).then(res => {
      if (res.data.errCode == 0) {
        // wx.navigateTo({
        //   url: '../packageB/topic/topic?surveyId='+res.data.content0.surveyId,
        // })
        if(res.data.content0==null){
          wx.setStorageSync('istrain', false)
          // this.setData({iftrain:false})
          wx.navigateTo({
            url: '../packageB/clockout/clockout',
          })
        }else{
          wx.setStorageSync('istrain', true)
          if(res.data.content0.isCollect){
            // this.setData({iftrain:false})
            wx.navigateTo({
              url: '../packageB/clockout/clockout',
              // url: '../packageB/punch/punch',
            })
          }else{
            // this.setData({iftrain:true})
            wx.navigateTo({
              url: '../packageB/topic/topic?surveyId='+res.data.content0.surveyId,
            })
          }
        }
      }
    })
  },

  onShow() {
    // console.log('app.globalData.userInfo', app.globalData.userInfo)
    var config = wx.getStorageSync('config')
    // console.log('config',config)
    if(config.openId){
      this.setData({
        userInfo: config,
      })
      if(config.nickName){
        this.setData({hasUserInfo:true,imgUrl: config.imgUrl,nickName:config.nickName})
      }
    }
    
    
    // if (app.globalData.userInfo.nickName) {
    //   this.setData({
    //     userInfo: app.globalData.userInfo,
    //     hasUserInfo: true,
    //   })
    // }
  },
  showOfficial(){
    var url = '/api/v1/config/qr_code_pop_ups'
    http.get(`${app.globalData2.url}${url}`, {}, true).then(res => {
      if (res.data.code == 20000) {
        // console.log(res.data.data.value)
        this.setData({
          officialcode: res.data.data.value,
          isshowofficial: true
        })
      }
    })
  },
  showcode() {
    wx.navigateToMiniProgram({
      appId: 'wx45ce5b4703a0314c',
      envVersion: 'release',// 打开正式版
      success(res) {
          // 打开成功
      },
      fail: function (err) {
        // console.log(err);
      }
    })
    // var url = '/api/v1/config/qr_code_clinic'
    // http.get(`${app.globalData2.url}${url}`, {}, true).then(res => {
    //   if (res.data.code == 20000) {
    //     this.setData({
    //       menzhencode: res.data.data.value,
    //       isshowcode: true
    //     })
    //   }
    // })
  },
  closeCode() {
    this.setData({
      isshowcode: false
    })
  },
  closeofficial() {
    this.setData({
      isshowofficial: false
    })
  },
  downImage(e) {
    let that = this
    var type=e.currentTarget.dataset.type
    let url=''
    if(type==1){
      url = that.data.imageurl1 + that.data.menzhencode
    }else{
      url = that.data.imageurl1 + that.data.officialcode
    }
    
    //若二维码未加载完毕，加个动画提高用户体验
    wx.showToast({
      icon: 'loading',
      title: '正在保存图片',
      duration: 1000
    })

    //判断用户是否授权"保存到相册"
    wx.getSetting({
      success(res) {
        console.log('授权情况',res)
        //没有权限，发起授权
        if (res.authSetting['scope.writePhotosAlbum']==false) {
          wx.showModal({
            title: '是否授权保存到相册',
            content: '需要获取您的保存图片权限，请确认授权，否则图片将无法保存到相册',
            success: function (res) {
              if (res.confirm) {
                console.log(res)
                wx.openSetting({
                  success: function (dataAu) {
                    console.log("dataAu",dataAu)
                    if (data.authSetting["scope.writePhotosAlbum"] === true) {
                      wx.showToast({
                        title: '授权成功',
                        icon: 'success',
                        duration: 1000
                      })
                      that.savePhoto(url)
                    } else {
                      wx.showToast({
                        title: '授权失败',
                        icon: 'none',
                        duration: 1000
                      })
                    }
                  }
                })
              }
            }
          })
          
          // wx.authorize({
          //   scope: 'scope.writePhotosAlbum',
          //   success() { //用户允许授权，保存图片到相册
          //     that.savePhoto(url);
          //   },
          //   fail() { //用户点击拒绝授权，跳转到设置页，引导用户授权
          //     wx.openSetting({
          //       success() {
          //         wx.authorize({
          //           scope: 'scope.writePhotosAlbum',
          //           success() {
          //             that.savePhoto(url);
          //           }
          //         })
          //       }
          //     })
          //   }
          // })
        } else { //用户已授权，保存到相册
          that.savePhoto(url)
        }
      }
    })
  },
  //保存图片到相册，提示保存成功
  savePhoto(url) {
    let that = this
    wx.downloadFile({
      url: url,
      success: function (res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success(res) {
            if (res.errMsg == "saveImageToPhotosAlbum:ok") {
              wx.showToast({
                title: '保存成功',
                icon: "success",
                duration: 1000
              })
            }
          }
        })
      }
    })
  },

  getUserInfo(e) {
    wx.getUserInfo({
      lang: "zh_CN",
      success: (res) => {
        wx.setStorageSync('userInfo', res.userInfo)
        app.globalData.userInfo = res.userInfo
        this.setData({
          // showModel: false,
          userInfo: app.globalData.userInfo,
          hasUserInfo: true,
          nickName:res.userInfo.nickName,
          imgUrl: res.userInfo.avatarUrl
        })
        this.apiUpdateUser({
          nickName: res.userInfo.nickName,
          imgUrl: res.userInfo.avatarUrl,
        })
      }
    })
  },

  apiUpdateUser(formData) {
    http.post(`${app.globalData.url}/user/update.do`, formData, true).then(res => {
      if (res.data.errCode == 401) {
        app.login(() => {
          this.apiUpdateUser(formData)
        });
      } else if (res.data.errCode != 0) {
        wx.showToast({
          title: '头像昵称更新失败',
          icon: 'none'
        })
      }
    })
  },

  onLogout() {
    wx.setStorageSync('loginType', 1)
    wx.reLaunch({
      url: '../login/login',
    })
  }
})