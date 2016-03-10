var masterPageController = null;
(function ($) {
    $.widget("cisco.comment", $.ui.mainController, {
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
            var me = this;

            var commentValid = true;

            $(".okBtn", this.element).bind("click.cisco", function(e){
                e.preventDefault();
                var saveBtn =   $("#nextbackholder #btnNext");//$(".comment-beside-save");
                var saveWidth = "49.5%";
                var commentContainer = $("#comment-container");
                commentContainer.css({"width":saveWidth});
            	saveBtn.css('display','block');
                
                if(commentValid){
                    var jsonObj = "{";
                    var temp = '"#name": "#value"';
                    $("input, textarea, select", me.element).each(function (i) {
                        var input = $(this);
                        var name = input.attr("name");
                        var val = input.val();
                        if (input.attr("type") && input.attr("type").toLowerCase() == "checkbox") {
                            val = input.get(0).checked;
                        }
                        
                        //val = typeof(val)=="string" ? val.replace(/\r?\n/g,'<br/>') : val;
                        val = typeof(val)=="string" ? me._escape(val) : val;
                        
                        
                        if(i>0){
                            jsonObj += ",\n\t";
                        }
                        jsonObj += temp.replace("#name", name).replace("#value", val);
                        //commentInfo[name] = val;
                    });
                    jsonObj += "}";
                    me.options.model.commentInfo = eval("(" + jsonObj + ")");
                    
                    //$("a.rightPanel", me.element).click();
                    if(!e.isTrigger) {
                    	var trigger = $('#comment-trigger');
                    	trigger.click();
                	}
                }
                else{
                    
                }
               
            });

            this._loadCommentInfo();

            Custom.init(this.element);
        },
        _loadCommentInfo: function () {
            var cmtInfo = this.options.model.commentInfo;
            var frm = $("form#commentForm", this.element);
            if (cmtInfo) {
                for (var key in cmtInfo) {
                    var el = $("[name='" + key + "']", frm);
                    var val = cmtInfo[key];
                    if (el.attr("type") && el.attr("type").toLowerCase() == "checkbox") {
                        el.get(0).checked = (val == "true")
                    }
                    else {
                        el.val(val);
                    }
                }
            }
        },
        //destructor
        destroy: function () {
            $.Widget.prototype.destroy.call(this);
        },
        _survey: null,

    });
})(jQuery);