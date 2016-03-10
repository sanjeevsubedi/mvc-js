 (function ($) {
	 var survey = null;
     $.widget("ui.allquestions", $.ui.mainController, {
         //defaul options
         options: {
             model: null //model needed by this controller/view
         },
         //constructor
         _create: function () {
             // Your code before calling the overridden method.
             $.ui.mainController.prototype._create.call(this);
             // Your code after calling the overridden method.
             survey = masterPageController._survey;
             //console.log(survey);
         },

         //called when widget is called with no parameter of only options after widget is created
         _init: function () {
             $.ui.mainController.prototype._init.call(this);
             masterPageController.hideNextBtn(false);
             masterPageController.hideBackBtn(true);
             masterPageController.hideComment(false);
             var me = this;


             var contactInfo = survey.contactInfo;

             var contactEmail = contactInfo.email;
             var contactFirstName = contactInfo.first_name;
             var contactLasttName = contactInfo.last_name;
             var contactCompany = contactInfo.company;
             var contactCard =  contactInfo.imageName;
             var contactValue = "";

                
                $("#contactInfoStatus #info").css({'left':'10px'});

                if(contactEmail){
                    contactValue = contactEmail;
                } else if(contactFirstName || contactLasttName) {
                    contactValue = contactFirstName + ' ' + contactLasttName;
                } else if(contactCompany) {
                    contactValue = contactCompany;
                } else if(contactCard){

                    $("#contactInfoStatus #info").css({'left':'135px'});
                    var fullPath = contactInfo.imageFullPath;
                    $("#contactInfoStatus #cardPreview").attr("src", fullPath).show();
                    $("#contactInfoStatus #cardPreview").parent().attr("href", fullPath);
                    contactValue = langMgr.getTranslation("ImageUploadedIinfo");
                } else {
                    contactValue = "Unknown";
                }
                //return val;
           
                $("#contactInfoStatus #info").html("Contact: " + contactValue);

          
             
             $(".answer-save").off().on("click", function(e){
            	 me.onNext();
             })
             
     		$('ul.options li').live('click',function(i,e) {
					var sel = $(this).parent().prev().prev();
					var selId = $(this).parent().prev().prev().attr('id');
					var qid = $(this).parent().prev().prev().attr('data-question');
					var index = $(this).index();
					
					if(index > 0) {
						$('#'+selId+' option').removeAttr('selected');
						
						$('#'+selId+' option').each(function(i){
							if(i == index) {
								$(this).attr('selected','selected');
								return false;
							}
						})
						
						sel.trigger('change');  
					} else {
						var curQ = me._getQuestionById(qid);
						console.log(curQ);
						if(curQ.answers){
							console.log("has prev answers");
							delete curQ.answers;
						}
					}
			});	

             
             for (var keyQ in survey.questions) {
                 var curQ = survey.questions[keyQ];
                 var answers = curQ.answers;
             
	             if (answers) {
	            	 
	            	 if(curQ.type == "textInput") {
		                 $("input#txt" + curQ.id, this.element).val(answers[0].text);
	            	 } else if (curQ.type == "multiSelect") {
		                 for (var key in answers) {
		                     var ans = answers[key];
		                     //var chk = $("#rd" + curQ.id+"_"+ans.optionId, this.element);
		                     //chk.get(0).checked = true;
		                     
		                     var chkmulti = $("#chk" + curQ.id+"_"+ans.optionId, this.element);
		                     chkmulti.get(0).checked = true;
		                 }
		                 
	            	 } else{
		                     $("#select-custom-"+curQ.id+ " option#opt" + answers[0].optionId, this.element).get(0).selected = true;
		                 }
		                 
	            }
             }
             Custom.init(this.element);
             $(".micro-tabs li").removeClass("micro-tab-active");
             $("#question-tab").addClass("micro-tab-active");
             
             $("#btnNext").html(langMgr.getTranslation("Save"));
             $("#btnNext").removeClass("con");
             $(".comment-beside-save").css("display","block");
             $(".comment-beside-save").html(langMgr.getTranslation("Save"));
             
             //add classes for first and last record of checklist options
             $(".list-wrap .checkList:first-child").addClass("first-row");
             $(".list-wrap .checkList:last-child").addClass("last-row");

         },
         
         _getQuestionById: function (qid) {
        	 
        	  for (var keyQ in survey.questions) {
                  var curQ = survey.questions[keyQ];
                  if(curQ.id == qid) {
                	  return curQ;
                  }
        	  }    
         },
         
         _getCheckboxDisplay: function (type) {
             if (type == "multiSelect") {
                 return "block";
             }
             else {
                 return "none";
             }
         },
         
         _OptionSelectChanged: function (s,e) {
        	 
           	 var item = $(s).closest("[data-question]");
           	//var q = $(item).data("question");
           	 //console.log(q);
        	 this._setAnswerDropDown(item);
         },
         
         _getSelectDisplay: function (type) {
        	 if (type == "singleSelect" || type == "dropDown") {
                 return "block";
             }
             else {
                 return "none";
             }
        	 
         },
         
         _getTextBoxDisplay: function (type) {
        	 
             if (type == "textInput") {
            	 
                 return "block";
             }
             else {
                 return "none";
             }
         },
         
         _allowedQtypes: function (type) {
        	 if (type == "textInput" || type == "multiSelect" || type == "singleSelect" || type == "dropDown") {
                 return "block";
             }
             else {
                 return "none";
             }
         },
         
         
        /* _optionMultiClicked: function (sender, e) {
                 if (!$(e.target).is("span.checkbox")) {
                     $(":checkbox", sender).each(function () {
                         this.checked = !this.checked;
                         $(this).change();
                     });
                 }
         },*/
         
         /*_checkChanged: function (sender, e) {
             var parent = $(sender).closest("[data-bind]")
             var item = $(sender).closest("[data-item]");
             //$("input:text", item).get(0).disabled = !sender.checked;
             this._setAnswer(item);           

         },*/
         
         _checkChangedMulti: function (sender, e) {
             var item = $(sender).closest("[data-item]");
             //console.log(item);
             this._setAnswerMulti(item);

         },
         
         _textChanged: function (sender, e) {
             for (var keyQ in survey.questions) {
                 var curQ = survey.questions[keyQ];
                 var answeredQuestion = $(sender).attr("data-question");
                 if(curQ.id == answeredQuestion) {
                	 var curQuestion = survey.questions[keyQ];
                	 
                     curQuestion.answers = new Array();
                     if (sender.value != "") {
                         curQuestion.answers.push({ questionId: curQuestion.id, optionId: null, text: sender.value });
                     }
                     break;
                 }
             }
         },
        /* _setAnswer: function (item) {
             var option = item.data("context");
             //data-question
             for (var keyQ in survey.questions) {
                 var curQ = survey.questions[keyQ];
                 var answeredQuestion = $(item).data("question");
                 if(curQ.id == answeredQuestion) {
                	 var curQuestion = survey.questions[keyQ];
                	 
                	 var isChecked = $("input:radio", item).get(0).checked;

                     curQuestion.answers = new Array();
                     if (isChecked) {
                         var newAns = {
                             questionId: $(item).data("question"),//curQuestion.id, 
                             optionId: option.id, 
                         };
                         
                         curQuestion.answers.push(newAns);

                     }
                     //console.log(curQuestion);

                     break;	 
                 }
                 
             }   
             
         },*/
         
         _setAnswerMulti: function (item) {
        	 var answeredQuestion = $(item).data("question");
        	 console.log(answeredQuestion);
        	 
        	 for (var keyQ in survey.questions) {
                 var curQ = survey.questions[keyQ];
	             

                 if(curQ.id == answeredQuestion) {
                	 var option = item.data("context");
                	 
		             var curQuestion = curQ;
		             var isChecked = $("input:checkbox", item).get(0).checked;
		
		             if (!curQuestion.answers) {
		                 curQuestion.answers = new Array();
		             }
		             
		             //console.log(curQuestion.answers);
		
		             for (var i = 0; i < curQuestion.answers.length; i++) {
		                 var curAnswer = curQuestion.answers[i];
		                 if (curAnswer.optionId == option.id) {
		                     curQuestion.answers.splice(i, 1);
		                 }
		             }
		             
		             if(isChecked) {
			             var newAns = {
			                 questionId: curQuestion.id, 
			                 optionId: option.id, 
			             };
				         curQuestion.answers.push(newAns);
                 	}
		             //console.log(curQuestion)
		             break;
		         }
        	 }

             
         },
         
         _setAnswerDropDown: function (item) {
             for (var keyQ in survey.questions) {
                 var curQ = survey.questions[keyQ];
                 var answeredQuestion = $(item).data("question");
                 if(curQ.id == answeredQuestion) {
                	 var curQuestion = survey.questions[keyQ];
                	 
                	 var option = $('#select-custom-'+answeredQuestion+" option:selected").index();
                	 option = option -1;
                     //if (option) {
					     curQuestion.answers = new Array();
					 
					         var newAns = {
					             questionId: curQuestion.id, 
					             optionId: option, 
					         };
					 
					 curQuestion.answers.push(newAns);
                     //}
                     //console.log(curQuestion); 

                     break;	 
                 }
                 
             }   
             
         },

         getSurveyResponse: function () {
             var respObj = {};
             respObj.surveyId = survey.id;
             respObj.deviceId = survey.deviceId;
             respObj.userId = ciscoGlobalData.curUser.id;
             respObj.cardImageName = survey.contactInfo.imageName
             respObj.contactInfo = survey.contactInfo;
             respObj.commentInfo = survey.commentInfo;
             respObj.genDate =  Date.now() /1000 |0;
             respObj.barcode = collectionController._getBarCodeContent();
             respObj.responses = [];

             

             for (var keyQ in survey.questions) {
                 var curQ = survey.questions[keyQ];
                 if(curQ.type == 'singleSelect' || curQ.type == 'multiSelect' || curQ.type == 'dropDown' || curQ.type == 'textInput') {
	                 var resp = {};
	                 resp.questionId = curQ.id;
	                 resp.comment = curQ.comment;
	                 resp.answers = curQ.answers;
	                 /*for (var keyA in curQ.answers) {
	                     var curA = curQ.answers[keyA];
	                     resp.answers.push(curA);
	                 }*/
	                 respObj.responses.push(resp);
                 }
             }

             return JSON.stringify(respObj);

         },


         //override
         onNext: function (arg) {
        	 
        	 var isAllValid = true;
        	 var me = this;

             for (var keyQ in survey.questions) {
                 var curQ = survey.questions[keyQ];
                 
                var type = curQ.type;
	            if (type == "textInput" || type == "multiSelect" || type == "singleSelect" || type == "dropDown") {
	               //var isValid = Survey.isAnswerValid(curQ) || $.ui.allquestions.getWidgetName(curQ) == "notSupported";
	            	var isValid = Survey.isAnswerValid(curQ);
	            	console.log(isValid);
	            	if (!isValid) {
	                     isAllValid = false;
	                     break;
	                 }
	            }
             }

             if (isAllValid) {
            	 $(".control_cols_xlarge .okBtn" ).trigger( "click" ); //save the comment automatically
            	 var cmsg = langMgr.getTranslation("ConfirmSave") 
            	 var response = me.getSurveyResponse();
            	 //console.log(response);
            	 
                 var confirmed = function (btnIndex) {
                     if (btnIndex == 1) {
 			loadingWidget.show();
                         survey.deviceId = ciscoDeviceId;
                         if (isPhoneGap) {
                             var timestamp = (new Date()) * 1;
                             var query = 'INSERT INTO RESPONSE (surveyId , email , response , status, surveyTakenAt , updatedAt) VALUES (?,?,?,?,?,?)';
                             var params = [survey.id, survey.contactInfo.email, me.getSurveyResponse(), 1, timestamp, timestamp];
                             if (survey.editing) {
                                 query = 'UPDATE RESPONSE SET surveyId =?, email=? , response=? , status=? , updatedAt=? WHERE id=' + survey.responseId;
                                 params = [survey.id, survey.contactInfo.email, me.getSurveyResponse(), 1, timestamp];
                             }

                             databaseHelper.execQuery(query, params, function (result, err) {
                                 if (result && result.rowsAffected) {
                                     //databaseHelper.execQuery("select * from RESPONSE");
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
                                     });
                                 }
                                 else {
                                     customAlert("SavingRespFailed");
                                 }
                             });
                         }
                         else {

                             me.getSurveyResponse();
                             survey.questions = []; 
                             //me.navigateTo("thankYou", me.options.model);
                             //window.location = "index.html?surveyId=" + ciscoGlobalData.curSurveyId;
                             //me.navigateTo("docs", me.options.model);
                             var surveyObj = new Survey();
                             databaseHelper.execQuery("SELECT * FROM SURVEYSDOWNLOADED WHERE surveyId=?", [ciscoGlobalData.curSurveyId], function (results, err) {
                                 if (results && results.rows.length > 0) {
                                     var row = results.rows.item(0);
                                     surveyObj.loadXML($.proxy(me.onRestart, me), row.filePath);
                                 } 
                             });
                         }
                     }
                 }
                 var labels = langMgr.getTranslation("Yes") + ',Review';
                 navigator.notification.confirm(cmsg, confirmed, ciscoGlobalData.appName,labels);
                 //navigator.notification.confirm(cmsg, confirmed, ciscoGlobalData.appName);
                 //this.navigateTo("contact", this.options.model);
             } else {
            	 customAlert("QuestionRequired");
             }
        	 
             
         },
         onRestart: function(survey) {
        	 //set the reminder
             if (!localStorage.getItem('notification')) {
             
             var badgeNo = 1;
             var now = new Date().getTime(),
             //timer = new Date(now + 60 * 30000); //first time 30 minutes after
             timer = new Date(now + 60 * 60000); //first time 1 hour after
             var repeater = "daily";
             if (device.platform.toLowerCase() == "android") {
             repeater = 60*24;
             }
             console.log("reminder set");
             localStorage.setItem('notification', 'on');
             
             window.plugin.notification.local.ontrigger = function(id, state, json) {
             
             };
             
             
             window.plugin.notification.local.add({
                                                  id: 1,
                                                  title: 'Reminder',
                                                  message: 'Please upload your saved records to the server.',
                                                  repeat: repeater,
                                                  badge: badgeNo,
                                                  date: timer
                                                  });
             }

        	 
        	 var me = this;
        	 masterPageController.setSurvey(survey);
             ciscoGlobalData.curSurveyId = survey.id;
             $(".micro-tabs").quickJump({
                 model: survey
             });

             $(".comments").comment({
                 model: survey
             });
        	 me.navigateTo("miniSettings", survey);
             masterPageController.hideNextBtn(false);
             loadingWidget.hide();
         },
         onPrev: function (arg) {
        	 //this.goBack();
        	 var me = this;
        	 me.navigateTo("contact", me.options.model);
         },
         _getRequired: function(arg) {
        	 if(arg) {
        		 return "visible"; 
        	 } else {
        		 return "hidden";
        	 }
         },
         _optionClicked: function (sender, e) {
        	 if (!$(e.target).is("span.checkbox")) {
	             $(":checkbox", sender).each(function () {
	                 this.checked = !this.checked;
	                 $(this).change();
	             });
        	 }
         },

     });
     $.ui.allquestions.getWidgetName = function (question) {

         var type = question.type.substring(0, 1).toLowerCase() + question.type.substring(1);
                 
         //type = "multiSelect";
         if ($("<div/>")[type]) {
             return type;
         }
         else {
             return "notSupported";
         }
     };
 })(jQuery);
