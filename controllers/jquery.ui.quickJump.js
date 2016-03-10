var quickJumpController = null;

(function ($) {
	  var fileName = "";
	  var savedImageName = "";
	  var imageFullPath = "";

  $.widget("ui.quickJump", $.ui.mainController, {
           //defaul options
           options: {
           model: null, //model needed by this controller/view
           pushInHistoryStack: false
           },
           //constructor
           _create: function () {
           // Your code before calling the overridden method.
           $.ui.mainController.prototype._create.call(this);
           var me = this;
           survey = masterPageController._survey;
           quickJumpController = this;
           
           },
           //called when widget is called with no parameter of only options after widget is created
           _init: function () {
           $.ui.mainController.prototype._init.call(this);
           },

           /*_deleteHistory: function(){

                  $(".bulkdel:checked").each(function(){
                    var id = $(this).attr('id');
                    console.log(id);
                    var query = "DELETE FROM RESPONSE WHERE id=?";
                    var params = [id];

                    databaseHelper.execQuery(query, params, function (result, err) {
                        console.log(result);

                    })

                  })


           },*/


           _goToContacts: function () {
        	   var trigger = $('#comment-trigger');
           	trigger.click();
        	   this.navigateTo('contact', this.options.model);
           },
           _goToQuestions: function () {
        	   var trigger = $('#comment-trigger');
           	trigger.click();
               var cform = $(".con");
        	   var sourceTab = $(".micro-tab-active").attr("id");
        	   
               if(cform.length && sourceTab == "contact-tab") {
            	   cform.click();
               } else {
            	   this.navigateTo('allquestions', this.options.model);
               }
              /* 
               var me = this;
               var jsonObj = "{";
               var temp = '"#name": "#value"';
               var frm = $("#entryForm");z
               if (frm.valid()) {
               $("input:not(:checkbox, :radio), select, input:checked, .phonePrefix", frm).each(function (i) {
                                                                                                var input = $(this);
                                                                                                var name = input.attr("name");
                                                                                                var val = "";
                                                                                                if (name && name != "") {
                                                                                                val = input.val();
                                                                                                } else {
                                                                                                name = input.attr("id");
                                                                                                val = input.text();
                                                                                                }
                                                                                                if (i > 0) {
                                                                                                jsonObj += ",\n\t";
                                                                                                }
                                                                                                jsonObj += temp.replace("#name", name).replace("#value", val);
                                                                                                
                                                                                                if (name == me._emailFieldName) {
                                                                                                jsonObj += ",\n\t";
                                                                                                jsonObj += temp.replace("#name", "email").replace("#value", val);
                                                                                                
                                                                                                }
                                                                                                
                                                                                                //contactInfo[name] = val;
                                                                                                });
               
               for (var fk in this.options.model.contactFields) {
               var field = this.options.model.contactFields[fk];
               var val = "";
               
               if (field.validationRule == "country") {
               var c = $("#" + "cf_" + field.id + "name", frm).val();
               var cc = $("#" + "cf_" + field.id + "iso", frm).val();
               val = c + "(" + cc + ")";
               jsonObj += ",\n\t" + temp.replace("#name", "cf_" + field.id).replace("#value", val);
               } else if (field.validationRule == "salesperson") {
               var c = $("#" + "cf_" + field.id + "name", frm).val();
               val = c;
               jsonObj += ",\n\t" + temp.replace("#name", "cf_" + field.id).replace("#value", val);
               } else if (field.validationRule == "telephone") {
               var pc = $("#" + "cf_" + field.id + "Code", frm).val();
               var pp = $("#" + "cf_" + field.id + "Prefix", frm).val();
               var pn = $("#" + "cf_" + field.id + "No", frm).val();
               val = pc + pp + pn;
               jsonObj += ",\n\t" + temp.replace("#name", "cf_" + field.id).replace("#value", val);
               }
               
               
               }
               
               jsonObj += "}";
               this.options.model.contactInfo = eval("(" + jsonObj + ")");
               this.options.model.contactInfo.imageName = savedImageName;
               this.navigateTo('allquestions', this.options.model);
               } else {
            	   alert("Please fill all the required contact form fields");
               }*/
        	   
           },
           _goToDocs: function () {
        	   var contactInfo = this.options.model.contactInfo;
        	   var sourceTab = $(".micro-tab-active").attr("id");
        	   if(sourceTab == "contact-tab") {
        		   this._saveContactInfo();
        	   }   
        	   var trigger = $('#comment-trigger');
           		trigger.click();
        	   this.navigateTo('docs', this.options.model);
           },
           _goToSettings: function () {
        	  /* var trigger = $('#comment-trigger');
              	trigger.click();
        	   var contactInfo = this.options.model.contactInfo;
        	   var sourceTab = $(".micro-tab-active").attr("id");
        	   if(sourceTab == "contact-tab") {
        		   delete ciscoGlobalData.contactCollection;
        		   this._saveContactInfo();
        	   }   

        	   this.navigateTo('contactcollection', this.options.model);*/
        	   
               
        	   var me  = this;
               var msg = langMgr.getTranslation("GoToSettings");
               var labels = 'OK,'+langMgr.getTranslation("Cancel");
               navigator.notification.confirm(msg,
                                              function(buttonIndex) {
                                              if (buttonIndex == 1) {
                                              //window.location = "index.html?surveyId=" + ciscoGlobalData.curSurveyId;
                                            	  me._renew();
                                            	  /*loadingWidget.show();
                                              
                                              survey.questions = [];
                                              
                                              delete survey.contactInfo;
                                              delete survey.commentInfo;
                                              delete survey.cameraInfo;
                                              $("#commentForm textarea").html("");
                                              delete ciscoGlobalData.contactCollection; //remove old contact data
                                              //window.location = "index.html?surveyId=" + ciscoGlobalData.curSurveyId;
                                              //me.navigateTo("thankYou", me.options.model);
                                              var surveyObj = new Survey();
                                              databaseHelper.execQuery("SELECT * FROM SURVEYSDOWNLOADED WHERE surveyId=?", [ciscoGlobalData.curSurveyId], function (results, err) {
                                                                       if (results && results.rows.length > 0) {
                                                                       var row = results.rows.item(0);
                                                                       surveyObj.loadXML($.proxy(me.onRestart, me), row.filePath);
                                                                       loadingWidget.hide();
                                                                       }
                                                                       });*/
                                              
                                              
                                              }
                                              
                                              }, ciscoGlobalData.appName,labels);
        	   
        	   
           },
           
           _renew: function () {
         	    
         	   var me  = this;
         	     //window.location = "index.html?surveyId=" + ciscoGlobalData.curSurveyId;
               loadingWidget.show();
               
               survey.questions = [];
               
               delete survey.contactInfo;
               delete survey.commentInfo;
               delete survey.cameraInfo;
               $("#commentForm textarea").html("");
               delete ciscoGlobalData.contactCollection; //remove old contact data
               //window.location = "index.html?surveyId=" + ciscoGlobalData.curSurveyId;
               //me.navigateTo("thankYou", me.options.model);
               collectionController._setGuidContent('');
               collectionController._setBarCodeContent('');
               $("#entryForm input[name='guid-eventmonitor']").remove();
               
               var surveyObj = new Survey();
               databaseHelper.execQuery("SELECT * FROM SURVEYSDOWNLOADED WHERE surveyId=?", [ciscoGlobalData.curSurveyId], function (results, err) {
                                        if (results && results.rows.length > 0) {
                                        var row = results.rows.item(0);
                                        surveyObj.loadXML($.proxy(me.onRestart, me), row.filePath);
                                        loadingWidget.hide();
                                        }
                                        });
         	   
         	   
            },
           
           onRestart: function(survey) {
               var me = this;
               masterPageController.setSurvey(survey);
               ciscoGlobalData.curSurveyId = survey.id;
               $(".micro-tabs").quickJump({
                                          model: survey
                                          });
               
               $(".comments").comment({
                                      model: survey
                                      });
               me.navigateTo("contactcollection", survey);
               masterPageController.hideNextBtn(false);
               loadingWidget.hide();
               },
           
           _saveContactInfo: function () {
               var me = this;
               var jsonObj = "{";
               var temp = '"#name": "#value"';
               var frm = $("#entryForm");
               var contactInfo = me.options.model.contactInfo;
               
               $("input:not(:checkbox, :radio), select, input:checked, .phonePrefix", frm).each(function (i) {
                                                                                                var input = $(this);
                                                                                                var name = input.attr("name");
                                                                                                var val = "";
                                                                                                if (name && name != "") {
                                                                                                val = input.val();
                                                                                                val = me._escape(val);
                                                                                                } else {
                                                                                                name = input.attr("id");
                                                                                                val = input.text();
                                                                                                val = me._escape(val);
                                                                                                }
                                                                                                if (i > 0) {
                                                                                                jsonObj += ",\n\t";
                                                                                                }
                                                                                                
                                                                                                jsonObj += temp.replace("#name", name).replace("#value", val);
                                                                                                
                                                                                                if(contactInfo) {
                                                                                                	contactInfo[name]=val;
                                                                                                }
                                                                                                
                                                                                                if (name == me._emailFieldName) {
                                                                                                jsonObj += ",\n\t";
                                                                                                jsonObj += temp.replace("#name", "email").replace("#value", val);
                                                                                               
	                                                                                                if(contactInfo) {
	                                                                                                	contactInfo["email"]=val;
	                                                                                                }
                                                                                               
                                                                                                }
                                                                                                
                                                                                                //contactInfo[name] = val;
                                                                                                });
               
               for (var fk in this.options.model.contactFields) {
               var field = this.options.model.contactFields[fk];
               var val = "";
               
               if (field.validationRule == "country") {
               var c = $("#" + "cf_" + field.id + "name", frm).val();
               var cc = $("#" + "cf_" + field.id + "iso", frm).val();
               val = c + "(" + cc + ")";
               jsonObj += ",\n\t" + temp.replace("#name", "cf_" + field.id).replace("#value", val);
               
	               if(contactInfo) {
	               	contactInfo["cf_" + field.id]=val;
	               }
               
               } else if (field.validationRule == "salesperson") {
               var c = $("#" + "cf_" + field.id + "name", frm).val();
               val = c;
               jsonObj += ",\n\t" + temp.replace("#name", "cf_" + field.id).replace("#value", val);
               
               if(contactInfo) {
	               	contactInfo["cf_" + field.id]=val;
	               }
               
               
               } else if (field.validationRule == "telephone") {
               var pc = $("#" + "cf_" + field.id + "Code", frm).val();
               var pp = $("#" + "cf_" + field.id + "Prefix", frm).val();
               var pn = $("#" + "cf_" + field.id + "No", frm).val();
               val = pc + pp + pn;
               jsonObj += ",\n\t" + temp.replace("#name", "cf_" + field.id).replace("#value", val);
               if(contactInfo) {
	               	contactInfo["cf_" + field.id]=val;
	               }
               }
               }
               
               jsonObj += "}";
               if(!contactInfo) {
            	   if(this.options.model.cameraInfo) { 
	    	           savedImageName = this.options.model.cameraInfo.imageName;
	    	           imageFullPath = this.options.model.cameraInfo.imgPath;
            	   }
            	   this.options.model.newcontactInfo = eval("(" + jsonObj + ")");
            	   this.options.model.newcontactInfo.imageName = savedImageName;
                   this.options.model.newcontactInfo.imageFullPath = imageFullPath;
           		}
               if(contactInfo && this.options.model.cameraInfo) {
            	   savedImageName = this.options.model.cameraInfo.imageName;
    	           imageFullPath = this.options.model.cameraInfo.imgPath;
            	   this.options.model.contactInfo.imageName = savedImageName;
                   this.options.model.contactInfo.imageFullPath = imageFullPath;
               }
               //console.log(JSON.stringify(this.options.model.newcontactInfo));
               //console.log(JSON.stringify(this.options.model.contactInfo));
  
           },
           //destructor
           destroy: function () {
           $.Widget.prototype.destroy.call(this);
           }
           
           
           });
  })(jQuery);