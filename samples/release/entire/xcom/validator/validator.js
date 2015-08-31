/**
 * @fileoverview 验证器 todo 优化下代码组织
 * @email zhangshen04@baidu.com
 */

define(function () {

    'use strict';

    var Wi = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1 ];    // 加权因子
    var ValideCode = [ 1, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2 ];            // 身份证验证位值.10代表X

    // 验证子粒
    var specialChars = {
        validate: function (val) {
            var re = /[\s,!@#\$%\^&\*\(\)\-\+=_\[\]\{};:'"\?\.<>！￥（）－＋｛｝【】‘“，’”？：；。`·《》]/;
            if (re.test(val)) {
                return {
                    result: false,
                    msg: '请不要使用特殊字符'
                };
            } else {
                return {
                    result: true,
                    msg: ''
                };
            }
        }
    };
    // 用于校验营业执照注册号 以及 组织机构代码
    var illegalCharWithBracket = {
        validate: function (val) {
            var re = /[\s,!@#\$%\^&\*\+=_\[\]\{};:'"\?\.<>！￥－＋｛｝【】‘“，’”？：；。`·《》]/;
            if (re.test(val)) {
                return {
                    result: false,
                    msg: '请不要使用特殊字符'
                }
            } else {
                return {
                    result: true,
                    msg: ''
                }
            }
        }
    };
    // 最大长度验证
    var length = function (min, max) {
        return {
            validate: function (val) {
                if (val.length > max) {
                    return {
                        result: false,
                        msg: '长度超过了' + max + '个字符'
                    };
                } else if (val.length < min) {
                    return {
                        result: false,
                        msg: '长度不得小于' + min + '个字符'
                    };
                } else {
                    return {
                        result: true,
                        msg: ''
                    };
                }
            }
        };
    };
    // 验证身份证
    var id = {
        validate: function (val) {
            //去掉字符串头尾空格
            var idCard = $.trim(val);
            var result;
            //进行15位身份证的验证
            if (idCard.length === 15) {
                result = isValidityBrithBy15IdCard(idCard);
            } else if (idCard.length === 18) {
                // 得到身份证数组
                var a_idCard = idCard.split('');
                //进行18位身份证的基本验证和第18位的验证
                result = isValidityBrithBy18IdCard(idCard)
                    && isTrueValidateCodeBy18IdCard(a_idCard);
            } else {
                result = false;
            }

            return {
                result: result,
                msg: result ? '' : '输入不是合法身份证号'
            };
        }
    };
    var required = {
        validate: function (val) {
            var ret = ($.trim(val) !== '');
            return {
                result: ret,
                msg: ret ? '' : '此项不能为空'
            }
        }
    };
    var email = {
        validate: function (val) {
            var re = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
            if (re.test(val)) {
                return {
                    result: true,
                    msg: ''
                };
            } else {
                return {
                    result: false,
                    msg: '不是正确的邮箱格式'
                };
            }
        }
    };
    var positiveInteger = {
        validate: function(val){
            var re = /^[1-9]\d*$/;
            if (re.test(val)) {
                return {
                    result: true,
                    msg: ''
                };
            } else {
                return {
                    result: false,
                    msg: '必须是大于0的整数'
                }
            }
        }
    };
    var nonNegativeInteger = {
        validate: function(val){
            var re = /^[1-9]\d*$|0$/;
            if (re.test(val)) {
                return {
                    result: true,
                    msg: ''
                };
            } else {
                return {
                    result: false,
                    msg: '必须是大于或等于0的整数'
                }
            }
        }
    };
    var positiveNumber = {
        validate: function(val){
            var re = /^[1-9]\d*(\.\d*[1-9])?$|0\.\d*[1-9]$/;
            if (re.test(val)) {
                return {
                    result: true,
                    msg: ''
                };
            } else {
                return {
                    result: false,
                    msg: '必须是大于0的数字'
                }
            }
        }
    };
    var nonNegativeNumber = {
        validate: function(val){
            var re = /^[1-9]\d*(\.\d*[1-9])?$|0\.\d*[1-9]$|0$/;
            if (re.test(val)) {
                return {
                    result: true,
                    msg: ''
                };
            } else {
                return {
                    result: false,
                    msg: '必须是大于或者等于0的数字'
                }
            }
        }
    };
    var phone = {
        validate: function (val) {
            var re = /^0?1[3|4|5|8][0-9]\d{8}$/;
            if (re.test(val)) {
                return {
                    result: true,
                    msg: ''
                };
            } else {
                return {
                    result: false,
                    msg: '不是正确的手机号码'
                }
            }
        }
    };
    var queryWord = {
        validate: function (val) {
            var limit = 4;
            var byteLen = String(val)
                .replace(/[^\x00-\xff]/g, 'ci')
                .length;
            var len = val.length;
            // 如果是英文或中英文混合最小长度为2, limit/2
            var isEn = (len >= limit / 2 && byteLen >= limit / 2);
            //如果是中文最小字节数是4 ,limit[0]
            var isCN = byteLen > limit;

            var ret = !val || ((isEn || isCN) && byteLen <= 20);
            if (ret) {
                return {
                    result: true,
                    msg: ''
                };
            } else {
                return {
                    result: false,
                    msg: '请输入2-10个汉字或2-20个字母/数字'
                };
            }
        }
    };
    var website = {
        validate: function(val){
            var re = new RegExp("^(https?://)?"//协议        
                + "([0-9a-zA-Z_!~*'()-]+\\.)*" // 域名      
                + "([0-9a-zA-Z][0-9a-zA-Z-]{0,61})?[0-9a-zA-Z]\\."//二级域名        
                + "[a-zA-Z]{2,6}" //一级域名      
                + "(:[0-9]{1,4})?"//端口- :80        
                + "((/?)|"      
                + "(/[0-9a-zA-Z_!~*'().;?:@&=+$,%#-]+)+/?)$"); 
            if (re.test(val)) {
                return {
                    result: true,
                    msg: ''
                };
            } else {
                return {
                    result: false,
                    msg: '不是正确的站点地址格式'
                }
            }
        }
    };

    /**
     * 判断身份证号码为18位时最后的验证位是否正确
     * @param {Array} a_idCard 身份证号码数组
     * @return {boolean}
     */
    function isTrueValidateCodeBy18IdCard(a_idCard) {
        // 声明加权求和变量
        var sum = 0;
        // 将最后位为x的验证码替换为10方便后续操作
        if (a_idCard[17].toLowerCase() === 'x') {
            a_idCard[17] = 10;
        }
        // 加权求和
        for ( var i = 0; i < 17; i++) {
            sum += Wi[i] * a_idCard[i];
        }
        var valCodePosition = sum % 11;
        // 得到验证码所位置
        return a_idCard[17] == ValideCode[valCodePosition];
    }

    /**
     * 验证18位数身份证号码中的生日是否是有效生日
     * @param {string} idCard18 18位书身份证字符串
     * @return {boolean}
     */
    function isValidityBrithBy18IdCard(idCard18) {
        var year =  idCard18.substring(6, 10);
        var month = idCard18.substring(10, 12);
        var day = idCard18.substring(12, 14);
        var temp_date = new Date(year, parseFloat(month) - 1, parseFloat(day));
        // 这里用getFullYear()获取年份，避免千年虫问题
        return !(temp_date.getFullYear() != parseFloat(year)
            || temp_date.getMonth() != parseFloat(month) - 1
            || temp_date.getDate() != parseFloat(day));
    }

    /**
     * 验证15位数身份证号码中的生日是否是有效生日
     * @param {string} idCard15 15位书身份证字符串
     * @return {boolean}
     */
    function isValidityBrithBy15IdCard(idCard15) {
        var year =  idCard15.substring(6,8);
        var month = idCard15.substring(8,10);
        var day = idCard15.substring(10,12);
        var temp_date = new Date(year, parseFloat(month) - 1, parseFloat(day));
        // 对于老身份证中的你年龄则不需考虑千年虫问题而使用getYear()方法
        return !(temp_date.getYear() != parseFloat(year)
            || temp_date.getMonth() != parseFloat(month) - 1
            || temp_date.getDate() != parseFloat(day));
    }

    return {
        specialChars: specialChars,
        illegalCharWithBracket: illegalCharWithBracket,
        positiveInteger: positiveInteger,
        nonNegativeInteger: nonNegativeInteger,
        positiveNumber: positiveNumber,
        nonNegativeNumber: nonNegativeNumber,
        id: id,
        required: required,
        website: website,
        email: email,
        phone: phone,
        queryWord: queryWord,
        length: length
    }
});