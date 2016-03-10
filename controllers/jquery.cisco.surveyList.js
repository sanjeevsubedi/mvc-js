
(function ($) {

    $.widget("cisco.surveyList", $.ui.mainController, {
        //defaul options
        options: {
            model: null //model needed by this controller/view
        },
        //constructor
        _create: function () {
            $.ui.mainController.prototype._create.call(this);
            var me = this;
            //setTimeout(function () {
                me._checkAndNavigate()
            //}, 50);

        },
        //called when widget is called with no parameter of only options after widget is created
        _init: function () {
        	masterPageController.logoPlaceHolder(false);
            masterPageController.hideNextBtn(true);
            masterPageController.hideBackBtn(true);
            masterPageController.hideComment(true);
            $(".micro-tabs, header,.moreOptions").css("display","none");
            $("html").addClass("noHeader");
            $("html").removeClass("loginscreen");
            this._calculatePedingSurveys();

        },
		 _hideSurveys: function(val,data,key){
		        	
			 return val[langMgr.getCurLang().short_name] ? "surveyshow" : "surveyhide";
			
		},
        _getSurveyName: function (val, data, key) {
            return val[langMgr.getCurLang().short_name] ? val[langMgr.getCurLang().short_name].name : "N/A";
        },
        _isSelected: function (val, data, key) {
            return val == langMgr.getCurLang().short_name ? "selected" : "";
        },
        _langaugeChanged: function (s, e) {
            var lang = $(':selected', s).data("context");
            langMgr.setCurLang(lang);
            window.location = "";
            //this.bind();
            //$("#langauges .selected").get(0).selected = true;
        },
        _checkAndNavigate: function () {
            var me = this;

            var respId = ciscoGlobalData.queryStrings["respId"];
            var surveyId = ciscoGlobalData.queryStrings["surveyId"];

            me._response = null;
            me._respId = -1;
            if (isPhoneGap) {

                if (respId) {
                    databaseHelper.execQuery("select * from RESPONSE where id=?", [respId], function (results, err) {
                        if (results) {
                            me._response = eval("(" + results.rows.item(0).response + ")");
                            //console.log(results.rows.item(0).response);
                            me._respId = respId;
                            var surveyId = results.rows.item(0).surveyId;
                            //me._startSurvey(survey);
                            me._loadAndStartSurvey(surveyId);
                        }
                    });
                } else if (surveyId) {
                    me._loadAndStartSurvey(surveyId);
                } else {
                    surveyList.getData(function (surveyList) {
                    	var newLangs = me._languageFinder(surveyList);
                        surveyList.langs = newLangs;
                        //surveyList.langs = langMgr.getAllLangs();
                        me.options.model = surveyList;
                        $.ui.mainController.prototype._init.call(me);
                        $("#langauges .selected").get(0).selected = true;
                        loadingWidget.hide();
                    });
                }
            } else {
                if (surveyId) {
                    me._loadAndStartSurvey(surveyId);
                } else {
                    surveyList.getData(function (surveyList) {
                    	
                    	var newLangs = me._languageFinder(surveyList);
                        surveyList.langs = newLangs;
                        me.options.model = surveyList;
                        $.ui.mainController.prototype._init.call(me);
                        $("#langauges .selected").get(0).selected = true;
                        loadingWidget.hide();
                    });
                }

            }
        },
        
        _languageFinder:function(surveyList){
        	
         	//to find out available languages
          	var availableTranslations = [];
        	$(surveyList.surveys).each(function(i,v){
        		
        		var translations = v.translated_langs;
        		
        		$(translations).each(function(i,v){
        			
        			if($.inArray(v,availableTranslations) == -1){
        				//console.log(v);
        				availableTranslations.push(v);
        			}
        		})
        	})
        	//console.log(availableTranslations);
        	//ends
        	
        	var staticLangs = langMgr.getAllLangs();
        	var newLangs = [];
        	
        	$(staticLangs).each(function(i,v){
        		
        		if($.inArray(v.short_name,availableTranslations) != -1){
        			newLangs.push(v);
        		}
        		
        	})
        	return newLangs;
        },
        _surveyItemClicked: function (s, e) {
            e.preventDefault();
            var surveyItem = $(s).closest("[data-item]").data("context");
            if (surveyItem.translations[langMgr.getCurLang().short_name]) {
                //window.location = "index.html?surveyId=" + surveyItem.translations[langMgr.getCurLang().short_name].questionnaire_id;
            	this._loadAndStartSurvey(surveyItem.translations[langMgr.getCurLang().short_name].questionnaire_id);

            }

        },
        _loadAndStartSurvey: function (surveyId) {
            var me = this;
            var survey = new Survey();
            if (isPhoneGap) {

                databaseHelper.execQuery("SELECT * FROM SURVEYSDOWNLOADED WHERE surveyId=?", [surveyId], function (results, err) {
                    if (results && results.rows.length > 0) {
                        var row = results.rows.item(0);
                        survey.loadXML($.proxy(me._startSurvey, me), row.filePath);
                    } else {
                    	//set the reminder
                       /* if (!localStorage.getItem('notification')) {
                        	
                            var badgeNo = 1;
                            var now = new Date().getTime(),
                            timer = new Date(now + 60 * 1000);
                            var repeater = "minutely";
							if (device.platform.toLowerCase() == "android") {
							    repeater = 1;             		
							 }
                            console.log("reminder set");
                            localStorage.setItem('notification', 'on');

                            window.plugin.notification.local.ontrigger = function(id, state, json) {

                            };


                            window.plugin.notification.local.add({
                                id: 1,
                                title: 'Reminder',
                                message: 'Please upload survey responses.',
                                repeat: repeater,
                                badge: badgeNo,
                                date: timer
                            });
                        }*/
                        me._download(surveyId);
                    }
                });

            } else {
                survey.loadXML($.proxy(me._startSurvey, me), "xml/AllQuestions.xml");
            }
        },
        _startSurvey: function (survey) {

            masterPageController.setSurvey(survey);
            ciscoGlobalData.curSurveyId = survey.id;
            if (this._respId != -1) {
                survey.editing = true;
                survey.responseId = this._respId;
            }

            if (this._response) {
                this._mergeResponse(survey);
            }

            $(".micro-tabs, .trash-top").quickJump({
                model: survey
            });

            $(".comments").comment({
                model: survey
            });
            
            /*$(".answer-save").allquestions({
                model: survey
            });
            $(".answer-save").contact({
                model: survey
            });*/


            //this.navigateTo("contactcollection", survey);
                 if (this._response) {
                     localStorage.setItem('response',true);
              this.navigateTo("contactcollection", survey);
          
             } else {
             this.navigateTo("contactcollection", survey);
             }
          
            loadingWidget.hide();


        },
        _mergeResponse: function (survey) {
            survey.contactInfo = this._response.contactInfo;
            survey.commentInfo = this._response.commentInfo;
            var respMap = [];
            for (var i = 0; i < this._response.responses.length; i++) {
                var resp = this._response.responses[i];
                respMap[resp.questionId] = resp;
            }

            for (var i = 0; i < survey.questions.length; i++) {
                var question = survey.questions[i];
                var resp = respMap[question.id];
                if(resp) {
	                question.answers = resp.answers;
	                question.comment = resp.comment;
                }
            }
        },
        _download: function (id) {
            var me = this;
            loadingWidget.show();
            FiletransferHelper.downloadFile(baseServerPath + "/client?method=get_xml&sid=" + id+"&t=s&enc=y", "Cisco/surveys/survey_" + id + "/survey.xml", function (path) {

            //FiletransferHelper.downloadFile(baseServerPath + "/client?method=get_xml&sid=" + id+"&t=s", "Cisco/surveys/survey_" + id + "/survey.xml", function (path) {
                if (path == null) {
                    customAlert("DownloadFailed")
                    loadingWidget.hide();
                    window.location = "index.html"
                } else {
                    var survey = new Survey();
                    survey.loadXML($.proxy(me._downloadResources, me), path);
                    survey.filePath = path;
                }
            });

        },
        _downloadResources: function (survey) {
            var me = this;
            var allResources = survey.allResources;
            this._downloadFiles(allResources, "Cisco/surveys/survey_" + survey.id + "/resources/", function (result) {
                if (result.failed == 0) {
                    me._downloadTemplateImages(survey);
                } else {
                    me._surveyDownloadFailed(survey);
                }
            });
        },
        _downloadTemplateImages: function (survey) {
            var me = this;
            var files = [];
  
            if(survey.designTemplate.type == "s") { 
	            files.push({
	                name: "logo.png",
	                path: survey.designTemplate.logoMobile
	            });
            } else {
                files.push({
                    name: "logo.png",
                    path: survey.designTemplate.logo
                });
 
            }
            /*files.push({
                name: "background.png",
                path: survey.designTemplate.bgImage
            });*/
            this._downloadFiles(files, "Cisco/surveys/survey_" + survey.id + "/design/", function (result) {
                if (result.failed == 0) {
                    me._surveyDownloaded(survey);
                } else {
                    me._surveyDownloadFailed(survey);
                }
            });
        },
        _surveyDownloaded: function (survey) {
            var me = this;
            databaseHelper.execQuery("INSERT INTO SURVEYSDOWNLOADED (surveyId, filePath, status, downloadedOn) VALUES (?, ?, ?, ?)", [survey.id, survey.filePath, 1, ((new Date()) * 1)], function (results, err) {
                if (results && results.rowsAffected > 0) {
                    customAlert("SurveyDownloaded");
                    survey.sendStatus(true);
                    me._startSurvey(survey);
                    loadingWidget.hide();
                } else {
                    me._surveyDownloadFailed(survey)
                }
            });
        },
        _surveyDownloadFailed: function (survey) {
            //survey.sendStatus(false);
            customAlert("SurveyDownloadFailed");
            loadingWidget.hide();
            window.location = "index.html?" + (new Date() * 1);
        },
        _downloadFiles: function (files, savePath, callback) {
            var me = this;

            var downloading = 0;
            var downloaded = 0;
            var failed = 0;
            var resourceCount = files.length;
            loadingWidget.show("DownloadingRes", [0, resourceCount]);
            //customAlert(resourceCount);
            var download = function () {
                if (files.length > 0) {
                    if (downloading <= 5) {
                        var res = files.splice(0, 1)[0];
                        console.log("downloading " + res.name);
                        downloading++;
                        FiletransferHelper.downloadFile(baseServerPath + res.path, savePath + res.name, function (path) {
                            downloading--;
                            if (path == null) {
                                console.log("download failed " + path);
                                failed++;
                            } else {
                                localStorage[baseServerPath + res.path] = path;
                                console.log("downloaded " + path);
                                downloaded++;
                            }
                            var msg = langMgr.getTranslation("DownloadingRes", [downloaded, resourceCount]);
                            if (failed > 0) {
                                msg += " (" + failed + " " + langMgr.getTranslation("Failed") + ")";
                            }
                            loadingWidget.showText(msg);
                        });
                    }
                } else if (downloaded + failed >= resourceCount) {
                    callback({
                        total: resourceCount,
                        downloaded: downloaded,
                        failed: failed
                    })
                    return;
                }

                setTimeout(download, 100);

            };

            download();

        },
        _refreshClicked: function (s, e) {
            var msg = langMgr.getTranslation("ConfirmRefresh");


            var confirmed = function (buttonIndex) {
                if (buttonIndex == 1) {
                    var networkState = navigator.connection.type;

                    if (navigator.onLine && networkState != 'none') {
                        var me = this;
                        databaseHelper.execQuery("DELETE FROM SURVEYSDOWNLOADED", [], function () {
                            filesystemHelper.getDirRecursively("Cisco/surveys/" + me._responseTxtFilename, function (dir) {
                                console.log("gotdir callback");
                                if (dir) {
                                    dir.removeRecursively(function () {
                                            console.log("delete sucess");
                                            window.location = "index.html";
                                        },
                                        function () {
                                            console.log("delete failed");
                                        });
                                } else {
                                    console.log("Couldn't get directory.");
                                    window.location = "index.html";
                                }
                            }, true);
                        })
                    } else {
                        customAlert("CheckInternet");
                    }

                }
            }
            navigator.notification.confirm(msg, confirmed, ciscoGlobalData.appName);
        },

        _response: null,
        _respId: -1,
        //destructor
        destroy: function () {
            $.Widget.prototype.destroy.call(this);
        }
    });
})(jQuery);