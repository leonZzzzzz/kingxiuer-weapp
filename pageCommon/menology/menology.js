const app = getApp()

var startX, endX;

var moveFlag = true;// 判断执行滑动事件

Page({

  data: {
    list:[{name:'111111',page:1},{name:'222222222',page:2}],
    currt:1,
    page : 1,

    ani1: '',

    ani2: ''

  },

  onLoad: function () {



  },



  touchStart: function (e) {
console.log(e)
    startX = e.touches[0].pageX; // 获取触摸时的原点

    moveFlag = true;

  },

  // 触摸移动事件

  touchMove: function (e) {

    endX = e.touches[0].pageX; // 获取触摸时的原点

    if (moveFlag) {

      if (endX - startX > 50) {

        console.log("move right");

        this.move2right();

        moveFlag = false;

      }

      if (startX - endX > 50) {

        console.log("move left");

        this.move2left();

        moveFlag = false;

      }

    }

  },

  // 触摸结束事件

  touchEnd: function (e) {

    moveFlag = true; // 回复滑动事件

  },

  //向左滑动操作

  move2left() {

    var that = this;

    if (this.data.page == 2) {

      return

    }

    var animation = wx.createAnimation({

      duration: 1000,

      timingFunction: 'ease',

      delay: 100

    });

    animation.opacity(0.2).translate(-500, 0).step()

    this.setData({

      ani1: animation.export()

    })

    setTimeout(function () {

      that.setData({

        page: 2,

        ani2: ''

      });

    }, 800)

  },

  //向右滑动操作

  move2right() {

    var that = this;

    if (this.data.page == 1) {

      return

    }

    var animation = wx.createAnimation({

      duration: 1000,

      timingFunction: 'ease',

      delay: 100

    });

    animation.opacity(0.2).translate(500, 0).step()

    this.setData({

      ani2: animation.export()

    })

    setTimeout(function () {

      that.setData({

        page: 1,

        ani1: ''

      });

    }, 800)

    }

})
