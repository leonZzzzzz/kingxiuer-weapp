import Photosplit from '../../utils/photosplit.js'
import regeneratorRuntime from '../../utils/runtime.js'
var app = getApp();
let photo = '', shareImg = '';
Page({
  data: {
    getTempPath: '',
    domWidth: 0,
    domHeight: 0,
    errData: {}
  },
  onLoad: function (options) {
    var d = wx.getStorageSync('canvasData')
    this.setData({
      domWidth: wx.getSystemInfoSync().windowWidth - 10,
      domHeight: d.length * 40,
    })
    this.drawImage(d);
  },

  asyncGetLocalUrl(arr, i) {
    let src, that = this;
    if (i.imageUrl == "" || i.imageUrl == '/null.png' || !i.imageUrl) {
      src = 'http://kingsuer-1255600302.file.myqcloud.com/attachments/assets/img/null.png'
    } else {
      src = i.fullImg
    }
    // console.log(src)
    return new Promise(function (resolve, reject) {
      const getImageInfo = () => {
        wx.getImageInfo({
          src: src,
          success: function (res) {
            // console.log(res.path);
            i.imageUrl = res.path
            i.imageWidth = res.width
            i.imageHeight = res.height
            arr.push(i);
            resolve();
          },
          fail: function (e) {
            console.log(e);
            // 记录失败次数, 如果重试3次还不行就返回空链接，避免因为一张不行就导致全部不行
            // 绘图那边会判断的 为空就绘制"下载图片失败”文字
            let errData = that.data.errData
            errData[i.id] = errData[i.id] ? errData[i.id] + 1 : 1
            // console.log('下载图片失败次数==', errData[i.id])
            that.setData({ errData })
            if (errData[i.id] > 3) {
              i.imageUrl = ''
              i.imageWidth = 375
              i.imageHeight = 40
              arr.push(i);
              return resolve();
            } else {
              getImageInfo()
            }
          }
        })
      }
      getImageInfo()
    });
  },
  async drawImage(img) {
    var arr = [];
    for (var i = 0; i < img.length; i++) {
      wx.showLoading({title: '正在解析图片'})
      await this.asyncGetLocalUrl(arr, img[i]);
    }
    // 测试用
    // img.reverse()
    // for (var i = 0; i < 9; i++) {
    //   wx.showLoading({title: '正在解析图片'})
    //   await this.asyncGetLocalUrl(arr, img[i]);
    // }
    // arr = img.map(item => {
    //   let src;
    //   if (item.imageUrl == "" || item.imageUrl == '/null.png' || !item.imageUrl) {
    //     src = 'http://kingsuer-1255600302.file.myqcloud.com/attachments/assets/img/null.png'
    //   } else {
    //     src = item.fullImg
    //   }
    //   item.imageUrl = src
    //   return item
    // })
    photo = new Photosplit('canvas', arr, {
      imageHeight: 40,
      imageWidth: this.data.domWidth,
    })
    photo.createCanvas((res) => {
      wx.hideLoading()
      this.data.getTempPath = res;
      wx.uploadFile({
        url: `${app.globalData.url}/attachments/images/tencent_cloud.do`,
        filePath: this.data.getTempPath,
        name: 'file',
        formData: {
          imageType: 'compound',
          sessionKeyId: wx.getStorageSync('sessionKeyId')
        },
        success: (res) => {
          var obj = JSON.parse(res.data);
          shareImg = app.globalData.imgPrefix + obj.imageUrl;
        }
      })
    });
  },
  save() {
    photo.saveImage(this.data.getTempPath);
  },
  showKf() {
    wx.showModal({
      title: '提示',
      content: '请先保存图片，到"我的>联系客服"',
    })
  },

  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      console.log(res)
      return {
        title: '分享给好友',
        path: `/pages/packageA/share/share?img=${shareImg}`,
        success: function (res) {
          wx.showToast({
            title: '转发成功',
            icon: 'none'
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
  }
})