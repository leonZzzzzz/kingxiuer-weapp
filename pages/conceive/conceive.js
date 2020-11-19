import http from '../../utils/http.js'
const app = getApp();
Page({
  data: {
    // 是否显示海报
    showPoster: false,
    pageShow: false,
  },
  onShow() {
    this.setData({
      pageShow: true
    })
  },
  onHide() {
    this.setData({
      pageShow: false
    })
  },
  oppenPoster() {
    this.setData({
      showPoster: true
    })
  },
  closePoster() {
    this.setData({
      showPoster: false
    })
  },
  download() {
    wx.getImageInfo({
      src: 'https://kingsuer-1255600302.file.myqcloud.com/attachments/assets/img/share.jpg',
      success(e) {
        wx.saveImageToPhotosAlbum({
          filePath: e.path,
          success(res) {
            wx.showToast({
              title: '图片已保存',
            })
          }
        })
      }
    })
  },
  // 转发
  onShareAppMessage(res) {
    return {
      title: '金秀儿',
      path: '/pages/packageA/share/share?img=https://kingsuer-1255600302.file.myqcloud.com/attachments/assets/img/share.jpg',
      success: function (res) {
        wx.showToast({
          title: '转发成功',
        })
      },
      fail: function (res) {
        wx.showToast({
          title: '转发失败',
          icon: 'none'
        })
      }
    }
  }
})