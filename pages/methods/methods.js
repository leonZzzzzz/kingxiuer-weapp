var plugin = requirePlugin("detectionPlugin")
Page({
  data: {
    detectionMsg: {
      appid: "aaef18d29a134b83bf268e7bdae67167",
      from: "wondfohealth",
      reactionTime: 20,   //反应时间，即反应倒计时时长
      testTime: 60  //检测时间，即失效倒计时时长
    }
  },
  onLoad: function() {
  },
  changeEvent(e){
    console.log("testResult",e.detail.testResult)     //通过e.detail.testResult获取检测结果
    if(e.detail.testResult.data==null){
      if(e.detail.testResult.code==100300){
        wx.showToast({
          title:e.detail.testResult.msg,
          icon:'none'
        })
      }else if(e.detail.testResult.code==100400){
        wx.showToast({
          title: '检测超时，无检测结果，请重新检测',
          icon:'none'
        })
      }
      
      setTimeout(()=>{
        wx.switchTab({
          url: '../ovulation/ovulation',
        })
      },1500)
    }else{
      wx.setStorageSync('testResult', e.detail.testResult)
      wx.switchTab({
        url: '../ovulation/ovulation',
      })
    }
  },
})