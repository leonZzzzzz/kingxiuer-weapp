// 用来获取storage 中的sessionKey  添加到 data中的参数里面;
let getSessionKey = (data, callback) => {
  data.sessionKeyId = wx.getStorageSync('sessionKeyId');
  if (!data.sessionKeyId) {
    const app = getApp();
    console.log('重新获取sessionKeyId')
    console.log(app)
    app.login(() => {
      data.sessionKeyId = wx.getStorageSync('sessionKeyId');
      callback && callback()
    });
  }
  return data;
}

export default getSessionKey