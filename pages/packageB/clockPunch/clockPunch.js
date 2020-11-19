import http from '../../../utils/http.js'
var app = getApp();

const date = new Date();
const years = [];
const months = [];
const days = [];
const hours = [];
const minutes = [];
const second=[];
//获取年
for (let i = 2020; i <= date.getFullYear() + 5; i++) {
  var a=i+'年'
  years.push("" + a);
}
//获取月份
for (let i = 1; i <= 12; i++) {
  var a=''
  if (i < 10) {
    a = "0" + i+'月';
  }else{
    a=i+'月'
  }
  months.push("" + a);
}
//获取日期
for (let i = 1; i <= 31; i++) {
  var a=''
  if (i < 10) {
    a = "0" + i+'日';
  }else{
    a=i+'日'
  }
  days.push("" + a);
}
//获取小时
for (let i = 0; i < 24; i++) {
  var a=''
  if (i < 10) {
    a = "0" + i+'时';
  }else{
    a = i+'时'
  }
  hours.push("" + a);
}
//获取分钟
for (let i = 0; i < 60; i++) {
  var a=''
  if (i < 10) {
    a = "0" + i+'分';
  }else{
    a=i+'分'
  }
  minutes.push("" + a);
}
//获取秒
for (let i = 0; i < 60; i++) {
  var a=''
  if (i < 10) {
    a = "0" + i+'秒';
  }else{
    a=i+'秒'
  }
  second.push("" + a);
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    preType:'',
    imageurl:'https://kingsuer-1255600302.file.myqcloud.com',
    clockType:[
      {type:"movement",name: "运动"},
      {type:"diet",name:"饮食"},
      {type:"drink",name:"喝水"},
      {type:"temperature",name:"体温"},
      {type:"weight",name:"体重"}
    ],
    foodList:["主食","蛋白质","蔬菜","其他"],
    datalist:[],
    showModel:false,
    category:'',
    catename:'',
    clockTime:'',
    foodValue:[{}],
    sportValue:[{}],
    attachments:[],
    project:'',
    exerciseTime:'',
    exerciseCentrality:'',
    sleepTime:'',
    wakeUpTime:'',
    remark:'',
    waterIntake:'',
    bodyWeight:'',

    time: '',
    multiArray: [years, months, days, hours, minutes,second],
    multiIndex: [0, 6, 15, 10, 16,10],
    choose_year: '',
    istrain:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var {multiIndex,clockType} = this.data
    var date = new Date();
    multiIndex[1]=date.getMonth()+'月'; //获取当前月份(0-11,0代表1月)
    multiIndex[2]=date.getDate()-1; //获取当前日(1-31)
    multiIndex[3]=date.getHours(); //获取当前小时数(0-23)
    multiIndex[4]=date.getMinutes(); //获取当前分钟数(0-59)
    multiIndex[5]=date.getSeconds(); //获取当前秒数(0-59)
    console.log(multiIndex)
    var catename=''
    clockType.forEach(item=>{
      if(item.type==options.type){
        catename=item.name
      }
    })
    var istrain = wx.getStorageSync('istrain')
    this.setData({
      istrain:istrain,
      category:options.type,
      catename,
      multiIndex,
      choose_year: this.data.multiArray[0][0]
    })
  },
  hidesoftkey(){

  },
  // 打卡类型
  chooseType(e){
    var index=e.detail.value
    var {clockType}=this.data
    this.setData({category:clockType[index].type,catename:clockType[index].name,time:''})
  },
  // 打卡时间
  choosetime(e){
    console.log(e)
    this.setData({clockTime:e.detail.value})
  },
  // 添加食物类型
  addValue(e){
    var foodValue = this.data.foodValue
    foodValue.push({})
    this.setData({foodValue})
  },
  // 删除食物类型
  deteleFood(e){
    var foodValue = this.data.foodValue
    if(foodValue.length==1){
      wx.showToast({
        title: '至少保留一个类型',
        icon:'none'
      })
      return
    }
    var index = e.currentTarget.dataset.index
    foodValue.splice(index,1)
    this.setData({foodValue})
  },
  // 食物类型---start----
  chooseFood(e){
    console.log(e)
    let {foodValue,foodList} = this.data
    var index=e.currentTarget.dataset.index
    console.log(index,foodValue[index])
    foodValue[Number(index)].foodType=foodList[e.detail.value]
    this.setData({foodValue})
    console.log(foodValue)
  },
  getEat(e){
    var foodValue = this.data.foodValue
    var index=e.currentTarget.dataset.index
    var food = e.detail.value
    foodValue[index].food=food
    this.setData({foodValue})
  },
  getEatmuch(e){
    var foodValue = this.data.foodValue
    var index=e.currentTarget.dataset.index
    var consumption = e.detail.value
    foodValue[index].consumption=consumption
    this.setData({foodValue})
  },
  // 食物类型---end----

  // 运动类型  ------start--------
  getsportproject(e){
    this.setData({project:e.detail.value})
  },
  getsporytime(e){
    this.setData({exerciseTime:e.detail.value})
  },
  getsportkey(e){
    this.setData({exerciseCentrality:e.detail.value})
  },
  // 运动类型  ------end--------

  // 体温-----start-------
  binbsleeptime: function(e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      multiIndex: e.detail.value
    })
    const index = this.data.multiIndex;
    const year = this.data.multiArray[0][index[0]];
    const month = this.data.multiArray[1][index[1]];
    const day = this.data.multiArray[2][index[2]];
    const hour = this.data.multiArray[3][index[3]];
    const minute = this.data.multiArray[4][index[4]];
    const second = this.data.multiArray[5][index[5]];
    // console.log(`${year}-${month}-${day}-${hour}-${minute}`);
    var sleepTime= year + '-' + month + '-' + day + ' ' + hour + ':' + minute+":"+second
    var y = year.substring(0,year.length - 1)
    var m = month.substring(0,month.length - 1)
    var d = day.substring(0,day.length - 1)
    var h = hour.substring(0,hour.length - 1)
    var min = minute.substring(0,minute.length - 1)
    var s = second.substring(0,second.length - 1)
    var nowtime = this.getNowFormatDate()
    var time = y + '-' + m + '-' + d + ' ' + h + ':' + min+":"+s
    console.log(time,nowtime)
    if(time>nowtime){
      this.setData({
        sleepTime: nowtime
      })
    }else{
      this.setData({
        sleepTime: time
      })
    }
    
  },
  bindwaekuptime: function(e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      multiIndex: e.detail.value
    })
    const index = this.data.multiIndex;
    const year = this.data.multiArray[0][index[0]];
    const month = this.data.multiArray[1][index[1]];
    const day = this.data.multiArray[2][index[2]];
    const hour = this.data.multiArray[3][index[3]];
    const minute = this.data.multiArray[4][index[4]];
    const second = this.data.multiArray[5][index[5]];
    var y = year.substring(0,year.length - 1)
    var m = month.substring(0,month.length - 1)
    var d = day.substring(0,day.length - 1)
    var h = hour.substring(0,hour.length - 1)
    var min = minute.substring(0,minute.length - 1)
    var s = second.substring(0,second.length - 1)
    var nowtime = this.getNowFormatDate()
    var wakeUpTime = year + '-' + month + '-' + day + ' ' + hour + ':' + minute+":"+second
    var time = y + '-' + m + '-' + d + ' ' + h + ':' + min+":"+s
    var nowtime = this.getNowFormatDate()
    console.log(time,nowtime)
    if(time>nowtime){
      this.setData({
        wakeUpTime: nowtime
      })
    }else{
      this.setData({
        wakeUpTime: time
      })
    }
    
  },
  getremark(e){
    this.setData({remark:e.detail.value})
  },
  // 体温-----end -------
  // 喝水
  getwater(e){
    this.setData({waterIntake:e.detail.value})
  },
  // 体重
  getweight(e){
    this.setData({bodyWeight:e.detail.value})
  },

  //上传图片
  uploadpic: function(e) {
    var that = this;
    console.log(99999)
    wx.onMemoryWarning(function () {
      wx.showToast({
        title: '内存不足，清理内存后再试',
        icon:'none'
      })
      console.log('onMemoryWarningReceive')
    })
    var sessionKeyId=wx.getStorageSync('sessionKeyId')
    var sessionId=wx.getStorageSync('sessionId')
    var attachments=that.data.attachments
    wx.chooseImage({
      count: Math.abs(attachments.length - 9), // 最多可以选择的图片张数 8
      sizeType: ['compressed'], // original 原图，compressed 压缩图，默认二者都有
      sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
      success: function(res) {
        var tempFilePaths = res.tempFilePaths
        that.setData({tempFilePaths})
        var successUp = 0; //成功，初始化为0
        var failUp = 0; //失败，初始化为0
        var length = tempFilePaths.length; //总共上传的数量
        var count = 0; //第几张，初始化为0 
        that.uploadonebyeone(tempFilePaths,successUp,failUp,count,length)
      }
    })
  },
  uploadonebyeone(tempFilePaths,successUp,failUp,count,length){
    var that = this
    var sessionKeyId=wx.getStorageSync('sessionKeyId')
    var sessionId=wx.getStorageSync('sessionId')
    var attachments = that.data.attachments
    wx.uploadFile({
      url: `${app.globalData.url}/attachments/images/tencent_cloud.do`,
      filePath: tempFilePaths[count],
      name: 'file',
      header:{
        'Accept': 'application/json',
        'content-type': 'multipart/form-data',
        'WPGSESSID':sessionId
      },
      formData: {
        'sessionKeyId':sessionKeyId,
        'file': '(binary)',
        'imageType':'compound'
      },
      success: (res) => {
        if(res.statusCode!='500'){
          successUp++
          let resData=JSON.parse(res.data)
          attachments.push(resData.imageUrl)
          that.setData({attachments})
        }else{
          wx.showToast({
            title:'系统错误请联系管理员',
            icon:'none',
            duration: 2000
          })
        }
      },
      fail: (res)=> {
        failUp++
        wx.hideLoading();
      },
      complete:(res)=>{
        count++
        if(count==length){
          wx.showToast({
            title: '上传成功',
          })
        }else{
          that.uploadonebyeone(that.data.tempFilePaths,successUp,failUp,count,length)
        }
      }
    });
  },
  //删除图片
  deleteImg (e) {
    let index = e.currentTarget.dataset.index
    let attachments = this.data.attachments;
    attachments.splice(index, 1);
    this.setData({ attachments: attachments });
  },


  // 确认
  confirm(){
    var {category,time,attachments,foodValue,project,exerciseTime,exerciseCentrality,waterIntake,sleepTime,wakeUpTime,remark,bodyWeight}=this.data
    var params={}
    if(!category){
      wx.showToast({
        title: '请选择打卡类型',
        icon:'none'
      })
      return
    }else{
      if(category=='diet'){
        var a=0,b=0,c=0
        foodValue.forEach(item=>{
          if(!item.foodType)a++
          if(!item.food)b++
          if(!item.consumption)c++
        })
        if(a>0){
          wx.showToast({
            title: '请将数据填写完整',
            icon:'none'
          })
          return
        }
        if(b>0){
          wx.showToast({
            title: '请将数据填写完整',
            icon:'none'
          })
          return
        }
        if(c>0){
          wx.showToast({
            title: '请将数据填写完整',
            icon:'none'
          })
          return
        }
        params = {category:category,clockTime:time,value:JSON.stringify(foodValue),attachments:attachments}
      }
      if(category=='movement'){
        if(!project||!exerciseTime||!exerciseCentrality){
          wx.showToast({
            title: '请将数据填写完整',
            icon:'none'
          })
          return
        }
        var obj={project:project,exerciseTime:exerciseTime,exerciseCentrality:exerciseCentrality}
        params = {category:category,clockTime:time,value:JSON.stringify(obj),attachments:attachments}
      }
      if(category=='temperature'){
        if(!sleepTime||!wakeUpTime){
          wx.showToast({
            title: '请将数据填写完整',
            icon:'none'
          })
          return
        }
        var obj={sleepTime:sleepTime,wakeUpTime:wakeUpTime,remark:remark}
        params={category:category,clockTime:time,value:JSON.stringify(obj),attachments:attachments}
      }
      if(category=='drink'){
        if(!waterIntake){
          wx.showToast({
            title: '请将数据填写完整',
            icon:'none'
          })
          return
        }
        var obj={waterIntake:waterIntake}
        params = {category:category,clockTime:time,value:JSON.stringify(obj),attachments:attachments}
      }
      if(category=='weight'){
        if(!bodyWeight){
          wx.showToast({
            title: '请将数据填写完整',
            icon:'none'
          })
          return
        }
        var obj={bodyWeight:bodyWeight}
        params = {category:category,clockTime:time,value:JSON.stringify(obj),attachments:attachments}
      }
    }
    if(!time){
      wx.showToast({
        title: '请选择打卡时间',
        icon:'none'
      })
      return
    }
    if(this.data.istrain){
      if(attachments.length==0){
        wx.showToast({
          title: '请上传图片',
          icon:'none'
        })
        return
      }
    }
    this.save(params)
  },
  save(params){
    console.log(params)
    http.post(`${app.globalData.url}/clock/insert.do`, params, true).then(res => {
      if (res.data.errCode == 0) {
        wx.showToast({
          title: '打卡成功',
          icon:'none'
        })
        setTimeout(()=>{
          wx.navigateBack({
            delta:1
          },2000)
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  //获取时间日期
  bindMultiPickerChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      multiIndex: e.detail.value
    })
    const index = this.data.multiIndex;
    var year = this.data.multiArray[0][index[0]];
    year=year.slice(0,year.length-1)
    var month = this.data.multiArray[1][index[1]];
    month=month.slice(0,month.length-1)
    var day = this.data.multiArray[2][index[2]];
    day=day.slice(0,day.length-1)
    var hour = this.data.multiArray[3][index[3]];
    hour=hour.slice(0,hour.length-1)
    var minute = this.data.multiArray[4][index[4]];
    minute=minute.slice(0,minute.length-1)
    var second = this.data.multiArray[5][index[5]];
    second=second.slice(0,second.length-1)
    // console.log(`${year}-${month}-${day}-${hour}-${minute}`);
    var time = year + '-' + month + '-' + day + ' ' + hour + ':' + minute+":"+second
    var nowtime=this.getNowFormatDate()
    console.log(nowtime)
    if(time>nowtime){
      time = nowtime
    }
    this.setData({
      time:time
    })
    
  },
  //监听picker的滚动事件
  bindMultiPickerColumnChange: function(e) {
    console.log(e)
    //获取年份
    if (e.detail.column == 0) {
      let choose_year = this.data.multiArray[e.detail.column][e.detail.value];
      console.log(choose_year);
      this.setData({
        choose_year
      })
    }
    //console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    if (e.detail.column == 1) {
      let num = parseInt(this.data.multiArray[e.detail.column][e.detail.value]);
      console.log(num)
      let temp = [];
      if (num == 1 || num == 3 || num == 5 || num == 7 || num == 8 || num == 10 || num == 12) { //判断31天的月份
        for (let i = 1; i <= 31; i++) {
          if (i < 10) {
            i = "0" + i;
          }
          temp.push("" + i+'日');
        }
        this.setData({
          ['multiArray[2]']: temp
        });
      } else if (num == 4 || num == 6 || num == 9 || num == 11) { //判断30天的月份
        for (let i = 1; i <= 30; i++) {
          if (i < 10) {
            i = "0" + i;
          }
          temp.push("" + i+'日');
        }
        this.setData({
          ['multiArray[2]']: temp
        });
      } else if (num == 2) { //判断2月份天数
        let year = parseInt(this.data.choose_year);
        console.log(year);
        if (((year % 400 == 0) || (year % 100 != 0)) && (year % 4 == 0)) {
          for (let i = 1; i <= 29; i++) {
            if (i < 10) {
              i = "0" + i;
            }
            temp.push("" + i+'日');
          }
          this.setData({
            ['multiArray[2]']: temp
          });
        } else {
          for (let i = 1; i <= 28; i++) {
            if (i < 10) {
              i = "0" + i;
            }
            temp.push("" + i+'日');
          }
          this.setData({
            ['multiArray[2]']: temp
          });
        }
      }
      console.log(this.data.multiArray[2]);
    }
    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    data.multiIndex[e.detail.column] = e.detail.value;
    this.setData(data);
  },
  // 获取当前年月日时分秒
  getNowFormatDate(){
    var date = new Date();
    var seperator1 = "-";  
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var hour = date.getHours();
    var minutes = date.getMinutes() ;
    var seconds = date.getSeconds();
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    if(minutes>=0&&minutes<=9){
      minutes = '0'+minutes
    }
    var currentdate = year + seperator1 + month + seperator1 + strDate+" "+hour+":" +minutes+":" +seconds;
    return currentdate;
  },
})