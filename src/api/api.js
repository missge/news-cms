import axios from 'axios';
import URLSearchParams from 'url-search-params';
import {pageJump} from "../common/js/util";

let Base64 = require('js-base64').Base64
//通用的
//let base = 'http://m.feawin.com/scene/cms';

let base = SERVER_BASE_URL;
let codeBase = SERVER_CODEBASE_URL;

function createInstance() {
    let instance = axios.create({
        baseURL: base,
        validateStatus
    });
    instance.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem("token")}`;
    return instance;
}

// let codeBase = 'http://m.feawin.com';


function createCodeInstance() {
    let instance = axios.create({
        baseURL: codeBase,
        validateStatus
    });
    instance.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem("token")}`;
    return instance;
}


function formData(param) {
    const data = new URLSearchParams();
    for (let key in param) {
        data.append(key, param[key]);
    }
    return data;
}


function getParamValue(key, params) {
    let value = "";
    if (params[key]) {
        value = params[key];
        delete params[key]
    }
    return value;
}


function responseFilter(response) {
    let {status, data} = response;
    if (status >= 200 && status < 300) {
        return data;
    }

    switch (status) {
        case 401: {
            localStorage.removeItem("token");
            pageJump("/login");
            return;
        }
        default: {
            return Promise.reject(data.message);
        }
    }
}

function validateStatus(status) {
    return true;
}

let loginInstance = axios.create({
    baseURL: base
});

//登陆接口
export const requestLogin = params => {
    return loginInstance.post(`${base}/auth/login`, formData(params)).then(responseFilter);
};

export const getUserList = params => {
    return axios.get(`${base}/user/list`, {params: params});
};

export const getUserListPage = params => {
    return axios.get(`${base}/user/listpage`, {params: params});
};

export const removeUser = params => {
    return axios.get(`${base}/user/remove`, {params: params});
};

export const batchRemoveUser = params => {
    return axios.get(`${base}/user/batchremove`, {params: params});
};

export const editUser = params => {
    return axios.get(`${base}/user/edit`, {params: params});
};

export const addUser = params => {
    return axios.get(`${base}/user/add`, {params: params});
};

//文章接口
export const getArticleList = params => {
    return createInstance().get(`${base}/monitor/article/list`, {params: params}).then(responseFilter)
};

export const getMonitorArticleDetail = id => {
    return createInstance().get(`${base}/monitor/article/detail/${id}`).then(responseFilter)
};

export const getAbnormalActivityList = params => {
    return createInstance().get(`${base}/monitor/activity/error/list`, {params: params}).then(responseFilter)
};

export const getSyncHistory = (id, params) => {
    return createInstance().get(`${base}/monitor/article/update/history/${id}`, {params: params}).then(responseFilter)
};
//指令监控
export const getInstructionList = params => {
    return createCodeInstance().get(`${codeBase}/newchina/cms/alarm/instructions/article/list`, {params: params}).then(responseFilter)
};
export const changeThreshold = params => {
    return createInstance().post(`${codeBase}/newchina/cms/alarm/instructions/threshold`, formData(params)).then(responseFilter)
};
export const changeThresholdStatus = params => {
    return createInstance().post(`${codeBase}/newchina/cms/alarm/instructions/status`, formData(params)).then(responseFilter)
};
export const clearInstruction = params => {
    return createInstance().post(`${codeBase}/newchina/cms/alarm/instructions/clear`, formData(params)).then(responseFilter)
};
export const changeGlobalConfig = params => {
    return createInstance().post(`${codeBase}/newchina/cms/alarm/instructions/global-config`, formData(params)).then(responseFilter)
};

//视频监控状态
export const getVideoMonitorHistory = (id, params) => {
    return createInstance().get(`${base}/monitor/video/history/${id}`, {params: params}).then(responseFilter)
};

export const getArticleStatusHistory = (id, params) => {
    return createInstance().get(`${base}/monitor/article/status/history/${id}`, {params: params}).then(responseFilter)
};

//视频接口
export const getVideoList = params => {
    return createInstance().get(`${base}/monitor/video/list`, {params: params}).then(responseFilter)
};

export const getAbnormalVideoList = params => {
    return createInstance().get(`${base}/monitor/video/list`, {params: params}).then(responseFilter)
};

