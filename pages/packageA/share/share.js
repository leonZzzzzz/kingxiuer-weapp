Page({
  data: {
    imgUrl: '',
  },
  onLoad(e) {
    console.log(e);
    this.setData({
      imgUrl: e.img
    })
  }
})