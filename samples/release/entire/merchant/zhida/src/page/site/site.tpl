{{extends file="../../../common/page/layout.tpl"}}
{{block name=title}}直达号-商户后台-站点设置{{/block}}
{{block name=mainContent}}
<link rel="stylesheet" type="text/css" href="css@merchant:zhida:site" />
<h1 class="page-title">直达站点设置</h1>
{{* 直达号未提交时的状态逻辑 *}}
{{if $zhida_info.status eq 1}}
<p class="page-warning">
    <span class="icon smile"></span>
    直达站点审核通过后，将有机会获得更多的百度移动搜索流量。
    <!--<a href="javascript:void(0)">了解详情</a>-->
</p>
{{* 直达号审核中时的状态逻辑 start *}}
{{else if $zhida_info.status eq 2 || $zhida_info.status eq 6}}
<section class="titled-section state-section proceeding">
    <div class="section-content">
        <div class="form-row clearfix">
            <div class="form-label">
                <label>直达站点状态</label>
            </div>
            <div class="form-control">
                <b class="state-text">
                {{if $zhida_info.status eq 2}}
                审核中
                {{elseif $zhida_info.status eq 6}}
                已上线（复审中）
                {{/if}}
                </b>
            </div>
            <p class="state-notice">
            {{if $zhida_info.status eq 2}}
            审核
            {{elseif $zhida_info.status eq 6}}
            复审
            {{/if}}
            结果会在3个工作日内以
            {{if $email neq ''}}
            邮件（{{$email|escape:'html'}}）
            {{/if}}
            {{if $phone neq ''}}
            短信（{{$phone|escape:'html'}}）
            {{/if}}
            系统消息通知您</p>
        </div>
    </div>
</section>
{{* 直达号审核中时的状态逻辑 end *}}

{{* 直达号审核未通过时的状态逻辑 start *}}
{{else if $zhida_info.status eq 3 || $zhida_info.status eq 7}}
<section class="titled-section state-section failed">
    <div class="section-content">
        <div class="form-row clearfix">
            <div class="form-label">
                <label>直达站点状态</label>
            </div>
            <div class="form-control">
                <b class="state-text">
                {{if $zhida_info.status eq 3}}审核不通过{{elseif $zhida_info.status eq 7}}已上线（复审失败）{{/if}}
                </b>
            </div>
        </div>
        <div class="form-row clearfix audit-failed">
            <div class="state-notice">
            {{if $zhida_info.status eq 3}}审核{{elseif $zhida_info.status eq 7}}复审{{/if}}不通过，原因：{{$zhida_info.op_audit_comment|escape:'html'}}
            </div>
            <div class="state-notice-btn">
                <button id="revise_immediately_btn" class="revise-immediately-btn btn-30 btn-white {{if ($zhida_info.qua_status lte 3 || $zhida_info.qua_status eq 6 || $zhida_info.qua_status gte 7) || ($zhida_info.status eq 2 || $zhida_info.status eq 6)}}btn-disabled{{/if}}">立即修改</button>
            </div>
        </div>
    </div>
</section> 
{{* 直达号审核未通过时的状态逻辑 end *}}

{{* 直达号审核通过时的状态逻辑 start *}}
{{else if $zhida_info.status eq 4}}
<section class="titled-section state-section passed">
    <div class="section-content">
        <div class="form-row clearfix">
            <div class="form-label">
                <label>
                    直达站点状态
                </label>
            </div>
            <div class="form-control">
                <b class="state-text">已上线</b>
            </div>
        </div>
    </div>
</section>  
{{* 直达号审核通过时的状态逻辑 end *}}

{{* 直达号已下线时的状态逻辑 start *}}
{{else if $zhida_info.status eq 8 || $zhida_info.status eq 9}}
<section class="titled-section state-section unused">
    <div class="section-content">
        <div class="form-row clearfix">
            <div class="form-label">
                <label>
                    直达站点状态
                </label>
            </div>
            <div class="form-control">
                <b class="state-text">已下线（{{if $zhida_info.status eq 9}}个人下线{{else if $zhida_info.status eq 8}}系统下线{{/if}}）</b>
            </div>
            <p class="state-notice">
            {{if $zhida_info.status eq 9}}
                {{$zhida_info.site_offline_reason|escape:'html'}}
            {{else if $zhida_info.status eq 8}}
                {{$zhida_info.op_audit_comment|escape:'html'}}
            {{/if}}
            </p>
        </div>
    </div>
