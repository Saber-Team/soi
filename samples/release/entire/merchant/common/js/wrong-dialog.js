define([
    '../../../xcom/dialog/dialog'
],function(Dialog) {
    	function wrongDialog(content){
            var failDialog = new Dialog({
                width: "360px",
                height: "160px",
                title: "提示",
                content: '<div class="wrong-content">'+content+'</div>',
                button: [{
                    theme: 'blue',
                    text: '确定',
                    callback: function(failialog){
                        failDialog.close();
                    }
                }]
            }).init();
        }

        return {
            wrongDialog: wrongDialog
        };
});