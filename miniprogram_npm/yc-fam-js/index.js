module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1597988240384, function(require, module, exports) {
module.exports = require('./lib/fam-sdk')

}, function(modId) {var map = {"./lib/fam-sdk":1597988240385}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1597988240385, function(require, module, exports) {

var __TEMP__ = require('./storage');var Storage = __REQUIRE_DEFAULT__(__TEMP__);
var __TEMP__ = require('./environment');var envString = __REQUIRE_DEFAULT__(__TEMP__);
const sha1 = require('js-sha1')
const axios = require('axios')
const md5 = require('md5')

if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });exports.default = class YCFam {
  /**
   *
   * @param {String} appId 应用 Id，由 yuncheng 分配
   * @param {String} appSecret 应用密钥，由 yuncheng 分配
   * @param {String} unionId 用户唯一标识符。同一个应用內，两个用户不能重复
   */
  constructor(appId, appSecret, unionId) {
    this.appId = appId
    this.appSecret = appSecret
    this.unionId = unionId
    this.storage = new Storage()
    this.baseURL = 'https://saas.shecarefertility.com'
    this.envString = envString()
  }

  getCTS() {
    return ((new Date().getTime() / 1000) | 0) + ''
  }

  /**
   * 返回算法签名，用于接口校验
   * @param {String} cTS 时间戳，单位秒
   * @returns {String} SHA1 加密字符串
   */
  getSigns(cTS) {
    if (!cTS || cTS.length === 0) {
      cTS = this.getCTS()
    }
    return sha1(this.appId + this.appSecret + cTS + 'yunchengSaas')
  }

  commonGetParams(sessionId) {
    let dataURL = '?'
    dataURL += 'appId=' + this.appId
    let cTS = this.getCTS()
    dataURL += '&signs=' + this.getSigns(cTS)
    dataURL += '&ts=' + cTS
    dataURL += '&sessionId=' + sessionId
    dataURL += '&version=v2'
    return dataURL
  }

  /**
   * 发起算法请求
   * @param {String} debugId 格式为 UUID 的字符串，用于唯一标记一次请求
   * @param {Object} input 算法的输入项
   * @returns {Promise} 返回算法请求结果
   */
  getFAMDays(debugId, input) {
    let newKey = md5(JSON.stringify(input))
    let oldResult = this.storage.getItem(newKey)
    if (oldResult) {
      return new Promise((resolve) => {
        resolve(JSON.parse(oldResult))
      })
    }
    let data = Object.assign(
      {
        appId: this.appId,
        unionId: this.unionId,
        debugId: debugId
      },
      { data: input }
    )
    let url = this.baseURL + '/custom/al/yuncheng/famGetDay' + this.commonGetParams(debugId)
    if (this.envString === 'mnp') {
      return this.getFAMDaysForMNP(newKey, url, data)
    } else {
      return this.getFAMDaysForH5(newKey, url, data)
    }
  }

  getFAMDaysForMNP(newKey, url, data) {
    const self = this
    return new Promise((resolve, reject) => {
      wx.request({
        method: 'post',
        url: url,
        data: data,
        success(res) {
          if (res.data.code === 200) {
            // Local storage can only save strings
            self.storage.setItem(newKey, JSON.stringify(res.data))
            resolve(res.data)
          } else {
            reject(new Error(res.data.message))
          }
        },
        fail(err) {
          reject(err)
        }
      })
    })
  }

  getFAMDaysForH5(newKey, url, data) {
    const self = this
    let reqInstance = axios.create()
    return new Promise((resolve, reject) => {
      reqInstance({
        method: 'post',
        url: url,
        data: data
      })
        .then((res) => {
          if (res.data.code === 200) {
            // Local storage can only save strings
            self.storage.setItem(newKey, JSON.stringify(res.data))
            resolve(res.data)
          } else {
            reject(new Error(res.data.message))
          }
        })
        .catch((err) => {
          reject(err)
        })
    })
  }
};

}, function(modId) { var map = {"./storage":1597988240386,"./environment":1597988240387}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1597988240386, function(require, module, exports) {
var __TEMP__ = require('./environment');var envString = __REQUIRE_DEFAULT__(__TEMP__);

if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });exports.default = class Storage {
  constructor() {
    this.envString = envString()
    this.storage = new Map()
    this.itemsKey = 'yc_fam_js_cache'
    this.itemsCount = 3
  }

  getItems() {
    let itemsStr = ''
    if (this.envString === 'mnp') {
      itemsStr = wx.getStorageSync(this.itemsKey)
    } else if (this.envString === 'node') {
      itemsStr = this.storage.get(this.itemsKey)
    } else {
      itemsStr = window.localStorage.getItem(this.itemsKey)
    }

    let items = []
    if (itemsStr) {
      items = JSON.parse(itemsStr)
    }
    return items
  }

  getItem(key) {
    let items = this.getItems()
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.intput === key) {
        return item.output
      }
    }
    return null
  }

  setItem(key, value) {
    let items = this.getItems()
    while (items.length >= this.itemsCount) {
      items.shift()
    }
    let newItem = {
      intput: key,
      output: value
    }
    items.push(newItem)

    let itemsStr = JSON.stringify(items)
    if (this.envString === 'mnp') {
      wx.setStorageSync(this.itemsKey, itemsStr)
    } else if (this.envString === 'node') {
      this.storage.set(this.itemsKey, itemsStr)
    } else {
      window.localStorage.setItem(this.itemsKey, itemsStr)
    }
  }
};

}, function(modId) { var map = {"./environment":1597988240387}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1597988240387, function(require, module, exports) {
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });exports.default = function envString() {
  // This should first return, for `npm test`
  if (typeof process === 'object') {
    if (typeof process.versions === 'object') {
      if (typeof process.versions.node !== 'undefined') {
        return 'node'
      }
    }
  }
  try {
    if (wx.navigateTo) {
      return 'mnp'
    }
  } catch (error) {    
  }
  
  var ua = navigator.userAgent.toLowerCase()
  if (ua.match(/MicroMessenger/i) == 'micromessenger') {
    return 'wechat'
  }
  return 'brower'
};
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1597988240384);
})()
//# sourceMappingURL=index.js.map