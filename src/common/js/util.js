var SIGN_REGEXP = /([yMdhsm])(\1*)/g;
var DEFAULT_PATTERN = 'yyyy-MM-dd';
import moment from "moment";
import {getAppList} from "../../api/api"

function padding(s, len) {
    var len = len - (s + '').length;
    for (var i = 0; i < len; i++) {
        s = '0' + s;
    }
    return s;
};

let router;

export default {
    getQueryStringByName: function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        var context = "";
        if (r != null)
            context = r[2];
        reg = null;
        r = null;
        return context == null || context == "" || context == "undefined" ? "" : context;
    },
    formatDate: {
        format: function (date, pattern) {
            pattern = pattern || DEFAULT_PATTERN;
            return pattern.replace(SIGN_REGEXP, function ($0) {
                switch ($0.charAt(0)) {
                    case 'y':
                        return padding(date.getFullYear(), $0.length);
                    case 'M':
                        return padding(date.getMonth() + 1, $0.length);
                    case 'd':
                        return padding(date.getDate(), $0.length);
                    case 'w':
                        return date.getDay() + 1;
                    case 'h':
                        return padding(date.getHours(), $0.length);
                    case 'm':
                        return padding(date.getMinutes(), $0.length);
                    case 's':
                        return padding(date.getSeconds(), $0.length);
                }
            });
        },
        parse: function (dateString, pattern) {
            var matchs1 = pattern.match(SIGN_REGEXP);
            var matchs2 = dateString.match(/(\d)+/g);
            if (matchs1.length == matchs2.length) {
                var _date = new Date(1970, 0, 1);
                for (var i = 0; i < matchs1.length; i++) {
                    var _int = parseInt(matchs2[i]);
                    var sign = matchs1[i];
                    switch (sign.charAt(0)) {
                        case 'y':
                            _date.setFullYear(_int);
                            break;
                        case 'M':
                            _date.setMonth(_int - 1);
                            break;
                        case 'd':
                            _date.setDate(_int);
                            break;
                        case 'h':
                            _date.setHours(_int);
                            break;
                        case 'm':
                            _date.setMinutes(_int);
                            break;
                        case 's':
                            _date.setSeconds(_int);
                            break;
                    }
                }
                return _date;
            }
            return null;
        }

    },

};

export function setRouter(newRouter) {
    router = newRouter;
}

export function pageJump(url) {
    router.push({path: url});
}
//时间格式化
export function dateFormat(row, column) {
    let date = row[column.property];
    if (date == undefined) {
        return "";
    }
    let checkTime = moment(date);
    if (parseInt(checkTime.get("year")) < 1980) {
        date = parseInt(date) * 1000;
    }
    return moment(date).format("YYYY-MM-DD  HH:mm:ss");
}

export function formatDate(date) {
    if (date == undefined) {
        return "";
    }
    let checkTime = moment(date);
    if (parseInt(checkTime.get("year")) < 1980) {
        date = parseInt(date) * 1000;
    }
    return moment(date).format("YYYY-MM-DD  HH:mm:ss");
}

/**
 * 初始化应用选择列表
 * @param menulist 需要设置的列表
 * @param callback 在获得列表数据后调用
 * @constructor
 */
export function InitMenu(menulist, callback = function () {

}) {
    getAppList({
        skip: 0,
        limit: 100,
    }).then((data) => {
        menulist.length = 0
        let OptionList = data.list;
        // console.log(OptionList[0])
        for (let i = 0; i < OptionList.length; i++) {
            if (OptionList[i].isTop)
                menulist.push({
                    value: OptionList[i].appCode,
                    label: OptionList[i].appName
                })
        }
        callback(menulist)
        // console.log(menulist)
    }).catch(message => {
        console.log(message);
    });
}

export function trim(str) {
    return str.replace(/^(\s|\u00A0)+/, '').replace(/(\s|\u00A0)+$/, '');
}

export function getLastMonthTime(date) {
    var mon = date.getMonth() - 1;
    if (mon === -1) {
        date.setUTCFullYear(date.getUTCFullYear() - 1);
        date.setUTCMonth(11)
    } else {
        date.setUTCMonth(mon)
    }
    return date
}


