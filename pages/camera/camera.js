const app = getApp()
// import http from '../../utils/http.js'
import { formatTime, throttle, debounce } from '../../utils/util.js'
Page({
  data: {
    imageURL:'https://kingsuer-1255600302.file.myqcloud.com',
    image1:'/attachments/20200908/null/ac10100d746ba81d01746ca9b2590032.png',
    image2:'/attachments/20200908/null/ac10100d746ba81d01746caa70d70033.png',
    image3:'/attachments/20200908/null/ac10100d746ba81d01746caaf5c60034.png',
    // 图片路径
    imgUrl: '',
    // 是否显示预览图
    oppenPhoto: false,
    // 页面来源： 0 保存到系统相册 1 排卵 2 验孕 
    source: 1,
    systemInfo: {},
    cropImgWidth: 375
  },
  onLoad(options) {
    console.log(app.globalData.userInfo)
    try {
      wx.getSystemInfo({
        success: (res) => {
          // rpx to px
          let cha = res.screenWidth / 750
          // let cropImgWidth = 670 * cha
          let cropImgWidth = res.screenWidth - 40
          console.log('rpx to px ====>'+cha, cropImgWidth)
          this.setData({
            systemInfo: res,
            cropImgWidth: cropImgWidth,
            source: options.source || 1
          })
        },
      })
    } catch (error) {
      console.log(error)
    }
  },
  onShow() {
    wx.removeStorageSync('navToYunChengPage')
  },
  initdone(e) {
    console.log('相机初始化完成==》', e)
    setTimeout(() => {
      this.ctx = wx.createCameraContext()
    }, 100)
  },
  error(e) {
    wx.showModal({
      title: '授权提示',
      content: '该功能需要调用相机组件，请授权使用',
      success(success) {
        if (success.confirm) {
          wx.getSetting({
            success: (res) => {
              if (!res.authSetting['scope.camera']) {
                wx.openSetting({
                  success(res) {
                    if (res.authSetting['scope.camera']) {
                      wx.navigateBack({
                        delete: 1
                      })
                    }
                  }
                })
              } else {
                console.log('调起相机出错==》', e.detail)
                wx.showModal({
                  title: '提示',
                  content: e.detail || '调起相机失败，请打开右上角设置，点击 "重新小程序" 重试',
                  showCancel: false,
                  confirmText: '知道了',
                  success: () => {
                    wx.navigateBack({
                      delete: 1
                    })
                  }
                })
              }
            }
          })
        } else if (success.cancel) {
          wx.navigateBack({
            delete: 1
          })
        }
      },
    })
  },
  // 拍照
  takePhoto() {
    if (!this.ctx) this.ctx = wx.createCameraContext();
    this.ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        console.log(res)
        this.setData({
            imgUrl: res.tempImagePath,
          },
          () => {
            this.onCutPic()
            //this.analyze(res.tempImagePath)
          }
        )
      },
      fail: (err) => {
        console.log(err)
      }
    })
  },
  // 裁剪图
  onCutPic() {
    this.setData({
      oppenPhoto: true
    }, () => {
      setTimeout(() => {
        let ctx = wx.createCanvasContext("image-canvas")
        console.log(ctx)
        
        // 第三个参数越大，截取部分越往下
        // ctx.drawImage(this.data.imgUrl, 0, -155, this.data.systemInfo.screenWidth, this.data.systemInfo.screenHeight)
        ctx.drawImage(this.data.imgUrl, -20, -160, this.data.systemInfo.screenWidth, this.data.systemInfo.screenHeight)
        ctx.draw(true)
      }, 1000)

    })
  },
  // 关闭图片预览
  closePhoto() {
    this.setData({
      oppenPhoto: false
    })
  },

  handleThrottle() {
    console.log('handleThrottle')
    debounce(this.savePhoto, 2000)()
  },
  // 携带图片重定向到调用页面
  savePhoto() {
    console.log('savePhoto')
    let that = this
    if (that.data.source == 1) {
      // 排卵
      // 建议在当前页面分析
      that.analyze(that.data.imgUrl, () => {
        console.log(7777)
        wx.setStorageSync('cropImg', '')
        if (wx.getStorageSync('navToYunChengPage')) return false
        wx.redirectTo({
          url: `../yuncheng/index?source=${that.data.source}&panoramaImg=${that.data.imgUrl}&noAnalyze=true`,
          success: () => {
            // 防止接口被调用多次，而导致多次跳转页面
            wx.setStorageSync('navToYunChengPage', true)
          },
          fail: (error) => {
            console.log(error)
            wx.removeStorageSync('navToYunChengPage')
          }
        })
      })
      return
    }
    wx.canvasToTempFilePath({
      destWidth: 600,
      destHeight: 30,
      canvasId: 'image-canvas',
      success(res) {
        console.log(res)
        console.log('source',that.data.source)
        let img = res.tempFilePath
        if (that.data.source == 1) {
          // 排卵
          // wx.redirectTo({
          //   url: `../yuncheng/index?source=${that.data.source}&panoramaImg=${that.data.imgUrl}`
          // })
          // 建议在当前页面分析
          // 如果需要在当前页面分析，就调用 analyze() 否则就打开上面的注释，
          that.analyze(that.data.imgUrl, () => {
            console.log(8888)
            wx.setStorageSync('cropImg', img)
            if (wx.getStorageSync('navToYunChengPage')) return false
            wx.redirectTo({
              url: `../yuncheng/index?source=${that.data.source}&panoramaImg=${that.data.imgUrl}&noAnalyze=true`,
              success: () => {
                // 防止接口被调用多次，而导致多次跳转页面
                wx.setStorageSync('navToYunChengPage', true)
              },
              fail: () => {
                wx.removeStorageSync('navToYunChengPage')
              }
            })
            
          })
        } else if (that.data.source == 2) {
          // 验孕
          wx.redirectTo({
            url: `../conceiveRecord/conceiveRecord?source=${that.data.source}&imgUrl=${img}`
          })
          // wx.redirectTo({
          //   url: `../yuncheng/index?panoramaImg=${that.data.imgUrl}&cropImg=${img}&source=${that.data.source}`
          // })
        } else if (that.data.source == 3) {
          // 半定量
          console.log('source',that.data.source)
          wx.redirectTo({
            url: `../ovulationRecord/ovulationRecord?source=${that.data.source}&imgUrl=${img}`
          })
        } else {
          // 系统相册
          wx.saveImageToPhotosAlbum({
            filePath: img,
            success: (res) => {
              wx.showToast({
                title: '保存成功',
                icon: 'success'
              })
              setTimeout(() => {
                wx.hideToast()
              }, 1500);
            },
            fail: () => {
              wx.showToast({
                title: '保存失败',
                icon: 'none'
              })
              setTimeout(() => {
                wx.hideToast()
              }, 1500);
            }
          })
        }
      },
      fail(err) {
        console.log(err)
      }
    })
  },
  // 分析试纸
  analyze(img, cb){
    // 新版本插件可查文档 https://mp.weixin.qq.com/wxopen/plugindevdoc?appid=wx479777803030f27b&token=&lang=zh_CN#-
    let that = this;
    let time = formatTime(new Date())
    // let openId = app.globalData.userInfo ? app.globalData.userInfo.openId : ''
    let config = wx.getStorageSync('config') || {}
    var panoramaImage = img
    var saasAppId = '100022'
    var saasAppKey = 'da7564b887596ba56068271de072c0b8'
    var userId = config.openId || wx.getStorageSync('sessionKeyId')
    var usingTime = time.replace(/\//g, '-')
    var base64ImageData = wx.getFileSystemManager().readFileSync(panoramaImage, 'base64')
    // pointLefty 和 pointRighty 后面这个 + 20是通过试错得到的，和裁剪框的垂直位置不一致，这个可能是相机可视区域和小程序可视区域不一样导致的，比如小程序多了导航栏 
    var saasOb = {
      panoramaImage: panoramaImage,
      userId: userId,
      usingTime: usingTime,
      saasAppId: saasAppId,
      saasAppKey: saasAppKey,
      fromSource: 2,
      operation: 2,
      pointLeftx: (20 / this.data.systemInfo.screenWidth).toFixed(2),
      pointLefty: ((145 + 20) / this.data.systemInfo.screenHeight).toFixed(2),
      pointRightx: ((this.data.cropImgWidth + 25) / this.data.systemInfo.screenWidth).toFixed(2),
      pointRighty: ((145 + 47) / this.data.systemInfo.screenHeight).toFixed(2),
    }
    console.log("saasOb1111",saasOb)
    
    var getResult = requirePlugin('lhPlugin').getAnalysisResult
    getResult(
      saasOb,
      base64ImageData,
      function success(res) {
        if(res.lhValue==20){
          res.lhValue=25
        }
        var panoramaAnalysisRes = res
        // panoramaAnalysisRes.showViewOrEdit = 1
        console.log('panoramaAnalysisRes',panoramaAnalysisRes)
        that.setData({panoramaAnalysisRes})
      
        wx.setStorageSync('saasOb', saasOb)
        wx.setStorageSync('panoramaAnalysisRes', panoramaAnalysisRes)
        // 4、下一步操作，比如跳转到插件的结果展示页面
        cb && cb(panoramaAnalysisRes)

        // 3、分析成功，拿到返回值 res，包括以下字段：
        /**
          *  {
                lhPaperAlType: '', // 算法返回的 “试纸品牌”
                lhPaperUrl: '', // 通过全景图抠出的裁剪图在微信环境的临时路径
                cLocation: '', // C 线的位置
                tLocation: '', // T 线的位置
                lhValue: '', // 试纸分析出来的 value 值
                blurCloud: '', // 算法返回的 “模糊度”
                barcode: '', // 算法返回的 “条码信息”，仅限孕橙试纸
                lhTime: '', // 试纸测试时间
                customRadio: 5 // 试纸结果分级，暂时只支持 5
              }
        */
      },
      function fail(err) {
        // 错误处理相关代码
        console.log('err',err)
        wx.showModal({
          showCancel: false,
          confirmText: '知道了',
          content: '试纸分析失败，请重试！ '+err
        })
      }
    )
  },
})
