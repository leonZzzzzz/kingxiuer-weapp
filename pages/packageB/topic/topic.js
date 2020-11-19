import http from '../../../utils/http.js'
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imageurl:'https://kingsuer-1255600302.file.myqcloud.com',
    surveyId:'',
    questionlist:[],
    answerList:[],
    title:'',
    content:'',
    checklist:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({surveyId:options.surveyId})
    this.getDetail(options.surveyId)
  },
  // 问卷详情
  getDetail(id){
    http.get(`${app.globalData2.url}/api/v1/survey/get`, {id}, true).then(res => {
      if (res.data.code == 20000) {
        var data=res.data.data.survey
        var questionlist = data.questionList
        var {answerList}=this.data
        questionlist.forEach((item,index)=>{
          answerList.push({required:item.required})
        })
        console.log(answerList)
        this.setData({questionlist:questionlist,title:data.title,content:data.content,answerList})
      }
    })
  },

  // 多选
  checkboxChange(e){
    console.log(e)
    let {answerList,questionlist}=this.data
    var {index}=e.currentTarget.dataset
    var valuelist = e.detail.value
    // var mulcheck=[]
    // 获取有几个多选题
    // questionlist.forEach((item,index)=>{
    //   if(item.type==2){
    //     mulcheck.push({index:index})
    //   }
    // })
    var optionList = questionlist[index].optionList
    var checklist=[]
    optionList.forEach(item=>{
      valuelist.forEach(val=>{
        var b={}
        if(item.value==val){
          b.value=item.id
          b.questionId=item.questionId
          b.type=questionlist[index].type
          checklist.push(b)
        }
      })
    })
    answerList[index].list=checklist
    this.setData({answerList})
   console.log(answerList)
  },
  // 单选
  radioChange(e){
    console.log(e)
    let {answerList,questionlist}=this.data
    var {index}=e.currentTarget.dataset
    var value=e.detail.value
    var optionList = questionlist[index].optionList
    var obj={}
    optionList.forEach(item=>{
      if(item.value==value){
        obj.questionId=item.questionId
        obj.value=item.id
      }
    })
    // obj.value=value
    obj.type=questionlist[index].type
    obj.required=answerList[index].required
    answerList[index]=obj
    this.setData({answerList})
    console.log(answerList)
  },
  // chooseAnswer(e){
  //   let {answerList,questionlist}=this.data
  //   var {index,type,id}=e.currentTarget.dataset
  //   var value=e.detail.value
  //   var optionList = questionlist[index].optionList
  //   var name = optionList[value].value
  //   questionlist[index].name=name
  //   var valueid = optionList[value].id
  //   var obj={}
  //   obj.value=valueid
  //   obj.type=type
  //   obj.questionId=id
  //   // answerList.push(obj)
  //   answerList[index]=obj
  //   this.setData({answerList,questionlist})
  //   console.log(answerList)
  // },
  getanswer(e){
    var {answerList}=this.data
    var {index,type,id,sign}=e.currentTarget.dataset
    var value = e.detail.value
    var obj = {}
    if(sign=='phone'){
      obj.sign='phone'
    }
    obj.value=value
    obj.type=type
    obj.questionId=id
    obj.required=answerList[index].required
    answerList[index]=obj
    // answerList.push(obj)
    this.setData({answerList})
    console.log(answerList)
  },

  // 提交
  confirm(){
    var {surveyId,answerList}=this.data
    console.log(answerList)
    var a=0,j=0,b=0,c=0,isreq=0,d=0
    answerList.forEach((item,index)=>{
      if(item.required){
        isreq++
      }
      if(item.sign&&item.sign=='phone'){
        if(!(/^1[3456789]\d{9}$/.test(item.value))){ 
          b++ 
        }
      }

      if(item.questionId||(item.list&&item.list.length>0)){
        a++
      }
      // if(item.list&&item.list.length>0){
      //   a++
      // }
      if(item.type==3&&item.value==""&&item.required){
        c++
      }
    })
    if(b>0){
      wx.showToast({
        title: '手机号格式不正确，请重填',
        icon:'none'
      }) 
      return;
    }
    console.log(isreq,a)
    if(a<isreq){
      wx.showToast({
        title: '请将数据填写完整',
        icon:'none'
      })
      return
    }
    if(c>0){
      wx.showToast({
        title: '请将数据填写完整!',
        icon:'none'
      })
      return
    }
    




    answerList.forEach((item,i)=>{
      if(item.list&&item.list.length>0){
        item.list.forEach(val=>{
          val.required = item.required
          answerList.push(val)
        })
      }
    })
    console.log(answerList)
    var alist = []
    answerList.forEach(item=>{
      if(!item.list){
        alist.push(item)
      }
    })
    console.log(alist)
    alist.forEach(item=>{
      if(item.required&&!item.value){
        d++
      }
    })
    if(d>0){
      wx.showToast({
        title: '请将数据填写完整!',
        icon:'none'
      })
      return
    }
    var lastdata=[]
    alist.forEach(item=>{
      if(item.questionId&&item.value){
        if(!item.list){
          lastdata.push(item)
        }
      }
    })
    console.log(lastdata)
    
    var params={entryType:'miniProgram',surveyId,answerList:lastdata}
    console.log(params)
    http.post(`${app.globalData2.url}/api/v1/ksMemberSurvey/submit`,{json:JSON.stringify(params)}, true).then(res => {
      if (res.data.code == 20000) {
        wx.showToast({
          title: res.data.message,
          icon:'none'
        })
        setTimeout(()=>{
          wx.navigateTo({
            url: '../clockout/clockout',
            // url: '../clockplan/clockplan',
          })
        },1000)
        // wx.navigateBack({delta:1})
      }else{
        wx.showToast({
          title: res.data.message,
          icon:'none'
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

  }
})