export const getVideoReportList = params => {
    return createInstance().get(`${base}/monitor/video/report/list`, {params: params}).then(responseFilter)
};

export const getMonitorVideoDetail = params => {
    return createInstance().get(`${base}/monitor/video/report/detail/${params.id}`, {params: params}).then(responseFilter)
};

//点击回应
export const editAssets = params => {
    return createInstance().put(`${base}/assets/${getParamValue("_id", params)}`, params).then(checkResponse);
};


//二维码
export const shareQsCodeUrl = (id, params) => {
    return createCodeInstance().get(`${codeBase}/toolkit/qscode/article/live/${id}`, {params: params}).then(responseFilter)
};

//应用接口
//广告
export const getlatestAd = params => {
    return createCodeInstance().post(`${codeBase}/newchina/cms/ad/latest`, formData(params)).then(responseFilter)
};
export const addAd = params => {
    return createCodeInstance().post(`${codeBase}/newchina/cms/ad/add`, params).then(responseFilter)
};
export const updateAd = params => {
    return createCodeInstance().post(`${codeBase}/newchina/cms/ad/update`, params).then(responseFilter)
};

export const getAdList = params => {
    return createCodeInstance().get(`${codeBase}/newchina/cms/ad/list`, {params: params}).then(responseFilter)
};


//用户反馈接口
export const feedBack = (appId, params) => {
    return createCodeInstance().get(`${codeBase}/feedback/list/${appId}`, {params: params}).then(responseFilter)
};
//上下架
export const changeShelvesOn = articleId => {
    return createCodeInstance().get(`${codeBase}/newchina/cms/toolkit/article/on/shelves/${articleId}`).then(responseFilter)
};
export const changeShelvesOff = articleId => {
    return createCodeInstance().get(`${codeBase}/newchina/cms/toolkit/article/off/shelves/${articleId}`).then(responseFilter)
};

//评论接口
export const getMenu = params => {
    return createCodeInstance().get(`${codeBase}/newchina/reco`, {params: params}).then(responseFilter)
};
export const getViewMainList = params => {
    return createCodeInstance().get(`${codeBase}/newchina/cms/comment/article/list`, {params: params}).then(responseFilter)
};
export const getViewList = params => {
    return createCodeInstance().get(`${codeBase}/newchina/cms/comment/list`, {params: params}).then(responseFilter)
};
export const getReplyList = params => {
    return createCodeInstance().get(`${codeBase}/newchina/cms/comment/reply/list`, {params: params}).then(responseFilter)
};

export const getCommentUserList = params => {
    return createCodeInstance().get(`${codeBase}/newchina/cms/appuser/list`, {params: params}).then(responseFilter)
};

export const setUserIsTest = params => {
    return CreateIncludeHeader().post(`${codeBase}/newchina/app/user/test/change`, params).then(responseFilter)
};

//评论--文章添加或文章评论接口
export const publishView = params => {
    return createCodeInstance().post(`${codeBase}/newchina/cms/comment/publish`, formData(params)).then(responseFilter)
};
//评论--评论／提问／回复的删除／恢复接口／审核通过
export const commentStatus = params => {
    return createCodeInstance().post(`${codeBase}/newchina/cms/comment/status`, formData(params)).then(responseFilter)
};
//评论--获得记者列表
export const getJournalist = params => {
    return createCodeInstance().get(`${codeBase}/newchina/cms/comment/users/journalist`, {params: params}).then(responseFilter)
};
//用户搜索接口
export const searchUsers = params => {
    return createCodeInstance().get(`${codeBase}/newchina/cms/comment/users/search`, {params: params}).then(responseFilter)
};
//添加删除记者接口
export const dealJournalist = params => {
    return createCodeInstance().post(`${codeBase}/newchina/cms/comment/users/journalist`, formData(params)).then(responseFilter)
};
export const getAllComment = params => {
    return createCodeInstance().get(`${codeBase}/newchina/cms/comment/all`, {params: params}).then(responseFilter)
};
export const checkStatus = params => {
    return createCodeInstance().post(`${codeBase}/newchina/cms/config/save`, params).then(responseFilter)
};

