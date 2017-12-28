// import Login from './views/Login.vue'
// import NotFound from './views/404.vue'
// import Home from './views/Home.vue'

let Home = (resolve) => {
    import('@/views/Home').then((moudle) => {
        resolve(moudle)
    })
}
// import Main from './views/Main.vue'
// import Welcome from './views/Welcome.vue'
//
// //文章列表
// import ArticleList from './views/article/List.vue'
// import ArticleMonitorDetail from "./views/article/MonitorDetail.vue";
// import AbnormalActivityList from './views/article/AbnormalActivityList.vue'
// import AbnormalVideoList from './views/article/AbnormalVideoList.vue';
// import SyncHistory from './views/article/SyncHistory.vue';
// import VideoMonitorHistory from "./views/article/VideoMonitorHistory.vue"
// import ArticleStatusHistory from "./views/article/ArticleStatusHistory.vue"
// import ErrorInstructWarning from "./views/article/ErrorInstructWarning.vue"
// import Shelves from './views/article/Shelves.vue'
//
// //视频监控
// import VideoList from './views/Video/VideoList.vue'
// import VideoReport from './views/Video/VideoReport.vue';
// import VideoMonitorDetail from "./views/Video/VideoDetail.vue";
// import ideoStatusChangeList from './views/Video/VideoList.vue';
//
// //后台管理
// import Page4 from './views/User/Page4.vue'
// import BackStageManagement from './views/User/BackStageManagement.vue'
// import AuthorityManagement from './views/User/AuthorityManagement.vue'
// import ResourcesList from './views/User/ResourcesList.vue'
//
// //渠道分发
// import Distribution from './views/nav3/Distribution.vue'
//
// //栏目列表
// import columnList from './views/Column/columnList.vue'
// import invalidList from './views/Column/invalidList.vue'
// import ChineseTitle from './views/Column/ChineseTitle.vue'
//
//
// //应用信息
// import UserReturns from './views/AppMessage/UserReturns.vue'
// import OpenAd from './views/AppMessage/OpenAd.vue'
// import ApplicationUpgrade from './views/AppMessage/ApplicationUpgrade'
// import PopularSearch from './views/AppMessage/PopularSearch'
//
// //评论
// import ReviewMain from './views/Review/ReviewMain.vue'
// import Blacklist from './views/Review/Blacklist.vue'
// import ReviewList from './views/Review/ReviewList.vue'
// import ReviewUser from './views/Review/ReviewUser.vue'
// import ThesaurusFilter from './views/Review/ThesaurusFilter.vue'
// import ReplyList from './views/Review/ReplyList.vue'
// import AllReviewList from './views/Review/AllReviewList.vue'
// import UserList from './views/Review/UserList.vue'
//
//
// //推送
// import AppList from './views/push/AppList.vue'
// import PushMessage from './views/push/PushMessage.vue'
// // import Equipment from './views/push/Equipment.vue'
// // import UserList from './views/push/Equipment/UserList.vue'
//
// //任务
// import TaskList from './views/Task/TaskList.vue'
// import TaskMonitor from './views/Task/TaskMonitor.vue'
//
// import echarts from './views/charts/echarts.vue'