</section>
{{/if}}
{{* 直达号已下线时的状态逻辑 end *}}

<section class="titled-section site-section">
    <h2 class="section-title">
        <span>站点信息</span>
        <span id="leading_to_builder_tip"{{if $zhida_info.app_url_status eq 1}} style="display:none"{{/if}}>
            <b>还没有移动店铺／站点？</b>
            <a id="quick_build_site" target="_self" href="http://zhida.baidu.com/hangyefangan?zhida_refer=">10分钟快速开店／建站</a>
        </span>
        {{* 一入模板深似海，从此节操是路人 *}}
        {{* 综合直达号状态和直达站点状态，是否展示以及禁用修改、下线、重新提交按钮的逻辑条件 *}}
        {{if ($zhida_info.qua_status gte 4 
            && $zhida_info.qua_status lte 7) 
            && ($zhida_info.status gte 4 
            && $zhida_info.status lte 7)
        }}
        <button id="disable_site_btn" class="remove-site-btn btn-30 btn-white tool-btn {{if $zhida_info.qua_status eq 6 || $zhida_info.status eq 6}}btn-disabled{{/if}}">下线</button>
        {{/if}}
        {{if $zhida_info.status lt 8 && $zhida_info.status gt 1}}
        <button id="revise_site_btn" class="revise-site-btn btn-30 btn-white tool-btn {{if ($zhida_info.qua_status lte 3 || $zhida_info.qua_status eq 6 || $zhida_info.qua_status gte 7) || ($zhida_info.status eq 2 || $zhida_info.status eq 6)}}btn-disabled{{/if}}">修改</button>
        {{/if}}
        {{if $zhida_info.status gte 8}}
        <button id="recommit_site_btn" class="recommit-site-btn btn-30 btn-white tool-btn {{if $zhida_info.qua_status eq 6 || $zhida_info.qua_status gte 8}}btn-disabled{{/if}}">重新提交</button>
        {{/if}}
    </h2>
    
    <div id="submit_form" class="section-content {{if $zhida_info.status eq 1}}edit{{/if}}">
        <div class="form-row clearfix">
            <div class="form-label">
                <label for="site">
                    <span class="required">*</span>
                    直达站点：
                </label>
            </div>
            <div class="form-control">
                <input id="app_url_input" class="site_input o-validator-item" name="app_url" type="text" data-origin-app-url="{{$zhida_info.app_url|escape:'htmlall'}}" data-origin-app-url-status="{{$zhida_info.app_url_status}}" data-app-url-status="{{$zhida_info.app_url_status}}" data-create-type="{{if $zhida_info.create_type}}{{$zhida_info.create_type}}{{else}}1{{/if}}" data-validator-rules="required website checkAppOwnership" {{if $zhida_info.status neq 1 || $zhida_info.app_url_status eq 1}}style="display:none"{{/if}} />
                <button id="verify_ownership_btn" class="btn-30 btn-white" {{if $zhida_info.status neq 1 || $zhida_info.app_url_status eq 1}}style="display:none"{{/if}}>验证所有权</button>
                <a id="verify_read_link" target="_blank" class="verify_read_link verify_read" href="http://zhida.baidu.com/zhidahao/wiki/index.php?title=docs/direct/directguide#.E6.89.80.E6.9C.89.E6.9D.83.E9.AA.8C.E8.AF.81.E6.96.B9.E6.B3.95" {{if $zhida_info.status neq 1 || $zhida_info.app_url_status eq 1}}style="display:none"{{/if}}>验证必看</a>
                <span id="app_url_text" class="site_text" {{if $zhida_info.status eq 1 && $zhida_info.app_url_status neq 1}}style="display:none"{{/if}}>{{$zhida_info.app_url|escape:'htmlall'}}</span>
                <div id="ownership_verify_success" class="form-row-tip valid" {{if $zhida_info.status gt 1 || $zhida_info.app_url_status neq 1}}style="display:none"{{/if}}>
                    <span class="icon okay"></span>
                    <span>验证成功</span>
                </div>
                <!--div id="ownership_verify_fail" class="form-row-tip invalid" {{if $zhida_info.status gt 1 || $zhida_info.app_url_status neq 2}}style="display:none"{{/if}}>
                    <span class="icon error"></span>
                    <span>验证失败</span>
                </div-->
                <div class="o-validator-tip"></div>
                <p id="site_notice_1" class="site-notice" {{if $zhida_info.create_type neq 1}}style="display:none"{{/if}}>
                    <a target="_blank" href="http://zhida.baidu.com/zhidahao/wiki/index.php?title=docs/direct/transaction">接入直达号订单</a>
                    <span>，获得更多推广渠道权限。</span>
                </p>
                <p id="site_notice_2" class="site-notice" {{if $zhida_info.app_url_status neq 1 || $zhida_info.create_type eq 1}}style="display:none"{{/if}}>
                    <!--a href="http://builder.baidu.com/app/config/{{$zhida_info.sid}}">完善店铺／站点</a-->
                    <a target="_self" href="http://cq01-lapp07.epc.baidu.com:8241/solution?sid={{$zhida_info.sid}}">完善店铺／站点</a>
                    <span>，至少发布两个商品才能通过审核。</span>
                </p>
                <p id="site_notice_3" class="site-notice edit-only" >
                    <a target="_blank" href="http://zhida.baidu.com/zhidahao/wiki/index.php?title=docs/direct/mobilesite">查看直达站点审核标准</a>
                    <span>，以提高审核通过率。</span>
                </p>
                <p id="site_notice_4" class="site-notice edit-only">
                    <a id="change_site_url" href="javascript:void(0)">更换站点地址</a>
                    <span>，可提交自建的新移动店铺／站点地址。</span>
                </p>
            </div>
        </div>
        <div class="form-row clearfix">
            <div class="form-label align-top">
                <label>
                    <span class="required">*</span>
                    行业资质：
                </label>
            </div>
            <div class="form-control">
                <div class="o-webuploader o-validator-item" name="uploader" data-validator-rules="inUploading checkCredentials">
                    {{if $zhida_info.ind_qua_info}}
                    {{foreach $zhida_info.ind_qua_info as $url}}
                        <div class="o-thumbnail o-thumbnail-view" data-order="{{$url@index}}">
                            <img src="{{$url}}">
                            <div class="o-remove" style="display: none;"></div>
                            <div class="o-hover">
                                <span><div class="view-origin" title="放大查看"></div></span><span><div class="re-upload" title="重传"></div></span>
                            </div>
                        </div>
                    {{/foreach}}
                    {{/if}}
                    <div class="o-filepicker edit-only inline-block">
                        <div class="up-icon"></div>
                        <div class="up-text">上传文件</div>
                    </div>
                </div>
                <div class="o-validator-tip"></div>
                <p class="upload-notice edit-only">
                    请上传文件的原件照片或彩色扫描件，格式要求jpg，jpeg，png，文件大小不超过10M，最多20张
                </p>
                <p class="industry-notice edit-only">
                    如果您的店铺／站点涉及以下行业，请务必上传行业资质文件，否则审核不通过！涉及多个行业，请一并上传！
                </p>
                <div class="industry-list-wrapper edit-only">
                    <table class="industry-list-table">
                        <thead>
                            <th width="200">行业名称</th>
                            <th>行业资质</th>
                        </thead>
                    </table>
                    <div class="industry-list-scroll">
                        <table class="industry-list-table no-top-border">
                            <tbody>
                                <tr>
                                    <td width="200">食品销售类</td><td>《食品流通许可证》</td>
                                </tr>
                                <tr>
                                    <td>数码产品</td><td><a target="_blank" href="http://apps.bdimg.com/developer/static/docs/commitment_letter.docx">《数码、电影、视频类接入承诺函》</a></td>
                                </tr>
                                <tr>
                                    <td>线下药店类</td><td>《药品经营许可证》和《药品经营质量管理规范》</td>
                                </tr>
                                <tr>
                                    <td>药品销售类</td><td>《互联网药品交易许可证》</td>
                                </tr>
                                <tr>
                                    <td>保健品</td><td>保健品批准证书或注册批件</td>
                                </tr>
                                <tr>
                                    <td>医疗机构</td><td>《医疗机构执业许可证》</td>
                                </tr>
                                <tr>
                                    <td>整形美容</td><td>《医疗机构执业许可证》</td>
                                </tr>
                                <tr>
                                    <td>法律服务</td><td>个人类：个人律师执业资格证书和律师事务所执业证书；公司类：律师事务所执业证书</td>
                                </tr>
                                <tr>
                                    <td>机票代理销售</td><td>中国航协颁发的《资格认可证书》</td>
                                </tr>
                                <tr>
                                    <td>贵金属交易平台</td><td>贵金属交易所（中心）会员查询截图并加盖公章（截图上应保留浏览器整体框架及地址栏贵金属交易所（中心）网址）</td>
                                </tr>
                                <tr>
                                    <td>医疗器械及相关器械</td><td>《医疗器械生产许可》或《医疗器械经营许可》</td>
                                </tr>
                                <tr>
                                    <td>银行</td><td>《金融机构许可证》</td>
                                </tr>
                                <tr>
                                    <td>食品及食品添加剂生产</td><td>《全国工业产品生产许可证》</td>
                                </tr>
                                <tr>
                                    <td>药品生产类</td><td>《药品生产许可证》</td>
                                </tr>
                                <tr>
                                    <td>股票类</td><td>《经营股票承销业务资格证书》</td>
                                </tr>
                                <tr>
                                    <td>基金类</td><td>《基金代销业务资格证或基金管理资格证书》</td>
                                </tr>
                                <tr>
                                    <td>期货类</td><td>《期货经营许可证》</td>
                                </tr>
                                <tr>
                                    <td>证劵投资类</td><td>《证券投资咨询业务资格证书或经营证券业务许可证》</td>
                                </tr>
                                <tr>
                                    <td>医药研究、药品研发</td><td>《药品生产许可证》和临床实验的证明文件</td>
                                </tr>
                                <tr>
                                    <td>开锁类</td><td>特种行业许可证（许可证经营范围注明为开锁或开锁服务）或开锁服务许可证或开锁服务卡或公安局备案证明</td>
                                </tr>
                                <tr>
                                    <td>外汇类</td><td>《经营外汇业务许可证》</td>
                                </tr>
                                <tr>
                                    <td>航空公司类</td><td>《公共航空运输企业经营许可证》或《中国民用航空局颁发的经营许可》</td>
                                </tr>
                                <tr>
                                    <td>计划生育服务（涉及医疗机构）</td><td>计划生育技术服务机构执业许可证</td>
                                </tr>
                                <tr>
                                    <td>戒毒机构</td><td>医疗机构执业许可证（项目登记中必须包含戒毒服务）</td>
                                </tr>
                                <tr>
                                    <td>第三方支付平台</td><td>《支付业务许可证》</td>
                                </tr>
                                <tr>
                                    <td>司法鉴定</td><td>省级以上司法行政部门颁发的《司法鉴定许可证》</td>
                                </tr>
                                <tr>
                                    <td>公证类</td><td>《公证机构执业证》</td>
                                </tr>
                                <tr>
                                    <td>假肢及假肢矫形器生产装配类</td><td>假肢和矫形器（辅助器具）生产装配企业资格认定书</td>
                                </tr>
                                <tr>
                                    <td>其他宗教类</td><td>推广许可证和备案证明</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {{if $zhida_info.ind_qua_info|count eq 0}}
            <p class="no-qualification-notice read-only">我的店铺/站点不涉及特殊行业</p>
            {{/if}}
            <div id="no_need_qualification" class="no-need-qualification edit-only">
                <div class="o-checkbox">
                    <input id="no_need_qualification_checkbox" name="no-need-qualification" type="checkbox" {{if $zhida_info.ind_qua_info|count eq 0}}checked="checked"{{/if}}/>
                    <label for="no_need_qualification_checkbox" class="confirmation-text">
                        我的移动店铺／站点不涉及以上行业
                    </label>
                </div>
                <div class="o-validator-tip"></div>
            </div>
        </div>
        <div id="edit_btn_group" class="form-controls edit-only clearfix">
            <button id="submit_btn" class="btn-38 btn-blue {{if $zhida_info.qua_status lt 4 || $zhida_info.qua_status eq 6 || $zhida_info.qua_status gte 8}}btn-disabled{{/if}}">提交</button>
            {{* 只有在未提交的时候才可以暂存 *}}
            {{if $zhida_info.status eq 1}}
            <button id="save_btn" class="btn-38 btn-gray">保存</button>
            {{/if}}
            <button id="cancel_btn" class="btn-38 btn-gray">取消</button>
        </div>
        {{if $zhida_info.status eq 1}}
        <p class="commit-notice edit-only">
        {{if $zhida_info.qua_status lt 4}}
        直达号还未上线，无法提交，请先保存，待直达号上线后再提交。
        {{else if $zhida_info.qua_status eq 6}}
        直达号审核中，无法提交，请先保存，待直达号审核结束再提交
        {{/if}}
        </p>
        {{/if}}
    </div>