//栏目管理接口
export const getColumnsList = params => {
    return createCodeInstance().post(`${codeBase}/newchina/cms/reco/getColumnsList`, params).then(responseFilter)
};
export const addNeWColumn = params => {
    return createCodeInstance().post(`${codeBase}/newchina/cms/reco/addNeWColumn`, params).then(responseFilter)
};
export const deleteNewColumns = params => {
    return createCodeInstance().post(`${codeBase}/newchina/cms/reco/deleteNewColumns`, params).then(responseFilter)
};
export const updateNewColumn = params => {
    return createCodeInstance().post(`${codeBase}/newchina/cms/reco/updateNewColumn`, params).then(responseFilter)
};
export const syncMenusInfo = params => {
    return createCodeInstance().post(`${codeBase}/newchina/cms/reco/syncMenusInfo`, formData(params)).then(responseFilter)
};
//栏目管理-失效列表
export const getDisabledColumnsList = params => {
    return createCodeInstance().post(`${codeBase}/newchina/cms/reco/getDisabledColumnsList`, params).then(responseFilter)
};
export const reuseNewColumns = params => {
    return createCodeInstance().post(`${codeBase}/newchina/cms/reco/reuseNewColumns`, params).then(responseFilter)
};

//任务
export const getTaskList = params => {
    return createCodeInstance().get(`${codeBase}/newchina/cms/task/list`, {params: params}).then(responseFilter)
};
export const saveTask = params => {
    return createCodeInstance().post(`${codeBase}/newchina/cms/task/save`, formData(params)).then(responseFilter)
};
export const removeTask = params => {
    return createCodeInstance().post(`${codeBase}/newchina/cms/task/remove`, formData(params)).then(responseFilter)
};
export const clearRedis = () => {
    return createCodeInstance().post(`${codeBase}/newchina/cms/task/redis/clear`).then(responseFilter)
};
export const resetRedis = () => {
    return createCodeInstance().post(`${codeBase}/newchina/cms/task/redis/reset`).then(responseFilter)
};
export const getTaskMonitorList = params => {
    return createCodeInstance().get(`${codeBase}/newchina/cms/task/monitor/list`, {params: params}).then(responseFilter)
};
export const getTaskMonitorCount = params => {
    return createCodeInstance().get(`${codeBase}/newchina/cms/task/monitor/count`).then(responseFilter)
};


//后台管理接口
export const getBackStageUserList = params => {
    return createInstance().get(`${base}/user/list`, {params: params}).then(responseFilter)
};

export const addBackStageUser = params => {
    return createInstance().post(`${base}/user/add`, formData(params)).then(responseFilter)
};

export const editBackStageUser = params => {
    return createInstance().post(`${base}/user/update`, formData(params)).then(responseFilter)
};

export const delBackStageUser = params => {
    return createInstance().post(`${base}/user/del`, formData(params)).then(responseFilter)
};
//权限接口
//权限--群组
export const getGroupList = params => {
    return createCodeInstance().get(`${codeBase}/newchina/cms/group/list`, {params: params}).then(responseFilter)
};
export const addGroup = params => {
    return createCodeInstance().post(`${codeBase}/newchina/cms/group/add`, formData(params)).then(responseFilter)
};
export const updateGroup = params => {
    return createCodeInstance().post(`${codeBase}/newchina/cms/group/update`, formData(params)).then(responseFilter)
};
export const delGroup = params => {
    return createCodeInstance().post(`${codeBase}/newchina/cms/group/del`, formData(params)).then(responseFilter)
};
export const assignGroup = params => {
    return createCodeInstance().post(`${codeBase}/newchina/cms/user/group/assign`, formData(params)).then(responseFilter)
};
export const assignResources = params => {
    return createCodeInstance().post(`${codeBase}/newchina/cms/group/resources/assign`, formData(params)).then(responseFilter)
};
export const searchGroupId = (gourpId, params) => {
    return createCodeInstance().get(`${codeBase}/newchina/cms/group/resources/${gourpId}`, {params: params}).then(responseFilter)
};

