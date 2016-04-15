<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
    <title>soi example</title>
    <link type="text/css" rel="stylesheet" href="/static/css/sdoRqQoB5.css" />
</head>
<body>
    <header></header>
    <p>input a random string:</p>
    <input id="pid" placeholder="random string" maxlength="30"/>
    <button>get reverse</button>
    <div>your result:</div>
    <div class="ret"></div>
    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAZCAMAAADwgHt5AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDIxIDc5LjE1NTc3MiwgMjAxNC8wMS8xMy0xOTo0NDowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTQgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjU4RTA0MDJERTcxQjExRTQ4RUU1RDFFNzc2RkI0OEQ0IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjU4RTA0MDJFRTcxQjExRTQ4RUU1RDFFNzc2RkI0OEQ0Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NThFMDQwMkJFNzFCMTFFNDhFRTVEMUU3NzZGQjQ4RDQiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NThFMDQwMkNFNzFCMTFFNDhFRTVEMUU3NzZGQjQ4RDQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4WSmSCAAABklBMVEVNctsmJib///+wsLB3d3d8fHx9fX39/f2CnObU1NTd3d1WVlaysrL5+v60xPArKyvDw8OxsbHc3Nzy9fzr6+vu7u4xMTGLi4vBwcFRddxsiuE6Ojp1dXXz9v0zMzPx8fHJycmrvO5Xet2RkZGNjY3j4+P8/PxSUlKioqJYe937+/u8vLw/Pz/Y2Ng8PDz7/P7+/v9Oc9tig9+Kiophgt+qvO6rve7i4uK1xPClpaXp7fqDneb9/f/5+/5hgd9Qddxyj+LCwsLm6/o9PT34+f5DQ0Nsi+GTqemWlpZFRUVERETFxcXr8Ps+Pj5cXFxggd+hteywwe+WrOqVlZXZ4feXl5d/muVPdNtUeNy/zfJfgN/h4eEvLy9piOGkpKSmuO3s7Oyzs7NWed1ISEiYreqNpOiuv++Opeisve52dnaSkpLE0POKoufHx8eTk5Po7fqGn+aar+toh+B4eHh+meV3k+NVed1HR0f19/3Q2vbGxsbw8/xafN65yPEqKip5eXnu8ftafd6csOvv7+97luT///844fOOAAAAhnRSTlP/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////ANmZWh0AAAJPSURBVHjavJbnV+JAEMB31yQkQiD0IqIICAJKVcDz1LP367333nv12v7ft5tCgu9IfAadD7uz82F+b3bKLsBHIMCug8EmX41+uM43Bw8Ncjw5BlQZmxR7AHnOrXs869wXg2k6BgwSm7YL6d+BReZs6nER7vRrtq1Z0CGzW/Ygw6Ftl4MqDtd2aFi9q3mwR+ZFc0j4hGkciWxQ04PZhBLLVAfg4qMHACTNITfYPyYQ50QACxmqNQQcmHBSzT9iZFS+o58AjPhNIUNcrjtjE3qxAGEfxn0QCtgFN4nR3RHIabT0nmxu85xEmPGuEHbAgRuQUAgDZrBjgCXGY0bGTVR6R3feHDKaDueV7LSGtOhaYUXZeIvlIKiQcDCzQZY6cXlBZfxGM69kpW5RXT6mIO8Sy0VGKTXCsWo1eNawRqEMvOYhSxQAf/m+7Hq1XH6o0KJWJfyEU8snx6R92JdmclpFhVJtiJdqKQq5A8AZVPpLPD+bQffA/iBaJETGa8wLpqbn6GNcvy5KiS+T5Q3xOYU+rQC+hE5pualb5aSWbx/yBa6gn3CcJP4qvSsvWRok8XE18ZXL6OvqEtI7hj94dUnQpZawVylhSSvh6GeEUFOvMvfB+8TQjBkB3zI246Vz6GmlzbBoxhYbNB8rAU0PZBM+WUnKfr+9/qUHYjFWwhGLAbmoDsjbi9qAFFf2DsiYaHPUO2Fx93yKKUJne9QvXOlknFyw/WhJ7PKPa3dZyWB62eNH6/8iTvb4+e3ykXDz1bm5Ku8+vI/EEX2J9iP/BBgAXSvnMa7dvGIAAAAASUVORK5CYII=" />
    <script>
        var apidomain = '__APIDOMAIN__';
    </script>
    <script type="text/javascript" src="/static/js/f4Wf4ti6N.js"></script>
</body>
</html>