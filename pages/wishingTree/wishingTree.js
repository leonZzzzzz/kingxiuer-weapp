// pages/wishingTree/wishingTree.js
import http from '../../utils/http.js'
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imageurl: 'https://athena-1255600302.cosgz.myqcloud.com',
    imageurl1: app.globalData.imgPrefix,
    addwish: true,
    insert: true,
    // 默认生成好孕的位置
    left: "350rpx",
    top: "980rpx",
    display: 'none',

    // 获取后台许愿记录

    showWishingContent: [],
    // 轮播所有还愿
    allHuanyuanContent: [],
    // 记录我的愿望
    isWishing: false,
    wishingContent: [],
    // 记录我的还愿
    isHuanyuan: false,
    huanyuanContent: [],

    // 查看令牌的内容
    seecontent: "",

    modalDisplay: 'none',
    isShowHuanyuan: 'none',
    isShowSuccessHuanyuan: 'none',
    isShowKefuCode: 'none',
    isShowXuyuan: 'none',
    isShowMyWishing: 'none',
    iscode: 'none',
    // 滚动数据
    scorllText: "祝你好孕祝你好孕祝你好孕祝你好孕祝你好孕祝你好孕祝你好孕祝你好孕祝你好孕祝你好孕",
    marqueePace: 1, //滚动速度
    marqueeDistance: 0, //初始滚动距离
    marquee_margin: 0,
    size: 14,
    windowWidth: 0,
    isShowScroll: 'none',
    flag: true,
    distanceIndex: 0,
    showModel: false,
    // scrollStutas:true,
    // length:0,
    // 输入数据部分   
    inputValue: '',
    // 许愿内容
    wishingValue: '',
    // 模拟客服二维码
    kefuCode: '',
    menzhencode: '',
    // 门诊webview链接
    hotelUrl: 'https://weixin.kbjcc.cc/html/pm/weixin_auth.html?clinicCode=jxe001&pageCode=clinicsIntroduce&authType=1',
    // 许愿开关
    wishSwitch: 'close'
  },


  onLoad: function () {
    var config = wx.getStorageSync('config')
    if (!config.mobile) {
      this.setData({
        showModel: true
      })
    }
    this.apiGetAllWishingContent()
    //获得dialog组件
    this.dialog = this.selectComponent("#dialog");
    this.getHuanyuan()
    this.isWishing()
    this.isHuanyuan()
    this.setData({
      wishSwitch: wx.getStorageSync('wishSwitch')
    })
    this.getWishSwitch()
  },
  // 关闭模态框
  closeModal() {
    this.setData({
      modalDisplay: 'none'
    })
  },

  closeSuccessHuanyuanModal() {
    this.setData({
      isShowSuccessHuanyuan: 'none'
    })
  },
  closeKefuCode() {
    this.setData({
      isShowKefuCode: 'none'
    })
  },
  // 关闭许愿框
  closexuyuanModal() {
    this.setData({
      isShowXuyuan: 'none',
      wishingValue: ''
    })
  },
  // 关闭我的许愿框
  closeMyWishingModal() {
    this.setData({
      isShowMyWishing: 'none',
      wishingValue: this.data.wishingContent.content
    })
  },
  closeCode() {
    this.setData({
      iscode: 'none'
    })
  },

  // 获取许愿开关
  getWishSwitch() {
    var that = this
    http.get(`${app.globalData2.url}/api/v1/config/wishing_tree_switch`, {}, false).then(res => {
      if (res.data.code == 20000) {
        that.setData({
          wishSwitch: res.data.data.value
        })
        wx.setStorageSync('wishSwitch', res.data.data.value)
      }
    })
  },

  // 打开许愿框
  toWishing(e) {
    if (e.currentTarget.dataset.type == 'myWishing') {
      this.setData({
        isShowMyWishing: 'flex'
      })
    } else {
      this.setData({
        isShowXuyuan: 'flex'
      })
    }
  },

  // 是否许愿过？
  isWishing() {
    http.get(`${app.globalData.url}/desire/myDesire.do`, {}, true).then(res => {
      // console.log('iswishing', res);
      if (res.data.content0 == null) {
        this.setData({
          isWishing: false,
          // wishingContent:res.data.content0
        })
      } else {
        this.setData({
          isWishing: true,
          wishingContent: res.data.content0,
          wishingValue: res.data.content0.content
        })
      }
    })
  },
  // 输入愿望
  Binput(value, cursor, keyCode) {
    // console.log(value)
    this.setData({
      wishingValue: value.detail.value
    })
  },
  // 我要许愿
  subWishing() {
    this.setData({
      addwish: false
    })
    if (!this.data.wishingValue) {
      this.setData({addwish: true})
      wx.showToast({
        title: '请输入愿望',
        icon: 'none'
      })
      return
    }
    wx.showLoading({})
    http.post(`${app.globalData.url}/desire/insert.do`, {
      content: this.data.wishingValue
    }, true).then(res => {
      wx.hideLoading({})
      if (res.data.errCode == 0) {
        this.isWishing()
        // wx.setStorageSync('wishing_status',true)
        this.setData({
          // 设置新许愿的坐标
          isShowXuyuan: 'none',
          display: 'none',
          left: '350rpx',
          top: "980rpx",
        })
        wx.showToast({
          title: '许愿成功',
          icon: 'none'
        })

        // 设置飘动令牌
        let LEFT = Math.floor(Math.random() * 501 + 100)
        let TOP = Math.floor(Math.random() * 501 + 200)
        // console.log(LEFT,TOP);
        this.setData({
          display: 'block',
          addwish: true
        })
        setTimeout(() => {
          this.setData({
            left: LEFT + "rpx",
            top: TOP + 'rpx'
          })
        }, 500);
      }
      if (res.data.errCode == 1) {
        wx.showToast({
          title: res.data.errMsg,
          icon: 'none'
        })
      }
    })
  },
  // 修改愿望
  modWishing() {
    // this.setData({insert:false})
    if (!this.data.wishingValue) {
      wx.showToast({
        title: '请输入愿望',
        icon: 'none'
      })
      return
    }
    wx.showLoading({})
    http.post(`${app.globalData.url}/desire/update.do`, {
      id: this.data.wishingContent.id,
      content: this.data.wishingValue
    }, true).then(res => {
      if (res.data.errCode == 0) {
        wx.hideLoading({})
        wx.showToast({
          title: res.data.content0,
          icon: 'none'
        })
        this.isWishing()
        // 把修改信息找出来更改,更新页面内容
        this.data.showWishingContent.filter(err => {
          if (err.userId.indexOf(this.data.wishingContent.userId) > -1) {
            err.content = this.data.wishingValue
          }
        })
        this.setData({
          isShowMyWishing: 'none',
          isHuanyuan: false,
          wishingValue: '',
          insert: true
        })
      }
    })

  },

  //点击还愿按钮
  go2huanyuan() {
    if (!this.data.isWishing) {
      wx.showToast({
        title: '你还没许愿，需要许愿后才能还愿哦~',
        icon: "none"
      })
      return
    }
    if (this.data.isHuanyuan) {
      this.setData({
        isShowSuccessHuanyuan: 'flex'
      })
    } else {
      this.setData({
        isShowHuanyuan: 'flex'
      })
    }


  },
  go2Home() {
    wx.switchTab({
      url: '../calendar/calendar'
    })
  },

  // 诊所二维码
  go2webView() {
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
    //       iscode: 'flex'
    //     })
    //   }
    // })

  },
  // 输入好孕报喜
  reportput(e) {
    this.setData({
      inputValue: e.detail.value
    })
  },
  // 确认报喜
  huanyuan() {
    var length = this.data.length;
    // 判定有没有输入内容
    if (!this.data.inputValue) {
      wx.showToast({
        title: '请输入还愿内容',
        icon: 'none'
      })
      return;
    }
    wx.showLoading({})
    http.post(`${app.globalData.url}/votive/insert.do`, {
      content: this.data.inputValue,
      desireId: this.data.wishingContent.id
    }, true).then(res => {
      if (res.data.errCode == 0) {
        wx.hideLoading({})
        // wx.showToast({
        //   title:'好孕报喜成功',
        //   icon:'none'
        // })
        this.setData({
          inputValue: '',
          huanyuanContent: res.data.content0,
          isHuanyuan: true,
          isShowHuanyuan: 'none',
          isShowSuccessHuanyuan: 'flex'
        })
        // 判断，正在轮播的时候

        res.data.content0.content = `${res.data.content0.userName}传好孕啦，${res.data.content0.content}`
        this.data.allHuanyuanContent.splice(this.data.distanceIndex + 1, 0, res.data.content0)

        length += res.data.content0.content.length * this.data.size + this.data.windowWidth / 2
        this.setData({
          // scorllText:txt,
          length: length,
          allHuanyuanContent: this.data.allHuanyuanContent,
        })
      }


      if (res.data.errCode == 1) {
        wx.showToast({
          title: res.data.errMsg,
          icon: 'none'
        })
      }
    })
  },
  // 取消报喜
  closeHuanyuanModal() {
    this.setData({
      isShowHuanyuan: 'none',
      inputValue: ''
    })
  },
  // 显示客服二维码
  kefuCode() {
    // let kefuCode=wx.getStorageSync('userInfo').avatarUrl
    var url = '/api/v1/config/qr_code_staff'
    http.get(`${app.globalData2.url}${url}`, {}, true).then(res => {
      if (res.data.code == 20000) {
        this.setData({
          kefuCode: res.data.data.value,
          isShowKefuCode: 'flex',
          isShowSuccessHuanyuan: 'none',
          // kefuCode:kefuCode?kefuCode:this.data.kefuCode
        })
      }
    })

  },
  downImage2(){
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
  },

  //点击保存图片
  downImage(e) {
    let that = this
    let type = e.currentTarget.dataset.url
    let url = ''
    if (type == 1) {
      url = that.data.imageurl1 + that.data.kefuCode
    } else {
      url = that.data.imageurl1 + that.data.menzhencode
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
        //没有权限，发起授权
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() { //用户允许授权，保存图片到相册
              that.savePhoto(url);
            },
            fail() { //用户点击拒绝授权，跳转到设置页，引导用户授权
              wx.openSetting({
                success() {
                  wx.authorize({
                    scope: 'scope.writePhotosAlbum',
                    success() {
                      that.savePhoto(url);
                    }
                  })
                }
              })
            }
          })
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


  // 获取许愿列表
  apiGetAllWishingContent() {
    http.get(`${app.globalData.url}/desire/desireTree.do`, {}, true).then(res => {
      if (res.data.errCode == 401) {
        app.login(() => {
          this.apiGetAllWishingContent()
        })
      } else {
        this.data.allWishingContent = res.data.content0.rows;
      }
      if (res.data.errCode == 0) {
        // 产生随机坐标
        res.data.content0.rows.forEach(element => {
          let Rl = Math.floor(Math.random() * 400 + 150) + "rpx"
          let Rt = Math.floor(Math.random() * 400 + 250) + "rpx"
          element.Rl = Rl,
            element.Rt = Rt
        });
        this.setData({
          showWishingContent: res.data.content0.rows
        })
      }
    })

  },




  // 用户是否还愿？
  isHuanyuan() {
    http.get(`${app.globalData.url}/votive/myVotive.do`, {}, true).then(res => {
      if (res.data.content0 == null) {
        this.setData({
          isHuanyuan: false,
          // wishingContent:res.data.content0
        })
      } else {
        this.setData({
          isHuanyuan: true,
          huanyuanContent: res.data.content0
        })
      }
    })
  },

  // 查看数据
  seeContent(e) {
    if (e.currentTarget.dataset.index == 'myWishing') {
      http.get(`${app.globalData.url}/desire/myDesire.do`, {}, true).then(res => {
        this.setData({
          modalDisplay: 'flex',
          seeContent: res.data.content0,
          wishingValue: res.data.content0.content
        })
      })
    } else {
      this.setData({
        modalDisplay: 'flex',
        seeContent: this.data.showWishingContent[e.currentTarget.dataset.index]
      })
    }
  },
  // 滚动条函数
  scrolltxt() {
    var that = this;
    var length = that.data.length; //滚动文字的宽度
    var windowWidth = that.data.windowWidth; //屏幕宽度
    var distanceIndex = that.data.distanceIndex
    // if (length+windoww > windowWidth){
    //函数节流
    // if(crentleft){
    var distanceArr = []
    var distance = this.data.windowWidth
    this.data.allHuanyuanContent.forEach(v => {
      distance += v.content.length * this.data.size + this.data.windowWidth / 3
      distanceArr.push(distance)
    })
    var interval = setInterval(function () {
      var maxscrollwidth = that.data.length;
      // console.log(maxscrollwidth);
      var crentleft = that.data.marqueeDistance;
      if (crentleft < maxscrollwidth) { //判断是否滚动到最大宽度
        // 执行小于的操作
        that.setData({
          marqueeDistance: crentleft + that.data.marqueePace
        })
        // 判断当前轮播到第几个数据，获取index值方便插入新的许愿
        if (crentleft == distanceArr[distanceIndex]) {
          that.setData({
            distanceIndex: distanceIndex + 1
          })
          distanceIndex = distanceIndex + 1

        }
      } else {
        // console.log('执行大于的操作');
        that.setData({
          marqueeDistance: 0,
          // scrollStutas:false
          distanceIndex: 0
        });
        clearInterval(interval);
        that.scrolltxt()
      }
    }, 20);

  },

  // 还愿轮播
  getHuanyuan() {
    var that = this

    http.get(`${app.globalData.url}/votive/getList.do`, {}, true).then(res => {
      if (res.data.errCode == 401) {
        app.login(() => {
          this.apiGetAllWishingContent()
        })
      }
      if (res.data.errCode == 0) {
        if (res.data.content0.rows.length > 20) {
          var newallHuanyuanContent = res.data.content0.rows.slice(0, 20)
        } else {
          var newallHuanyuanContent = res.data.content0.rows
        }
        newallHuanyuanContent.forEach(v => {
          v.content = `${v.userName}传好孕啦，${v.content}`
        });
        this.setData({
          allHuanyuanContent: newallHuanyuanContent,
        })

        // 判断滚动
        var length = 0;
        var windowWidth = wx.getSystemInfoSync().windowWidth; // 屏幕宽度
        this.data.allHuanyuanContent.forEach(v => {
          length += v.content.length * this.data.size + windowWidth / 2; //文字长度
        })
        this.setData({
          isShowScroll: 'flex',
          isShowHuanyuan: 'none',
          //设置滚动条件
          length: length,
          windowWidth,
        })
        that.scrolltxt()

      }
    })
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {


    // 获取还愿列表轮播
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