//权限--资源
export const getResourcesList = params => {
    return createCodeInstance().get(`${codeBase}/newchina/cms/resources/list`, {params: params}).then(responseFilter)
};
export const addResources = params => {
    return createCodeInstance().post(`${codeBase}/newchina/cms/resources/add`, formData(params)).then(responseFilter)
};
export const updateResources = params => {
    return createCodeInstance().post(`${codeBase}/newchina/cms/resources/update`, formData(params)).then(responseFilter)
};
export const delResources = params => {
    return createCodeInstance().post(`${codeBase}/newchina/cms/resources/del`, formData(params)).then(responseFilter)
};
//用户接口
export const getUserGroup = (userId, params) => {
    return createCodeInstance().get(`${codeBase}/newchina/cms/user/group/${userId}`, {params: params}).then(responseFilter)
};
export const getUserResource = token => {
    return createCodeInstance().get(`${codeBase}/newchina/cms/user/resources/${token}`).then(responseFilter)
};
//敏感词过滤
export const getSenstiveList = params => {
    return createCodeInstance().get(`${codeBase}/newchina/cms/senstive/list`, {params: params}).then(responseFilter)
};
export const addSenstive = params => {
    return createCodeInstance().post(`${codeBase}/newchina/cms/senstive/add`, formData(params)).then(responseFilter)
};
export const removeSenstive = params => {
    return createCodeInstance().post(`${codeBase}/newchina/cms/senstive/remove`, params).then(responseFilter)
};

export const searchSenstive = params => {
    return createCodeInstance().get(`${codeBase}/newchina/cms/senstive/search`, {params: params}).then(responseFilter)
};

//黑名单
export const addBlack = (type, params) => {
    return createCodeInstance().post(`${codeBase}/newchina/cms/black/${type}`, formData(params)).then(responseFilter)
};
export const getBlackList = (type, params) => {
    return createCodeInstance().get(`${codeBase}/newchina/cms/black/${type}`, {params: params}).then(responseFilter)
};
export const serchBlack = (type, params) => {
    return createCodeInstance().get(`${codeBase}/newchina/cms/black/${type}/search`, {params: params}).then(responseFilter)
};
export const deleteBlack = (type, entityId) => {
    return createCodeInstance().delete(`${codeBase}/newchina/cms/black/${type}/${entityId}`).then(responseFilter)
};
export const updateBlack = (type, entityId, params) => {
    return createCodeInstance().post(`${codeBase}/newchina/cms/black/${type}/${entityId}`, formData(params)).then(responseFilter)
};

//推送
export const getAppList = (params) => {
    return createCodeInstance().get(`${codeBase}/newchina/api/app/getAppList`, {params: params}).then(responseFilter)
};
export const addApp = params => {
    return createCodeInstance().post(`${codeBase}/newchina/api/app/addApp`, params).then(responseFilter)
};
export const getAppInfo = (params) => {
    return createCodeInstance().get(`${codeBase}/newchina/api/app/getAppInfo`, {params: params}).then(responseFilter)
};
export const updateAppInfo = params => {
    return createCodeInstance().post(`${codeBase}/newchina/api/app/updateAppInfo`, params).then(responseFilter)
};
export const deleteApp = (params) => {
    return createCodeInstance().get(`${codeBase}/newchina/api/app/delete`, {params: params}).then(responseFilter)
};
//推送信息
export const getMessageList = (params) => {
    return createCodeInstance().post(`${codeBase}/newchina/api/message/getMessageList`, formData(params)).then(responseFilter)
};
export const sendMessage = params => {
    return createCodeInstance().post(`${codeBase}/newchina/api/message/sendMessage`, params).then(responseFilter)
};
export const updateMessageInfo = params => {
    return createCodeInstance().post(`${codeBase}/newchina/api/message/updateMessageInfo`, params).then(responseFilter)
};
export const deleteMessage = (params) => {
    return createCodeInstance().get(`${codeBase}/newchina/api/message/delete`, {params: params}).then(responseFilter)
};
export const getMessageInfo = () => {
    return createCodeInstance().get(`${codeBase}/newchina/api/message/getMessageInfo`).then(responseFilter)
};

//全局配置-状态切换
export const getCommentConfig = () => {
    return createCodeInstance().get(`${codeBase}/newchina/cms/config/comment`).then(responseFilter)
};


//应用信息--热门搜索
export const getHotSearch = (params) => {
    return createCodeInstance().post(`${codeBase}/newchina/cms/article/hotSearchList`, formData(params)).then(responseFilter)
};

//应用信息--热门搜索
export const updateSearchWord = (params) => {
    return createCodeInstance().post(`${codeBase}/newchina/cms/article/updateSearchWord`, formData(params)).then(responseFilter)
};

export const addSearchWord = (params) => {
    return createCodeInstance().post(`${codeBase}/newchina/cms/article/addSearchWord`, formData(params)).then(responseFilter)
};


