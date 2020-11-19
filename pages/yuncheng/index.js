const app = getApp()
import http from '../../utils/http.js'
import util from '../../utils/util.js'
Page({
  data: {
    saasOb: {
      source: '', // 1 从相册选择，2 拍照
      operation: '', // 1 自动抠图，2 手动裁剪
      testTime: '', // 试纸测试时间，形如 '2020-04-16 12:00:00' 的字符串
      appId: '', // SaaS 的 AppId
      appKey: '', // SaaS 的 AppKey
      unionId: '' // 用户唯一标识符
    },
    panoramaAnalysisRes:{},
    // 页面来源： 0 保存到系统相册 1 排卵 2 验孕 
    source: 1,
    // 分析出来的值
    resultValue: null,
    // c线的位置
    valueCLocation: 0
  },
  onUnload(){
    this.setData({panoramaAnalysisRes:{}})
    wx.removeStorageSync('cropImg')
    wx.removeStorageSync('saasOb')
    wx.removeStorageSync('panoramaAnalysisRes')
    wx.removeStorageSync('navToYunChengPage')
  },
  
  onLoad(options) {
    console.log('options',options)
    let that = this;
    // let cropImg = wx.getStorageSync('cropImg');
    let analyzeObj = wx.getStorageSync('saasOb') || {};
    console.log('analyzeObj',analyzeObj)
    let panoramaAnalysisRes = wx.getStorageSync('panoramaAnalysisRes') || {};

    // 注意有坑：分析时用的saasOb属性字段和展示结果用的saasOb属性字段是不一样的
    // 组件用的参数
    let saasOb = {
      source: analyzeObj.fromSource, // 1 从相册选择，2 拍照
      operation: analyzeObj.operation, // 1 自动抠图，2 手动裁剪
      testTime: analyzeObj.usingTime, // 试纸测试时间，形如 '2020-04-16 12:00:00' 的字符串
      appId: analyzeObj.saasAppId, // SaaS 的 AppId
      appKey: analyzeObj.saasAppKey, // SaaS 的 AppKey
      unionId: analyzeObj.userId // 用户唯一标识符
    }
    console.log('saasOb+++> && ===>panoramaAnalysisRes', analyzeObj)
    // 建议使用真机调试，可以看到更详细的信息（控制台和network）
    
    this.setData({
      saasOb: saasOb,
      panoramaAnalysisRes,
      cropImg: panoramaAnalysisRes.cropPaperTempFilePath,
      source: options.source || '1',
    })
  },
  // 点击返回重拍触发的事件
  navigatePageBack(event) {
    console.log('返回重拍')
    // 调用方可在此做自定义跳转等
    wx.redirectTo({
      url: `/pages/camera/camera?source=${this.data.source}`,
    })
  },
  errorEvent(e) {
    // 错误处理相关代码
    console.log('errorEvent', e)
    wx.showModal({
      title: '提示',
      content: '试纸分析失败，请重试！ '+JSON.stringify(e)
    })
  },
  saveEditor(event) {
    // 编辑模式下，此方法接收用户修改的值，调用方可根据此值是否跟传入的lhValue值判断是否发生变化
    console.log('modifyValue:' + event.detail.modifyValue)
    var modifyValue = event.detail.modifyValue
    this.setData({
      resultValue: modifyValue
    })
  },
  // 新版本插件还返回了很多参数，可查文档 https://mp.weixin.qq.com/wxopen/plugindevdoc?appid=wx479777803030f27b&token=&lang=zh_CN#-
  // 插件中点击确认提交触发的事件可在此方法接收，返回结果有三：
  // valueTLocation：t线的位置，百分比，值在0-1之间，保留四位小数，例:0.4533
  // valueCLocation：c线的位置，百分比，值在0-1之间，保留四位小数，例:0.5533
  // analysisResultValue: 试纸分析出来的value值，值是0，5，10，15，20，25，45，65的其中之一，例:10
  // manaulModifyAnalysisResultValue: 用户手动的修改值，如果为-2表示用户没有修改，如果>=0说明用户手动修改了
  // cropPaperTempFilePath: 通过全景图抠出的裁剪图在微信环境的临时路径，调用方可调用自己的API或者微信的wx.uploadFile()方法上传到自己的服务器
  confirmSubmit(event) {
    wx.showLoading({
      title: '正在提交…',
      mask: true
    })
    try {
      console.log('确认提交', event)
      var valueTLocation = event.detail.valueTLocation
      var valueCLocation = event.detail.valueCLocation
      var analysisResultValue = event.detail.analysisResultValue
      var manaulModifyAnalysisResultValue = event.detail.manaulModifyAnalysisResultValue
      // var cropPaperTempFilePath = event.detail.cropPaperTempFilePath

      valueCLocation *= 100
      
      if (manaulModifyAnalysisResultValue == -2) {
        this.setData({ resultValue: analysisResultValue, valueCLocation: valueCLocation })
      } else {
        this.setData({ resultValue: manaulModifyAnalysisResultValue, valueCLocation: valueCLocation,  })
      }
      this.uploadFile()
    } catch (error) {
      console.log('confirmSubmit++++++>', error)
      wx.hideLoading()
      wx.showToast({title: error, icon: 'none'})
    }
  },
  // 上传图片
  uploadFile() {
    console.log('调用我们的api上传图片')
    let that = this;
    wx.uploadFile({
      url: `${app.globalData.url}/attachments/images/tencent_cloud.do`,
      filePath: that.data.cropImg,
      name: 'file',
      formData: {
        imageType: that.data.source == '1' ? 'ovulate' : that.data.source == '3' ? 'ovulate' : 'pregnancy',
        sessionKeyId: wx.getStorageSync('sessionKeyId')
      },
      success: function (res) {
        console.log('上传成功了吗？', res)
        let data = JSON.parse(res.data)
        console.log('来源===>', that.data.source)
        if (data.errCode !== 0) return
        if (that.data.source == '1' || that.data.source == '3') {
          that.apiAddOvulate(data);
        } else {
          that.apiAddConceive(data);
        }
      },
      fail: (err) => {
        wx.hideLoading()
        console.log('上传失败', err)
        wx.showToast({title: err.errMsg, icon: 'none'})
      },
      complete: () => {
        console.log('上传成功和失败都执行')
      }
    })
 
  },
  formatVlaue(value) {
    // pregnant:  1阴性 2弱阳 3阳性 4强阳
    let pregnant = value
    if (value < 0 ) {
      pregnant = 0
    } else if (value == 0) {
      pregnant = 1
    } else if (value > 0 && value < 25) {
      pregnant = 2
    } else if (value == 25) {
      pregnant = 3
    } else if (value >= 45) {
      pregnant = 4
    }
    return pregnant
  },
  apiAddOvulate(img, flag = 0) {
    let lhValue = this.data.resultValue
    if (this.data.source == '1') {
      // 普通的只需要传 0,1,2,3,4的其中之一
      lhValue = this.formatVlaue(this.data.resultValue)
    }
    let data = {
      type: this.data.source == '3' ? 2 : 1,
      imageUrl: img ? img.imageUrl : '/attachments/assets/img/null.png',
      measureTime: this.data.saasOb.testTime,
      lhValue: lhValue,
      valueClocation: this.data.valueCLocation, //这里是小写
      flag: flag
    }
    http.post(`${app.globalData.url}/ovulate/insert.do`, data, true)
      .then(res => {
        if (res.data.errCode == 401) {
          app.login(() => {
            this.apiAddOvulate(img);
          })
        } else if (res.data.errCode == 3) {
          wx.hideLoading()
          wx.showModal({
            title: '提示',
            content: res.data.errMsg,
            cancelColor: '#555',
            confirmColor: '#cca955',
            success: res => {
              if (res.confirm) {
                wx.showLoading({
                  title: '正在提交…',
                  mask: true
                })
                this.apiAddOvulate(img, 1);
              }
            }
          })
        } else if (res.data.errCode === 0){
          wx.hideLoading()
          wx.showToast({
            title: '数据记录成功',
            icon: 'none'
          })
          setTimeout(() => {
            wx.switchTab({
              url: '../ovulation/ovulation'
            })
          }, 1500)
        } else {
          wx.hideLoading()
        }
      })
      .catch(() => {
        wx.hideLoading()
      })
  },
  apiAddConceive(img, flag = 0) {
    let value = this.data.resultValue
    let pregnant = this.formatVlaue(value)
    let data = {
      imageUrl: img.imageUrl,
      measureTime: this.data.date + ' ' + this.data.time,
      measureTime: this.data.saasOb.testTime,
      pregnant: pregnant,
      flag: flag
    }
    http.post(`${app.globalData.url}/pregnancy/insert.do`, data, true)
      .then(res => {
        if (res.data.errCode == 401) {
          app.login(() => {
            this.apiAddConceive(img);
          })
        } else if (res.data.errCode == 3) {
          wx.hideLoading()
          wx.showModal({
            title: '提示',
            content: res.data.errMsg,
            cancelColor: '#555',
            confirmColor: '#cca955',
            success: res => {
              if (res.confirm) {
                wx.showLoading({
                  title: '正在提交…',
                  mask: true
                })
                this.apiAddConceive(img, 1);
              }
            }
          })
        } else if (res.data.errCode === 0) {
          wx.hideLoading()
          wx.showToast({
            title: '数据记录成功',
            icon: 'none'
          })
          setTimeout(() => {
            wx.switchTab({
              url: '../conceive/conceive'
            })
          }, 1500)
        } else {
          wx.hideLoading()
        }
      })
      .catch(() => {
        wx.hideLoading()
      })
  },
})
