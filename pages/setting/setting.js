import http from '../../utils/http.js'
let app = getApp();
Page({
  data: {
    userInfo: {},
  },
  onShow() {
    this.apiGetUser();
  },
  // 用户详情接口
  apiGetUser() {
    http.get(`${app.globalData.url}/user/get.do`, {}, true).then(res => {
      this.setData({
        userInfo: res.data.content0
      })
    })
  },
  apiUpdateUser(remind, id) {
    http.post(`${app.globalData.url}/user/update.do`, { remind, id }, true).then(res => {
      console.log(res);
    })
  },
  onChange(e) {
    if (this.data.userInfo.mobile == null) {
      wx.showToast({
        title: '游客无法开启该功能',
        icon: 'none'
      })
      this.setData({
        "userInfo.remind": 2
      });
      return;
    }
    let remind = e.detail.value ? 1 : 2;
    this.apiUpdateUser(remind, this.data.userInfo.id);
  }
})