Component({
  properties: {
    height: {
      type: Number,
      value: 20,
    },
    color: {
      type: String,
      value: '#f2f2f2',
    },
  },
  data: {
    someData: {}
  },
  methods: {
    click(e) {
      this.triggerEvent('click', e)
    }
  }
})