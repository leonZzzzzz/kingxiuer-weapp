
// 用来获取storage 中的sessionKey  添加到 data中的参数里面;
let getSessionKey = (data, callback) => {
  data.sessionKeyId = wx.getStorageSync('sessionKeyId');
  var type = wx.getStorageSync('userType')
  if (!data.sessionKeyId) {
    const app = getApp();
    if(type&&type!=4){
      app.userLogin()
    }
    // throw '可忽略；手动创建的错误，用来阻止代码继续运行，异步获取sessionKeyId'
  }
  return data;
}

let wxPromisify = (fn) => {
  return (obj = {}) => {
    return new Promise((resolve, reject) => {
      obj.success = function (res) {
        console.log('响应数据===>', res.data)
        if(res.data.errCode){
          if(res.data.errCode!=0){
            if(res.data.errCode==3){

            }else{
              wx.showToast({
                title: res.data.errMsg,
                icon:'none'
              })
            }
            
            if(res.data.errCode==401||res.data.code==63021){
              var type = wx.getStorageSync('userType')
              const app = getApp();
              // if(type==4){
              //   app.userLogin()
              // }else{
                wx.navigateTo({
                  url: '/pages/login/login',
                })
              // }
            }
          }
        }
        resolve(res) //成功
      }
      obj.fail = function (res) {
        console.log('响应数据===>', res.data)
        reject(res) //失败
      }
      fn(obj)
    })
  }
}

//无论promise对象最后状态如何都会执行
Promise.prototype.finally = function (callback) {
  let P = this.constructor;
  return this.then(
    value => P.resolve(callback()).then(() => value),
    reason => P.resolve(callback()).then(() => { throw reason })
  );
};

/**
 * get方法;
 * url 请求地址
 * data 请求参数
 */
let get = (url, data, isSessionKey = false) => {
  console.log('API====>', url)
  console.log('请求参数===>', data)
  // 是否需要sessionKey;
  if (isSessionKey) data = getSessionKey(data);
  var sessionId=wx.getStorageSync('sessionId')
  var get = wxPromisify(wx.request)
  return get({
    url: url,
    method: 'GET',
    data: data,
    header: {
      'Content-Type': 'application/json',
      'WPGSESSID':sessionId
    }
  })
}


/**
 * post方法;
 * url 请求地址
 * data 请求参数
 * isSessionKey 是否需要sessionKey
 */
let post = (url, data, isSessionKey = false) => {
  console.log('API====>', url)
  console.log('请求参数===>', data)
  // 是否需要sessionKey;
  if (isSessionKey) data = getSessionKey(data);
  var sessionId=wx.getStorageSync('sessionId')
  var post = wxPromisify(wx.request)
  return post({
    url: url,
    method: 'POST',
    data: data,
    header: {
      "content-type": "application/x-www-form-urlencoded",
      'WPGSESSID':sessionId
    },
  })
}
// json传参
let json = (url, data, isSessionKey = false) => {
  console.log('API====>', url)
  console.log('请求参数===>', data)
  // 是否需要sessionKey;
  if (isSessionKey) data = getSessionKey(data);
  var sessionId=wx.getStorageSync('sessionId')
  var post = wxPromisify(wx.request)
  return post({
    url: url,
    method: 'POST',
    data: data,
    header: {
      'WPGSESSID':sessionId,
      "content-type": 'application/json'
    },
  })
}
// 上传图片
//多张图片上传
function upload(data){
  try {
    console.log(data)
    var that=this,
    i=data.i?data.i:0,//当前上传的哪张图片
    success=data.success?data.success:0,//上传成功的个数
    fail=data.fail?data.fail:0;//上传失败的个数
    wx.uploadFile({
      url: data.url, 
      filePath: data.path[i],
      name: 'file',//这里根据自己的实际情况改
      formData:null,//这里是上传图片时一起上传的数据
      success: (resp) => {
        success++;//图片上传成功，图片上传成功的变量+1
        console.log(resp)
          console.log(i);
          //这里可能有BUG，失败也会执行这里,所以这里应该是后台返回过来的状态码为成功时，这里的success才+1
      },
      fail: (res) => {
          fail++;//图片上传失败，图片上传失败的变量+1
          console.log('fail:'+i+"fail:"+fail);
      },
      complete: () => {
          console.log(i);
          i++;//这个图片执行完上传后，开始上传下一张
      if(i==data.path.length){   //当图片传完时，停止调用          
          console.log('执行完毕');
          console.log('成功：'+success+" 失败："+fail);
      }else{//若图片还没有传完，则继续调用函数
          console.log(i);
          data.i=i;
          data.success=success;
          data.fail=fail;
          that.uploadimg(data);
      }
          
      }
    });
  } catch (error) {
      console.log(error)
  }
}

/**
 * put方法;
 * url 请求地址
 * data 请求参数
 */
let put = (url, data, isSessionKey = false) => {
  // 是否需要sessionKey;
  if (isSessionKey) data = getSessionKey(data);
  var sessionId=wx.getStorageSync('sessionId')
  var post = wxPromisify(wx.request)
  return post({
    url: url,
    method: 'PUT',
    data: data,
    header: {
      'WPGSESSID':sessionId,
      "content-type": "application/x-www-form-urlencoded"
    },
  })
}

/**
 * del方法;
 * url 请求地址
 * data 请求参数
 */
let del = (url, data, isSessionKey = false) => {
  // 是否需要sessionKey;
  if (isSessionKey) data = getSessionKey(data);
  var sessionId=wx.getStorageSync('sessionId')
  var del = wxPromisify(wx.request)
  return delete ({
    url: url,
    method: 'DELETE',
    data: data,
    header: {
      'WPGSESSID':sessionId
    },
  })
}

module.exports = {
  post: post,
  get: get,
  json:json,
  delete: del,
  put: put,
  getSessionKey: getSessionKey,
  upload:upload
}