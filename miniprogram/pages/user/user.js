// pages/user/user.js
var db = null;
var user = null;
var userData = null;
var _ = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    user_id: '未登录',
    updateSelfInfo: false,
    about: false,
    user_data: null,
    mark: '签名',
    showLoading: false,
    showUpdateP: false,
    showError: false,
    errorMessage: '',
    isLogin: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    db = wx.cloud.database();
    user = db.collection('user');
    userData = db.collection('detail');
    _ = db.command;
    this.checkUser(false, false)
  },
  onShow() {
    if(wx.getStorageSync('isLogin')){
      this.getUserInfoByDb()
    }
  },
  about(e) {
    let type = e.currentTarget.dataset.type;
    console.log(type)
    if (type == 'set') {
      this.setData({
        showSetting: true,
      })
    } else {
      this.setData({
        about: true
      })
    }
  },
  //修改个人简介
  edit() {
    this.setData({
      updateSelfInfo: true
    })
  },
  // P号修改弹框隐藏
  hideModalByP() {
    this.setData({
      showUpdateP: false
    })
  },
  // 隐藏模态框
  hideModal() {
    this.setData({
      updateSelfInfo: false,
      showError: false,
      about: false,
      showDialog: false,
      isOk: false,
      showSetting: false,
      errorMessage: null,
      showInfo: false
    })
  },
  //提交个人简介
  subedit(e) {
    console.log(e.detail.value.selfinfo)
    this.setData({
      updateSelfInfo: false
    })
    user.where({
      _openid: _.eq(wx.getStorageSync('openid'))
    }).update({
      data: {
        mark: e.detail.value.selfinfo
      },
      success: res => {
        console.log('修改成功')
        this.flushMark()
      }
    })
  },
  // 刷新签名
  flushMark() {
    this.setData({
      showLoading: true
    })
    user.where({
      _openid: _.eq(wx.getStorageSync('openid'))
    }).get({
      success: res => {
        this.setData({
          mark: res.data[0].mark,
          user_id: res.data[0].user_id,
          showLoading: false
        })
      }
    })
  },
  // 从数据库获取用户信息
  getUserInfoByDb() {
    this.setData({
      showLoading: true
    })
    //基本用户信息
    user.where({
      _openid: _.eq(wx.getStorageSync('openid'))
    }).get({
      success: res => {
        console.log(res)
        this.setData({
          user_id: res.data[0].user_id,
          mark: res.data[0].mark,
          userInfo: wx.getStorageSync('userinfo')
        })
      }
    });
    // 用户数据
    userData.where({
      _openid: _.eq(wx.getStorageSync('openid'))
    }).get({
      success: res => {
        let temp = null;
        if (res.data.length == 0) {
          temp = {
            s_day: 0,
            now_weight: 0,
            compire: 0
          }
        } else if (res.data.length == 1) {
          temp = {
            s_day: res.data.length,
            now_weight: res.data[res.data.length - 1].t_weight,
            compire: 0
          }
        } else {
          let today = Number(res.data[res.data.length - 1].t_weight);
          let yearsday = Number(res.data[res.data.length - 2].t_weight);
          temp = {
            s_day: res.data.length,
            now_weight: res.data[res.data.length - 1].t_weight,
            compire: ((today * 100 - yearsday * 100) / 100).toFixed(2),
          }
        }
        this.setData({
          user_data: temp
        })
        this.setData({
          showLoading: false
        })
      }
    })
  },
  // 修改P号
  updateUserId(e) {
    console.log('P号修改', e.detail.value)
    this.setData({
      showLoading: true
    })
    let c = this.check(e.detail.value.userid);
    wx.setStorageSync('userid', e.detail.value.userid)
    if (c) {
      this.setData({
        showError: true,
        showLoading: false,
        errorMessage: '不能包含中文字符'
      })
    } else {
      let length = e.detail.value.userid.length
      if (length < 6) {
        this.setData({
          showError: true,
          showLoading: false,
          errorMessage: '长度要大于6位'
        })
      } else {
        //判断用户名是否已经被注册
        user.where({
          user_id: e.detail.value.userid
        }).get({
          success: res => {
            if (res.data.length != 0) {
              this.setData({
                showError: true,
                showLoading: false,
                errorMessage: '用户名已经存在'
              })
            } else {
              let _this = this;
              user.where({
                _openid: _.eq(wx.getStorageSync('openid'))
              }).update({
                data: {
                  user_id: e.detail.value.userid
                },
                success: function () {
                  _this.setData({
                    showUpdateP: false,
                    showLoading: false
                  })
                  _this.flushMark();
                }
              })
            }
          }
        })
      }
    }
  },
  // 点击修改P号时的触发事件
  updatePNumber() {
    this.setData({
      showUpdateP: true
    })
  },
  // 设置
  showSetting(e) {
    let type = e.currentTarget.dataset.set;
    console.log(type)
    if (type == 'mark') {
      this.setData({
        updateSelfInfo: true,
        about: false,
        showSetting: false
      })
    } else {
      this.setData({
        showUpdateP: true,
        about: false,
        showSetting: false
      })
    }
  },
  onShareAppMessage: function (res) {
    return {
      title: '一起来胖记鸭',
      path: '/pages/welcome/welcome',
      success: function () {},
      fail: function () {}
    }
  },
  // welcome 迁移过来的方法
  login() {
    this.checkUser(true, false);
  },
  // 检查是否获取权限
  checkUser(showD, showA) {
    this.setData({
      showLoading: true
    })
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          //已经获取了权限
          console.log("已经获取权限，放行")
          this.useCloudLogin()
        } else {
          this.setData({
            showInfo: true,
            showDialog: showD,
            isOk: showA,
            showLoading: false
          })
        }
      }
    })
  },
  // 授权
  getUserMessage(e) {
    console.log(e)
    this.checkUser(true, false)
  },
  // 拒绝授权
  refused() {
    this.setData({
      isOk: true,
      showDialog: false
    })
  },
  //重新授权
  getUserAgain() {
    this.setData({
      isOk: false,
      showDialog: true
    })
  },
  //登录
  useCloudLogin() {
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        wx.setStorageSync('openid', res.result.openid)
        wx.getUserInfo({
          lang: 'zh_CN',
          success: res=> {
            wx.setStorageSync('userinfo', res.userInfo)
            this.setData({
              isLogin: true
            })
            this.checkUsername(wx.getStorageSync('openid'))
            //标记登录成功
            wx.setStorageSync('isLogin', true)
            // 获取用户信息
            this.getUserInfoByDb()
          }
        })

      }
    })
  },
  //通过openid查询该用户在用户表中是否存在，如果不存在则创建用户
  checkUsername(openid) {
    user.where({
      _openid: _.eq(openid)
    }).get({
      success: res => {
        if (res.data.length == 0) {
          console.log('没有该用户信息，需要注册')
          this.setData({
            showRegister: true,
            showLoading: false
          })
        }
      }
    })
  },
  // 注册
  register(e) {
    this.setData({
      showLoading: true
    })
    let c = this.check(e.detail.value.userid);
    wx.setStorageSync('userid', e.detail.value.userid)
    if (c) {
      console.log('包含中文，请重新输入')
      this.setData({
        showError: true,
        showLoading: false,
        errorMessage: '不能包含中文字符'
      })
    } else {
      let length = e.detail.value.userid.length
      if (length < 6) {
        console.log('长度不符合')
        this.setData({
          showError: true,
          showLoading: false,
          errorMessage: '长度要大于6位'
        })
      } else {
        //判断用户名是否已经被注册
        user.where({
          user_id: e.detail.value.userid
        }).get({
          success: res => {
            if (res.data.length != 0) {
              this.setData({
                showError: true,
                showLoading: false,
                errorMessage: '用户名已经存在'
              })
            } else {
              let addData = {
                user_id: wx.getStorageSync('userid'),
                user_name: wx.getStorageSync('userinfo').nickName,
                avatarUrl: wx.getStorageSync('userinfo').avatarUrl,
                gender: wx.getStorageSync('userinfo').gender,
                mark: '你胖胖的样子真可爱~~~'
              }
              let _this = this;
              user.add({
                data: addData,
                success: function (res) {
                  _this.setData({
                    showLoading: false
                  })
                  console.log('注册成功', res)
                  wx.reLaunch({
                    url: '../user/user',
                  })
                }
              })
            }
          }
        })
        console.log('可以注册')
      }
    }
  },
  // 检测注册用户名是否合法
  check(str) {
    if (escape(str).indexOf("%u") != -1) {
      return true;
    } else {
      return false;
    }
  }
})