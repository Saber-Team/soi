/**
 * @fileoverview 商户后台一些公用函数集
 * @email zhangshen04@baidu.com
 *        shanli@baidu.com
 *        songjin@baidu.com
 */

define('merchant:common:utils', function() {

    'use strict';

    /**
     * 检查是否登陆，否则弹窗，依赖于passport的js文件
     */
    function checkLogin() {
        if (!baidu) {
            return;
        }
        var countnumber = 5,
            loginDialog = baidu.openapi.loginDialog,
            timer;

        if (!loginDialog || !countnumber) {
            countnumber--;
            loginDialog = baidu.openapi.loginDialog;
            timer = setTimeout(function() {
                checkLogin();
            }, 500);
        } else {
            clearTimeout(timer);
            loginDialog.show();
        }
    }

    function pad(val, len) {
        val = String(val);
        len = len || 2;
        while (val.length < len) {
            val = '0' + val;
        }
        return val;
    }

    function formatDate(date, mask, utc) {

        var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
            timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
            timezoneClip = /[^-+\dA-Z]/g;

        var dateFormat = function(date, mask, utc) {
            // 内置格式
            var masks = {
                'default':      'ddd mmm dd yyyy HH:MM:ss',
                shortDate:      'm/d/yy',
                mediumDate:     'mmm d, yyyy',
                longDate:       'mmmm d, yyyy',
                fullDate:       'dddd, mmmm d, yyyy',
                shortTime:      'h:MM TT',
                mediumTime:     "h:MM:ss TT",
                longTime:       "h:MM:ss TT Z",
                isoDate:        "yyyy-mm-dd",
                isoTime:        "HH:MM:ss",
                isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
                isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
            };
            // Internationalization strings
            var i18n = {
                dayNames: [
                    'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
                    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday',
                    'Friday', 'Saturday'
                ],
                monthNames: [
                    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
                    'Oct', 'Nov', 'Dec', 'January', 'February', 'March', 'April',
                    'May', 'June', 'July', 'August', 'September',
                    'October', 'November', 'December'
                ]
            };

            // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
            if (arguments.length == 1 &&
                Object.prototype.toString.call(date) === '[object String]' &&
                !/\d/.test(date)) {
                mask = date;
                date = undefined;
            }

            // Passing date through Date applies Date.parse, if necessary
            date = date ? new Date(date) : new Date;
            if (isNaN(date)) {
                throw SyntaxError('invalid date');
            }

            // 显示格式
            mask = String(masks[mask] || mask || masks['default']);

            // Allow setting the utc argument via the mask
            if (mask.slice(0, 4) === 'UTC:') {
                mask = mask.slice(4);
                utc = true;
            }

            var _ = utc ? 'getUTC' : 'get',
                d = date[_ + 'Date'](),
                D = date[_ + 'Day'](),
                m = date[_ + 'Month'](),
                y = date[_ + 'FullYear'](),
                H = date[_ + 'Hours'](),
                M = date[_ + 'Minutes'](),
                s = date[_ + 'Seconds'](),
                L = date[_ + 'Milliseconds'](),
                o = utc ? 0 : date.getTimezoneOffset(),
                flags = {
                    d:    d,
                    dd:   pad(d),
                    ddd:  i18n.dayNames[D],
                    dddd: i18n.dayNames[D + 7],
                    m:    m + 1,
                    mm:   pad(m + 1),
                    mmm:  i18n.monthNames[m],
                    mmmm: i18n.monthNames[m + 12],
                    yy:   String(y).slice(2),
                    yyyy: y,
                    h:    H % 12 || 12,
                    hh:   pad(H % 12 || 12),
                    H:    H,
                    HH:   pad(H),
                    M:    M,
                    MM:   pad(M),
                    s:    s,
                    ss:   pad(s),
                    l:    pad(L, 3),
                    L:    pad(L > 99 ? Math.round(L / 10) : L),
                    t:    H < 12 ? 'a'  : 'p',
                    tt:   H < 12 ? 'am' : 'pm',
                    T:    H < 12 ? 'A'  : 'P',
                    TT:   H < 12 ? 'AM' : 'PM',
                    Z:    utc ? 'UTC' : (String(date).match(timezone) || ['']).pop().replace(timezoneClip, ''),
                    o:    (o > 0 ? '-' : '+') + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                    S:    ['th', 'st', 'nd', 'rd'][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
                };

            return mask.replace(token, function ($0) {
                return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
            });
        };

        return dateFormat(date, mask, utc);
    }

    function timestamp_to_datetime(timestamp,format){
        var format = format || 'yyyy-MM-dd hh:mm:ss';
        var now = new Date(parseInt(timestamp) * 1000);
        var o = {
            "M+" : now.getMonth()+1, //month
            "d+" : now.getDate(), //day
            "h+" : now.getHours(), //hour
            "m+" : now.getMinutes(), //minute
            "s+" : now.getSeconds(), //second
            "q+" : Math.floor((now.getMonth()+3)/3), //quarter
            "S" : now.getMilliseconds() //millisecond
        }
        if(/(y+)/.test(format)){
            format = format.replace(RegExp.$1,(now.getFullYear()+"")
                .substr(4- RegExp.$1.length));
        }
        for(var k in o){
            if(new RegExp("("+ k +")").test(format)){
                format = format.replace(RegExp.$1,RegExp.$1.length==1? o[k] :
                    ("00"+ o[k]).substr((""+ o[k]).length));
            }
        }
        return format;
    }

    function datetime_to_timestamp(datetime){
        var tmp_datetime = datetime.replace(/:/g,'-');
        tmp_datetime = tmp_datetime.replace(/ /g,'-');
        var arr = tmp_datetime.split("-");
        var now = new Date(Date.UTC(arr[0],
            arr[1]-1,
            arr[2],
            arr[3]-8,
            arr[4],
            arr[5]));
        return parseInt(now.getTime()/1000);
    }

    // 导出
    return {
        checkLogin: checkLogin,
        formatDate: formatDate,
        stampToDateTime: timestamp_to_datetime,
        dateTimeToStamp: datetime_to_timestamp
    }
});

