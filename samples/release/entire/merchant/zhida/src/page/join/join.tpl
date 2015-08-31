<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=Edge" />
    <script type="text/javascript">
        (function () {
            var ua = getUserAgentString();

            /**
             * 是否Internet Explorer。其他一些设备用了Trident渲染引擎。比如AOL，Netscape 8
             * @return {boolean}
             */
            var isIE = ((ua.indexOf('MSIE') !== -1) || (ua.indexOf('Trident') !== -1));

            /**
             * 某些客户代理(Gears WorkerPool)没有navigator对象,我们返回空字符串.
             * @return {String}
             */
            function getUserAgentString () {
                return window.navigator ? window.navigator.userAgent : '';
            }

            /**
             * @return {String} 标明版本号的字符串
             */
            function determineIEVersion () {
                // 版本号应该是个字符串，因为可能包含 'b', 'a'
                var version = '', re, arr;

                if (isIE) {
                    re = /\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/;
                    arr = re.exec(ua);
                    version = arr ? arr[1] : '';

                    // IE9可能会是document mode 9但检测UA得到的版本号低于9，一般是设置了浏览器的代理模式。
                    // 如果检测到的版本低于9,我们以documentMode为主。IE8也有这种问题。
                    // 建议在meta头设置X-UA-Compatible为edge确保用的是documentMode 9。
                    var docMode = getDocumentMode();
                    if (docMode > parseFloat(version))
                        return '' + docMode;
                }

                return version;
            }

            /**
             * @return {?Number}
             */
            function getDocumentMode () {
                var doc = window.document;
                return doc ? doc.documentMode : undefined;
            }

            if (isIE && determineIEVersion() < 9) {
                location.href = 'http://zhida.baidu.com/static/assets/sorry-for-ie.html';
            }
        })();
    </script>
    <title>{{block name=title}}直达号{{/block}}</title>
    <style>
        .framework-page {
            position: relative;
            width: 1200px;
            margin: 0 auto;
        }
        .framework-page:before,
        .framework-page:after {
            display: block;
            content: "";
            clear: both;
        }
        /* 主要内容 */
        .framework-page .framework-center {
            position: relative;
            display: block;
            width: 1198px;
            border: 1px solid #DFE2E3;
            border-radius: 2px;
            background: #ffffff;
            margin-top: 20px;
        }
        /* 页脚 */
        .framework-footer {
            position: relative;
            width: calc(100% － 200px);
            height: 30px;
            margin: 20px 0;
            clear: both;
            color: rgb(139, 139, 139);
            font-size: 14px;
            text-align: center;
            line-height: 30px;
        }
        .framework-footer a {
            color: rgb(139, 139, 139);
            font-size: 14px;
            line-height: 30px;
            text-decoration: none;
        }
    </style>
</head>
<body>
<script type="text/javascript" src="__TOPBAR__/apis/topbar?version=old"></script>
<script type="text/javascript">
    baidu.openapi.renderHeader({
        hasZhidaLogo: 1,
        hasAppNav: 0
    });
