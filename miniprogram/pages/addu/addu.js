// pages/addu/addu.js
var db = null;
var user = null;
var link = null;
var _ = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userData: null,
    isAdd: null,
    user_id: '',
    addUserId: null,
    showLoading: false,
    showError: false,
    errorMessage: ''
  },
  onLoad: function (options) {
    console.log(options)
    this.setData({
      user_id: options.userId
    })
    db = wx.cloud.database()
    user = db.collection('user')
    link = db.collection('link')
    _ = db.command
  },
  getUser(e) {
    this.setData({
      showLoading: true
    })
    console.log(e)
    //查询用户信息
    user.where({
      user_id: _.eq(e.detail.value.userid)
    }).get({
      success: res => {
        if (res.data.length == 0) {
          console.log('没有查找到用户')
          this.setData({
            showLoading: false,
            showError: true,
            errorMessage: '没有找到该用户，请确认对方P号'
          })
        } else {
          let linkId = res.data[0]._openid
          this.setData({
            userData: res.data[0]
          })
          link.where({
            link_user: _.eq(linkId),
            _openid: _.eq(wx.getStorageSync('openid'))
          }).get({
            success: res => {
              if (res.data.length == 0) {
                console.log('没有关注')
                this.setData({
                  isAdd: false
                })
              } else {
                console.log('已关注')
                this.setData({
                  isAdd: true
                })
              }
              this.setData({
                showLoading: false
              })
            }
          })
        }
      }
    })
  },
  addUser() {
    const _this = this;
    this.setData({
      showLoading: true
    })
    let tempLink = {
      link_user: this.data.userData._openid,
    }
    link.add({
      data: tempLink,
      success: function (res) {
        console.log('关注成功')
        wx.navigateBack({
          delta: 0,
          success: function () {
            wx.showToast({
              title: '关注成功',
            })
          }
        })
        _this.setData({
          showLoading: false
        })
      }
    })
  },
  back() {
    wx.navigateBack({
      delta: 0,
    })
  },
  hideModal(){
    this.setData({
      showError: false
    })
  }
})