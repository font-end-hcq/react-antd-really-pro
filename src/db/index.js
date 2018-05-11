import DBF from 'dbfac'
export default DBF;

// let prefix = ''
// if (__LOCAL__) {
//     prefix = ''  //http://localhost:6061
// }
// if (__PRO__) {
//     prefix = ''
// }


// 关于课程科目
DBF.create('Category',{
  // 获取科目列表
    getCategoryList:{
      url:'/pinpai/api/category/list',
      method:'GET',
    },
  // 添加科目
    addCategory:{
      url:'/pinpai/api/category/add',
      method:'POST',
    },
  // 移除科目
    removeCategory:{
      url:'/pinpai/api/category/delete',
      method:'POST',
    },
  // 获取列表
    getLabelList:{
        url:'/pinpai/api/label/list',
        method:'POST',
    },
});

// 新建课程相关
DBF.create('CreateCourse',{
    // 新增或修改课次
    editClass:{
        url:'/pinpai/api/class/operate',
        method:'POST',
    },
    // 获取课次详情
    getClassDetail:{
        url:'/pinpai/api/class/detail',
        method:'POST',
    },
    // 获取课次列表
    getClassList:{
        url:'/pinpai/api/class/list',
        method:'POST',
    },
    // 创建或修改课程
    createCourse:{
        url:'/pinpai/api/course/operate',
        method:'POST',
    },
    // 获取课程详情
    getCourseDetail2:{
        url:'/pinpai/api/course/edit',
        method:'POST',
    },
    // 获取token
    getToken:{
        url:'/pinpai/api/aliyun/oss_sts_token',
        method:'GET',
    },
});

// 关于课程标签
DBF.create('Label',{
  // 获取所有课程标签
    getCourseLabel:{
      url: '/pinpai/api/label/all',
      method:'GET',
    },
    // 获取科目列表，用于筛选
    getCategoryList:{
      url: '/pinpai/api/category/list',
      method:'GET',
    },
    // 添加课程标签
    addCategoryLabel:{
      url: '/pinpai/api/label/add',
      method:'POST',
    },
    // 修改标签
    updateCategoryLabel:{
      url: '/pinpai/api/label/update',
      method:'POST',
    },
    // 删除标签
    deleteCategoryLabel:{
      url: '/pinpai/api/label/delete',
      method:'POST',
    },
    // 编辑标签时，如果移除某个课程标签内容，需要判断是否可以删除
    isWantedDelete:{
      url: '/pinpai/api/label/wantdeletecontent',
      method:'POST',
    }
});


DBF.create('Place',{
    getList:{
      url:'/pinpai/api/place',
      method:'GET',
    },
});
// 关于加盟校
DBF.create('School',{
    getList:{
      url:'/pinpai/api/school/list',
      method:'POST',
    },
    operate:{
        url:'/pinpai/api/school/operate',
        method:'POST',
    },
    detail:{
        url:'/pinpai/api/school/detail',
        method:'POST',
    },
    delete:{
        url:'/buc/api/manager/jiamengxiao/delete',
        method:'POST',
    }
});

// 关于课程
DBF.create('Course',{
  // 课程列表
    getCourseList:{
      url: '/pinpai/api/course/list',
      method:'POST'
    },
    // 课程详情
    getCourseDetail:{
      url: '/pinpai/api/course/detail',
      method:'POST'
    },
    // 课时列表
    getClassList:{
      url: '/pinpai/api/class/list',
      method:'POST'
    },
    // 课程删除
    deleteOneCourse:{
      url: '/pinpai/api/course/delete',
      method:'POST'
    },
    // 修改课程状态
    changeCourseState:{
      url: '/pinpai/api/course/state',
      method:'POST'
    }
});
DBF.create('User',{
    // 退出登录
    logout:{
      url: '/buc/api/user/logout',
      method:'GET'
    },
    // 获取用户详情
    getUserInfo:{
        url:'/pinpai/api/user/message',
        method:'GET',
    },
});

DBF.create('Manager',{
    // 管理员列表
    list:{
      url: '/buc/api/manager/list',
      method:'post'
    },
    //添加
    add:{
      url: '/buc/api/manager/add',
      method:'post'
    },
    update:{
        url: '/buc/api/manager/update',
        method:'post'
    },
    checkMobile:{
      url: '/buc/api/manager/check',
      method:'post'
    },
    delete:{
        url: '/buc/api/manager/delete',
        method:'post'
    }
});
// 报表模块的请求
DBF.create('Report',{
    // 加盟校名称及ID，用于筛选
    getSchoolList:{
      url: '/pinpai/api/report/school-downList',
      method:'GET'
    },
    //加盟校开通数据，页面所有内容
    getSchoolOpen:{
      url: '/pinpai/api/report/school',
      method:'GET'
    },
    // 获取账号数据页面，页面所有内容
    getAccount:{
      url: '/pinpai/api/report/account',
      method:'GET'
    },
    // 资料管理，页面所有内容
    getResourseManage:{
      url: '/pinpai/api/report/course',
      method:'GET'
    },
    // 资料查看，页面所有内容
    getResourseInspect:{
        url: '/pinpai/api/report/view',
        method:'GET'
    },
    // 运营数据  顶部card  收入数据(type=0)，招生数据(type=1)
    getOperateLatest:{
        url: '/pinpai/api/erpReport/latest',
        method:'GET'
    },
    // 运营数据  echarts与表格部分
    getOperateDetail:{
        url: '/pinpai/api/erpReport/detail',
        method:'GET'
    }
});