</script>
<div class="framework-page">
    <div class="framework-center" id="main-content">
        <link rel="stylesheet" href="css@merchant:zhida:join">
        <h1>开通直达号</h1>
        <div class="step step-1">
            <div class="banner"></div>
            <div class="ssg">您的资质已通过百度推广的实名V认证，在直达号平台免认证</div>
            <div class="warning">
                <div class="warning-title"><i>!</i>审核不通过</div>
                <p></p>
            </div>
            <div class="form">
                <form id="form">
                    <fieldset class="required separator f-orgType">
                        <label for="org_type">组织类型：</label>
                        <div class="slider" id="org_type">
                            <span data-value="1" class="actived">企业</span><span data-value="2">其他组织</span>
                        </div>
                        <div class="quote">?</div>
                        <div class="tooltip">
                            <p class="separator"><em>企业</em>指领取营业执照的有限责任公司、股份有限公司、非公司企业法人、
                                合伙企业、个人独资企业及其分支机构，来华从事经营活动的外国(地区)企业，及其他经营单位
                            </p>
                            <p><em>其他组织</em>指在中华人民共和国境内依法注册、依法登记的机关、事业单位、社会团体、
                                学校和民办非企业单位和其他机构
                            </p>
                        </div>
                    </fieldset>
                    <fieldset class="required f-busLicUrl">
                        <label for="bus_lic_url">营业执照扫描件：</label>
                        <div class="f-content">
                            <div class="o-webuploader">
                                <div class="o-thumbnail o-upload-done" data-order="0">
                                    <img src="">
                                    <div class="o-remove" style="display: none;"></div>
                                    <div class="o-hover" style="">
                                        <span><div class="view-origin"></div></span>
                                        <span><div class="re-upload"></div></span>
                                    </div>
                                </div>
                                <div id="bus_lic_url" class="o-filepicker">
                                    <div class="up-icon"></div>
                                    <div class="up-text">上传扫描件</div>
                                </div>
                            </div>
                            <div class="error">未上传图片</div>
                            <div class="tip">
                                请提供证件的原件照片或彩色扫描件(正副本均可), 文字/盖章清晰可辨认
                                <a target="_blank" href="http://zhida.baidu.com/static/assets/zhida/sample/%E8%90%A5%E4%B8%9A%E6%89%A7%E7%85%A7%E6%89%AB%E6%8F%8F%E4%BB%B6%E5%8F%82%E8%80%83%E6%A0%B7%E4%BE%8B.png">参考样例</a><br/>格式要求png, jpg, jpeg, 不超过10MB
                            </div>
                            <div class="sample"></div>
                        </div>
                    </fieldset>
                    <fieldset class="required f-busLicNum">
                        <label for="bus_lic_num">营业执照注册号：</label>
                        <div class="o-inputfield" data-name="bus_lic_num">
                            <div class="box">
                                <input type="text" value="" id="bus_lic_num" name="bus_lic_num"
                                       placeholder="请输入营业执照上的注册编号" />
                            </div>
                            <div class="error">返回错误</div>
                            <div class="tip">若编码中包含(1-1)或者(1/1), 请正常填写</div>
                        </div>
                    </fieldset>
                    <fieldset class="required f-orgInsUrl">
                        <label for="org_ins_url">组织机构代码证：</label>
                        <div class="f-content">
                            <div class="o-webuploader">
                                <div class="o-thumbnail o-upload-done" data-order="0">
                                    <img src="">
                                    <div class="o-remove" style="display: none;"></div>
                                    <div class="o-hover" style="">
                                        <span><div class="view-origin"></div></span>
                                        <span><div class="re-upload"></div></span>
                                    </div>
                                </div>
                                <div id="org_ins_url" class="o-filepicker">
                                    <div class="up-icon"></div>
                                    <div class="up-text">上传扫描件</div>
                                </div>
                            </div>
                            <div class="error">未上传图片</div>
                            <div class="tip">
                                请提供证件的原件照片或彩色扫描件(正副本均可), 文字/盖章清晰可辨认
                                <a target="_blank" href="http://zhida.baidu.com/static/assets/zhida/sample/%E8%90%A5%E4%B8%9A%E6%89%A7%E7%85%A7%E6%89%AB%E6%8F%8F%E4%BB%B6%E5%8F%82%E8%80%83%E6%A0%B7%E4%BE%8B.png">参考样例</a><br/>格式要求png, jpg, jpeg, 不超过10MB
                            </div>
                            <div class="sample"></div>
                        </div>
                    </fieldset>
                    <fieldset class="required f-orgInsNum">
                        <label for="org_ins_num">组织机构代码证号：</label>
                        <div class="o-inputfield" data-name="org_ins_num">
                            <div class="box">
                                <input type="text" value="" id="org_ins_num" name="org_ins_num"
                                       placeholder="请输入组织机构代码证上的编号" />
                            </div>
                            <div class="error">返回错误</div>
                        </div>
                    </fieldset>
                    <fieldset class="required f-companyName">
                        <label for="company_name">企业名称：</label>
                        <div class="o-inputfield" data-name="company_name">
                            <div class="box">
                                <input type="text" value="" id="company_name" name="company_name" maxlength="100"
                                       placeholder="请输入营业执照上的企业名称" />
                                <i><em>0</em>/100</i>
                            </div>
                            <div class="error">返回错误</div>
                            <div class="tip">个体工商户请填"字号名称", 无名称的填写"无"</div>
                        </div>
                    </fieldset>
                    <fieldset class="required f-legalIdUrl">
                        <label for="legal_id_url">运营者身份证扫描件：</label>
                        <div class="f-content">
                            <div class="o-webuploader">
                                <div class="o-thumbnail o-upload-done" data-order="0">
                                    <img src="">
                                    <div class="o-remove" style="display: none;"></div>
                                    <div class="o-hover" style="">
                                        <span><div class="view-origin"></div></span>
                                        <span><div class="re-upload"></div></span>
                                    </div>
                                </div>
                                <div id="legal_id_url" class="o-filepicker">
                                    <div class="up-icon"></div>
                                    <div class="up-text">上传正面扫描件</div>
                                </div>
                            </div>
                            <div class="error">未上传图片</div>
                        </div>
                    </fieldset>
                    <fieldset class="required f-legalIdBackUrl">
                        <label for="legal_id_back_url" class="hidden">运营者身份证扫描件：</label>
                        <div class="f-content">
                            <div class="o-webuploader">
                                <div class="o-thumbnail o-upload-done" data-order="0">
                                    <img src="">
                                    <div class="o-remove" style="display: none;"></div>
                                    <div class="o-hover" style="">
                                         <span><div class="view-origin"></div></span>
                                        <span><div class="re-upload"></div></span>
                                    </div>
                                </div>
                                <div id="legal_id_back_url" class="o-filepicker">
                                    <div class="up-icon"></div>
                                    <div class="up-text">上传反面扫描件</div>
                                </div>
                            </div>
                            <div class="error">未上传图片</div>
                            <div class="tip">
                                请提供证件的原件照片或彩色扫描件, 文字/头像清晰可辨认
                                <a target="_blank" href="http://zhida.baidu.com/static/assets/zhida/sample/%E8%BA%AB%E4%BB%BD%E8%AF%81%E6%89%AB%E6%8F%8F%E4%BB%B6%E5%8F%82%E8%80%83%E6%A0%B7%E4%BE%8B.png">参考样例</a><br/>格式要求png, jpg, jpeg, 不超过10MB
                            </div>
                            <div class="sample"></div>
                        </div>
                    </fieldset>
                    <fieldset class="required f-name">
                        <label for="name">运营者姓名：</label>
                        <div class="o-inputfield" data-name="name">
                            <div class="box">
                                <input type="text" value="" id="name" name="name" maxlength="32"/>
                            </div>
                            <div class="error">返回错误</div>
                        </div>
                    </fieldset>
                    <fieldset class="required f-legalIdNo">
                        <label for="legal_id_no">运营者身份证号：</label>
                        <div class="o-inputfield" data-name="legal_id_no">
                            <div class="box">
                                <input type="text" value="" id="legal_id_no" name="legal_id_no" maxlength="18"/>
                                <i><em>0</em>/18</i>
                            </div>
                            <div class="error">返回错误</div>
                        </div>
                    </fieldset>
                    <fieldset class="required f-email">
                        <label for="email">运营者邮箱：</label>
                        <div class="f-content">
                            <div class="view">
                                <div>asdasdas@sina.com</div>
                                <span>修改</span>
                            </div>
                            <div class="edit">
                                <div class="o-inputfield" data-name="email">
                                    <div class="box">
                                        <input type="text" value="" id="email" name="email" maxlength="100" />
                                    </div>
                                    <div class="error">返回错误</div>
                                </div>
                                <div class="btn-30 btn-gray">发送验证码</div>
                                <div class="o-inputfield" data-name="email-qrcode">
                                    <div class="box">
                                        <input type="text" value="" id="email-qrcode" name="email-qrcode"
                                               placeholder="请输入您收到的邮箱验证码" />
                                    </div>
                                    <div class="error">返回错误</div>
                                </div>
                            </div>
                        </div>
                    </fieldset>
                    <fieldset class="required f-phone">
                        <label for="phone">运营者手机号：</label>
                        <div class="f-content">
                            <div class="view">
                                <div>13683370283</div>
                                <span>修改</span>
                            </div>
                            <div class="edit">
                                <div class="o-inputfield" data-name="phone">
                                    <div class="box">
                                        <input type="text" value="" id="phone" name="phone" maxlength="18" />
                                    </div>
                                    <div class="error">返回错误</div>
                                </div>
                                <div class="btn-30 btn-gray">发送验证码</div>
                                <div class="o-inputfield" data-name="phone-qrcode">
                                    <div class="box">
                                        <input type="text" value="" id="phone-qrcode" name="phone-qrcode"
                                               placeholder="请输入您收到的手机验证码" />
                                    </div>
                                    <div class="error">返回错误</div>
                                </div>
                            </div>
                        </div>
                    </fieldset>
                    <fieldset class="f-agree">
                        <label>同意条款</label>
                        <div class="f-content">
                            <div class="o-checkbox">
                                <input type="checkbox" id="agree" checked/>
                                <label for="agree">已阅读并同意<a target="_blank" href="http://zhida.baidu.com/zhidahao/wiki/index.php?title=docs/direct/directagreement">《直达号服务协议》</a></label>
                            </div>
                        </div>
                    </fieldset>
                </form>
                <div class="buttons">
                    <div class="btn-38 btn-blue">下一步</div>
                    <div class="btn-38 btn-gray">取消</div>
                </div>
            </div>
        </div>
        <div class="step step-2">
            <div class="banner"></div>
            <div class="warning">
                <div class="warning-title"><i>!</i>审核不通过</div>
                <p></p>
            </div>
            <div class="form">
                <form id="formStep2">
                    <fieldset class="required f-query">
                        <label for="query">直达号名称：</label>
                        <div class="o-inputfield" data-name="query">
                            <div class="box">
                                <input type="text" value="" id="query" name="query" maxlength="20"
                                       placeholder="请使用企业简称或品牌名称" />
                            </div>
                            <div class="error">返回错误</div>
                            <div class="tip">长度为2-10个汉字或者2-20个英文字母/数字，不能是泛词，行业词。<br/>
                                <a target="_blank" href="http://zhida.baidu.com/zhidahao/wiki/index.php?title=docs/direct/keyword">
                                    查看详细填写规则</a>，以提高审核效率</div>
                        </div>
                        <div class="quote">?</div>
                        <div class="tooltip"></div>
                    </fieldset>
                    <fieldset class="required f-summary">
                        <label for="summary">直达号简介：</label>
                        <div class="o-textarea" data-name="summary">
                            <textarea id="summary" name="summary" maxlength="200" draggable="false"
                                      placeholder="请至少使用20个字来介绍您的直达号"></textarea>
                            <i><em>0</em>/200</i>
                            <div class="error">返回错误</div>
                        </div>
                        <div class="quote">?</div>
                        <div class="tooltip"></div>
                    </fieldset>
                    <fieldset class="required f-logo">
                        <label for="logo">直达号LOGO：</label>
                        <div class="f-content">
                            <div class="o-webuploader"></div>
                            <div class="error">未上传图片</div>
                            <div class="tip">该图标将用于用户关注您的直达号后在其桌面展示。<br/>
                                尺寸：200*200像素  /  格式：png，jpg，gif<br/>  大小：300k
                            </div>
                        </div>
                    </fieldset>
                    <fieldset class="f-brand">
                        <label for="brand">品牌/商标材料：</label>
                        <div class="f-content">
                            <div class="o-webuploader">
                                <div id="brand" class="o-filepicker">
                                    <div class="up-icon"></div>
                                    <div class="up-text">上传图片</div>
                                </div>
                            </div>
                            <div class="error">未上传图片</div>
                            <div class="tip">
                                若您的直达号是驰名品牌或商标，请上传品牌加盟书，商标注册证或代理协议等相关授权书<br/>
                                的原件照片或彩色扫描件，否则将无法通过审核。<br/>
                                若分公司申请内容涉及总公司，需要提供总公司证明或授权书，否则将无法通过审核。<br/>
                                格式要求png，jpg，gif ,  不超过10M。
                            </div>
                        </div>
                    </fieldset>
                </form>
                <div class="buttons">
                    <div class="btn-38 btn-gray">上一步</div>
                    <div class="btn-38 btn-blue">提交</div>
                </div>
            </div>
        </div>
        <div class="step step-3">
            <div class="banner"></div>
            <div class="inform">
                <h3>您和直达号只剩下一个审核的距离</h3>
                <p></p>
            </div>
            <div class="builder">
                <h3>成功开店/建站，将有机会获得更多百度流量</h3>
                <button>去开店/建站</button>
                <a href="/sh/site/detail">我有移动店铺/站点</a>
            </div>
            <div class="sample">
                <div class="card ditu"><div class="si"></div></div>
                <div class="card juhe"><div class="si"></div></div>
                <div class="card sousuo"><div class="si"></div></div>
                <div class="card tui"><div class="si"></div></div>
                <div class="card wise"><div class="si"></div></div>
                <div class="card xunzhi"><div class="si"></div></div>
            </div>
            <a class="enter" href="/sh/detail">点击进入商户后台></a>
        </div>
        <script>
            var GlobalInfo = {
                'app_id': '{{$step_status.app_id}}',
                'bdstoken' : "{{$bdstoken}}",
                'islogin': "{{$passport_info.is_login}}",
                'step': "{{$step_status.step}}",
                'status': "{{$step_status.status}}",
                'phone': "{{$step_status.phone}}",
                'email': "{{$step_status.email}}",
                'sid': "{{$step_status.sid}}",
                'site_status': "{{$step_status.site_status}}"
            };
            var FileAPI = {
                debug: true,
                staticPath: '__FILE_API_STATIC__/static/merchant/common/swf/'
            };
        </script>
        <script src="js@base"></script>
        <script src="js@base:uploader"></script>
        <script src="js@base:logouploader"></script>
        <script src="js@merchant:zhida:join"></script>
    </div>
</div>
<footer class="framework-footer">
    &copy; 2015 Baidu <a href="http://www.baidu.com/duty/" target="_blank">使用百度前必读</a> | <a target="_blank" href="http://www.miibeian.gov.cn">京ICP证030173号</a>
</footer>
</body>
</html>