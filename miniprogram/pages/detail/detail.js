var db = null;
var detail = null;
var _ = null;
Page({
  data: {
    dataList:[],
    dateList:[]
  },
  onLoad: function (options) {
    console.log("接收到的openid",options.userId)
    const _this = this;
    db = wx.cloud.database({
      env: 'hhl-bsaji'
    })
    detail = db.collection('detail')
    _ = db.command
    detail.where({
      _openid: _.eq(options.userId)
    }).get({
      success: function(res){
        console.log(res);
        let tempDateList = [];
        res.data.forEach(element => {
          let date = element.date_time;
          let year = date.getFullYear();
          let month = date.getMonth();
          let day = date.getDate();
          let tempDate = year+'/'+month+'/'+day;
          tempDateList.push(tempDate);
        });
        _this.setData({
          dataList: res.data,
          dateList: tempDateList
        })
      }
    })
  },
  back(){
    wx.navigateBack({
      delta: 0,
    })
  }
})