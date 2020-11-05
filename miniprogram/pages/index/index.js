//index.js
const app = getApp()
var db = null;
var userData = null;
var _ = null;
Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    status: false,
    logged: false,
    takeSession: false,
    requestResult: '',
    isDk: false,
    isDka: false,
    weight: null,
    todayDate: '',
    showLoading: false,
    showError: false,
    errorMessage: ''
  },

  onLoad: function () {
    db = wx.cloud.database();
    userData = db.collection('detail');
    _ = db.command;
    let today = new Date();
    this.setData({
      todayDate: today.getFullYear() + '/' + (today.getMonth() + 1) + '/' + today.getDate()
    })
  },
  onShow() {
    this.checkIsDk();
  },
  clockCard() {
    let login = wx.getStorageSync('isLogin')
    if (!login) {
      this.setData({
        showError: true,
        errorMessage: '请先登登录'
      })
    } else {
      if (this.data.status) {
        this.setData({
          isDka: true
        })
      } else {
        this.setData({
          isDk: true
        })
      }

    }

  },
  hideModal(e) {
    let type = e.currentTarget.dataset.type;
    if (type == 'daka') {
      this.setData({
        isDk: false,
        isDka: false
      })
    } else {
      this.setData({
        showError: false
      })
    }
  },
  daka(e) {
    let w = e.detail.value.t_weight;
    let f = this.isNumber(w);
    if (w.trim() == "" || !f) {
      this.setData({
        showError: true,
        errorMessage: f ? '请输入体重后提交' : '请输入数字类型'
      })
    } else {
      let tempWeight = e.detail.value.t_weight;
      let tempData = {
        t_weight: tempWeight,
        date_time: new Date(),
      }
      userData.add({
        data: tempData,
        success: res => {
          console.log('签到成功')
          this.setData({
            isDk: false
          })
          this.checkIsDk()
        }
      })
    }
  },
  iosbug() {},
  // 检查是否已经打卡
  checkIsDk() {
    this.setData({
      showLoading: true
    })
    userData.where({
      _openid: _.eq(wx.getStorageSync('openid'))
    }).get({
      success: res => {
        console.log(res.data)
        if (res.data.length > 0) {
          let temp = res.data[res.data.length - 1].date_time;
          console.log(temp)
          let now = new Date();
          if ((now > temp) && (now.getFullYear() == temp.getFullYear()) && (now.getMonth() == temp.getMonth()) && (now.getDate() == temp.getDate())) {
            console.log('已打卡')
            wx.setStorageSync('temp_id', res.data[res.data.length - 1]._id)
            this.setData({
              status: true,
              weight: res.data[res.data.length - 1].t_weight
            })
          } else {
            console.log('未打卡')
          }
        }
        this.setData({
          showLoading: false
        })
      }
    })
  },
  //重新打卡
  dkagain() {
    this.setData({
      isDka: true
    })
  },
  dka(e) {
    let w = e.detail.value.t_weight;
    let f = this.isNumber(w);
    if (w.trim() == "" || !f) {
      this.setData({
        showError: true,
        errorMessage: f ? '请输入体重后提交' : '请输入数字类型'
      })
    } else {
      let a_weight = e.detail.value.t_weight;
      userData.where({
        _id: _.eq(wx.getStorageSync('temp_id'))
      }).update({
        data: {
          t_weight: a_weight
        },
        success: res => {
          this.setData({
            isDka: false
          })
          this.onShow();
        }
      })
    }
  },
  // 检测是否是数字
  isNumber(number) {
    if (!isNaN(number)) {
      return true;
    } else {
      return false;
    }
  },
  onShareAppMessage: function (res) {
    return {
      title: '一起来胖记鸭',
      path: '/pages/welcome/welcome',
      success: function () {},
      fail: function () {}
    }
  }
})