/**
 * 评论，审核评论-获取4个数量
 */
export const commentCount = (params) => {
    return createCodeInstance().get(`${codeBase}/newchina/cms/comment/count`, {params: params}).then(responseFilter)
};

/*
中国号*/
export const categoryAdd = (params) => {
    return createCodeInstance().post(`${codeBase}/newchina/cms/cnumber/category/add`, formData(params)).then(responseFilter)
};
export const categories = (params) => {
    return createCodeInstance().get(`${codeBase}/newchina/cms/cnumber/categories`, {params: params}).then(responseFilter)
};
export const categoryDel = (params) => {
    return createCodeInstance().post(`${codeBase}/newchina/cms/cnumber/category/del`, formData(params)).then(responseFilter)
};

export const categoryUpdate = (params) => {
    return createCodeInstance().post(`${codeBase}/newchina/cms/cnumber/category/update`, formData(params)).then(responseFilter)
};

/*应用升级*/
export const ApplicationUpdate = (params) => {
    return createCodeInstance().post(`${codeBase}/newchina/api/app/version/add`, params).then(responseFilter)
};
/*应用升级历史记录*/
export const ApplicationUpdateHistory = (params) => {
    return createCodeInstance().get(`${codeBase}/newchina/api/app/version/list`, {params: params}).then(responseFilter)
};

/*打赏*/
export const RewardListMessage = (params) => {
    return createCodeInstance().get(`${codeBase}/newchina/cms/appreciate/list`, {params: params}).then(responseFilter)
};
export const RewardListOrder = (params) => {
    return createCodeInstance().get(`${codeBase}/newchina/cms/order/list`, {params: params}).then(responseFilter)
};
export const RewardInfo = (params) => {
    return createCodeInstance().get(`${codeBase}/newchina/cms/appreciate/info`, {params: params}).then(responseFilter)
};

export const RewardResource = (params) => {
    return createCodeInstance().get(`${codeBase}/newchina/app/appreciate/amounts`, {params: params}).then(responseFilter)
};

/*举报*/

export const ReportList = params => {
    return createCodeInstance().post(`${codeBase}/newchina/cms/report/getReportList`, params).then().then(responseFilter)
};
export const ReportAdd = params => {
    return createCodeInstance().post(`${codeBase}/newchina/cms/report/addReportItem`, params).then().then(responseFilter)
};
export const ReportRemove = params => {
    return createCodeInstance().post(`${codeBase}/newchina/cms/report/deleteReportItem`, params).then().then(responseFilter)
};
export const ReportUpdate = params => {
    return createCodeInstance().post(`${codeBase}/newchina/cms/report/updateReportItem`, params).then().then(responseFilter)
};

/*点击数查询*/
export const ClickCountGet = (articleId, params) => {
    if (params.type === 'video_click' && !Number(articleId)) {
        articleId = Base64.encode(articleId)
    }
    // articleId = Base64.encode(articleId)
    return createCodeInstance().get(`${codeBase}/newchina/cms/toolkit/article/click/setting/${articleId}`, {params: params}).then(responseFilter)
};
export const ClickCountUpdate = (articleId, params) => {
    if (params.type === 'video_click' && !Number(articleId)) {
        articleId = Base64.encode(articleId)
    }
    return createCodeInstance().post(`${codeBase}/newchina/cms/toolkit/article/click/setting/${articleId}`, formData(params)).then(responseFilter)
};
export const ClickCountGetRealSum = (articleId, params) => {
    if (params.type === 'video_click' && !Number(articleId)) {
        articleId = Base64.encode(articleId)
    }
    return createCodeInstance().get(`${codeBase}/newchina/app/article/click/detail/count/${articleId}`, {params: params}).then(responseFilter)
};


function CreateIncludeHeader() {
    return axios.create({
        baseURL: codeBase,
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'custom': '{"ak":"0104050100","appVersionCode":"150","appVersionStr":"1.5.0","appType":"mobileWeb","buildType":"dev","deviceLanguage":"zh","deviceId":"cms","adId":"","mac":"","osType":"","deviceString":"cms","osVersion":"","userId":""}'
        }
    });
}