</section>

<div id="verify_ownership_popup" class="o-popup">
    <div class="o-popup-mask"></div>
    <div class="o-popup-box">
        <div class="o-popup-title">
            <i class="o-popup-close icon close"></i>
            <h1>所有权验证</h1>
        </div>
        <div class="o-popup-body">
            <div class="page-warning">验证您提交的移动站点属于贵公司，有助于我们保障贵公司的合法权益</div>
            <p class="verify_method">验证方法</p>
            <p class="verify_notice">
                请将以下验证代码复制给您移动站点的技术人员，由技术人员添加该代码到移动站点首页的&lt;head&gt;与&lt;/head&gt;标签之间
            </p>
            <ul class="tabs clearfix">
                <li class="on" value="http">http站点</li>
                <li value="https">https站点</li>
            </ul>
            <textarea id="code_text" class="code" readonly="readonly"><script type="text/javascript" name="baidu-tc-cerfication" data-appid="{{$app_id}}" src="http://apps.bdimg.com/cloudaapi/lightapp.js"></script></textarea>
            <button id="copy_code_btn" class="copy-verify-code-btn btn-24 btn-white" data-clipboard-target="code_text">复制验证代码</button>
        </div>
        <div class="o-popup-btn-group">
            <button class="confirm-btn btn-38 btn-blue">提交验证</button><button class="cancel-btn btn-38 btn-gray">我知道了</button>
        </div>
    </div>