// 关于客户
DBF.create('Customer',{
  // 获取客户列表
  getList:{
    url: 'pinpai/api/kehu/list',
    method:'POST'
  },
  //快速新建
  createCustomer:{
    url:'pinpai/api/kehu/create',
    method:'POST'
  },
  //客户来源
  Sourcelist:{
    url:'pinpai/api/kehu/sourcelist',
    method:'GET'
  },

  //删除客户
  Delete:{
    url:'pinpai/api/kehu/delete',
    method:'POST'
   },

  //快速新建后继续编辑
  EditCustomer:{
    url:'pinpai/api/kehu/update',
    method:'POST'
  },
  //新建客户的归属人
  Belong:{
    url:'pinpai/api/user/pinpaiuserlist',
    method:'GET'
  },

  //客户详情
  Detail:{
    url:'pinpai/api/kehu/detail',
    method:'POST'
  },

  //首要联系人
  FirstContactsList:{
    url:'pinpai/api/kehu/lianxirenlist',
    method:'POST'
  },
  // 获取顶部客户信息
  getCustomerInfo:{
    url: '/pinpai/api/kehu/customerInfo',
    method:'POST'
  },
  // 获取基本信息
  getBaseInfo: {
    url: '/pinpai/api/kehu/baseInfo',
    method:'POST'
  },
  // 获取联系人列表
  getContactList: {
    url: '/pinpai/api/kehu/lianxirenlist',
    method:'POST'
  },
  // 查看联系人信息
  getContactDetail: {
    url: '/pinpai/api/kehu/lianxirendetail',
    method:'POST'
  },
  // 删除联系人
  deleteContact: {
    url: '/pinpai/api/kehu/lianxirendelete',
    method:'POST'
  },
  // 新建/编辑联系人
  updateContact: {
    url: '/pinpai/api/kehu/lianxirenoperate',
    method:'POST'
  },
  // 获取跟进信息列表
  getFollowList: {
    url: '/pinpai/api/kehu/followlist',
    method:'POST'
  },
  // 获取跟进类型
  getFollowType: {
    url: '/pinpai/api/kehu/followtypelist',
    method:'GET'
  },
  // 获取跟进详情
  getFollowDetail: {
    url: '/pinpai/api/kehu/followodetail',
    method:'POST'
  },
  // 新建/编辑跟进信息
  updateFollow: {
    url: '/pinpai/api/kehu/followoperate',
    method:'POST'
  },
  // 删除跟进信息列表
  deleteFollow: {
    url: '/pinpai/api/kehu/followodelete',
    method:'POST'
  },
  // 设为首要联系人
  setContactImportant: {
    url: '/pinpai/api/kehu/lianxirenfirst',
    method:'POST'
  },
  // 获取执行人列表
  getExecUserList: {
    url: '/pinpai/api/user/pinpaiuserlist',
    method:'GET'
  }
})
// 加盟校合同管理模块的请求
DBF.create('Contract',{
  // 加盟校合同管理列表数据
  getContractList:{
    url: '/pinpai/api/agreement/list',
    method:'GET'
  },
  // 新建合同获取下拉选项所有内容
  getOwner:{
    url: '/pinpai/api/agreement/customer-owner',
    method:'GET'
  },
  // 新建合同中提交所有内容
  contractAdd:{
    url: '/pinpai/api/agreement/add',
    method:'POST'
  },
  // 新建合同中根据对应客户查联系
  getContacts:{
    url: '/pinpai/api/agreement/contacts',
    method:'GET'
  },
  // 编辑合同提交接口
  getEdit:{
    url: '/pinpai/api/agreement/edit',
    method:'POST'
  },
  // 查看合同接口，获取单份合同详情
  getDetail:{
    url: '/pinpai/api/agreement/detail',
    method:'GET'
  },
  // 根据对应合同ID删除对应合同的接口
  getDelete:{
    url: '/pinpai/api/agreement/delete',
    method:'GET'
  },
});

DBF.create('Product',{
  // 获取商品列表
  getProductList: {
    url: '/pinpai/api/goods/list',
    method:'GET'
  },
  // 获取商品下拉列表
  getCategoryList: {
    url: '/pinpai/api/goods/sort/list',
    method:'GET'
  },
  // 商品的上/下架
  setProductState: {
    url: '/pinpai/api/goods/release',
    method:'POST'
  },
  // 新建商品
  createProduct: {
    url: '/pinpai/api/goods/add',
    method:'POST'
  },
  // 编辑商品
  editProduct: {
    url: '/pinpai/api/goods/edit',
    method:'POST'
  },
  // 删除商品
  delelteProduct: {
    url: '/pinpai/api/goods/delete',
    method:'POST'
  },
  // 获取商品详情
  getProductDetail: {
    url: '/pinpai/api/goods/detail',
    method:'GET'
  },
  // 新建分类
  createCategory: {
    url: '/pinpai/api/goods/sort/add',
    method:'POST'
  },
  // 编辑分类
  editCategory: {
    url: '/pinpai/api/goods/sort/edit',
    method:'POST'
  },
  // 删除分类
  deleteCategory: {
    url: '/pinpai/api/goods/sort/delete',
    method:'POST'
  }
})
// 商城-订单列表模块的请求
DBF.create('Order',{
  // 获取订单列表
  getOrderList:{
    url: '/pinpai/api/goods/orders/list',
    method:'GET'
  },
  // 订单确认到款
  getMoney:{
    url: '/pinpai/api/goods/orders/getMoney',
    method:'POST'
  },
  // 订单添加备注
  addRemark:{
    url: '/pinpai/api/goods/orders/remark',
    method:'POST'
  },
  // 订单添加发货信息
  addExpress:{
    url: '/pinpai/api/goods/orders/express',
    method:'POST'
  },
});
