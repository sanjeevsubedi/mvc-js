var masterPageController = null;
var masterPageControllerMobile = null;
(function ($) {
   
    $.widget("ui.masterPage", $.ui.mainController, {
        //defaul options
        options: {
            model: null, //model needed by this controller/view            
            pushInHistoryStack: false,
            serverStatus: false,
        },
        //constructor
        _create: function () {
            masterPageController = this;
            masterPageControllerMobile = $("#nextbackholder");//$(this.element).next();
            
            $.ui.mainController.prototype._create.call(this);
            /*var buttons = $(".commonBtnWrap", this.element);
            var height = buttons.offset().top - this._container.offset().top;
            $(this._pageHolder, this.element).height(height);*/
            //loadingWidget = $("#loadingDiv").loading().data("loading");            
            var me = this;
            var survey = new Survey();
            //setTimeout(function () {
                ciscoGlobalData.curUser = new User();
                //if (ciscoGlobalData.queryStrings["goToSettings"] == "true" || !baseServerPath || baseServerPath == "") {
                if (ciscoGlobalData.queryStrings["goToSettings"] == "true") {
                    me.navigateTo("settings");
                }
                else if (ciscoGlobalData.curUser.loadFromStorage()) {
                	//me.navigateTo("miniSettings", null);
                    //change the dialog box title with the company name
                    ciscoGlobalData.appName = ciscoGlobalData.curUser.company;
                    me.navigateTo("surveyList", null);
                }
                else {
                    //me.navigateTo("surveyList", null);
                    me.navigateTo("login", null);
                }                
                
           // }, 100);


            /***************events******************/
            $("#btnBack").click(function (e) {
                e.preventDefault();
                me.triggerCustomEvent("onPrev", "prevParam");
            });
            $("#btnNext").click(function (e) {
                e.preventDefault();
                me.triggerCustomEvent("onNext", "nextParam");
            });
            $("#ciscoLogo").click(function (e) {
                e.preventDefault();
            /*  var msg = langMgr.getTranslation("GoToSettings");
                navigator.notification.confirm(msg,
                    function (buttonIndex) {
                        if (buttonIndex == 1) {
                            window.location = "index.html?goToSettings=true";
                        }

                    },ciscoGlobalData.appName);*/
            //window.location = "index.html?goToSettings=true";
            });
            
        },
        //called when widget is called with no parameter of only options after widget is created 
        _init: function () {

            if(!this.options.serverStatus) {

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
            
        },
        setSurvey: function (survey) {
            this._survey = survey;
            this._changeDesign();
        },
        _changeDesign: function () {

            //var bg = localStorage[baseServerPath + this._survey.designTemplate.bgImage] + "?" + ((new Date())*1);
            var logo = localStorage[baseServerPath + this._survey.designTemplate.logo] + "?" + ((new Date()) * 1);
            console.log("logo:"+this._survey.designTemplate.logo);
            //change the dialog box title with the company name
            //ciscoGlobalData.appName = this._survey.company.name;
            $("header #surveyTitle").text(this._survey.title);
            $("header #surveyLocation").text(this._survey.location);
            
            //$(".lookupdownload").html('<a href="#" id="lookup-trigger">Refresh database</a>');
             
            /* var searchDb = this._survey.badgescan.value;
             if(searchDb != 1) {
                $(".look-up-trigger").css('display','none');
                $(".barcode-trigger").css('display','none');
                $(".lookupdownload").css('display','none');
                $("#lkup").css('display','none');
             }

            
            var badgescan = this._survey.badgescan;
            var postData = {
                login: badgescan.username,
                password: badgescan.password,
                idSection: badgescan.idsection,
                idLanguage: badgescan.languageid,
                searchPattern: '%',
                idQuestionSearch: badgescan.idquestionsearch,
                idQuestionOutput: badgescan.idquestionoutput,
                server : badgescan.server
            };
            $("header #lookup-trigger").attr('data-post',JSON.stringify(postData));*/
            
            if (!isPhoneGap) {
                //bg = baseServerPath + this._survey.designTemplate.bgImage;
                logo = baseServerPath + this._survey.designTemplate.logo;
            } else {
                var networkState = navigator.connection.type;
                //check internet
                if(navigator.onLine && networkState != 'none') {
                    /* $(".container").css({
                        backgroundImage: "url(" + bg + ")"
                    });*/
            
                    $("a#ciscoLogo>img").css("display", 'block');
                    $("a#ciscoLogo>img").attr("src", appFolderPath+logo);
                } else {
                    // offline logo
                    filesystemHelper.getFile("Cisco/surveys/survey_"+this._survey.id+"/design/logo.png", function (file) {
                        if (file != null && file.getFileLength()>0) {
                            $("a#ciscoLogo>img").css("display", 'block');
                            $("a#ciscoLogo>img").attr("src", appFolderPath+file.getFullPath());
                        }
                    }, false);
            
                //offline template
                /* filesystemHelper.getFile("Cisco/surveys/survey_"+this._survey.id+"/design/background.png", function (file) {
                        if (file != null && file.getFileLength()>0) {
                            $(".container").css({
                                backgroundImage: "url(" + file.getFullPath() + ")"
                            });
                        }
                    }, false);*/
            
                }
                
            //show the download lookup feature when it is enabled from cms backend
            /* if(this._survey.badgescan.value == 1) {
                	$(".lookupdownload").css('display','block');
                } else {
                	$(".lookupdownload").css('display','none');
                }*/
            }
            
            var dsgnTemp = $("style#designTemplate");
            if (dsgnTemp.length <= 0) {
                dsgnTemp = $('<style id="designTemplate" type="text/css"></style>');
                $("head").append(dsgnTemp);
            }

            //s means small device
            if(this._survey.designTemplate.type == "s" && this._survey.designTemplate.themeColor != "no") {
             var themeColor = this._survey.designTemplate.themeColor;
            var themeHoverColor = this._survey.designTemplate.themeHoverColor;
           dsgnTemp.text("body,.micro-tabs ul li:hover,.contact-form:hover, .lookup:hover, .business-card:hover, .barcode:hover,"+
                "#nextbackholder #btnNext, #view_miniSettings ul li a,#lookup-container .pattern-holder #remote-search,.control_cols_xlarge .okBtn,div.fancy-select select:focus + div.trigger.open,div.fancy-select ul.options li.selected,.comment-beside-save,#comment-trigger,.lookup:after, .barcode:after,.business-card:after, .contact-form:after,.btnLookupDownload,.micro-tabs ul li.micro-tab-active{background:"+themeColor+"}"+
                "#nextbackholder #btnNext:hover, #view_miniSettings ul li a:hover,.control_cols_xlarge .okBtn:hover,.btnLookupDownload:hover,.button:hover, .comment-beside-save:hover,#comment-trigger:hover{background:"+themeHoverColor+"}" +
                ".micro-tabs ul li a, .button{color:"+themeColor+"}" +
                "#lookup-container .search-holder input,div.fancy-select ul.options,#view_login fieldset input:focus, #view_contact fieldset input:focus{border-color:"+themeColor+"}" +
                "#lookup-container #lookuptable tbody tr td:first-child{color:"+themeColor+"}"); 
        
            }
        },
        hideNextBtn: function(hide){
            if(hide){
                $("#btnNext", masterPageControllerMobile).hide();
                /*$("#btnBack", masterPageControllerMobile).css({
                    'float':'none',
                    'width':'100%',
                    'margin':'0'
                })*/
            }
            else{
                $("#btnNext", masterPageControllerMobile).show();
                /*$("#btnBack", masterPageControllerMobile).css({
                    'float':'left',
                    'width':'46%',
                    'margin-left':'2%'
                })*/
            }
        },
        hideBackBtn: function(hide){
            if(hide){
                $("#btnBack", masterPageControllerMobile).hide();
                /*$("#btnNext", masterPageControllerMobile).css({
                    'float':'none',
                    'width':'100%',
                    'margin':'0'
                })*/
            }
            else{
                $("#btnBack", masterPageControllerMobile).show();
                $("#btnBack", masterPageControllerMobile).css({
                    'float':'none',
                    'width':'100%',
                    'margin':'0',
                    'display':'block',
                })
                /*$("#btnNext", masterPageControllerMobile).css({
                    'float':'left',
                    'width':'46%',
                    'margin-left':'2%'
                })*/
            }
        },
        logoPlaceHolder: function (hide){
            if(hide){
                $(".logoplaceholder").hide();
                $(".loggedInStatus").hide();
                $(".version").hide();
            }
            else{
            	
            	 if(ciscoGlobalData.curUser.email) {
                     $(".loggedInStatus").show();
                     $(".loggedInStatus #loggedInUser").html(ciscoGlobalData.curUser.email);
                     $(".loggedInStatus #logStatus").html(langMgr.getTranslation("loggedInAs"));
                  }else {
                     $(".loggedInStatus").hide();
                  }
            	 
            	 $(".version").show();
                $(".logoplaceholder").show();
            }
        	
        },
        hideComment: function (hide){
            if(hide){
                $("#comment-container").hide();
            }
            else{
                $("#comment-container").show();
            }
       	
        },
        
        getSurveyResponse: function () {
            var respObj = {};
            respObj.surveyId = this._survey.id;
            respObj.deviceId = this._survey.deviceId;
            respObj.userId = ciscoGlobalData.curUser.id;
            respObj.cardImageName = this._survey.contactInfo.imageName
            respObj.contactInfo = this._survey.contactInfo;
            respObj.commentInfo = this._survey.commentInfo;
            respObj.genDate =  Date.now() /1000 |0;
            respObj.barcode = collectionController._getBarCodeContent();
            respObj.responses = [];
            
            return JSON.stringify(respObj);
            
            },
            
            collectResponses: function (mdl,type,callback) {
            console.log("master");
              var me = this;
            
            
            
            $(".control_cols_xlarge .okBtn" ).trigger( "click" ); //save the comment automatically
            
            var response = me.getSurveyResponse();
            //console.log(response);
            
            loadingWidget.show();
            this._survey.deviceId = ciscoDeviceId;
            if (isPhoneGap) {
            var timestamp = (new Date()) * 1;
            var query = 'INSERT INTO RESPONSE (surveyId , email , response , status, surveyTakenAt , updatedAt) VALUES (?,?,?,?,?,?)';
            var params = [this._survey.id, this._survey.contactInfo.email, me.getSurveyResponse(), 1, timestamp, timestamp];
            
            var respId = ciscoGlobalData.respId ? ciscoGlobalData.respId : ciscoGlobalData.queryStrings["respId"];
            if (respId || ciscoGlobalData.respId) {
            query = 'UPDATE RESPONSE SET surveyId =?, email=? , response=? , status=? , updatedAt=? WHERE id=' + respId;
            params = [this._survey.id, this._survey.contactInfo.email, me.getSurveyResponse(), 1, timestamp];
            }
            
            databaseHelper.execQuery(query, params, function (result, err) {
                                     if (result && result.rowsAffected) {
                                    me._calculatePedingSurveys();
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
                           
                                     
                                     if(!type){
	                                     me.navigateTo("contact", mdl);
	                                     $("#response-contact").attr("data-respId",result.insertId);
	                                     if(ciscoGlobalData.scan) {
	                                    	 $("#full_name, #firstName, #lastName, #email, #company").show();
		                                     $("#firstName").html(ciscoGlobalData.scan.firstname);
		                                     $("#lastName").html(ciscoGlobalData.scan.lastname);
		                                     $("#email").html(ciscoGlobalData.scan.email);
		                                     $("#company").html(ciscoGlobalData.scan.company);
		                                     
		                                     
		                                     $(".micro-tabs, #contact-holder, .collections, #comment-container, #btnNext").css("display","none");
		                                     $("#intermediate-screen, #scanOnly, .scan-options").show();
		                                     var saveBtn =  $("#scanOnly");
		                                     saveBtn.show().css({"width":"100%"});
		                                     saveBtn.html("Next Scan");
		                                     
		                                     
	                                     }
	                                    
                                     }
                                    
                                     masterPageController.hideNextBtn(true);
                                   //  if(type == "contact") {
                                	 var param = respId ? respId : result.insertId
                                	 callback(param);
                                     //}
                                     
                                     
                                     }
                                     else {
                                     customAlert("SavingRespFailed");
                                     }
                                     });
            }
            
            
            },
        
        //destructor
        destroy: function () {
            $.Widget.prototype.destroy.call(this);
        },
        _survey: null

    });
})(jQuery);