</div>

<div id="disable_site_popup" class="o-popup">
    <div class="o-popup-mask"></div>
    <div class="o-popup-box">
        <div class="o-popup-title">
            <i class="o-popup-close icon close"></i>
            <h1>下线</h1>           
        </div>
        <div class="o-popup-body">
            <div class="warning-block">
                <h3>您是否确认下线直达站点？</h3>
                <p>直达站点下线后将无法通过@直达号名称搜索到，请您确认是否下线直达站点。</p>
            </div>
            <div class="page-warning error" style="display:none">
                <span class="icon exclamation"></span>
                <span class="warning-text"></span>
            </div>
            <section class="titled-section no-border">
                <div class="section-content">
                    <div class="form-row clearfix">
                        <div class="form-label">
                            <label for="disabled_reason">
                                <span class="required">*</span>
                                下线原因：
                            </label>
                        </div>
                        <div class="form-control">
                            <textarea id="disabled_reason" name="disable-reason" class="disabled-reason o-validator-item" data-display-name="下线原因" data-validator-rules="required maxlength(512)"></textarea>
                            <div class="o-validator-tip"></div>
                        </div>
                    </div>
                    <div class="form-row clearfix">
                        <div class="form-label">
                            <label for="validate_code">
                                <span class="required">*</span>
                                验证码：
                            </label>
                        </div>
                        <div class="form-control">
                            <input id="validate_code_text" name="validate-code" data-display-name="验证码" class="o-validator-item" type="text" data-validator-rules="required match(^[0-9a-zA-Z]{4}$)" /><img class="validate-code" height="30" width="100" /><a id="change_validate_code" class="change-validate-code" href="javascript:void(0)">换一换</a>
                            <div class="o-validator-tip"></div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
        <div class="o-popup-btn-group">
            <button class="confirm-btn btn-38 btn-blue">确认下线</button><button class="cancel-btn btn-38 btn-gray">取消</button>
        </div>
    </div>
</div>
<div class="o-popup o-error-popup">
    <div class="o-popup-mask"></div>
    <div class="o-popup-box">
        <div class="o-popup-body">
            <i class="o-popup-close">╳</i>
            <h4 class="error-msg">啊哦...我好像出错了！</h4>
            <b>我们重新再试试吧</b>
        </div>
        <div class="o-popup-btn-group">
            <button class="cancel-btn btn-38 btn-blue">我知道了</button>
        </div>
    </div>
</div>
<script>
var GlobalInfo = {
    'app_id': '{{$app_id}}',
    'bdstoken': '{{$bdstoken}}',
    'qua_status': {{$zhida_info.qua_status}}
};
</script>
<script src="js@base"></script>
<script src="js@base:uploader"></script>
<script src="js@base:clipboard"></script>
<script src="js@merchant:zhida:site"></script>
{{/block}}