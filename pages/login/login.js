import http from '../../utils/http.js'
const app = getApp()
let loginType = 0
let userType = '1'
Page({
  data: {
    userInfo: {},
    // 注册输入的手机号
    mobile: '',
    // 验证码
    code: '',
    // 验证码时效
    obj: '重发(59s)',
    // 用于更新
    id: '',
    // 验证码是否发过
    isPost: false,
    showPage: false,
    hasAudit: true,
    loginCode: '',
  },
  onLoad() {
    this.wxLogin()
  },
  onShow() {
    loginType = wx.getStorageSync('loginType');
    var userType = wx.getStorageSync('userType');
    
    console.log('userType',userType)
    // if(userType==4){
    //   wx.switchTab({
    //     url: '../calendar/calendar',
    //   })
    //   return
    // }
    console.log('loginType', loginType)
    if (loginType != 1) {
      app.userLogin()
      let that = this
      // 登录成功回调函数
      app.userInfoReadyCallback = res => {
        if (res.user) {
          app.globalData.userInfo = {
            nickName: res.user.nickName || '',
            avatarUrl: res.user.imgUrl || ''
          }
        }
        that.setData({
          userInfo: res,
          showPage: true,
          // loginCode: res.loginCode
        })
      }
      // 登录失败回调函数
      app.errLoginCallback = err => {
        this.setData({
          hasAudit: false,
          showPage: true
        })
      }
    } else {
      // 个人中心点退出账号，来这里
      this.setData({
        hasAudit: false,
        showPage: true
      })
    }
  },
  onUnload() {
    console.log('登录页 onUnload')
    wx.setStorageSync('loginType', 0)
  },

  wxLogin(cb) {
    wx.login({
      success: rej => {
        this.setData({
          loginCode: rej.code
        })
        cb && cb(rej.code)
      },
      fail: (err) => {
        wx.showToast({title: err.errMsg, icon: 'none'})
        wx.hideLoading()
      }
    })
  },

  // 快速登录
  handleGetPhoneNumber(e) {
    console.log(e)
    if (!e.detail.encryptedData) {
      wx.showToast({
        title: '授权失败，请重试',
        icon: 'none'
      })
      this.wxLogin()
      return
    }
    wx.showLoading({
      title: '获取中…',
      mask: true
    })
    let params = {
      code: this.data.loginCode,
      encryptedData: e.detail.encryptedData,
      iv: e.detail.iv
    }
    
    userType = wx.getStorageSync('userType')
    wx.setStorageSync('mobileData', params)
    var config = wx.getStorageSync('config');
    if (userType == '1') {
      wx.hideLoading()
      wx.navigateTo({
        url: `/pages/record/record`
      })
    } else {
      // this.fastRegister(params)
      if(config.location){
        this.fastRegister(params)
      }else{
        this.again_getLocation(params)
      }
    }
  },
  again_getLocation(params){
    let that = this;
    wx.hideLoading()
    // 获取位置信息
    wx.getSetting({
      success: (res) => {
        console.log(res)
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {//非初始化进入该页面,且未授权
          wx.showModal({
            title: '是否授权当前位置',
            content: '需要获取您的地理位置，请确认授权，否则无法获取您所需数据',
            success: function (res) {
              console.log(res)
              if (res.cancel) {
                that.setData({
                  isshowCIty: false
                })
                wx.showToast({
                  title: '授权失败',
                  icon: 'error',
                  duration: 1000
                })
                wx.navigateTo({
                  url: '../packageA/adress/adress',
                })
              } else if (res.confirm) {
                wx.openSetting({
                  success: function (dataAu) {
                    console.log(dataAu)
                    if (dataAu.authSetting["scope.userLocation"] == true) {
                      wx.showToast({
                        title: '授权成功',
                        icon: 'success',
                        duration: 1000
                      })
                      that.onGetLocation(params);
                    } else {
                      wx.showToast({
                        title: '授权失败',
                        icon: 'error',
                        duration: 1000
                      })
                      wx.navigateTo({
                        url: '../packageA/adress/adress',
                      })
                    }
                  }
                })
              }
            }
          })
        } else if (res.authSetting['scope.userLocation'] == undefined) {//初始化进入
          that.onGetLocation(params);
        }
        else { //授权后默认加载
          that.onGetLocation(params);
        }
      }
    })

  },
  // 获取用户地理位置
  onGetLocation(params) {
    wx.getLocation({ 
      success: (res) => {
        console.log('成功：', res)
        this.getapis(params,res.latitude,res.longitude) 
      },
      fail: (res) => {
          console.log('失败：', res)
          wx.navigateTo({
            url: '../packageA/adress/adress',
          })
      },
    })
  },
  getapis(params,latitude,longitude){
    var location = latitude+','+longitude
    http.get('https://apis.map.qq.com/ws/geocoder/v1/',{location,key:'5UTBZ-ZHLW3-7C33F-Y3RDM-HG3X7-PLFNX'}).then(res=>{
      var province = res.data.result.address_component.province
      var city = res.data.result.address_component.city
      var district = res.data.result.address_component.district
      var location2 = province+'-'+city+'-'+district
      params.location=location2
      this.fastRegister(params)
    })
  },
  fastRegister(formData) {
    wx.showLoading({
      title: '登录中…',
      mask: true
    })
    http.post(`${app.globalData.url}/loginSmallProgram.do`, formData, true).then(res => {
      console.log(res.data)
      wx.hideLoading()
      if (!(/^2[0-9]{2}/g.test(res.statusCode))) {
        this.wxLogin()
        wx.showToast({
          title: res.data.errMsg || '登录失败，请重试',
          icon: 'none'
        })
        return
      }
      if (res.data.errCode == 401) {
        app.login(() => {
          this.wxLogin(code => {
            formData.code = code
            this.fastRegister(formData)
          })
        });
      } else if (res.data.errCode == 3) {
        wx.navigateTo({
          url: '/pages/record/record?mobile='+res.data.msg,
        })
      } else if (res.data.errCode != 0) {
        wx.showToast({
          title: res.data.errMsg || '登录失败，请重试',
          icon: 'none'
        })
      } else {
        if (res.data.content0 && res.data.content0.user) {
          app.globalData.userInfo = res.data.content0.user
        }
        wx.switchTab({
          url: '../calendar/calendar',
        })
      }
    })
  },

  getUserInfo(e) {
    if (e.detail.userInfo) {
      app.globalData.userInfo = e.detail.userInfo
      this.setData({
        'userInfo.user': app.globalData.userInfo
      })
    }
  },

  // 获取用户信息
  getUser(e) {
    // console.log(e);
  },
  // 绑定手机号
  formSubmit(e) {
    let mobile = e.detail.value.mobile,
      code = e.detail.value.code,
      that = this;
    if (code == '' || !this.isPhoneAvailable(mobile)) {
      wx.showToast({
        title: '请输入正确数据',
        icon: 'none'
      })
      return;
    }
    // 校验验证码
    http.post(`${app.globalData.url}/msg/checkCode.do`, {
      mobile: mobile,
      code: code
    }, true).then(res => {
      if (res.data.errCode == 0) {
        // 判断是否是游客
        if (this.data.userInfo.userType == 2 || loginType == 1) {
          // 更新--数据
          http.post(`${app.globalData.url}/user/update.do`, {
            mobile: mobile,
            id: this.data.id
          }, true).then(res => {
            console.log(res)
            if (res) {
              wx.switchTab({
                url: '../calendar/calendar'
              })
            }
          })
          return;
        }
        // 不是老用户并且没有绑定手机号
        wx.navigateTo({
          url: `../record/record?mobile=${mobile}`
        })
      } else {
        wx.showToast({
          title: '验证码有误',
          icon: 'none'
        })
      }
    })
  },

  // 获取用户输入的手机号
  putMobile(e) {
    this.setData({
      mobile: e.detail.value
    })
  },

  // 获取用户输入的手机号
  putCode(e) {
    this.setData({
      code: e.detail.value
    })
  },

  // 发送验证码
  getCode() {
    let mobile = this.data.mobile;
    if (!this.isPhoneAvailable(mobile)) {
      wx.showToast({
        title: '手机号输入有误',
        icon: 'none'
      })
      return;
    }
    // 将验证码变更为已发送
    http.post(`${app.globalData.url}/msg/sendCheckCode.do`, {
      mobile: mobile
    }, true).then(res => {
      if (res.data.errCode === 11) {
        wx.showToast({
          title: res.data.errMsg,
          icon: 'none'
        })
      } else if (res.data.errCode === 401) {
        app.login(() => {
          this.getCode();
        });
      } else if (res.data.errCode === 0) {
        this.setData({
          isPost: true
        })
        this.setTimeCode(this, 60)
      };
    })
  },

  /**
   * 验证码时效;
   * that Page
   * count 倒计时间(s)
   */
  setTimeCode(that, count) {
    let countDown = count;
    let timer = setInterval(function() {
      countDown--;
      that.setData({
        obj: '重发(' + countDown + 's)'
      })
      if (countDown == 0) {
        that.setData({
          obj: '重发(' + count + 's)'
        })
        that.setData({
          isPost: false
        });
        clearInterval(timer);
        return;
      }
    }, 1000)
  },

  /**
   * 11位手机号验证 函数
   * str 手机号
   * 1--以1为开头；
   * 2--第二位可为3,4,5,7,8,中的任意一位；
   * 3--最后以0-9的9个整数结尾。
   */
  isPhoneAvailable(str) {
    let myReg = /^[0-9]{11}$/;
    if (str == '') {
      return false;
    } else if (!myReg.test(str)) {
      return false;
    } else {
      return true;
    }
  },
})