let routes = [
    {
        path: '/login',
        // component: Login,
        component: resolve => require(['@/views/Login'], resolve),
        name: '',
        meta: '',
        hidden: true
    },
    {
        path: '/404',
        // component: NotFound,
        component: resolve => require(['@/views/404'], resolve),

        name: '',
        meta: '',
        hidden: true
    },
    //{ path: '/main', component: Main },
    {
        path: '/article',
        component: Home,
        name: '现场',
        meta: '/article',
        iconCls: 'el-icon-cms-ai-video',//图标样式class
        children: [
            {
                path: '/main',
                // component: Main,
                component: resolve => require(['@/views/Main'], resolve),

                name: '主页',
                hidden: true
            },
            {
                path: '/article/ArticleList',
                // component: ArticleList,
                component: resolve => require(['@/views/article/List'], resolve),
                name: '新闻眼'
            },
            {
                path: '/Shelves',
                // component: Shelves,
                component: resolve => require(['@/views/article/Shelves'], resolve),
                name: '上下架'
            },
            {
                path: '/article/ErrorInstructWarning',
                component: resolve => require(['@/views/article/ErrorInstructWarning'], resolve),
                name: '异常指令警报'
            },
            {
                path: '/article/AbnormalActivityList',
                component: resolve => require(['@/views/article/AbnormalActivityList'], resolve),
                name: '异常活动列表'
            },
            {
                path: '/article/AbnormalVideoList',
                component: resolve => require(['@/views/article/AbnormalVideoList'], resolve),
                name: '异常视频列表'
            },
            {
                path: '/article/SyncHistory/:id',
                component: resolve => require(['@/views/article/SyncHistory'], resolve),
                name: '同步历史',
                hidden: true
            },
            {
                path: '/article/monitor/:id',
                component: resolve => require(['@/views/article/MonitorDetail'], resolve),
                name: '文章监控详情',
                hidden: true
            },
            {
                path: '/article/VideoMonitorHistory/:id',
                component: resolve => require(['@/views/article/VideoMonitorHistory'], resolve),
                name: '视频监控状态',
                hidden: true
            },
            {
                path: '/article/ArticleStatusHistory/:id',
                component: resolve => require(['@/views/article/ArticleStatusHistory'], resolve),
                name: '文章状态变化历史',
                hidden: true
            },
        ]
    },
    {
        path: '/videoMonitor',
        component: Home,
        name: '视频监控',//导航一
        meta: '/videoMonitor',
        iconCls: 'el-icon-cms-monitor',//图标样式class
        children: [
            {
                path: '/main',
                component: resolve => require(['@/views/Main'], resolve),
                name: '主页',
                hidden: true
            },
            {
                path: '/videoList',
                component: resolve => require(['@/views/Video/VideoList'], resolve),
                name: '视频监控'
              
            },
            {
                path: '/VideoReport',
                component: resolve => require(['@/views/Video/VideoReport'], resolve),
                name: '视频上报列表'
            },
            {
                path: '/VideoReport/monitor/:id',
                component: resolve => require(['@/views/Video/VideoDetail'], resolve),
                name: '视频上报监控详情',
                hidden: true
            },
        ]
    },
    {
        path: '/push',
        component: Home,
        name: '推送',
        meta: '',
        iconCls: 'el-icon-message',
        children: [
            {
                path: '/main',
                component: resolve => require(['@/views/Main'], resolve),
                name: '主页',
                hidden: true
            },
            {
                path: '/push/AppList',
                component: resolve => require(['@/views/push/AppList'], resolve),
                name: '应用列表'
            },
            {
                path: '/push/PushMessage',
                component: resolve => require(['@/views/push/PushMessage'], resolve),
                name: '推送消息'
            },
        ]
    },
    {
        path: '/column',
        component: Home,
        name: '栏目管理',
        meta: '',
        iconCls: 'el-icon-cms-lanmuguanli',
        children: [
            {
                path: '/main',
                component: resolve => require(['@/views/Main'], resolve),
                name: '主页',
                hidden: true
            },
            {
                path: '/columnList',
                component: resolve => require(['@/views/Column/columnList'], resolve),
                name: '栏目列表'
            },
            {
                path: '/invalidList',
                component: resolve => require(['@/views/Column/invalidList'], resolve),
                name: '失效列表'
            },
            {
                path: '/column/ChineseTitle',
                component: resolve => require(['@/views/Column/ChineseTitle'], resolve),
                name: '中国号'
            },
        ]
    },
    {
        path: '/appMessage',
        component: Home,
        name: '应用信息',
        meta: '/appMessage',
        iconCls: 'el-icon-cms-yingyong',//图标样式class
        children: [
            {
                path: '/main',
                component: resolve => require(['@/views/Main'], resolve),
                name: '主页',
                hidden: true
            },
            {
                path: '/UserReturns/:appId',
                component: resolve => require(['@/views/AppMessage/UserReturns'], resolve),
                name: '用户反馈'
            },
            {
                path: '/appMessage/OpenAd',
                component: resolve => require(['@/views/AppMessage/OpenAd'], resolve),
                name: '开屏广告'
            },
            {
                path: '/appMessage/PopularSearch',
                component: resolve => require(['@/views/AppMessage/PopularSearch'], resolve),
                name: '热门搜索'
            },
            {
                path: '/appMessage/ApplicationUpgrade',
                component: resolve => require(['@/views/AppMessage/ApplicationUpgrade'], resolve),
                name: '应用升级'
            }, {
                path: '/appMessage/ClickCountQuery',
                component: resolve => require(['@/views/AppMessage/ClickCountQuery'], resolve),
                name: '点击数查询'
            }
        ]
    },

    {
        path: '/review',
        component: Home,
        name: '评论',
        meta: '',
        iconCls: 'el-icon-cms-pinglun',
        children: [
            {
                path: '/main',
                component: resolve => require(['@/views/Main'], resolve),
                name: '主页',
                hidden: true
            },
            {
                path: '/review/AllReviewList',
                component: resolve => require(['@/views/Review/AllReviewList'], resolve),
                name: '审核列表'
            }, {
                path: '/review/AllReport',
                component: resolve => require(['@/views/Review/AllReport'], resolve),
                   name: '举报列表'
            },
            {
                path: '/review/ReviewMain',
                component: resolve => require(['@/views/Review/ReviewMain'], resolve),
                name: '评论'
            },
            {
                path: '/review/UserList',
                component: resolve => require(['@/views/Review/UserList'], resolve),
                name: '用户列表'
            },
            {
                path: '/review/ReviewUser',
                component: resolve => require(['@/views/Review/ReviewUser'], resolve),
                name: '评论用户'
            },
            {
                path: '/review/ReviewList/:id/:title/:menuId/:menuName',
                component: resolve => require(['@/views/Review/ReviewList'], resolve),
                name: '评论列表',
                hidden: true
            },
            {
                path: '/review/Blacklist',
                component: resolve => require(['@/views/Review/Blacklist'], resolve),
                name: '黑名单'
            },
            {
                path: '/review/ReplyList/:articleId/:commentId/:content/:menuId/:titles/:userId/:title',
                component: resolve => require(['@/views/Review/ReplyList'], resolve),
                name: '回复列表',
                hidden: true
            },
            {
                path: '/review/ThesaurusFilter',
                component: resolve => require(['@/views/Review/ThesaurusFilter'], resolve),
                name: '屏蔽词库'
            }

        ]
    },

    {
        path: '/statistics',
        component: Home,
        name: '统计',
        meta: '',
        iconCls: 'el-icon-cms-tongji',
        children: [
            {
                path: '/Statistics/DeviceStatistics',
                component: resolve => require(['@/views/Statistics/DeviceStatistics'], resolve),
                name: '设备统计'
            }, {
                path: '/Statistics/UserStatistics',
                component: resolve => require(['@/views/Statistics/UserStatistics'], resolve),
                name: '用户统计'
            }, {
                path: '/Statistics/ReadStatistics',
                component: resolve => require(['@/views/Statistics/ReadStatistics'], resolve),
                name: '阅读统计'
            }, {
                path: '/Statistics/CommentStatistics',
                component: resolve => require(['@/views/Statistics/CommentStatistics'], resolve),
                name: '评论统计'
            }, {
                path: '/Statistics/ColumnStatistics',
                component: resolve => require(['@/views/Statistics/ColumnStatistics'], resolve),
                name: '栏目统计'
            }, {
                path: '/Statistics/ReportStatistics',
                component: resolve => require(['@/views/Statistics/ReportStatistics'], resolve),
                name: '统计报表'
            }, {
                path: '/Statistics/reportItem',
                component: resolve => require(['@/views/Statistics/reportItem'], resolve),
                hidden:true,
                name: '统计报表详情'
            },
        ]
    },
    {
        path: '/reward',
        component: Home,
        name: '支付',
        meta: '',
        iconCls: 'el-icon-cms-shengriliwu',
        children: [
            {
                path: '/Order/OrderList',
                component: resolve => require(['@/views/reward/OrderList'], resolve),
                name: '订单列表'
            }, {
                path: '/Order/RewardList',
                component: resolve => require(['@/views/reward/RewardList'], resolve),
                name: '打赏列表'
            }, {
                // path: '/Order/RewardDetail/:id/:appreciateAmount/:appreciateCount',
                path: '/Order/RewardDetail/:id',
                component: resolve => require(['@/views/reward/RewardDetail'], resolve),
                name: '打赏详情',
                hidden: true
            }
        ]
    },
    {
        path: '/report',
        component: Home,
        name: '国传及举报',
        meta: '',
        iconCls: 'el-icon-cms-jubao',
        children: [
            {
                path: '/Report/ReportList',
                component: resolve => require(['@/views/Report/ReportList'], resolve),
                name: '举报列表'
            },
            {
                path: '/Report/English',
                component: resolve => require(['@/views/Report/English'], resolve),
                name: '英文'
            },
            {
                path: '/Report/EnglishDetail/:id',
                component: resolve => require(['@/views/Report/EnglishDetail'], resolve),
                name: '英文列表详情',
                hidden: true
            }
        ]
    },

    {
        path: '/user',
        component: Home,
        name: '系统管理',
        meta: '',
        iconCls: 'el-icon-cms-houtai',
        children: [
            {
                path: '/main',
                component: resolve => require(['@/views/Main'], resolve),
                name: '主页',
                hidden: true
            },
            {
                path: '/User/BackStageManagement',
                component: resolve => require(['@/views/User/BackStageManagement'], resolve),
                name: '用户管理'
            },
            {
                path: '/User/AuthorityManagement',
                component: resolve => require(['@/views/User/AuthorityManagement'], resolve),
                name: '权限管理'
            },
            {
                path: '/User/ResourcesList',
                component: resolve => require(['@/views/User/ResourcesList'], resolve),
                name: '资源列表'
            }

        ]
    },
    {
        path: '/',
        component: Home,
        name: '',
        meta: '',
        iconCls: 'el-icon-message',
        hidden: true,//还没实现
        leaf: true,//只有一个节点
        children: [
            {
                path: '/Distribution',
                component: resolve => require(['@/views/nav3/Distribution'], resolve),
                name: '渠道分发'
            }
        ]
    },
    {
        path: '/test',
        component: Home,
        name: '任务管理',
        meta: '',
        iconCls: 'el-icon-cms-task',
        children: [
            {
                path: '/main',
                component: resolve => require(['@/views/Main'], resolve),
                name: '主页',
                hidden: true
            },
            {
                path: '/Task/TaskList',
                component: resolve => require(['@/views/Task/TaskList'], resolve),
                name: '任务列表'
            },
            {
                path: '/Task/TaskMonitor',
                component: resolve => require(['@/views/Task/TaskMonitor'], resolve),
                name: '任务监控'
            }
        ]
    },
    //欢迎页
    {
        path: '/',
        component: Home,
        meta: '',
        hidden: true,
        children: [
            {
                path: '/main',
                component: resolve => require(['@/views/Main'], resolve),
                name: '主页',
                hidden: true
            },
            {
                path: '/Welcome',
                component: resolve => require(['@/views/Welcome'], resolve),

            }]
    },
    {
        path: '/',
        component: Home,
        name: 'Charts',
        hidden: true,
        iconCls: 'el-icon-message',
        children: [
            {
                path: '/echarts',
                component: resolve => require(['@/views/charts/echarts'], resolve),
                name: 'echarts'
            }
        ]
    },
    {
        path: '*',
        hidden: true,
        meta: '',
        redirect: {
            path: '/404'
        }
    }
];

export default routes;