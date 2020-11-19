import http from '../../../utils/http.js'
const app = getApp();
Page({

  data: {
    // imgSrc: ['twwd.jpg','plwd.jpg','yywd.jpg','jqsz1.jpg'],
    imagesrc:'',
    // imgHead: 'http://kingsuer-1255600302.file.myqcloud.com/attachments/assets/img/',
    type: 0,
    imageurl:'https://kingsuer-1255600302.file.myqcloud.com',
    image:'',
    key:''
  },
  onUnload:function(){
    wx.setStorageSync('questionpage', 'questionpage')
  },
  onLoad: function (options) {
    console.log(options)
    wx.showLoading({})
    if(options.imagesrc){
      wx.hideLoading({})
      this.setData({imagesrc:options.imagesrc})
    }else{
      if(options.id){
        wx.hideLoading({})
        this.setData({imagesrc:options.id})
      }else{
        var type=options.type
        let url=''
        if(type==1){
          url='/api/v1/config/tweets_temperature'
        }else if(type==2||type==3){
          url='/api/v1/config/tweets_ovulate'
        }else if(type==4){
          url='/api/v1/config/tweets_pregnancy'
        }else if(type==5){//经期
          url='/api/v1/config/menstrual_period'
        }
        else if(type==6){//卵泡期
          url='/api/v1/config/follicular_phase'
        }
        // else if(type==7){
        //   url='/api/v1/config/ovulation_day'
        // }
        // else if(type==8){
        //   url='/api/v1/config/suggest_love'
        // }
        else if(type==9||type==8||type==7){//排卵期
          url='/api/v1/config/ovulation_phase'
        }
        else if(type==10){//白带增多
          url='/api/v1/config/increased_leucorrhea'
        }
        else if(type==11){//安全期
          url='/api/v1/config/security_period'
        }
        // else if(type==12){//最底部图片跳转
        //   url='/api/v1/config/home_jump_value'
        // }else if(type==13){
        //   url='/api/v1/config/menstrual_period_value'
        // }else if(type=14){
        //   url='/api/v1/config/security_period_value'
        // }else if(type=15){
        //   url='/api/v1/config/ovulation_phase_value'
        // }else if(type=16){
        //   url='/api/v1/config/follicular_phase_value'
        // }
        http.get(`${app.globalData2.url}${url}`,{},true).then(res=>{
          if(res.data.code==20000){
            wx.hideLoading({})
            this.setData({imagesrc:res.data.data.value,key:res.data.data.key})
          }
        })
      }
    }
  }
})