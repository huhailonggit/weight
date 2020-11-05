import * as echarts from '../../ec-canvas/echarts';
var db = null;
var user = null;
var _ = null;
var datas = null;
function initChart(canvas, width, height, dpr) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr // new
  });
  canvas.setChart(chart);
  //连接数据库，查询当前用户的体重值记录
  db = wx.cloud.database({
    env: 'hhl-bsaji'
  })
  user = db.collection('detail')
  _ = db.command
  console.log('openid ', wx.getStorageSync('openid'))
  user.where({
    _openid: _.eq(wx.getStorageSync('openid'))
  }).get({
    success: function(res){
      console.log("当前用户信息： ",res)
      datas = res.data
      console.log("曲线data: ",datas)
      let weight_list = []
      let date_list = []
      datas.forEach(element => {
        let tempDate = element.date_time;
        let tempResultTime = tempDate.getFullYear()+'/'+(tempDate.getMonth()+1)+'/'+tempDate.getDate()
        date_list.push(tempResultTime)
        weight_list.push(element.t_weight)
      });
      console.log(weight_list,date_list)
      var option = {
        
        color: ['#5e00ff'],
        grid: {
          containLabel: true,
          bottom: 0,
          left: 10,
          right: 10,
          shadowColor: '#37A2DA'
        },
        tooltip: {
          show: false,
          trigger: 'axis',
          axisPointer: {
            type: "cross"
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: date_list,
          axisLabel:{
            interval: 0,
            rotate: 45,
            margin:2,
            textStyle:{
              fontWeight:"bolder"
            }
          },
          show: false
        },
        yAxis: {
          x: 'center',
          type: 'value',
          axisLine: {
            lineStyle: {
              type: 'solid',
              color: '#f0fff0'
            }
          },
          show: true
        },
        series: [{
          name: '体重',
          type: 'line',
          smooth: false,
          data: weight_list
        }]
      };
      chart.setOption(option);
      return chart;
    }
  })
  
  
}
Page({
  onShareAppMessage: function (res) {
    return {
      title: '一起来胖记鸭',
      path: '/pages/welcome/welcome',
      success: function () { },
      fail: function () { }
    }
  },
  data: {
    ec: {
      disableTouch: true,
      onInit: initChart,
      width: null,
      showLoading: false
    },
    dataList: null,
    dateList: [],
    showMessage: false,
    message: null
  },
  onLoad(){
    this.setData({
      showLoading: true
    })
    const _this = this
    db = wx.cloud.database({
      env: 'hhl-bsaji'
    })
    user = db.collection('detail')
    _ = db.command
    user.where({
      _openid: _.eq(wx.getStorageSync('openid'))
    }).get({
      success: function(res){
        if(res.data.length == 0){
          _this.setData({
            message: '空空如也~~~去打卡吧',
            showMessage: true
          })
        }
        console.log(res.data)
        let temp = []
        res.data.forEach(element => {
          temp.push(element.date_time.getFullYear()+'/'+(element.date_time.getMonth()+1)+'/'+element.date_time.getDate())
        });
        _this.setData({
          dataList: res.data.reverse(),
          dateList: temp.reverse()
        })
        _this.setData({
          showLoading: false
        })
      }
    })
  },
  getWindows(){
    let widht = wx.getSystemInfoSync().windowWidth;
    this.setData({
      widht: widht
    })
  },
  goDk(){
    this.setData({
      showMessage: false
    })
    wx.reLaunch({
      url: '../index/index',
    })
  }
});