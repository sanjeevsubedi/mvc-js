 (function ($) {
	 var survey = null;
     $.widget("ui.docs", $.ui.mainController, {
         //defaul options
         options: {
             model: null //model needed by this controller/view
         },
         //constructor
         _create: function () {
             // Your code before calling the overridden method.
             $.ui.mainController.prototype._create.call(this);
         },

         //called when widget is called with no parameter of only options after widget is created
         _init: function () {
             $.ui.mainController.prototype._init.call(this);
             masterPageController.hideNextBtn(true);
             masterPageController.hideBackBtn(true);
             masterPageController.hideComment(true);
             $(".micro-tabs li").removeClass("micro-tab-active");
             $("#doc-tab").addClass("micro-tab-active");
             $("#btnNext").removeClass("con");
             $(".comment-beside-save").css("display","none");
         },
         _resourceClicked: function (sender, e) {
             e.preventDefault();
             var path = localStorage[baseServerPath + $(sender).attr("href")];
             var resource = $(sender).parent().data("context");
             var target = "_blank";
             if (device.platform.toLowerCase() == "android") {
            	 target = "_system";
             }
             
             var docName = $(sender).attr("data-offline");
             var surveyId = ciscoGlobalData.curSurveyId;//ciscoGlobalData.queryStrings["surveyId"];
             filesystemHelper.getFile("Cisco/surveys/survey_"+surveyId+"/resources/"+docName, function (file) {
                                      if (file != null && file.getFileLength()>0) {
                                      window.open(encodeURI(appFolderPath+file.getFullPath()), target, 'location=no');
                                      }
                                      }, false);
             
             },
         
         //override
         onNext: function (arg) {
        	 var me = this;
        	 me.navigateTo("miniSettings", me.options.model);
         },
         
         onPrev: function (arg) {
        	 this.goBack();
         },

     });
 })(jQuery);