export const ClickCountGetRealSum2 = (params) => {
    let instance = axios.create({
        baseURL: codeBase,
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'custom': '{"ak":"0104050100","appVersionCode":"150","appVersionStr":"1.5.0","appType":"mobileWeb","buildType":"dev","deviceLanguage":"zh","deviceId":"cms","adId":"","mac":"","osType":"","deviceString":"cms","osVersion":"","userId":""}'
        }
    });
    return CreateIncludeHeader().get(`${codeBase}/newchina/app/statistics/get`, {params: params}).then(responseFilter)
};


/*英文单词*/
/*export const GetWordVersion = (params) => {
    return CreateIncludeHeader().get(`${codeBase}/newchina/app/enapp/words/version`, {params: params}).then(responseFilter)
};
export const AddWord = (appId, startTime, endTime, params) => {
    return CreateIncludeHeader().get(`${codeBase}/newchina/app/enapp/words/${appId}/${startTime}/${endTime}`, {params: params}).then(responseFilter)
};
export const GetWordDetail = (params) => {
    return CreateIncludeHeader().get(`${codeBase}/newchina/app/enapp/words/detail`, {params: params}).then(responseFilter)
};*/

export const UploadJsonFile = (id, params) => {
    return createCodeInstance().post(`${codeBase}/newchina/cms/enapp/words/import?appId=${id}`, params).then(responseFilter)
};
export const QueryWordList = (params) => {
    return createCodeInstance().get(`${codeBase}/newchina/cms/enapp/words/list`, {params: params}).then(responseFilter)
};


/*操作记录*/

export const OptionHistory = (entityKey) => {
    return createCodeInstance().get(`${codeBase}/newchina/cms/query/logs/${entityKey}`).then(responseFilter)
};


/*统计部分接口*/
var old = false;
export const weekListStats = (params) => {
    if(old) return createCodeInstance().post(`http://chapp.selcome.com/stats/web/weekListStats`, params).then(responseFilter)
    return createCodeInstance().post(`${codeBase}/web/weekListStats`, params).then(responseFilter)
};
export const ColumnStats = (params) => {
   if(old) return createCodeInstance().post(`http://chapp.selcome.com/stats/web/columnStats`, params).then(responseFilter)
    return createCodeInstance().post(`${codeBase}/newchina/web/columnStats`, params).then(responseFilter)
};

export const weekGenerate = (params) => {
    if(old) return createCodeInstance().post(`http://chapp.selcome.com/stats/web/weekGenerate`, params).then(responseFilter)
    return createCodeInstance().post(`${codeBase}/web/weekGenerate`, params).then(responseFilter)
};

export const weekDetailStats = (params) => {
    if(old) return createCodeInstance().post(`http://chapp.selcome.com/stats/web/weekDetailStats`, params).then(responseFilter)
    return createCodeInstance().post(`${codeBase}/web/weekDetailStats`, params).then(responseFilter)
};

export const articleStats = (params) => {
    if(old) return createCodeInstance().post(`ttp://chapp.selcome.com/statsh/web/articleStats`, params).then(responseFilter)
    return createCodeInstance().post(`${codeBase}/web/articleStats`, params).then(responseFilter)
};
export const DeviceStats = (params) => {
    if(old) return createCodeInstance().post(`http://chapp.selcome.com/stats/web/deviceStats`, params).then(responseFilter)
    return createCodeInstance().post(`${codeBase}/web/deviceStats`, params).then(responseFilter)
};
export const UserStats = (params) => {
    if(old) return createCodeInstance().post(`http://chapp.selcome.com/stats/web/userStats`, params).then(responseFilter)
    return createCodeInstance().post(`${codeBase}/web/userStats`, params).then(responseFilter)
};
export const ReadStats = (params) => {
    if(old) return createCodeInstance().post(`http://chapp.selcome.com/stats/web/scanStats`, params).then(responseFilter)
    return createCodeInstance().post(`${codeBase}/web/scanStats`, params).then(responseFilter)
};
export const CommentStats = (params) => {
    if(old) return createCodeInstance().post(`http://chapp.selcome.com/stats/web/scanComment`, params).then(responseFilter)
    return createCodeInstance().post(`${codeBase}/web/scanComment`, params).then(responseFilter)
};

//////////////////////////////////////////////////////////////////////////////////////////////////////
export const updateWeekDetailDesc = (params) => {
    return createCodeInstance().post(`${codeBase}/web/updateWeekDetailDesc`, params).then(responseFilter)
};

