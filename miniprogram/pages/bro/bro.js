// pages/bro/bro.js
var db = null;
var user = null;
var link = null;
var _ = null;
var userList = []
Page({

  /**
   * 页面的初始数据
   */
  data: {
    broList: [],
    showLoading: false,
    showDelete: false
  },

  onShow: async function (options) {
    this.setData({
      showLoading: true,
      broList: []
    })
    userList = [];
    const _this = this;
    db = wx.cloud.database({
      env: 'hhl-bsaji'
    })
    user = db.collection('user')
    link = db.collection('link')
    _ = db.command
    link.where({
      _openid: wx.getStorageSync('openid')
    }).get({
      success: function (res) {
        let tempLink = res.data
        if (tempLink.length > 0) {
          tempLink.forEach(element => {
            user.where({
              _openid: element.link_user
            }).get({
              success: function (res) {
                console.log("查询到关联用户：", res)
                userList.push(res.data[0])
                _this.setData({
                  broList: userList
                })
                _this.setData({
                  showLoading: false
                })
              }
            })
          });
        } else {
          _this.setData({
            showLoading: false
          })
        }
      }
    })
  },
  // 取消关注
  cacheLink(e) {
    wx.setStorageSync('deleteid', e.currentTarget.dataset.openid)
    this.setData({
      showDelete: true
    })
  },
  delete() {
    link.where({
      link_user: _.eq(wx.getStorageSync('deleteid'))
    }).remove({
      success: res => {
        console.log('删除成功')
        this.onShow()
        this.hideModal()
      }
    })
  },
  toDetail(e) {
    console.log(e.currentTarget.dataset.id)
    wx.navigateTo({
      url: '../detail/detail?userId=' + e.currentTarget.dataset.id,
    })
  },
  hideModal() {
    this.setData({
      showDelete: false
    })
  },
  back() {
    wx.navigateBack({
      delta: 0,
    })
  }
})