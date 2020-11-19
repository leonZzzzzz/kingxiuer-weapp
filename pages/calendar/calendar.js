import {
  getMonthday,
  getMonthFirstDay,
  getDateArray,
  newDate,
  dateInterval,
  islogin,
  isNeedZero,
  formatTime
} from '../../utils/util.js'
import {
  menses,
  ovluate,
  ovluateDay,
  mlDay,
  follicle,
  periodcome,
  oldovluate,oldmlDay,
  theDayBefore,
  getNowDays,
  getMiddle,
  getDaysBetween,
  format
} from '../../utils/menses.js'
import http from '../../utils/http.js'
import uuid from '../../utils/uuid.js'
import YCFam from 'yc-fam-js'
let app = getApp();
let update = null
Page({
  data: {
    imageurl: 'https://athena-1255600302.cosgz.myqcloud.com',
    imageurl2: 'https://kingsuer-1255600302.file.myqcloud.com/',
    // 选中的日期
    selected: {},
    //紧张操作
    lock: false,
    // 年
    year: 0,
    // 月
    month: 0,
    // 当前月有多少天
    day: 0,
    // 一号与周日间隔几天
    firstInterval: 0,
    lastInterval: 0,
    //今日
    toDay: 0,
    clickDay: 0,
    //当前月
    thisMonth: 0,
    //配置信息
    config: {},
    makeLoveList: [],
    mensesList: [],
    leucorrheaList: [],
    ovluateList: [],
    ovluateDay: [],
    mlDay: [],
    folliclelist: [],
    periodlist: [],
    isToDay: true,
    nofollow: false,
    // 模态框状态
    modalSatus: 'none',
    showValue: '',
    showId: '',
    showtype: '',
    showpublic: false,
    normalPageCurrent: 0,
    loginshow: islogin(),
    gzcode: '',
    rilipic: '',
    // 许愿树开关
    wishSwitch: 'close',
    comclick: 2,
    botpic: '',
    updateMsg: {},
    prevMenstrualStartDate: [],
    nextMenstrualStartDate: [],
    nextupdate: null,
    middleData: [],
    menstrualId:'',
    rows:[],
    centerImg:'',
    centerKey:'',
    centerValue:'',
    centerType:'',
    bottomValue:'',
    bottomType:'',
    newyunc:false,//是否有调用新算法接口
    pageNum:1,
    essaylist:[],
    foreStage:{},
    showscroll:false,
    currentmensesList:[],
    currentovluateList:[]
  },


  onLoad() {
    this.setData({
      loginshow: islogin()
    })
    // app.login(this.loginCallBack)\
    // 判断第一次登陆
    this.firstAccessProcess()
    this.followWechat()
    this.riliposter()
    this.getWishSwitch()
    this.getarticleList(1)
    this.stageDays()
  },
  // 文章列表
  getarticleList(pageNum){
    http.get(`${app.globalData.url}/article/page.do`,{columnId:'',pageNum:pageNum,content:'',pageSize:20},true).then(res=>{
      if(res.data.errCode==0){
        wx.stopPullDownRefresh() //停止下拉刷新
        var essaylist = this.data.essaylist
        var data = res.data.content0.rows
        if(data.length==0){
          wx.showToast({
            title: '数据加载完毕',
            icon:'none'
          })
          return
        }
        data.map(item=>{
          if(item.attachments!=''){
            item.imagelist=item.attachments.split(',')
          }else{
            item.imagelist=[]
          }
          essaylist.push(item)
        })
        this.setData({essaylist,showcontent:true})
      }
    })
  },
  godetail(e){
    var id=e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../packageA/information/mation?id='+id,
    })
  },
  // 预测距离下一阶段天数
  stageDays(){
    http.get(`${app.globalData.url}/menstrual/getDays.do`,{},true).then(res=>{
      if(res.data.errCode==0){
        var data=res.data.content0
        var foreStage={}
        let {currentmensesList,currentovluateList,toDay}=this.data
        if(data.type=='noData'){
          if(currentmensesList.length>0){//是否有旧的预测数据
            var a=null
            currentmensesList.forEach((item,i)=>{
              var date=item.date
              date.forEach(val=>{
                if(val==toDay){
                  a=i
                }
              })
            })
            if(a){//当前日期处于经期，预计排卵开始时间
              var days=getDaysBetween(toDay,currentovluateList[a].date[0])
              console.log(days)
              foreStage={type:'ovulation',days:days-1}
            }else{
              var b=null
              currentovluateList.forEach((item,i)=>{
                var date=item.date
                date.forEach(val=>{
                  if(val==toDay){
                    b=i
                  }
                })
              })
              if(b){//当前日期处于排卵期，预计排卵结束时间
                var last = currentovluateList[b].date
                var days=getDaysBetween(toDay,last[last.length-1])
                console.log(days)
                foreStage={type:'ovulationEnd',days:days-1}
              }else{//预计下一次经期时间
                var days=null
                var last = currentmensesList[1].date
                if(toDay>last[last.length-1]){
                  var last1 = currentmensesList[2].date
                  days=getDaysBetween(toDay,last1[0])
                }else{
                  days=getDaysBetween(toDay,last[0])
                }
                foreStage={type:'menstrual',days:days-1}
              }
            }
          }
        }else{
          foreStage=res.data.content0
        }
        this.setData({foreStage})
      }
    })
  },
  onPageScroll(e){
    if(e.scrollTop>=100){
      this.setData({showscroll:true})
    }else{
      this.setData({showscroll:false})
    }
  },
  // 回到顶部
  backscrolltop(){
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: 0
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },
  goforum(){
    wx.switchTab({
      url: '../forum/forum',
    })
  },

  onShow() {
    wx.removeStorageSync('callin')
    var questionpage = wx.getStorageSync('questionpage')
    if (questionpage) {
      wx.removeStorageSync('questionpage')
    } else {
      this.thisDay(false)
    }
    // this.apiGetarticle()
    this.bottomPic()
    var essaylist=this.data.essaylist
    var daralist=wx.getStorageSync('daralist')
    var deleteid=wx.getStorageSync('deleteid')
    
    essaylist.map((item,i)=>{
      if(deleteid){
        if(item.id==deleteid){
          essaylist.splice(i, 1)
        }
      }
      if(item.id==daralist.id){
        item.praiseQuantity=daralist.praiseQuantity
        item.isPraise=daralist.isPraise
        item.newisPraise=daralist.isPraise
        item.readQuantity=daralist.readQuantity
        item.commentQuantity=daralist.commentQuantity
        item.shareQuantity=daralist.shareQuantity
      }
    })
    this.setData({essaylist})
    wx.removeStorageSync('daralist')
  },
  
  async testFAMDays(alInput,cycle) {
    let debugId = uuid()
    let fam = new YCFam('100022', 'da7564b887596ba56068271de072c0b8', this.data.config.openId)
    try {
      const { data } = await fam.getFAMDays(debugId, alInput)
      var params2={
        reqJson:alInput,
        result:data.daysOutput
      }
      console.log("本地化预计传参",params2)
      this.getForecast(params2)
    } catch (error) {
      console.log(error)
    }
  },
  // 本地化预计经期和排卵期
  getForecast(params){
    wx.removeStorageSync('callin')
    http.post(`${app.globalData.url}/menstrual/insertForecast1.do`, {json:JSON.stringify(params)}, true).then(res => {
      if (res.data.errCode == 0) {
        this.apiGetMenstrual(false)
        // that.setData({
        //   rilipic: that.data.imageurl2 + res.data.data.value
        // })
      }else if(res.data.errCode == 1){
        wx.showToast({
          title: '您已清除掉此条经期',
          icon:'none'
        })
        this.apiGetMenstrual(false)
      }
    })
  },
  
  // 日历海报
  riliposter() {
    var that = this
    http.get(`${app.globalData2.url}/api/v1/config/calendar_map`, {}, true).then(res => {
      if (res.data.code == 20000) {
        that.setData({
          rilipic: that.data.imageurl2 + res.data.data.value
        })
      }
    })
  },
  // 底部海报
  bottomPic() {
    var that = this
    http.get(`${app.globalData2.url}/api/v1/config/home_jump`, {}, true).then(res => {
      if (res.data.code == 20000) {
        that.setData({
          botpic: res.data.data.value,
          bottomValue:res.data.data.showValue,
          bottomType:res.data.data.showType,
        })
      }
    })
  },
  gotemp(){
    wx.switchTab({
      url: '../temperature/temperature',
    })
  },
  gooval(){
    wx.switchTab({
      url: '../ovulation/ovulation',
    })
  },
  gobot(){
    var {bottomValue,bottomType}=this.data
    if(bottomType==1){
      wx.navigateTo({
        url: '../packageA/question/question?imagesrc='+bottomValue,
      })
    }else if(bottomType==2){
      wx.navigateTo({
        url: '../packageB/picturewords/picturewords?id='+bottomValue,
      })
    }else if(bottomType==3){
      http.get(`${app.globalData.url}/skipProgram/get.do`,{id:bottomValue},true).then(res=>{
        wx.navigateToMiniProgram({
          appId: res.data.content0.appId,
          // path: this.data.buytype=='yanyun'?'packages/goods/detail/index?alias=26z0fmb9ylu8s':'packages/goods/detail/index?alias=36dv61t5qmi0s',
          path: res.data.content0.skipUrl,
          envVersion: 'release',// 打开正式版
          success(res) {
              // 打开成功
          },
          fail: function (err) {
            console.log(err);
          }
        })
      })
    }
  },
  // 获取许愿开关
  getWishSwitch() {
    var that = this
    http.get(`${app.globalData2.url}/api/v1/config/wishing_tree_switch`, {}, false).then(res => {
      if (res.data.code == 20000) {
        that.setData({
          wishSwitch: res.data.data.value
        })
        wx.setStorageSync('wishSwitch', res.data.data.value)
      }
    })
  },
  // 没有登陆时点击页面
  loginclick() {
    wx.showModal({
      content: '您还未登录或登录已过期。登录便于找回记录，还可以有排卵检测提醒哦！',
      success: (res) => {
        if (res.confirm) {
          wx.redirectTo({
            url: '../login/login',
          })
        }
      }
    })
  },
  // 是否关注公众号
  followWechat() {
    wx.login({
      success: (res) => {
        http.get(`${app.globalData.url}/user/getUserAttention.do`, {
          code: res.code
        }, true).then(res => {
          this.setData({
            nofollow: res.data.content0
          })
        })
      },
    })

  },
  touchStart(e) {
    var touchx = e.changedTouches[0].clientX;
    var touchy = e.changedTouches[0].clientY
    if (touchx < 200) {
      this.prevMonth()
    } else {
      this.nextMonth()
    }

  },
  // 判断是不是第一次登陆
  firstAccessProcess() {
    const hasAccess = wx.getStorageSync('calendar_access_time')
    if (hasAccess) {
      const hasmonth = wx.getStorageSync('calendar_access_month')
      var stepmonth = new Date().getMonth + 1
      if (hasmonth < stepmonth) {
        this.setData({
          modalSatus: 'flex'
        })
        wx.setStorageSync('calendar_access_time', Date.now())
        wx.setStorageSync('calendar_access_month', stepmonth)
      }
    } else {
      var date = new Date();
      var month = date.getMonth() + 1;
      wx.setStorageSync('calendar_access_time', Date.now())
      wx.setStorageSync('calendar_access_month', month)
      this.setData({
        modalSatus: 'flex'
      })

    }
  },
  // 去发帖
  gowrite(){
    wx.navigateTo({
      url: '/pages/packageA/newinfor/newinfor',
    })
  },
  // 去许愿
  toWishing() {
    wx.navigateTo({
      url: '/pages/packageA/newinfor/newinfor',
    })
    this.setData({
      modalSatus: 'none'
    })
  },
  //  关闭许愿模态框
  closeModal() {
    this.setData({
      modalSatus: 'none'
    })
  },

  loginCallBack(res) {
    // userType 1 新用户 2游客 3 注册用户
    if (!res || !res.data) return
    wx.setStorageSync('userType', res.data.userType)
    let user = res.data.user
    if (res.data.userType == 2 || res.data.userType == 3) {
      if (user.nickName || user.imgUrl) {
        app.globalData.userInfo = {
          nickName: user.nickName || '',
          avatarUrl: user.imgUrl || ''
        }
      }
    }
  },

  thisDay() {
    let now = new Date()
    this.setData({
      isToDay: true,
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      toDay: newDate('yyyy-MM-dd'),
      thisMonth: newDate('yyyy-MM-dd').substr(0, 7),
    })
    this.apiGetUser(false);
  },
  // 用户详情接口
  apiGetUser(bool) {
    wx.login({
      success: rej => {
        http.get(`${app.globalData.url}/user/get.do`, {code:rej.code}, true).then(res => {
          this.setData({
            config: res.data.content0
          })
          wx.setStorageSync('NO', res.data.content0.number);
          wx.setStorageSync('config', res.data.content0);
          
          this.apiGetMenstrual(bool);
          if(!res.data.content0.location||res.data.content0.location==null||res.data.content0.location==" "){
            this.again_getLocation()
          }
        })
      }
    })
  },
  again_getLocation(){
    console.log(78888)
    let that = this;
    // 获取位置信息
    wx.getSetting({
      success: (res) => {
        console.log("授权情况",res)
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {//非初始化进入该页面,且未授权
          wx.showModal({
            title: '是否授权当前位置',
            content: '需要获取您的地理位置，请确认授权，否则无法获取您所需数据',
            success: function (res) {
              console.log(res)
              if (res.cancel) {
                that.setData({
                  isshowCIty: false
                })
                wx.showToast({
                  title: '授权失败',
                  icon: 'none',
                  duration: 1000
                })
                wx.navigateTo({
                  url: '../packageA/adress/adress',
                })
              } else if (res.confirm) {
                wx.openSetting({
                  success: function (dataAu) {
                    console.log("dataAu",dataAu)
                    if (dataAu.authSetting["scope.userLocation"] == true) {
                      wx.showToast({
                        title: '授权成功',
                        icon: 'success',
                        duration: 1000
                      })
                      that.onGetLocation();
                    } else {
                      wx.showToast({
                        title: '授权失败',
                        icon: 'none',
                        duration: 1000
                      })
                      wx.navigateTo({
                        url: '../packageA/adress/adress',
                      })
                    }
                  }
                })
              }
            }
          })
        } else if (res.authSetting['scope.userLocation'] == undefined) {//初始化进入
          that.onGetLocation();
        }else { //授权后默认加载
          that.onGetLocation();
        }
      }
    })

  },
  // 获取用户地理位置
  onGetLocation() {
    wx.getLocation({ 
      success: (res) => {
        console.log('成功：1', res)
        this.getapis(res.latitude,res.longitude) 
      },
      fail: (res) => {
        console.log('失败：1', res)
        // wx.showToast({
        //   title: '请先选择您的城市',
        //   icon:'none'
        // })
        setTimeout(()=>{
          wx.navigateTo({
            url: '../packageA/adress/adress',
          })
        },1000)
      },
    })
  },
  getapis(latitude,longitude){
    var location = latitude+','+longitude
    http.get('https://apis.map.qq.com/ws/geocoder/v1/',{location,key:'5UTBZ-ZHLW3-7C33F-Y3RDM-HG3X7-PLFNX'}).then(res=>{
      var province = res.data.result.address_component.province
      var city = res.data.result.address_component.city
      var district = res.data.result.address_component.district
      var location2 = province+'-'+city+'-'+district
      this.apiUpdateUser(this.data.config.remind, this.data.config.id,location2)
    })
  },
  // 获取上下月经期
  getNextLast(){
    //获取上一个月的时间
    var year = '', month = '', selected = 0;
    if (this.data.month == 1) {
      year = this.data.year - 1
      month = 12
      selected = 0
    } else {
      year = this.data.year
      month = this.data.month - 1
      selected = 0
    }
    // 获取下一个月的时间
    var nextyear = '', nextmonth = ''
    if (this.data.month == 12) {
      nextyear = this.data.year + 1
      nextmonth = 1
    } else {
      nextyear = this.data.year
      nextmonth = this.data.month + 1
    }
    var prevMenstrualStartDate = [], nextMenstrualStartDate = []
    http.get(`${app.globalData.url}/menstrual/getLastAndNext.do`, { lastMonth: `${year}-${isNeedZero(month)}`, nextMonth: `${nextyear}-${isNeedZero(nextmonth)}` }, true).then(res => {
      res.data.content0.lastMonth.forEach(data => {
        prevMenstrualStartDate.push({
          date: getDateArray(data.startDate, data.endDate),
          id: data.id
        });
      })
      res.data.content0.nextMonth.forEach(data => {
        nextMenstrualStartDate.push({
          date: getDateArray(data.startDate, data.endDate),
          id: data.id
        });
      })
      this.setData({ prevMenstrualStartDate,nextMenstrualStartDate })
    })
  },
  // 月经期数接口
  apiGetMenstrual(bool) {
    wx.showLoading({})
    this.apiGetMakeLove();
    this.apiGetLeucorrhea(); 
    this.getNextLast()
    let fd = `${this.data.year}-${isNeedZero(this.data.month)}-01`
    let ld = `${this.data.year}-${isNeedZero(this.data.month)}-${getMonthday(this.data.year, this.data.month)}`
    http.get(`${app.globalData.url}/menstrual/getAllList.do`, { startDate: fd, endDate: ld }, true).then(res => {
      wx.hideLoading({})
      if (res.data.errCode == 401) {
        app.login(() => {
          this.apiGetMenstrual(false)
        })
      } else {
        // -------------------------------------------获取新算法的预测数据----------------------------------------------
        var rows = res.data.content0.menstruals
        // 如果没有预测数据且没有真实排卵期就去获取就算法的预测数据
        var s=0
        if(rows.length>0){
          rows.forEach(item=>{
            if(item.forecastOvulation&&item.forecastOvulation.startDate){
              s++
            }
          })
        }
        this.setData({rows})
        let lastMenstrualStartDate = []; var ovluateList = [],ovluateDay=[] 
        this.data.mlDay=[]
        this.data.folliclelist=[]
        rows.forEach(data => {
          lastMenstrualStartDate.push({
            date: getDateArray(data.startDate, data.endDate),
            id: data.id
          });
          if(data.forecastOvulation){
            ovluateList.push({date:getDateArray(data.forecastOvulation.startDate,data.forecastOvulation.endDate)})
            if(data.forecastOvulation.ovulateDate){
              ovluateDay.push(data.forecastOvulation.ovulateDate)
            }
          }
        })
        
        if(res.data.content0.forecastMenstruals.length>0){
          rows = res.data.content0.forecastMenstruals
          rows.forEach(data => {
            lastMenstrualStartDate.push({
              date: getDateArray(data.startDate, data.endDate),
              id: undefined,
              type:'forecast'
            });
            if(data.forecastOvulation){
              ovluateList.push({
                date:getDateArray(data.forecastOvulation.startDate,data.forecastOvulation.endDate),
                id:undefined,
                type:'forecast'
              })
              if(data.forecastOvulation.ovulateDate){
                ovluateDay.push(data.forecastOvulation.ovulateDate)
              }
            }
          })
        }
        ovluateDay.forEach((parent, i) => {
          this.data.mlDay.push(mlDay(parent, 2, 4))
        })
        console.log('新的预测数据',lastMenstrualStartDate,ovluateList,ovluateDay,this.data.mlDay,this.data.folliclelist)
        this.setData({mensesList:lastMenstrualStartDate,ovluateList,ovluateDay})

        // 旧算法的预测数据----start
        // 当线上用户初次进入页面时没有获取到最新的预测数据就先显示旧的预测数据
        if(res.data.content0.forecastMenstruals.length==0){
          var oldlastMenstrualStartDate = []
          var rows = res.data.content0.menstruals
          rows.forEach(data => {
            oldlastMenstrualStartDate.push({
              date: getDateArray(data.startDate, data.endDate),
              id: data.id
            });
          })
  
          if (rows.length > 0) {
            let nextTime = dateInterval(rows.pop().startDate, this.data.config.shortPeriod)
            if (nextTime <= ld) {
              oldlastMenstrualStartDate.push({
                date: getDateArray(nextTime, dateInterval(nextTime, this.data.config.intervalDay - 1))
              })
            } else {
              //获取上一个月的时间
              var year = '', month = '', selected = 0;
              if (this.data.month == 1) {
                year = this.data.year - 1
                month = 12
                selected = 0
              } else {
                year = this.data.year
                month = this.data.month - 1
                selected = 0
              }
              // 调用上一个月的接口
              let fd2 = `${year}-${isNeedZero(month)}-01`
              let ld2 = `${year}-${isNeedZero(month)}-${getMonthday(year, month)}`
              http.get(`${app.globalData.url}/menstrual/getAllList.do`, { startDate: fd2, endDate: ld2 }, true).then(res => {
                rows.forEach(data => {
                  oldlastMenstrualStartDate.push({
                    date: getDateArray(data.startDate, data.endDate),
                    id: data.id
                  });
                })
              })
            }
          }else if (rows.length == 0 && `${this.data.year}-${isNeedZero(this.data.month)}` == this.data.thisMonth) {
            oldlastMenstrualStartDate = this.searchMenstrual(this.data.config.recentMenstrual, this.data.config.shortPeriod, this.data.year, this.data.month)
          }
        }
         // 旧算法的预测数据----end
        

        setTimeout(() => {
          if(res.data.content0.forecastMenstruals.length>0){
            console.log(1111)
              this.calendar(this.data.year, this.data.month,bool);
          }else{
            if(s>0){
              console.log(2222)
              this.calendar(this.data.year, this.data.month,bool);
            }else{
              console.log(3333)
              this.getMenses(oldlastMenstrualStartDate, this.data.config.intervalDay, this.data.config.shortPeriod, this.data.config.longPeriod,bool)
            }
            // this.getMenses(oldlastMenstrualStartDate, this.data.config.intervalDay, this.data.config.shortPeriod, this.data.config.longPeriod,bool)
          }
        }, 600)
      }
    })
  },
  //同房的接口
  apiGetMakeLove() {
    // wx.showLoading({
    //   title: '正在加载',
    // })
    let fd = `${this.data.year}-${isNeedZero(this.data.month)}-01`
    let ld = `${this.data.year}-${isNeedZero(this.data.month)}-${getMonthday(this.data.year, this.data.month)}`
    http.get(`${app.globalData.url}/love/getList.do`, {
      startDate: fd,
      endDate: ld
    }, true).then(res => {
      // wx.hideLoading({})
      if (res.data.errCode == 401) {
        app.login(() => {
          this.apiGetMakeLove(date)
        })
      } else {
        this.data.makeLoveList = res.data.content0.rows;
      }
    })
  },
  // 新增同房
  apiAddMakeLove(date) {
    http.post(`${app.globalData.url}/love/insert.do`, {
      loveDate: date
    }, true).then(res => {
      if (res.data.errCode == 401) {
        app.login(() => {
          this.apiAddMakeLove(date)
        })
      } else {
        this.data.day[this.data.selected.index].ml = res.data.content0.id;
        this.data.selected.ml=res.data.content0.id
        this.setData({
          day: this.data.day,
          selected:this.data.selected
        })
        this.onLoad()
      }
    })
  },
  // 删除同房
  apiDelMakeLove(id, date) {
    http.post(`${app.globalData.url}/love/delete.do`, {
      id: id,
      loveDate: date
    }, true).then(res => {
      if (res.data.errCode == 401) {
        app.login(() => {
          this.apiDelMakeLove(id, date)
        })
      } else {
        this.data.day[this.data.selected.index].ml = '';
        this.data.selected.ml=''
        this.setData({
          day: this.data.day,
          selected:this.data.selected
        })
        this.onLoad()
      }
    })
  },
  // 白带增多记录
  apiGetLeucorrhea() {
    // wx.showLoading({
    //   title: '正在加载',
    // })
    let fd = `${this.data.year}-${isNeedZero(this.data.month)}-01`
    let ld = `${this.data.year}-${isNeedZero(this.data.month)}-${getMonthday(this.data.year, this.data.month)}`
    http.get(`${app.globalData.url}/leukorrhea/getList.do`, {
      startDate: fd,
      endDate: ld
    }, true).then(res => {
      // wx.hideLoading({})
      if (res.data.errCode == 401) {
        app.login(() => {
          this.apiGetLeucorrhea(date)
        })
      } else {
        this.data.leucorrheaList = res.data.content0.rows;
      }
    })
  },
  // 白带增多api
  apiAddleucorrhea(date) {
    http.post(`${app.globalData.url}/leukorrhea/insert.do`, {
      recordDate: date
    }, true).then(res => {
      if (res.data.errCode == 401) {
        app.login(() => {
          this.apiAddleucorrhea(date)
        })
      } else {
        this.data.day[this.data.selected.index].leu = res.data.content0.id;
        this.data.selected.leu=res.data.content0.id
        this.setData({
          day: this.data.day,
          selected:this.data.selected
        })
        wx.showToast({
          title: '早晚测排卵，建议使用半定量，以免错过最佳时机！',
          duration:2000,
          icon: 'none'
        })
      }
    })
  },
  // 删除白带增多api
  apiDelLeucorrhea(id, date) {
    http.post(`${app.globalData.url}/leukorrhea/delete.do`, {
      id: id,
      recordDate: date
    }, true).then(res => {
      if (res.data.errCode == 401) {
        app.login(() => {
          this.apiDelMakeLove(id, date)
        })
      } else {
        this.data.day[this.data.selected.index].leu = '';
        this.data.selected.leu=''
        this.setData({
          day: this.data.day,
          selected:this.data.selected
        })
      }
    })
  },

  /**
   * 获取月经期，排卵期，排卵日，建议同房日
   * @param {lastMenstrualStartDate} Array 当前经期的开始日期
   * @param {MenstrualDuration} 经期持续时间
   * @param {shortPeriod} 最短间隔日期
   * @param {longPeriod} 最长间隔日期
   */
  getMenses(lastMenstrualStartDate, MenstrualDuration, shortPeriod, longPeriod,bool) {
    console.log('旧数据的lastMenstrualStartDate',lastMenstrualStartDate)
    this.data.mensesList = []
    this.data.ovluateList = []
    this.data.ovluateDay = []
    this.data.mlDay = []//建议同房日
    // this.data.folliclelist = []
    lastMenstrualStartDate.forEach((parent, i) => {
      this.data.mensesList.push({ 'date': menses(parent.date[0], parent.date.length), id: parent.id })
      this.data.ovluateList.push({ 'date': oldovluate(parent.date[0], shortPeriod, longPeriod), id: parent.id  })
      // this.data.ovluateList.push({ 'date': oldovluate(parent.date[parent.date.length-1], shortPeriod, longPeriod), id: parent.id  })
      this.data.ovluateDay.push(ovluateDay(parent.date[0], shortPeriod, longPeriod))
      this.data.mlDay.push(oldmlDay(parent.date[0], shortPeriod, longPeriod))
      // this.data.folliclelist.push({ 'date': follicle(parent.date[parent.date.length - 1], parent.date.length), id: parent.id })
      // this.data.folliclelist.push({ 'date': follicle(parent.date[parent.date.length - 1], MenstrualDuration), id: parent.id })
      if (parent.type == 'forecast') {
        this.data.mensesList.forEach(item => {
          item.type = 'forecast'
        })
        // this.data.folliclelist.forEach(item => {
        //   item.type = 'forecast'
        // })
        this.data.ovluateList.forEach(item => {
          item.type = 'forecast'
        })
      }
    })
    this.data.folliclelist.forEach(val => {
      val.date.shift()
    })
    if(this.data.isToDay){
      this.setData({currentmensesList:this.data.mensesList,currentovluateList:this.data.ovluateList})
    }
    console.log('旧的预测数据',this.data.mensesList, this.data.ovluateList, this.data.ovluateDay, this.data.mlDay, this.data.folliclelist)
    this.calendar(this.data.year, this.data.month,bool);
  },
  /**
   * 渲染日历
   * @param {year} 当前年份
   * @param {month} 当前月份
   */
  calendar(year, month,bool) {
    let {mensesList,prevMenstrualStartDate,nextMenstrualStartDate}=this.data
    let firstInterval, day, lastInterval, dayList = [];
    // 保存当前月份的天数的间隔时间
    firstInterval = getMonthFirstDay(year, month)
    day = getMonthday(year, month)
    // 获取后面间隔时间
    if (35 - (day + firstInterval) >= 0) {
      lastInterval = 35 - (day + firstInterval)
    } else {
      lastInterval = 42 - (day + firstInterval)
    }
    //返回日历数组
    for (let i = 1; i <= day; i++) {
      dayList.push({
        day: `${year}-${isNeedZero(month)}-${isNeedZero(i)}` === this.data.toDay ? '今' : i,
        full: `${year}-${isNeedZero(month)}-${isNeedZero(i)}`,
        index: i - 1,
      })
    }
    let index = 0;
    let idx = 0
    this.data.periodlist = [] 
    dayList.forEach((date, i) => {
      // 判断是否月经期
      this.data.mensesList.forEach(parent => {
        parent.date.forEach((child, childIndex) => {
          if (date.full === child) {
            if (parent.id != null||parent.id!=undefined) {
              // if(parent.type='forecast'){
              //   date.forecast=true
              // }
              date.come = true
              date.mensesId = parent.id
              date.mensesindex = childIndex + 1
              if (childIndex === 0) {
                date.mensesType = 'start'
                this.data.periodlist.push({
                  'date': periodcome(date.full, 15),
                  id: parent.id
                })
              } else if (childIndex === parent.date.length - 1) {
                date.mensesType = 'end'
              } else {
                date.mensesType = 'update'
              }
            } else {
              if (parent.type === 'forecast') {
                date.forecast = true
              }else{
                if (parent.date[0] == date.full) {
                  date.mensesType = 'start'
                }
              }
              date.come = true
              date.menses = true
              this.data.periodlist.push({
                'date': periodcome(parent.date[0], 15),
                id: parent.id,
                type:'forecast'
              })
            }
          }
        })
      })
      // 判断是否卵泡期
      this.data.folliclelist.forEach(res => {
        res.date.forEach(child => {
          if (date.full == child) {
            // if(!res.id){
            //   date.forecast = true
            // }
            date.follicle = true
            if (res.type && res.type == 'forecast') {
              date.forecast = true
            }
          }
        })
      })
      // 判断是否排卵期
      this.data.ovluateList.forEach(parent => {
        parent.date.forEach((child, childIndex) => {
          if (date.full === child) {
            date.ovluate = true
            if (parent.type && parent.type == 'forecast') {
              date.forecast = true
            }
            // if (childIndex === 0) {
            //   date.ovluateType = 'start'
            // } else if (childIndex === parent.length - 1) {
            //   date.ovluateType = 'end'
            // }
          }
        })
      })
      // 判断是否排卵日
      this.data.ovluateDay.forEach(ovluateDay => {
        if (date.full == ovluateDay) {
          date.ovluateDay = true
        }
      })
      // 判断是否同房
      this.data.makeLoveList.forEach(res => {
        if (date.full === res.loveDate) {
          date.ml = res.id
        }
      })
      // 判断是否白带增多
      this.data.leucorrheaList.forEach(res => {
        if (date.full === res.recordDate) {
          date.leu = res.id
        }
      })
      // 建议同房日期
      this.data.mlDay.forEach(mlDay => {
        mlDay.forEach(val => {
          if (date.full == val) {
            date.mlDay = true
          }
        })
      })
      if (this.data.clickDay == 0) {
        if (date.full == this.data.toDay) {
          index = i
        }
      } else {
        if (date.full == this.data.clickDay) {
          index = i
        }
      }
    })
    dayList.forEach(item => {
      this.data.periodlist.forEach(a => {
        if(a.type&&a.type=='forecast'){

        }else{
          a.date.forEach(b => {
            if (b == item.full) {
              item.come = true
            }
          })
        }
      })
    })

    let showtype = ''
    if (dayList[index].menses || (dayList[index].mensesId && dayList[index].mensesType)) {
      showtype = 5
    } else if (dayList[index].ovluate) {
      if (dayList[index].ovluateDay) {
        showtype = 7
      } else if (dayList[index].mlDay) {
        showtype = 8
      } else {
        showtype = 9
      }
    } else if (dayList[index].follicle) {
      showtype = 6
    } else if (dayList[index].leu) {
      showtype = 10
    } else {
      showtype = 11
    }
    this.getWall(dayList[index])
    var selected=null,nextupdate=null,update=null
    // if(this.data.toDay==dayList[index].full){

    // }else{
      var newmensesList=[]
      mensesList.forEach(item=>{
        if(!item.type){
          newmensesList.push(item)
        }
      })
      console.log(newmensesList,prevMenstrualStartDate,nextMenstrualStartDate)
      // 判断当月默认选中的天数是否在上个月经期的15天以内
      if(newmensesList.length==1){
        // 判断当前月份还有没有经期，如果有且选中日期在经期后面那prevMenstrualStartDate就为当前经期
        if(dayList[index].full>newmensesList[0].date[0]){
          prevMenstrualStartDate=newmensesList
        }else{
          // 如果选中日期在经期前面那下一条经期就是newmensesList
          nextMenstrualStartDate=newmensesList
        }
      }
      if(newmensesList.length>1){
        // 判断当前选中日期在第一条经期的15天内还是第二条经期的15天内
        if(Date.parse(new Date(dayList[index].full))<Date.parse(new Date(newmensesList[0].date[0]))){
          // 在第一条经期前
          var next=[]
          next.push(newmensesList[0]) 
          nextMenstrualStartDate=next
        }else if(Date.parse(new Date(dayList[index].full))>Date.parse(new Date(newmensesList[0].date[0]))&&Date.parse(new Date(dayList[index].full))<Date.parse(new Date(newmensesList[1].date[0]))){
          // 在第二条经期前第一条经期后
          var next=[]
          next.push(newmensesList[1])
          nextMenstrualStartDate=next
        }
      }
      console.log(prevMenstrualStartDate,nextMenstrualStartDate)
      if (prevMenstrualStartDate.length > 0) {
        var predate = prevMenstrualStartDate[prevMenstrualStartDate.length - 1].date
        if(predate[0]<dayList[index].full){
          var  arr = getMiddle(predate[0],dayList[index].full)
          console.log(arr)
          if (arr.length < 16) {
            dayList[index].come=true
            // dayList[index].mensesType='start'
            if(arr.length==1){
              nextupdate=null
            }else{
              nextupdate = {
                id: '',
                startDate: dayList[index].full,
                msg: "nextupdate"
              }
            }
          } 
        }
      }
      
      
      // 当前默认选中日期是否在本月经期的15天内
      if (newmensesList.length > 0) {
        var mendate = newmensesList[0].date
        var arr =[]
        if(dayList[index].full< mendate[0]){
          arr = getMiddle(dayList[index].full, mendate[0])
        }else{
          arr = getMiddle(mendate[0],dayList[index].full)
        }
        console.log(arr)
        console.log(dayList[index].full, mendate[0])
        if(dayList[index].full< mendate[0]){
          // 在经期前的15天内
          if (arr.length < 17) {
            if(arr.length==1){
              update=null
            }else{
              update = {
                id: '',
                startDate: dayList[index].full,
                msg: "update"
              }
            }
          }
        }else{
          // 在经期后的15天内
          if (arr.length < 17) {
            if(arr.length==1){
              nextupdate=null
            }else{
              nextupdate = {
                id: '',
                startDate: dayList[index].full,
                msg: "nextupdate"
              }
            }
          }
        }
        
      }
      // 当前默认选中经期是否在下一个月的的经期15天内
      if(nextMenstrualStartDate.length>0){
        if(dayList[index].full<nextMenstrualStartDate[0].date[0]){
          var arr = getMiddle(dayList[index].full, nextMenstrualStartDate[0].date[0])
          console.log(arr)
          if(arr.length<17){
            update = {
              id: '',
              startDate: dayList[index].full,
              msg: "update"
            }
          }else{
            update=null
          }
        }
      }
    // }
    if(bool){
      if(this.data.menstrualId){
        // this.getYuce(dayList)
      }
    }
    console.log(update,nextupdate)
    this.setData({
      // selected:selected,
      nextupdate:nextupdate,
      updateMsg:update,
      lock: false,
      selected: dayList[index],
      firstInterval: firstInterval,
      lastInterval: lastInterval,
      day: dayList,
      showtype: showtype
    })
    this.stageDays()
  },
  
  apiUpdateUser(remind, id,location) {
    if(!remind){
      remind=''
    }
    http.post(`${app.globalData.url}/user/update.do`, {
      remind,
      id,
      location
    }, true).then(res => {

    })
  },
  onChange(e) {
    if (this.data.config.mobile == null) {
      wx.showToast({
        title: '游客无法开启该功能',
        icon: 'none'
      })
      this.setData({
        "config.remind": 2
      });
      return;
    }
    let remind = e.detail.value ? 1 : 2;
    this.apiUpdateUser(remind, this.data.config.id,this.data.config.location);
  },
  clickmodel() {
    this.getgzcontent()
  },
  gongzhongTips(e) {
    var that = this
    wx.login({
      success(res) {
        if (res.code) {
          http.post(`${app.globalData.url}/user/publicMessageSet.do`, {
            messageAlert: e.detail.value,
            code: res.code
          }, true).then(res => {
            if (res.data.errCode == 0) {
              if (e.detail.value) {
                wx.showToast({
                  title: '已开启消息提醒',
                  icon: 'none'
                })
              } else {
                wx.showToast({
                  title: '已关闭消息提醒',
                  icon: 'none'
                })
              }

            } else {
              wx.showToast({
                title: res.data.errMsg,
                icon: 'none'
              })
              that.getgzcontent()
            }
          })
        }
      }
    })
  },
  // 获取公众图片
  getgzcontent() {
    var that = this
    http.get(`${app.globalData2.url}/api/v1/config/qr_code_pop_ups`, {}, true).then(res => {
      if (res.data.code == 20000) {
        that.setData({
          gzcode: that.data.imageurl2 + res.data.data.value,
          showpublic: true
        })
      }
    })
  },
  // 关闭公众弹窗
  delpublic() {
    this.setData({
      showpublic: false
    })
  },
  
  //查询上一月
  prevMonth() {
    // 是否等于当前月份
    if (this.data.month == 1) {
      this.setData({
        year: this.data.year - 1,
        month: 12,
        selected: 0
      })
    } else {
      this.setData({
        month: this.data.month - 1,
        selected: 0
      })
    }
    let thisMonth = `${this.data.year}-${isNeedZero(this.data.month)}`
    console.log(thisMonth)
    this.setData({
      isToDay: thisMonth == this.data.thisMonth,
      prevMenstrualStartDate: [],
      nextMenstrualStartDate: []
    })
    //以当前月份为基准。如果日期大于当前月，是预测功能的。小于当前月份输入历史记录，查询后台。
    // if (this.data.thisMonth < thisMonth) {
    //   let menstrual = this.searchMenstrual(this.data.config.recentMenstrual, this.data.config.shortPeriod, this.data.year, this.data.month)
    //   this.getMenses(menstrual, this.data.config.intervalDay, this.data.config.shortPeriod, this.data.config.longPeriod)
    // } else if (this.data.thisMonth > thisMonth) {
    //   this.apiGetMenstrual([])
    // } else if (this.data.thisMonth = thisMonth) {
      this.apiGetMenstrual(false)
    // }
  },

  //查询下一月
  nextMonth() {
    if (this.data.month == 12) {
      this.setData({
        year: this.data.year + 1,
        month: 1,
        selected: 0
      })
    } else {
      this.setData({
        month: this.data.month + 1,
        selected: 0
      })
    }
    let thisMonth = `${this.data.year}-${isNeedZero(this.data.month)}`
    console.log(thisMonth)
    this.setData({
      isToDay: thisMonth == this.data.thisMonth,
      prevMenstrualStartDate: [],
      nextMenstrualStartDate: []
    })
    //以当前月份为基准。如果日期大于当前月，是预测功能的。小于当前月份输入历史记录，查询后台。
    // if (this.data.thisMonth >= thisMonth) {
      this.apiGetMenstrual(false)
    // } else if (this.data.thisMonth < thisMonth) {
    //   var riqi = ''
    //   var month = this.data.config.recentMenstrual.slice(5, 7)
    //   if (Number(month) == 1 || Number(month) == 3 || Number(month) == 5 || Number(month) == 7 || Number(month) == 8 || Number(month) == 10 || Number(month) == 12) {
    //     var year = this.data.config.recentMenstrual.slice(0, 4)
    //     var day = this.data.config.recentMenstrual.slice(8, 10)
    //     day = Number(day) + 1
    //     if (day < 10) {
    //       day = '0' + day
    //     } else {
    //       day = day
    //     }
    //     var ymd = year + '-' + month + '-' + day
    //     riqi = ymd
    //   } else {
    //     riqi = this.data.config.recentMenstrual
    //   }
    //   let menstrual = this.searchMenstrual(riqi, this.data.config.shortPeriod, this.data.year, this.data.month)
    //   this.getMenses(menstrual, this.data.config.intervalDay, this.data.config.shortPeriod, this.data.config.longPeriod)
    // }
  },
  /**
   * 经期查询
   * @param {lastMenstrualDate} 最后一次月经的时间
   * @param {MenstrualCycle} 月经的周期
   * @param {year} 当前年份
   * @param {month} 当前月份
   */
  searchMenstrual(lastMenstrualDate, MenstrualCycle, year, month) {
    let searchDate = `${year}-${isNeedZero(month)}-01`;
    let searchMenstrualDay;
    if (lastMenstrualDate.substr(0, 7) == `${year}-${isNeedZero(month)}`) {
      searchMenstrualDay = lastMenstrualDate
    } else {
      let IntervalNum = getDateArray(lastMenstrualDate, searchDate).length;
      let num = MenstrualCycle - IntervalNum % MenstrualCycle
      searchMenstrualDay = dateInterval(searchDate, num)
    }
    // 查询的月份
    let lastTime = getDateArray(dateInterval(searchMenstrualDay, -MenstrualCycle), dateInterval(dateInterval(searchMenstrualDay, -MenstrualCycle), this.data.config.intervalDay - 1))
    let nowTime = getDateArray(searchMenstrualDay, dateInterval(searchMenstrualDay, this.data.config.intervalDay - 1))
    let nextTime = getDateArray(dateInterval(searchMenstrualDay, MenstrualCycle), dateInterval(dateInterval(searchMenstrualDay, MenstrualCycle), this.data.config.intervalDay - 1))
    let searchMenstrual = [{
      date: lastTime, type: 'forecast'
    }, {
      date: nowTime, type: 'forecast'
    }, {
      date: nextTime, type: 'forecast'
    }]
    console.log(searchMenstrual)
    return searchMenstrual
  },
  // 去到文章详情
  goaritc() {
    wx.navigateTo({
      // url:'../../pages/packageA/question/question?id='+this.data.showId,
      url: '../../pages/packageA/question/question?type=' + this.data.showtype,
    })
  },
  // 获取安全期日历文章
  apiGetarticle(url) {
    http.get(`${app.globalData2.url}${url}`, {}, true).then(res => {
      if (res.data.code == 20000) {
        this.setData({
          showValue: res.data.data.showValue,
          showId: res.data.data.value
        })
      }
    })
  },

  // 选中日期
  selectedDay(e) {
    console.log('选中日期', e.currentTarget.dataset.list)
    var chooselist = e.currentTarget.dataset.list
    var { prevMenstrualStartDate, nextMenstrualStartDate,mensesList } = this.data 
    var newmensesList=[]
    mensesList.forEach(item=>{//本月已录入的经期数据
      if(!item.type){
        newmensesList.push(item)
      }
    })
    console.log(newmensesList,prevMenstrualStartDate, nextMenstrualStartDate)
    if(newmensesList.length==1){
      // 判断当前月份还有没有经期，如果有且选中日期在经期后面那prevMenstrualStartDate就为当前经期
      console.log(chooselist.full,newmensesList[0].date[0])
      if(chooselist.full>newmensesList[0].date[0]){
        prevMenstrualStartDate=newmensesList
      }else{
        // 如果选中日期在经期前面那下一条经期就是newmensesList
        nextMenstrualStartDate=newmensesList
      }
    }
    if(newmensesList.length>1){
      // 判断当前选中日期在第一条经期的15天内还是第二条经期的15天内
      console.log(chooselist.full,newmensesList[0].date[0])
      if(Date.parse(new Date(chooselist.full))<Date.parse(new Date(newmensesList[0].date[0]))){
        // 在第一条经期前
        var next=[]
        next.push(newmensesList[0]) 
        nextMenstrualStartDate=next
      }else if(Date.parse(new Date(chooselist.full))>Date.parse(new Date(newmensesList[0].date[0]))&&Date.parse(new Date(chooselist.full))<Date.parse(new Date(newmensesList[1].date[0]))){
        // 在第二条经期前第一条经期后
        var next=[],next2=[]
        next2.push(newmensesList[0])
        next.push(newmensesList[1])
        nextMenstrualStartDate=next
        prevMenstrualStartDate=next2
      }
    }
    console.log(prevMenstrualStartDate,nextMenstrualStartDate)
    let showtype = ''
    let sId, msIndex, meIndex, nextIndex
    let sIndex = chooselist.index
    let update = null, nextupdate = null
    if (prevMenstrualStartDate.length > 0) {
      var predate = prevMenstrualStartDate[prevMenstrualStartDate.length - 1].date
      if(chooselist.full>predate[0]){
        var arr = getMiddle(predate[0], chooselist.full)
        console.log(arr)
        if (arr.length < 16) {
          chooselist.come = true
          nextIndex = true
        } else {
          nextIndex = false
        }
      }
    }
    if (nextMenstrualStartDate.length > 0) {
      var nextdate = nextMenstrualStartDate[0].date
      if(chooselist.full<nextdate[0]){
        var arr = getMiddle(chooselist.full, nextdate[0])
        console.log(arr)
        if (arr.length < 16) {
          meIndex = true
        } else {
          meIndex = false
        }
      }
      // }else{
      //   arr = getMiddle(nextdate[0],chooselist.full)
      // }
      
    }

    if (chooselist.menses || (chooselist.mensesId && chooselist.mensesType)) {
      showtype = 5
    } else if (chooselist.ovluate) {
      if (chooselist.ovluateDay) {
        showtype = 7
      } else if (chooselist.mlDay) {
        showtype = 8
      } else {
        showtype = 9
      }
    } else if (chooselist.follicle) {
      showtype = 6
    } else if (chooselist.leu) {
      showtype = 10
    } else {
      showtype = 11
    }
    
    if(newmensesList.length>1){
      // 判断当前选中日期在第一条经期的15天内还是第二条经期的15天内
      if(Date.parse(new Date(chooselist.full))<Date.parse(new Date(newmensesList[0].date[0]))){
        // 在第一条经期前
        var s = ''
        this.data.day.forEach(day => {
          if(day.full== newmensesList[0].date[0]){
            s = day.index
          }
        })
        if (parseInt(sIndex -s) > 0) {
          meIndex = parseInt(sIndex - s) < 15
        }
        
      }else if(Date.parse(new Date(chooselist.full))>Date.parse(new Date(newmensesList[0].date[0]))&&Date.parse(new Date(chooselist.full))<Date.parse(new Date(newmensesList[1].date[0]))){
        // 在第二条经期前第一条经期后
        
      }
    }else{
      this.data.day.forEach(day => {
        if (day.mensesId != null && day.mensesType == 'start') {
          // meIndex = day.index + (15 - day.mensesindex) + 1 >= sIndex;
          // 获取经期后的15天
          if (parseInt(sIndex - day.index) > 0) {
            nextIndex = parseInt(sIndex - day.index) < 15
          }
          // 获取经期前的15天
          if (parseInt(day.index - sIndex) > 0) {
            meIndex = parseInt(day.index - sIndex) < 15
          }
        };
      })
    }
    
    if (meIndex) {
      update = {
        id: sId,
        startDate: chooselist.full,
        msg: "update"
      }
    };
    if (nextIndex) {
      nextupdate = {
        id: sId,
        startDate: chooselist.full,
        msg: "nextupdate"
      }
    }
    if (chooselist.full > this.data.toDay) {
      this.setData({
        lock: true
      })
    } else {
      this.setData({
        lock: false
      })
    }
    console.log(update,nextupdate)
    this.setData({
      showtype: showtype,
      selected: chooselist,
      updateMsg: update,
      nextupdate: nextupdate,
    })
    // 获取中间日期背景图
    this.getWall(chooselist)
  },

  // 姨妈来了
  mCome(e) {
    var { selected, day, prevMenstrualStartDate, nextMenstrualStartDate, updateMsg } = this.data
    var type = e.currentTarget.dataset.type
    var num = e.currentTarget.dataset.num
    this.setData({
      clickDay: selected.full, comclick: 1,
      updateMsg: updateMsg
    })
    if (num == 2) {
      wx.showModal({
        title: '您已标记了月经开始日，确认将月经开始日期修改为' + selected.full + '吗？',
        success: (res => {
          if (res.confirm) {
            // 经期后的15天内--姨妈刚来
            var url = '/menstrual/lessFifteen.do'
            var params = { operateType: 'just_arrived', checkDate: selected.full }
            this.apiAddMenstrual(url, params)
          }
        })
      })
    } else {
      if (type == 'scene1') {
        wx.showToast({
          title: '加载中，请稍后',
          icon: 'loading',
          mask: true,
          duration: 4000
        })
        // 经期第一天---姨妈没来
        var url = '/menstrual/menstrualNoCome.do'
        var params = { checkDate: selected.full }
        this.apiAddMenstrual(url, params)
      } else if (type == 'scene2') {
        wx.showToast({
          title: '加载中，请稍后',
          icon: 'loading',
          mask: true,
          duration: 4000
        })
        // 经期的某一天，不含第一天
        var url = '/menstrual/menstrualGoing.do'
        var params = { checkDate: selected.full }
        this.apiAddMenstrual(url, params)
      } else if (type == 'scene3') {
        wx.showToast({
          title: '加载中，请稍后',
          icon: 'loading',
          mask: true,
          duration: 4000
        })
        // 经期后的15天内--姨妈还在
        var url = '/menstrual/lessFifteen.do'
        var params = { operateType: 'still_exist', checkDate: selected.full }
        this.apiAddMenstrual(url, params)
      } else if (type == 'scene5') {
        wx.showToast({
          title: '加载中，请稍后',
          icon: 'loading',
          mask: true,
          duration: 4000
        })
        // if(prevMenstrualStartDate.length>0){
        //   //  本月没有设置经期---姨妈来了
        //   var url='/menstrual/inserts.do'
        //   var params={checkDate:selected.full}
        //   this.apiAddMenstrual(url,params)
        // }else{
        // 上月没有设置经期--姨妈来了
        var url = '/menstrual/moreThanFifteen.do'
        var params = { checkDate: selected.full }
        this.apiAddMenstrual(url, params)
        // }
      } else if (type == 'scene6') {
        // 下个月设置了经期---姨妈来了
        // if(nextMenstrualStartDate.length>0){
        //   var url='/menstrual/lessFifteen.do'
        //   var params={operateType:'just_arrived',checkDate:selected.full}
        //   this.apiAddMenstrual(url,params)
        // }else{
        wx.showToast({
          title: '加载中，请稍后',
          icon: 'loading',
          mask: true,
          duration: 4000
        })
        // 下个月没有设置经期--姨妈来了
        var url = '/menstrual/moreThanFifteen.do'
        var params = { checkDate: selected.full }
        this.apiAddMenstrual(url, params)
        // }
      }
    }
    // this.apiGetLeucorrhea()
    // this.apiGetMakeLove()
    this.setData({
      clickDay: this.data.selected.full,
      selected: this.data.selected,
    })
    setTimeout(() => {
      this.setData({ comclick: 2 })
    }, 1500)
  },

  apiAddMenstrual(url, params) {
    var {config} = this.data
    var cycle = Math.round((config.longPeriod+config.shortPeriod)/2)
    if (params.operateType) {
      http.post(`${app.globalData.url}${url}`, { checkDate: params.checkDate, operateType: params.operateType }, true).then(res => {
        if (res.data.errCode == 401) {
          app.login(() => {
            this.apiAddMenstrual(url, params)
          });
        } else {
          var menstrualId=res.data.content0.menstrual.id
          this.setData({menstrualId})
          if(res.data.errCode==1){
            wx.showToast({
              title: res.data.errMsg,
              icon:'none'
            })
          }else if(res.data.errCode==0){
            var alInput = res.data.content0.json
            if(alInput){
              if(alInput.daysInput.length>0){
                this.testFAMDays(alInput,cycle)
              }else{
                this.apiGetMenstrual(false)
              }
            }else{
              this.apiGetMenstrual(false)
            }
          }
        }
      })
    } else {
      http.post(`${app.globalData.url}${url}`, { checkDate: params.checkDate }, true).then(res => {
        if (res.data.errCode == 401) {
          app.login(() => {
            this.apiAddMenstrual(url, params)
          });
        } else {
          var menstrualId=res.data.content0.menstrual.id
          this.setData({menstrualId})
          if(res.data.errCode==1){
            wx.showToast({
              title: res.data.errMsg,
              icon:'none'
            })
          }else if(res.data.errCode==0){
            var alInput = res.data.content0.json
            if(alInput){
              if(alInput.daysInput.length>0){
                this.testFAMDays(alInput,cycle)
              }else{
                this.apiGetMenstrual(false)
              }
            }else{
              this.apiGetMenstrual(false)
            }
          }
        }
      })
    }
  },
  getWall(selected){
    var url=''
    if(selected.menses||(selected.mensesId && selected.mensesType)){
      url='/api/v1/config/bottom_menstrual_period'
    }else if(selected.ovluate){
      url='/api/v1/config/bottom_ovulation_phase'
    }else if(selected.follicle){
      url='/api/v1/config/bottom_follicular_phase'
    }else{
      url='/api/v1/config/bottom_security_period'
    }
    http.get(`${app.globalData2.url}${url}`,{},true).then(res=>{
      let {value,key,showValue,showType}=res.data.data
      this.setData({centerImg:value,centerKey:key,centerValue:showValue,centerType:showType})
    })
  },
  gocenter(e){
    var key = e.currentTarget.dataset.key
    var {centerValue,centerType}=this.data
    if(centerType==1){
      wx.navigateTo({
        url: '../packageA/question/question?imagesrc='+centerValue,
      })
    }else if(centerType==2){
      wx.navigateTo({
        url: '../packageB/picturewords/picturewords?id='+centerValue,
      })
    }else if(centerType==3){
      http.get(`${app.globalData.url}/skipProgram/get.do`,{id:centerValue},true).then(res=>{
        wx.navigateToMiniProgram({
          appId: res.data.content0.appId,
          // path: this.data.buytype=='yanyun'?'packages/goods/detail/index?alias=26z0fmb9ylu8s':'packages/goods/detail/index?alias=36dv61t5qmi0s',
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
    }
  },
  // 获取预测数据
  getYuce(day){
    var {year, month,prevMenstrualStartDate,nextMenstrualStartDate}=this.data
    let preyear='',premonth='',nextyear='',nextmonth=''
    if(month==12){
      preyear=year
      premonth=11
      nextyear=year+1
      nextmonth=1
    }else if(month==1){
      preyear=year-1
      premonth=12
      nextyear=year
      nextmonth=2
    }else{
      preyear=year
      premonth=month-1
      nextyear=year
      nextmonth=month+1
    }
    
    var predayList = getNowDays(preyear, premonth)
    var nextdayList = getNowDays(nextyear, nextmonth)
    // console.log(predayList,nextdayList)
    
    predayList.forEach(day=>{
      prevMenstrualStartDate.forEach(pre=>{
        if(!pre.type){
          pre.date.forEach(date=>{
            if(day.full==date){
              day.come=true
            }
          })
        }
      })
    })
    nextdayList.forEach(day=>{
      nextMenstrualStartDate.forEach(pre=>{
        if(!pre.type){
          pre.date.forEach(date=>{
            if(day.full==date){
              day.come=true
            }
          })
        }
      })
    })
    // 预测经期算法---start
    var {config} = this.data
    var cycle = Math.round((config.longPeriod+config.shortPeriod)/2)
    var error = config.longPeriod-config.shortPeriod
    var intervalDay = config.intervalDay
    var daysInput=[]
    predayList.forEach(item=>{
      var list = {}
      if(item.come){
        var str2 = item.full.replace(/-/g, '/');//g是重点，如果替换的为‘/’，需要转义，吧/a/g替换为'/\//g'
        item.riqi=str2+' '+'12:00:00'
        var timestamp = Date.parse(item.riqi)/1000;
        list.impactTempFlag=0,
        list.BBT=0,
        list.ovulationResultByUser=0,
        list.ovulationResultByLH=0,
        list.cervicalMunusRecord=0,
        list.timestamp=timestamp
        list.menstruationRecord=10
        daysInput.push(list)
      }
    })
    day.forEach(item=>{
      var list = {}
      var str2 = item.full.replace(/-/g, '/');//g是重点，如果替换的为‘/’，需要转义，吧/a/g替换为'/\//g'
      item.riqi=str2+' '+'12:00:00'
      var timestamp = Date.parse(item.riqi)/1000;
      list.impactTempFlag=0,
      list.BBT=0,
      list.ovulationResultByUser=0,
      list.ovulationResultByLH=0,
      list.cervicalMunusRecord=0,
      list.timestamp=timestamp
      list.menstruationRecord=0
      if(item.mensesId&&item.come){
        list.menstruationRecord=10
      }
      daysInput.push(list)
    })
    nextdayList.forEach(item=>{
      var list = {}
      if(item.come){
        var str2 = item.full.replace(/-/g, '/');//g是重点，如果替换的为‘/’，需要转义，吧/a/g替换为'/\//g'
        item.riqi=str2+' '+'12:00:00'
        var timestamp = Date.parse(item.riqi)/1000;

        // item.riqi=item.full+' '+'12:00:00'
        // var timestamp = Date.parse(item.riqi)/1000;
        list.impactTempFlag=0,
        list.BBT=0,
        list.ovulationResultByUser=0,
        list.ovulationResultByLH=0,
        list.cervicalMunusRecord=0,
        list.timestamp=timestamp
        list.menstruationRecord=10
        daysInput.push(list)
      }
    })
    let alInput = {
      debug: 0,
      userData: {
        userAverageCycleLength: cycle,
        userCycleLengthError: error,
        userCycleRegularity: 1,
        userAverageMenstruationLength: intervalDay,
        userAverageLuteumLength: 14
      },
      daysInput: daysInput
    }
    // var callin=wx.getStorageSync('callin')
    // if(callin&&callin==1){
    //   wx.removeStorageSync('callin')
    // }else{
      console.log('获取预测数据传参',alInput)
      this.testFAMDays(alInput,cycle)

    // }

    // 预测经期算法--end
  },

  // 已经同房
  makeLove() {
    let index = this.data.selected.index
    if (this.data.day[index].ml == null || this.data.day[index].ml == '') {
      this.apiAddMakeLove(this.data.day[index].full);
    } else {
      this.apiDelMakeLove(this.data.day[index].ml, this.data.day[index].full);
    }
  },

  // 白带增多
  leucorrhea_Inc() {
    console.log(this.data.selected)
    let index = this.data.selected.index
    if (this.data.day[index].leu == null || this.data.day[index].leu == '') {
      this.apiAddleucorrhea(this.data.day[index].full);
    } else {
      this.apiDelLeucorrhea(this.data.day[index].leu, this.data.day[index].full);
    }
  },
  onShareAppMessage() {
    return {
      title: '备孕记录',
      path: 'pages/login/login?jumpType=/pages/calendar/calendar'
    }
  },
  downImage() {
    var url = this.data.gzcode
    wx.downloadFile({
      url: url,
      success: function (res) {
        var benUrl = res.tempFilePath;
        //图片保存到本地相册
        wx.saveImageToPhotosAlbum({
          filePath: benUrl,
          //授权成功，保存图片
          success: function (data) {
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 2000
            })
          },
          //授权失败
          fail: function (err) {
            if (err.errMsg) { //重新授权弹框确认
              wx.showModal({
                title: '提示',
                content: '您好,请先授权，在保存此图片。',
                showCancel: false,
                success(res) {
                  if (res.confirm) { //重新授权弹框用户点击了确定
                    wx.openSetting({ //进入小程序授权设置页面
                      success(settingdata) {
                        if (settingdata.authSetting['scope.writePhotosAlbum']) { //用户打开了保存图片授权开关
                          wx.saveImageToPhotosAlbum({
                            filePath: benUrl,
                            success: function (data) {
                              wx.showToast({
                                title: '保存成功',
                                icon: 'success',
                                duration: 2000
                              })
                            },
                          })
                        } else { //用户未打开保存图片到相册的授权开关
                          wx.showModal({
                            title: '温馨提示',
                            content: '授权失败，请稍后重新获取',
                            showCancel: false,
                          })
                        }
                      }
                    })
                  }
                }
              })
            }
          }
        })
      }
    })
  },

  //点击保存图片
  downImage1(e) {
    let that = this
    //若二维码未加载完毕，加个动画提高用户体验
    wx.showToast({
      icon: 'loading',
      title: '正在保存图片',
      duration: 1000
    })
    //判断用户是否授权"保存到相册"
    wx.getSetting({
      success(res) {
        //没有权限，发起授权
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() { //用户允许授权，保存图片到相册
              that.savePhoto(that.data.gzcode);
            },
            fail() { //用户点击拒绝授权，跳转到设置页，引导用户授权
              wx.openSetting({
                success() {
                  wx.authorize({
                    scope: 'scope.writePhotosAlbum',
                    success() {
                      that.savePhoto(that.data.gzcode);
                    }
                  })
                }
              })
            }
          })
        } else { //用户已授权，保存到相册
          that.savePhoto(that.data.gzcode)
        }
      }
    })
  },
  //保存图片到相册，提示保存成功
  savePhoto(url) {
    let that = this
    wx.downloadFile({
      url: url,
      success: function (res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success(res) {
            if (res.errMsg == "saveImageToPhotosAlbum:ok") {
              wx.showToast({
                title: '保存成功',
                icon: "success",
                duration: 1000
              })
            }
          }
        })
      }
    })
  },
    /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.data.pageNum++;
    this.getarticleList(this.data.pageNum)
  },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
  onPullDownRefresh: function () {
      //调用刷新时将执行的方法
      this.setData({pageNum:1,essaylist:[]})
      this.getarticleList(1)
  }
})