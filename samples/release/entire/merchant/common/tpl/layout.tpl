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
        /* 左侧导航 */
        .framework-page .framework-left {
            position: fixed;
            display: block;
            top: 45px;
            width: 180px;
            height: auto;
        }
        .framework-page .framework-navbar {
            height: 100%;
        }
        /* 右侧内容 */
        .framework-page .framework-right {
            position: relative;
            display: block;
            float: right;
            width: 1000px;
        }
        /* 页脚 */
        .framework-footer {
            position: relative;
            width: calc(100% － 200px);
            height: 30px;
            margin: 20px 0 20px 200px;
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
        <aside class="framework-left framework-navbar" id="nav-bar"></aside>
        <script type="text/javascript" src="__NAVBAR__/side/bar/menulist?app_id={{$app_id}}"></script>
        <script type="text/javascript">
            var navbar = new Navbar({
                container: document.getElementById('nav-bar')
            });
        </script>
        <div class="framework-right" id="main-content">
            {{block name=mainContent}}{{/block}}
        </div>
    </div>
    <footer class="framework-footer">
        &copy; 2015 Baidu <a href="http://www.baidu.com/duty/" target="_blank">使用百度前必读</a> | <a target="_blank" href="http://www.miibeian.gov.cn">京ICP证030173号</a>
    </footer>
</body>
</html>