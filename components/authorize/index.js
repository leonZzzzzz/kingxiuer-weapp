
Component({

  properties: {
    show: {
      type: Boolean,
      default: false
    },
  },

  data: {
    showModel: false
  },

  // 监听器
  observers: {
    'show'(val) {
      console.log(val)
      this.setData({
        showModel: val
      })
    }
  },

  // 组件所在页面的生命周期--需要基础库2.2.3以上才能生效
  pageLifetimes: {
    show() {
      var changeclick=wx.getStorageSync('changeclick')
      if(changeclick){
        this.setData({
          showModel: false
        })
        wx.removeStorageSync('changeclick')
      }else{
        var config = wx.getStorageSync('config')
        // console.log('authorize组件所在页面的生命周期 onShow')
        if ( !wx.getStorageSync('userType') || wx.getStorageSync('userType') == '1') {
        // if ( !config.mobile) {
          this.setData({
            showModel: true
          })
        } else {
          this.setData({
            showModel: false
          })
        }
      }
      
    }
  },

  methods: {
    onCancel() {
      var pages = getCurrentPages() //获取加载的页面
      var currentPage = pages[pages.length-1] //获取当前页面的对象
      var url = currentPage.route //当前页面url
      console.log(url)
      if(url!='pages/calendar/calendar'){
        wx.switchTab({
          url: '../../pages/calendar/calendar',
        })
        wx.setStorageSync('changeclick', true)
      }
      
      this.setData({
        showModel: false
      })
      this.triggerEvent('onCancel', {showModel: false})
    },

    onConfirm() {
      this.setData({
        showModel: false
      })
      wx.setStorageSync('loginType', 1)
      wx.navigateTo({
        url: '/pages/login/login',
      })
      this.triggerEvent('onconfirm', {showModel: this.data.showModel})
    }
  }
})
