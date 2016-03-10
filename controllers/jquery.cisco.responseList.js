(function ($) {
    $.widget("cisco.responseList", $.ui.mainController, {
        //defaul options
        options: {
            model: null //model needed by this controller/view            
        },
        //constructor
        _create: function () {
            $.ui.mainController.prototype._create.call(this);
            survey = masterPageController._survey;

        },
        //called when widget is called with no parameter of only options after widget is created 
        _init: function () {
            $.ui.mainController.prototype._init.call(this);
            //masterPageController.hideNextBtn(true);
            masterPageController.hideBackBtn(false);


                $(".bulkdel").click(function(event) {
                                   
                    if($(this).is(":checked")){

                        if(!$(".additional-options").is(":visible")){
                             $(".additional-options").slideDown();
                        }
                              
                        //var delId = $(this).attr("id");

                        $(this).parent('li').addClass("bulkdel-highlight");
                        $(this).attr('checked', 'checked');

                    } else {


                        if($(".bulkdel:checked").length == 0) {
                           //if($(".additional-options").is(":visible")){
                                 $(".additional-options").slideUp();

                            //}
                        }

                        $(this).parent('li').removeClass("bulkdel-highlight");
                        $(this).removeAttr('checked');

                    }
                                  //return false;

                                /*setTimeout(function(){
                                $("#lookup-container li").removeClass("highlight_row singleclick");
                                },2000);*/

                                //var json = $(this).find('.chk-record').attr('data-record');

                })



            
            $("#view_responseList li").each(function(){
            	var img = $(this).find("img");
            	if(img) {
	            	var elem = img.attr('id');
	            	var fullPath = img.attr('data-fullpath');
	            	//alert(fullPath);
	            	if(fullPath != "") {
	            		img.parent().show();
	            		img.attr('src',fullPath);
	            		img.parent().next().show(); 
	            	} else {
	            		img.parent().next().show()
	            		img.parent().hide();
	            		img.parent().next().css({'float':'none','margin-left':'0','padding-top':'0','width':'100%'});
	            		
	            	}
            	}
            })
            $(".comment-beside-save,.moreOptions,.trash-top").css("display","none");


            /*$("#transitionHolder #view_responseList ul li .checkbox").live('click',function(){

                $(this).next().attr('')
            })*/



               Custom.init(this.element);
        },
        _responseItemClicked: function (s, e) {
            e.preventDefault();
            var item = $(s).closest("li").data("context");
            window.location = "index.html?respId=" + item.id;
        },


        _checkChangedResponse: function(s,e){

           var elem = $(s);
           console.log(elem.is(':checked'));


           if(elem.is(':checked')) {
              
                if(!$(".additional-options").is(":visible")){
                     $(".additional-options").slideDown();
                }
                      
                elem.parent('li').addClass("bulkdel-highlight");
                elem.attr('checked', 'checked');



           } else {
          
                if($(".bulkdel:checked").length == 0) {
                //if($(".additional-options").is(":visible")){
                  $(".additional-options").slideUp();

                //}
                }

                elem.parent('li').removeClass("bulkdel-highlight");
                elem.removeAttr('checked');




           }
           

            console.log(s);
        },

  //set up your sub method so that it returns a Deferred object
          _deleteHistoryAsync : function (id) {
              var token = $.Deferred();


              //var id = $(this).attr('id');
              console.log(id);
              var query = "DELETE FROM RESPONSE WHERE id=?";
              var params = [id];

              databaseHelper.execQuery(query, params, function (result, err) {
                  console.log("sa");
                  console.log(result);

                  $("#view_responseList ul li .bulkdel-"+ id).parent().remove();
                  token.resolve();

              })


              return token.promise();
          },

          _deleteHistoryAsyncComplete: function () {

            var msg = langMgr.getTranslation("ConfrimResponseDelete");
            var labels = 'OK,'+langMgr.getTranslation("Cancel");
            var me = this;
            navigator.notification.confirm(msg,
                                          function(buttonIndex) {
                                          if (buttonIndex == 1) {


                                                var chkValues = $(".bulkdel:checked").length;

                                                if(chkValues == 0) {
                                                  customAlert("ResponseDeleteRequired", "ResponseDeleteRequired");
                                                  return false;
                                                }


                                                  var tokens = [];
                                                
                                                  $(".bulkdel:checked").each(function(){

                                                      var id = $(this).attr('id');
                                                      //store all the returned tokens
                                                      tokens.push(me._deleteHistoryAsync(id));
                                                  })

                                                  $.when.apply($,tokens)
                                                      .then(function() {

                                                          var pendElem = $("#pendingResponses");
                                                          window.plugin.notification.local.cancelAll();
                                                          localStorage.removeItem('notification');

                                                          me._calculatePedingSurveys();
                                                          customAlert("ResponseDelete", "ResponseDelete");
                                                          $(".additional-options").slideUp();
                                                          //once ALL the sub operations are completed, this callback will be invoked
                                                          //alert("all async calls completed");

                                                      });

                                          
                                          }
                                          
                                          }, ciscoGlobalData.appName,labels); 


           
          },

        _getEmail: function (val, data, key) {
        	  if (val && val !== "") {
                  var splitted_val = val.split('_');
                  if(splitted_val[0]){
                     return splitted_val[0];
                  } else if(splitted_val[1] || splitted_val[2]) {
                     return splitted_val[1] + ' ' + splitted_val[2];
                  } else if(splitted_val[3]) {
                     return splitted_val[3];
                  } else {
                     return "Unknown";
                  }
                     //return val;
                 }
                 else {
                     return "Unknown";
                 }

        },
        onPrev: function (arg) {
            //this.navigateTo("miniSettings");
        	this.navigateTo("miniSettings", survey);
        },
        //destructor
        destroy: function () {
            $.Widget.prototype.destroy.call(this);
        }
    });
})(jQuery);