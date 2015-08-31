{{extends file="../../../common/page/layout.tpl"}}
{{block name=title}}直达号-商户后台-直达号基本信息{{/block}}
{{block name=mainContent}}
    <link rel="stylesheet" href="css@merchant:zhida:detail"/>
    <header class="info-header text-common-sm">
        直达号基本信息
    </header>
    <section class="info-box state">
        <div class="info-box-header">
            {{assign "qst" $zhidahao_zizhi.qua_status}}
            <div class="state-row text-common-sm">
                <div class="left">直达号状态</div>
                <div class="right
                {{if $zhidahao_zizhi.qua_status == 4}}
                    success
                {{elseif $zhidahao_zizhi.qua_status == 2 || $zhidahao_zizhi.qua_status == 6}}
                    processing
                {{elseif $zhidahao_zizhi.qua_status == 3 || $zhidahao_zizhi.qua_status == 7}}
                    failure
                {{else}}
                    text-gray-sm
                {{/if}}
                ">
                    {{if $qst == 8}}
                    已下线（系统下线）
                    {{elseif $qst == 9}}
                    已下线（个人下线）
                    {{elseif $qst == 10}}
                    已下线（开发者删除）
                    {{elseif $qst == 4}}
                    已上线
                    {{elseif $qst == 1}}
                    未提交
                    {{elseif $qst == 2}}
                    审核中
                    {{elseif $qst == 3}}
                    审核不通过
                    {{elseif $qst == 6}}
                    已上线（复审中)
                    {{elseif $qst == 7}}
                    已上线（复审失败）
                    {{else}}
                    {{$zhidahao_zizhi.status_desc|escape:"html"}}
                    {{/if}}
                </div>
            </div>

            {{if $qst == 2 || $qst == 6 }}
                <div class="state-row">
                    <div class="right left-offset text-gray-xs">
                        审核结果会在3个工作日内以
                        {{if $zhidahao_zizhi.email neq ""}}
                        邮件（{{$zhidahao_zizhi.email|escape:"html"}}）
                        {{/if}}
                        {{if $zhidahao_zizhi.phone neq ""}}
                        短信（{{$zhidahao_zizhi.phone|escape:"html"}}）
                        {{/if}}系统消息通知您
                    </div>
                </div>
            {{/if}}

            {{if $qst == 3 || $qst == 7 }}
                <div class="state-row">
                    <div class="right left-offset text-gray-xs">
                        {{$zhidahao_zizhi.audit_comment|escape:"html"}}

                    </div>
                    <div class="btn-right">
                        <a class="btn-24 btn-gray text-blue-xs"
                           href="/sh/join{{if $app_id }}?app_id={{$app_id|escape:'html'}}{{/if}}">立即修改</a>
                    </div>
                </div>
            {{/if}}

            {{if $qst == 8 || $qst == 9 || $qst == 10}}
                <div class="state-row">
                    <div class="right left-offset text-gray-xs">
                        {{if $qst == 8}}
                        {{$zhida_info.op_audit_comment|escape:"html"}}
                        {{else}}
                        {{$zhida_info.im_offline_reason|escape:"html"}}
                        {{/if}}
                    </div>

                </div>
            {{/if}}

        </div>
        {{if $zhida_info.app_url != ""}}
            <div class="website">
                {{assign "st" $zhida_info.status}}
                {{if $st == 4}}
                    <!-- 已上线 -->
                    <div class="state-row text-common-sm">
                        <div class="left">直达站点</div>
                        <div class="right success">已上线</div>
                        <div class="btn-right">
                            <a class="btn-24 btn-gray text-blue-xs" href="/sh/site/detail">查看</a>
                        </div>
                    </div>
                {{/if}}

                {{if $st == 1 || $st == 5}}
                    <!-- 未提交 -->
                    <div class="state-row text-common-sm">
                        <div class="left">直达站点</div>
                        <div class="right text-gray-sm">
                            {{if $st == 1}}
                            未提交
                            {{else}}
                            {{$zhida_info.status_desc|escape:"html"}}
                            {{/if}}
                        </div>
                        <div class="btn-right">
                            <a class="btn-24 btn-gray text-blue-xs" href="/sh/site/detail">完善提交</a>
                        </div>
                    </div>
                {{/if}}

                {{if $st == 2 || $st == 6}}
                    <!-- 直达站点审核中 -->
                    <div class="state-row text-common-sm">
                        <div class="left">直达站点</div>
                        <div class="right processing">
                            {{if $st == 2}}
                            审核中
                            {{else}}
                            已上线（复审中)
                            {{/if}}
                        </div>
                    </div>
                    <div class="state-row">
                        <div class="right left-offset text-gray-xs">
                            审核结果会在3个工作日内以
                            {{if $zhidahao_zizhi.email neq ""}}
                            邮件（{{$zhidahao_zizhi.email|escape:"html"}}）
                            {{/if}}
                            {{if $zhidahao_zizhi.phone neq ""}}
                            短信（{{$zhidahao_zizhi.phone|escape:"html"}}）
                            {{/if}}系统消息通知您
                        </div>

                    </div>
                {{/if}}

                {{if $st == 3 || $st == 7}}
                    <!-- 直达站点审核未通过 -->
                    <div class="state-row text-common-sm">
                        <div class="left">直达站点</div>
                        <div class="right failure">
                            {{if $st == 3}}
                            审核不通过
                            {{else}}
                            已上线（复审失败）
                            {{/if}}
                        </div>
                    </div>
                    <div class="state-row">
                        <div class="right left-offset text-gray-xs">
                            {{$zhida_info.op_audit_comment|escape:"html"}}
                        </div>

                        <div class="btn-right">
                            {{if $qst == 8 || $qst == 9}}
                                <button class="btn-24 btn-gray btn-disabled btn-offline">立即修改</button>
                            {{elseif $qst == 2 || $qst == 6}}
                                <button class="btn-24 btn-gray btn-disabled btn-edit">立即修改</button>
                            {{else}}
                                <a class="btn-24 btn-gray text-blue-xs" href="/sh/site/detail">立即修改</a>
                            {{/if}}
                        </div>
                    </div>
                {{/if}}

                {{if $st == 8 || $st == 9 || $st == 10}}
                    <div class="state-row text-common-sm">
                        <div class="left">直达站点</div>
                        <div class="right text-gray-sm">
                            {{if $st == 8}}
                                已下线（系统下线）
                            {{elseif $st == 9}}
                                已下线（个人下线）
                            {{else}}
                                已下线（开发者删除）
                            {{/if}}
                        </div>
                        <div class="btn-right">
                            <a class="btn-24 btn-gray text-blue-xs" href="/sh/site/detail">查看</a>
                        </div>
                    </div>
                    <div class="state-row">
                        <div class="right left-offset text-gray-xs">
                            {{if $st == 8}}
                            {{$zhida_info.op_audit_comment|escape:"html"}}
                            {{else}}
                            {{$zhida_info.site_offline_reason|escape:"html"}}
                            {{/if}}
                        </div>

                    </div>
                {{/if}}

            </div>
        {{elseif $zhida_info.status == 1}}
            <div class="no-website text-gray-xs">
                <span>您可以继续丰富直达号的服务内容</span>
                <a class="btn-24 btn-gray text-blue-xs" href="http://cq01-lapp07.epc.baidu.com:8241/solution?sid={{$zhida_info.sid|escape:'html'}}">去开店/建站</a>
                <a class="text-blue-xs" href="/sh/site/detail">我已有移动店铺/站点</a>
            </div>
        {{/if}}
    </section>

    <section class="info-box zhida">
        <div class="info-box-header text-common">
            直达号信息
            <div class="btn-right">

                {{if $qst == 8 || $qst == 9}}
                    <a class="btn-24 btn-gray text-blue-xs" href="/sh/join{{if $app_id }}?app_id={{$app_id|escape:'html'}}{{/if}}">重新开通</a>
                {{elseif $qst == 4 || $qst == 7}}
                    {{if $st == 2 || $st == 6}}
                        <button class="btn-24 btn-gray btn-disabled btn-edit">修改</button>
                        <button class="btn-24 btn-gray btn-disabled  btn-remove">下线</button>
                    {{else}}
                        <a class="btn-24 btn-gray text-blue-xs" href="/sh/join{{if $app_id }}?app_id={{$app_id|escape:'html'}}{{/if}}">修改</a>
                        <button class="btn-24 btn-gray text-blue-xs btn-remove">下线</button>
                    {{/if}}
                {{elseif $qst == 6}}
                    <button class="btn-24 btn-gray btn-disabled btn-edit">修改</button>
                    <button class="btn-24 btn-gray btn-disabled  btn-remove">下线</button>
                {{elseif $qst == 3}}
                    <a class="btn-24 btn-gray text-blue-xs" href="/sh/join{{if $app_id }}?app_id={{$app_id|escape:'html'}}{{/if}}">修改</a>
                {{elseif $qst == 2}}
                    <button class="btn-24 btn-gray btn-disabled btn-edit">修改</button>
                {{/if}}
            </div>
        </div>

        <div class="box-row">
            <div class="box-left text-common-sm">直达号名称:</div>
            <div class="box-right text-gray-xs">{{$zhida_info.query|escape:"html"}}</div>
        </div>

        <div class="box-row">
            <div class="box-left text-common-sm">直达号简介:</div>
            <div class="box-right text-gray-xs">{{$zhida_info.summary|escape:"html"}}</div>
        </div>

        <div class="box-row">
            <div class="box-left text-common-sm">直达号LOGO:</div>
            <div class="box-right text-gray-xs">
                <img src="{{$zhida_info.logo90|escape:'html'}}" class="logo" alt="直达号LOGO"/>
            </div>
        </div>
        {{if $zhida_info.di_url != ""}}
            <div class="box-row">
                <div class="box-left text-common-sm">直达号二维码:</div>
                <div class="box-right text-gray-xs">
                    <img src="{{$zhida_info.di_url|escape:'html'}}" class="qrcode" alt="直达号二维码"/>
                </div>
            </div>
        {{/if}}
        {{if $zhidahao_zizhi.brand_cert|@count neq 0}}
        <div class="box-row">
            <div class="box-left text-common-sm">品牌商标:</div>
            <div class="box-right text-gray-xs">
                {{foreach $zhidahao_zizhi.brand_cert as $url}}
                    <div class=" o-thumbnail o-thumbnail-view o-thumbnail-reset">
                        <img src="{{$url|escape:'html'}}" alt=""/>
                        <div class="o-hover" style="">
                            <span><div class="view-origin"></div></span>
                        </div>
                    </div>
                {{/foreach}}
            </div>
        </div>
        {{/if}}
    </section>

    <section class="info-box enterprise">
        <div class="info-box-header text-common">
            资质信息

            {{if $zhidahao_zizhi.qua_from eq 0}}
                <div class="btn-right">
                    {{if $qst == 6 || $qst == 2 || $st == 2 || $st == 6}}
                        <button class="btn-24 btn-gray btn-disabled btn-edit">修改</button>
                    {{elseif $qst == 4 || $qst == 7 || $qst == 3}}
                        <a class="btn-24 btn-gray text-blue-xs" href="/sh/join{{if $app_id }}?app_id={{$app_id|escape:'html'}}{{/if}}">修改</a>
                    {{/if}}
                </div>
            {{/if}}
        </div>

        {{if $zhidahao_zizhi.qua_from > 0}}

            <div class="box-row text-gray-xs ssg">
                您的资质已通过百度推广的实名V认证，在直达号平台免认证
            </div>

        {{else}}

            <div class="box-row">
                <div class="box-left text-common-sm">
                    {{if $zhidahao_zizhi.org_type eq 1}}
                        企业信息:
                    {{else}}
                        组织信息:
                    {{/if}}
                </div>
                <div class="box-right text-gray-xs">{{$zhidahao_zizhi.company_name|escape:"html"}}</div>
            </div>

            <div class="more">
                {{if $zhidahao_zizhi.org_type eq 1}}
                    <div class="box-row">
                        <div class="box-left text-common-sm">营业执照扫描件:</div>
                        <div class="box-right text-gray-xs">
                            <div class=" o-thumbnail o-thumbnail-view o-thumbnail-reset ">
                                <img src="{{$zhidahao_zizhi.bus_lic_url|escape:'html'}}" alt=""/>
                                <div class="o-hover" style="">
                                    <span><div class="view-origin"></div></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="box-row">
                        <div class="box-left text-common-sm">营业执照注册码:</div>
                        <div class="box-right text-gray-xs">{{$zhidahao_zizhi.bus_lic_num|escape:'html'}}</div>
                    </div>
                {{else}}
                    <div class="box-row">
                        <div class="box-left text-common-sm">组织机构代码证:</div>
                        <div class="box-right text-gray-xs">
                            <div class=" o-thumbnail o-thumbnail-view o-thumbnail-reset ">
                                <img src="{{$zhidahao_zizhi.org_ins_url|escape:'html'}}" alt=""/>
                                <div class="o-hover" style="">
                                    <span><div class="view-origin"></div></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="box-row">
                        <div class="box-left text-common-sm">组织机构代码证号:</div>
                        <div class="box-right text-gray-xs">{{$zhidahao_zizhi.org_ins_num|escape:'html'}}</div>
                    </div>
                {{/if}}

                <div class="box-row">
                    <div class="box-left text-common-sm">运营者身份证扫描件:</div>
                    <div class="box-right text-gray-xs">
                        <div class=" o-thumbnail o-thumbnail-view o-thumbnail-reset ">
                            <img src="{{$zhidahao_zizhi.legal_id_url|escape:'html'}}" alt=""/>
                            <div class="o-hover" style="">
                                <span><div class="view-origin"></div></span>
                            </div>
                        </div>
                    </div>
                    <div class="box-left-offset box-right text-gray-sm">
                        <div class=" o-thumbnail o-thumbnail-view o-thumbnail-reset ">
                            <img src="{{$zhidahao_zizhi.legal_id_back_url|escape:'html'}}" alt=""/>
                            <div class="o-hover" style="">
                                <span><div class="view-origin"></div></span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="box-row">
                    <div class="box-left text-common-sm">运营者姓名:</div>
                    <div class="box-right text-gray-xs">{{$zhidahao_zizhi.name|escape:"html"}}</div>
                </div>

                <div class="box-row">
                    <div class="box-left text-common-sm">运营者身份证号:</div>
                    <div class="box-right text-gray-xs">{{$zhidahao_zizhi.legal_id_no|escape:"html"}}</div>
                </div>
                <div class="box-row text-common-sm">
                    <div class="box-left">运营者邮箱:</div>
                    <div class="box-right text-gray-xs email">
                        {{$zhidahao_zizhi.email|escape:"html"}}
                    </div>
                </div>
                <div class="box-row text-common-sm">
                    <div class="box-left">运营者手机:</div>
                    <div class="box-right text-gray-xs mobile">
                        {{$zhidahao_zizhi.phone|escape:"html"}}
                    </div>
                </div>
            </div>

            <div class="toggle show-more text-blue-xs">展开详情</div>

        {{/if}}
    </section>

    {{if $zhidahao_zizhi.qua_from eq 0}}
    <section class="info-box contact">
        <div class="info-box-header text-common">
            运营者联系信息
        </div>
        <div class="box-row text-common-sm">
            <div class="box-left"><span class="required">*</span>运营者邮箱:</div>
            <div class="box-right text-gray-xs email-info">
                <span class="email">{{$zhidahao_zizhi.email|escape:"html"}}</span> <span class="edit text-blue-xs">修改</span>
            </div>
            <div class="box-right text-gray-xs email-edit hide">
                <div class="data-edit">
                    <input type="email" class="text-common-xs" placeholder="请输入邮箱地址" value=""/>
                    <button class="btn-30 btn-gray text-blue-xs send-email">发送验证码</button>
                    <div class="error">错误消息</div>
                </div>

                <div class="data-edit">
                    <input type="text" class="text-common-xs" placeholder="请输入您收到的邮箱验证码" value=""/>
                    <div class="error">错误消息</div>
                </div>

                <div class="data-edit">
                    <button class="btn-24 btn-gray text-blue-xs email-finish">完成</button>
                    <button class="btn-24 btn-gray text-blue-xs email-cancel">取消</button>
                </div>
            </div>
        </div>

        <div class="box-row text-common-sm">
            <div class="box-left"><span class="required">*</span>运营者手机:</div>
            <div class="box-right text-gray-xs mobile-info">
                <span class="mobile">{{$zhidahao_zizhi.phone|escape:"html"}}</span> <span class="edit text-blue-xs">修改</span>
            </div>
            <div class="box-right text-gray-xs mobile-edit hide">
                <div class="data-edit">
                    <input type="tel" class="text-common-xs" placeholder="请输入手机号码" value=""/>
                    <button class="btn-30 btn-gray text-blue-xs send-msg">发送验证码</button>
                    <div class="error">错误消息</div>
                </div>

                <div class="data-edit">
                    <input type="text" class="text-common-xs" placeholder="请输入您收到的手机验证码" value=""/>
                    <div class="error">错误消息</div>
                </div>

                <div class="data-edit">
                    <button class="btn-24 btn-gray text-blue-xs mobile-finish">完成</button>
                    <button class="btn-24 btn-gray text-blue-xs mobile-cancel">取消</button>
                </div>
            </div>
        </div>
    </section>
    {{/if}}

    <section class="info-box app">
        <div class="info-box-header text-common">
            应用信息
        </div>

        <div class="box-row">
            <div class="box-left text-common-sm">APPID:</div>
            <div class="box-right text-gray-xs">{{$zhidahao_appbase.app_id|escape:"html"}}</div>
        </div>

        <div class="box-row">
            <div class="box-left text-common-sm">API Key:</div>
            <div class="box-right text-gray-xs">{{$zhidahao_appbase.api_key|escape:"html"}}</div>
        </div>

        <div class="box-row">
            <div class="box-left text-common-sm">Secret Key:</div>
            <div class="box-right text-gray-xs">{{$zhidahao_appbase.secret_key|escape:"html"}}</div>
        </div>

    </section>

    <div class="popup">
        <div class="popup-mask"></div>
        <div class="popup-box">
            <div class="popup-title">
                <i class="popup-close"></i>
                <h1>下线</h1>
            </div>
            <div class="popup-body">
                <div class="warning">
                    <h3>您是否确认下线直达号？</h3>
                    <p>
                        直达号下线后将无法通过@直达号名称搜索到，其他附加功能（例如：CRM，数据统计）等均同时下线，请您确认是否下线直达号。
                    </p>
                </div>
                <div class="error-box">
                    <span class="icon">!</span><span class="text">下线错误</span>
                </div>
                <div class="form-row">
                    <div class="form-label">
                        <label for="disabled_reason">
                            <span class="required">*</span>
                            下线原因：
                        </label>
                    </div>
                    <div class="form-control">
                        <textarea id="disabled_reason" class="disabled-reason"></textarea>
                        <p class="error">请输入下线原因</p>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-label">
                        <label for="vcode">
                            <span class="required">*</span>
                            验证码：
                        </label>
                    </div>
                    <div class="form-control">
                        <input id="vcode" class="vcode " type="text" />
                        <img class="validate-code" height="30" width="100" />
                        <a class="refresh-code" href="javascript:void(0)">换一换</a>
                        <p class="error">验证码不正确</p>
                    </div>
                </div>

            </div>
            <div class="popup-btn-group">
                <button class="confirm-btn btn-38 btn-blue">确认下线</button><button class="cancel-btn btn-38 btn-gray">取消</button>
            </div>
        </div>
    </div>
    <script>
        var Info = {
            app_id: {{$zhida_info.app_id|escape:"javascript"}}
        };
    </script>
    <script src="js@base"></script>
    <script src="js@merchant:zhida:detail"></script>
{{/block}}