/**
 * 图片拼接
 * @params {string} canvasId  canvasId
 * @params {object} config  配置数据
 * @params {object} dataList  拼接的数据
 */
function Photosplit(canvasId, dataList, config) {
  this.canvasId = canvasId;
  this.config = config;
  this.dataList = dataList;
  this.ctx = wx.createCanvasContext(canvasId);
};

Photosplit.prototype.createCanvas = function (callback) {
  let that = this;
  that.dataList.map((res, index) => {
    let imgLeft = 0
    // 对齐C线位置----百分比换算成px
    if (res.valueClocation) {
      let percent = ((53.55 - res.valueClocation) / 100)
      // let percent = ((res.valueClocation - 53.55) / 100)
      let pxStr = (res.imageWidth * percent).toFixed(4)
      imgLeft = Number(pxStr)
      // console.log(res.imageWidth, res.valueClocation, percent, imgLeft)
    }
    if (imgLeft >= 0) {
      that.ctx.drawImage(res.imageUrl, 60 + imgLeft, index * that.config.imageHeight, that.config.imageWidth - 60, that.config.imageHeight);
      // that.ctx.drawImage(res.imageUrl, imgLeft, 0, res.imageWidth, res.imageHeight, 60, index * that.config.imageHeight, that.config.imageWidth - 60 - imgLeft, that.config.imageHeight);
    } else {
      // that.ctx.drawImage(res.imageUrl, 0, 0, res.imageWidth, res.imageHeight, 60, index * that.config.imageHeight, that.config.imageWidth - 60 + imgLeft, that.config.imageHeight);
      that.ctx.drawImage(res.imageUrl, 60, index * that.config.imageHeight, that.config.imageWidth - 60 + imgLeft, that.config.imageHeight);
    }
    that.ctx.beginPath();
    if (res.type == 1) {
      // 不知为何写switch case不行
      if (res.lhValue === 0) {
        // 无效
        that.ctx.setFillStyle('rgba(0, 0, 0, 0.5)')
      } else if (res.lhValue === 1) {
        // 阴性
        that.ctx.setFillStyle('#d4bbbb')
      } else if (res.lhValue === 2) {
        // 弱阳
        that.ctx.setFillStyle('#d38989')
      } else if (res.lhValue === 3) {
        // 阳性
        that.ctx.setFillStyle('#5BAC17')
      } else if (res.lhValue === 4) {
        // 强阳
        that.ctx.setFillStyle('#5BAC17')
      }
    } else {
      if (res.lhValue >= 25) {
        // 绿色
        that.ctx.setFillStyle('#5BAC17')
      } else {
        // 灰色
        that.ctx.setFillStyle('rgba(0, 0, 0, 0.5)')
      }
    }
    that.ctx.fillRect(that.config.imageWidth - 60, index * 40, 60, 40, );
    that.ctx.closePath();

    that.ctx.beginPath();
    that.ctx.setFontSize(12)
    that.ctx.setFillStyle('#ffffff')
    that.ctx.setTextBaseline('bottom')
    if (res.lhValue == 1) {
      that.ctx.fillText('阴性', that.config.imageWidth - 45, index * 40 + 25)
    } else if (res.lhValue == 2) {
      that.ctx.fillText('弱阳', that.config.imageWidth - 45, index * 40 + 25)
    } else if (res.lhValue == 3) {
      that.ctx.fillText('阳性', that.config.imageWidth - 45, index * 40 + 25)
    } else if (res.lhValue == 4) {
      that.ctx.fillText('强阳', that.config.imageWidth - 45, index * 40 + 25)
    } else if (res.lhValue == 0) {
      that.ctx.fillText('无效', that.config.imageWidth - 45, index * 40 + 25)
    } else {
      that.ctx.fillText(res.lhValue + 'LH', that.config.imageWidth - 45, index * 40 + 25)
    }
    that.ctx.closePath();

    // 日期背景块
    that.ctx.beginPath();
    that.ctx.setFillStyle('#fff')
    that.ctx.fillRect(0, index * 40, 60, 40, );
    that.ctx.closePath();

    // 时间背景块
    that.ctx.beginPath();
    that.ctx.setFillStyle('#f9f0f0')
    that.ctx.fillRect(60, index * 40, 60, 40, );
    that.ctx.closePath();

    // 绘制日期
    that.ctx.beginPath();
    that.ctx.setFillStyle('#712726')
    that.ctx.setTextBaseline('top')
    that.ctx.setFontSize(10)
    that.ctx.fillText(res.year, 15, index * 40 + 8)
    that.ctx.fillText(res.monthDay, 15, index * 40 + 15 + 8)
    that.ctx.closePath();

    // 绘制时间
    that.ctx.beginPath();
    that.ctx.setFontSize(14)
    that.ctx.setFillStyle('#9A7475')
    that.ctx.setTextBaseline('normal')
    that.ctx.fillText(res.time, 70, index * 40 + 25)
    that.ctx.closePath();

    // 画底部白色边框
    that.ctx.beginPath();
    that.ctx.setLineWidth(0.5)
    that.ctx.moveTo(0, index * 40)
    that.ctx.lineTo(that.config.imageWidth, index * 40)
    that.ctx.setStrokeStyle('#fff');
    that.ctx.stroke();
    that.ctx.closePath();

  })
  that.ctx.draw(true, () => {
    setTimeout(() => {
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        canvasId: that.canvasId,
        fileType: 'jpg',
        success: function (res) {
          callback(res.tempFilePath)
        },
        fail: function () {
          wx.showToast({
            title: '图片获取失败',
            icon: 'none'
          })
        }
      })
    }, 300)
  })
};

Photosplit.prototype.saveImage = function (tempFilePath) {
  console.log(tempFilePath)
  wx.getSetting({
    success(res) {
      console.log('授权情况',res)
      //没有权限，发起授权
      if (res.authSetting['scope.writePhotosAlbum']==false) {
        wx.showModal({
          title: '是否授权保存到相册',
          content: '需要获取您的保存图片权限，请确认授权，否则图片将无法保存到相册',
          success: function (res) {
            if (res.confirm) {
              console.log(res)
              wx.openSetting({
                success: function (dataAu) {
                  console.log("dataAu",dataAu)
                  if (data.authSetting["scope.writePhotosAlbum"] === true) {
                    wx.showToast({
                      title: '授权成功',
                      icon: 'success',
                      duration: 1000
                    })
                    wx.saveImageToPhotosAlbum({
                      filePath: tempFilePath,
                      success(res) {
                        console.log(res)
                        wx.showToast({
                          title: '图片已保存到本地',
                          icon: 'none'
                        })
                      }
                    })
                  } else {
                    wx.showToast({
                      title: '授权失败',
                      icon: 'none',
                      duration: 1000
                    })
                  }
                }
              })
            }
          }
        })
      } else { //用户已授权，保存到相册
        wx.saveImageToPhotosAlbum({
          filePath: tempFilePath,
          success(res) {
            console.log(res)
            wx.showToast({
              title: '图片已保存到本地',
              icon: 'none'
            })
          }
        })
      }
    }
  })
  
};

module.exports = Photosplit;