import http from '../../utils/http.js'
const app = getApp();
Component({
  properties: {
    url: {
      type: String
    },
    needColor: {
      type: Boolean,
      default: false
    },
    type: {
      type: Number,
      value: 1
    },
    data:{
      type:Object
    },
    dataNum:{
      type:Number,
      value:0
    }
  },
  data: {
    imageURL:'https://kingsuer-1255600302.file.myqcloud.com',
    /**
* delBtnWidth: 删除按钮的宽度单位
* list: 循环的mock数据
* startX: 收支触摸开始滑动的位置
*/
    // 加一个滑动删除
    startX: 0, //开始坐标
    startY: 0,
    isTouchMove: true, //默认全隐藏删除
    // 原本的
    year: '',
    time: '10:00',
    styleBgColor: {
      positive: '#d38989',
      negative: '#d4bbbb',
      qiangyang:'#bc4949',
      invalid: 'rgba(0,0,0,.5)'
    },
    nowIndex: 0,
    domHeight: 0,
    // 获取当前删除的index
    currentIndex:0
  },
  lifetimes: {
    // 组件生命周期声明对象，将组件的生命周期收归到该字段进行声明，原有声明方式仍旧有效，如同时存在两种声明方式，则lifetimes字段内声明方式优先级最高
    attached() {
      console.log(99999)
      this.apiGetList()
    }
  },
  observers: {
    'data': function(rate) {
      console.log(rate)
      // 在 rate被设置时，执行这个函数
      // this.updataRate()
    }
  },

  ready() {
    console.log(this.properties.data)
    this.apiGetList();
    this.setData({
      domHeight: Math.floor(wx.getSystemInfoSync().windowHeight / 2.5)
    })
  },
  observers: {
    'data': function(data) {
      console.log(data)
      // 在 rate被设置时，执行这个函数
      // this.apiGetList()
    }
  },

  methods: {
    /**
     * 获取列表接口
     */
    apiGetList() {
      let data = {
        curPage: 0,
        size: 50
      }
      http.get(`${app.globalData.url}/${this.properties.url}`, data, true).then(res => {
        if (res.data.errCode == 401) {
          app.login(() => {
            this.apiGetList()
          });
        } else if (res.data.errCode == 0) {
          if (res.data.content0.total == 0) return;
          console.log(res.data.content0)
          // 截取并追加年、月日、时间
          res.data.content0.rows.forEach((item, index) => {
            let str = res.data.content0.rows[index].measureTime
            let year = str.substr(0, 4),
              monthDay = str.substr(5, 5),
              time = str.substr(11, 5)
            let img = res.data.content0.rows[index].imageUrl == 'undefined' ? '/attachments/assets/img/null.jpg' : res.data.content0.rows[index].imageUrl
            if (item.valueClocation) {
              item.valueClocation_2 = (53.55 - item.valueClocation).toFixed(2)
            }
            res.data.content0.rows[index].year = year
            res.data.content0.rows[index].monthDay = monthDay
            res.data.content0.rows[index].time = time
            res.data.content0.rows[index].fullImg = app.globalData.imgPrefix + img
            // 增加一个touchmove
            // item.isTouchMove=true
            res.data.content0.rows[index].isTouchMove = true
          })
          this.properties.data = res.data.content0.rows
          this.properties.dataNum = res.data.content0.total
          this.setData({
            data: res.data.content0.rows,
            dataNum: res.data.content0.total
          })
          wx.setStorageSync('canvasData', res.data.content0.rows)
          this.showYear()
        }
      })
    },
    //  /删除事件?
    del: function (e) {
      this.apiDel(this.data.data[this.data.currentIndex].id)
      this.apiGetList()

    },
    // 删除图片接口
    apiDel(id){
      if(this.properties.url=='pregnancy/getPage.do'){
        http.post(`${app.globalData.url}/pregnancy/delete.do`,{id:id},true).then(res=>{
          console.log(res);
          
        })
      }else{
        http.post(`${app.globalData.url}/ovulate/delete.do`,{id:id},true).then(res=>{
          console.log(res);
        })
      }
      
    },
    // 滚动事件
    scrollChange(e) {
      this.showYear(e.detail.scrollTop + 15)
    },
    /**
     * 设置显示年份的方法
     * 根据滚动条位置判断是第几条数据
     * @  滚动条top值
     * @  每行高度
     */
    showYear(top = 0, height = 40) {
      let nowIndex = Math.floor(top / height);
      this.setData({
        nowIndex: nowIndex,
        year: this.data.data[nowIndex].year
      })
    },



    // 添加滑动删除功能
    //手指触摸动作开始 记录起点X坐标
    touchstart: function (e) {
  //开始触摸时 重置所有删除
    this.data.data.forEach(function (v, i) {
    if (v.isTouchMove)//只操作为false的
    // console.log(v);
      v.isTouchMove = true;
    })
    // console.log(e);
    this.setData({
    startX: e.changedTouches[0].clientX,
    startY: e.changedTouches[0].clientY,
    data: this.data.data
      })
    },
  //滑动事件处理
    touchmove: function (e) {
    var that = this,
      index = e.currentTarget.dataset.index,//当前索引
      startX = that.data.startX,//开始X坐标
      startY = that.data.startY,//开始Y坐标
      touchMoveX = e.changedTouches[0].clientX,//滑动变化坐标
      touchMoveY = e.changedTouches[0].clientY,//滑动变化坐标
      //获取滑动角度
      angle = that.angle({ X: startX, Y: startY }, { X: touchMoveX, Y: touchMoveY });
      that.data.data.forEach(function (v, i) {
      v.isTouchMove = true
       //滑动超过30度角 return
      if (Math.abs(angle) > 30) return;
      if (i == index) {
        if (touchMoveX > startX) //右滑
        v.isTouchMove = true
        else //左滑
        v.isTouchMove = false
      }
    })
    //更新数据
    that.setData({
    data: that.data.data
    })
  },
    /**
  * 计算滑动角度
  * @param {Object} start 起点坐标
  * @param {Object} end 终点坐标
  */
    angle: function (start, end) {
      var _X = end.X - start.X,
      _Y = end.Y - start.Y
     //返回角度 /Math.atan()返回数字的反正切值
     return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
    },
    


    // 尝试组件之间的传值
    toFatherPage(e){
      console.log(123);
      this.triggerEvent('toFatherPage', {
        isShowDelModal: "flex",
      })
      this.setData({
        currentIndex:e.currentTarget.dataset.index
      })
    }
  }
})