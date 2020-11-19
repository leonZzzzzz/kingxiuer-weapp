// components/buy/buy.js
const app = getApp();
import http from '../../utils/http.js'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    buytype:{
      type:String
    },
    weater:{
      type:String
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    showValue:'',
    isShow:true
  },
  ready:function(){
    var weater = this.data.weater
    console.log(weater)
    http.get(`${app.globalData2.url}${this.data.weater}`, {}, true).then(res => {
      this.setData({showValue:res.data.data.showValue,isShow:res.data.data.isShow})
      if(weater=='/api/v1/config/recommend_buy_test_paper'||weater=='/api/v1/config/recommend_buy_temperature'){
        this.triggerEvent("showfor", res.data.data.isShow )
      }else if(weater=='/api/v1/config/recommend_buy_half_test_paper'){
        this.triggerEvent("showfortwo", res.data.data.isShow )
      }else if(weater=='/api/v1/config/recommend_buy_pre_test_paper'){
        this.triggerEvent("showforthree", res.data.data.isShow )
      }
    })
  },

  /**
   * 组件的方法列表
   */
  methods: {
    click(){
      http.get(`${app.globalData.url}/skipProgram/get.do`,{id:this.data.showValue},true).then(res=>{
        wx.navigateToMiniProgram({
          appId: res.data.content0.appId,
          path: res.data.content0.skipUrl,
          envVersion: 'release',// 打开正式版
          success(res) {
              // 打开成功
          },
          fail: function (err) {
            // console.log(err);
          }
        })
      })
      // wx.navigateToMiniProgram({
      //   appId: 'wx3b9d57cf13800f38',
      //   path: this.data.buytype=='yanyun'?'packages/goods/detail/index?alias=26z0fmb9ylu8s':'packages/goods/detail/index?alias=36dv61t5qmi0s',
      //   envVersion: 'release',// 打开正式版
      //   success(res) {
      //       // 打开成功
      //   },
      //   fail: function (err) {
      //     console.log(err);
      //   }
      // })
    }
  }
})
