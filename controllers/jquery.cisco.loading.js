(function ($) {
    $.widget("cisco.loading", $.ui.mainController, {
        //defaul options
        options: {
            model: null //model needed by this controller/view            
        },
        //constructor
        _create: function () {
            $.ui.mainController.prototype._create.call(this);            
        },
        //called when widget is called with no parameter of only options after widget is created 
        _init: function () {
            $.ui.mainController.prototype._init.call(this);
        },
        //destructor
        destroy: function () {
            $.Widget.prototype.destroy.call(this);
        },
        show: function (tid, params) {
            var msg = "";
            if (tid) { msg = langMgr.getTranslation(tid, params); }
            this.showText(msg);
        },
        showText: function (msg) {
            $(".progress", this.element).html(msg);
            this.element.show();
        },
        hide: function(){
        	this.element.hide();
        },
        _msgContainer: null
    });
})(jQuery);