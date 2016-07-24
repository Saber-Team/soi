{{extends file="layout.tpl"}}
{{block name=main-content}}

<header>Test pages</header>
<p>input a random string:</p>
<input id="pid" placeholder="random string" maxlength="30"/>
<button>get reverse</button>
<div>your result:</div>
<div class="ret"></div>
<img src="/static/img/index.png" />

{{include file="part.tpl"}}

<script>
    var apidomain = '__APIDOMAIN__';
</script>
<script type="text/javascript" src="/static/js/sync-require.js"></script>
{{brisk_require_js name="app" }}