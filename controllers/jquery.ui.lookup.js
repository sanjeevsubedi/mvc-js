 (function($) {
     var fileName = "";
     var savedImageName = "";
     var imageFullPath = "";
     var survey = null;
     //var response = '{"ErrorNumber":0,"DateRequested":"\/Date(1399370513200)\/","AnswerList":[{"IdQuestion":1,"IdSession":20,"IdGuid":"3546c8aa-2c6f-4537-825e-4f0e9d2906cb","AnswerValue":{"firstname":"Uwe","lastname":"Limbach","salutation":"Mr.","company":"FairControl GmbH","position":"Lead Management","country":"Germany","countryiso":"DE","street1":"Bussardstraße 5","zip":"82166","city":"Gräfelfing","email":"uwe.limbach@faircontrol.de","url":"www.faircontrol.de","phone1":"+49 (0) 123456 789","phone1country":"49","phone1prefix":"0","phone1areacode":"123456","phone1number":"789"}},{"IdQuestion":1,"IdSession":116,"IdGuid":"4733ec66-c214-4c2f-9214-b09d030bc1a7","AnswerValue":{"firstname":"Uwe","lastname":"Limbach","country":"France","countryiso":"FR","email":"uwe.limbach@faircontrol.de","phone1":"+33 (0) 12345 789","phone1country":"33","phone1prefix":"0","phone1areacode":"12345","phone1number":"789","phone2country":"33","phone2prefix":"0","mobilecountry":"49","mobileprefix":"0","faxcountry":"33","faxprefix":"0"}},{"IdQuestion":1,"IdSession":157,"IdGuid":"666e5384-6cc9-4a3e-8e52-9cd4c0507fd7","AnswerValue":{"firstname":"Uwe","lastname":"Limbach","company":"FairControl","country":"Germany","countryiso":"DE","email":"uwe.limbach@faircontrol.de","phone1":"+49 (0) 123 123456","phone1country":"49","phone1prefix":"0","phone1areacode":"123","phone1number":"123456","phone2country":"49","phone2prefix":"0","mobilecountry":"49","mobileprefix":"0","faxcountry":"49","faxprefix":"0"}}],"Success":true}';
     var importNotice = "&gt;&gt; click to import";
     var verb = " are";
     var info = "Please scroll to see all.";
     var resultSingPlu = "record";

     $.widget("ui.lookup", $.ui.mainController, {
         //defaul options
         options: {
             model: null //model needed by this controller/view
         },
         //constructor
         _create: function() {
             // Your code before calling the overridden method.
             $.ui.mainController.prototype._create.call(this);
             // Your code after calling the overridden method.
             survey = masterPageController._survey;
             $("#lookup-container ul li").live('click', function() {

                 $("#lookup-container li").removeClass("highlight_row singleclick").find(".clkimport").hide();
                 $(this).addClass("highlight_row singleclick").find(".clkimport").show();

                 $("#lookup-container li").find('.chk-record').removeAttr("checked");
                 $(this).find('.chk-record').attr('checked', 'checked');

                 /*setTimeout(function(){
            		 $("#lookup-container li").removeClass("highlight_row singleclick");
            	 },2000);*/

                 //var json = $(this).find('.chk-record').attr('data-record');

             })


             //attach lookup handler to download all the lookup data
             var lookupElem = $('#lookup-trigger');
             var postData = lookupElem.attr('data-post');
             lookupElem.click($.proxy(this._lookupClicked, this, postData));

             //attach handler for import
             var me = this;
             var importElem = $('.import a');
             importElem.die();
             importElem.live('click', function() {

                 me._importClicked();
             });

             //attach remote search from popup box
             var remoteSearchElem = $('#remote-search');
             remoteSearchElem.die();
             remoteSearchElem.live('click', function() {
                 me._remoteSearchClicked();
             });

             $(".singleclick").die();
             $(".singleclick").live('click', function() {
                 //$(this).removeClass('singleclick');
                 me._importClicked();

             })

         },

         //called when widget is called with no parameter of only options after widget is created
         _init: function() {
             $.ui.mainController.prototype._init.call(this);
             masterPageController.hideNextBtn(true);
             masterPageController.hideBackBtn(false);
             masterPageController.logoPlaceHolder(true);
             /*var searchDb = this.options.model.badgescan.value;
             if (searchDb != '1') {
                 $(".look-up-trigger").css('display', 'none');

             }*/
             
            if (device.platform.toLowerCase() != "android") { 
                $("#lookup_val").focus();
            } else {
                cordova.plugins.Keyboard.show();
            }




             this._calculatePedingSurveys();
             $("html").addClass("noNav");
             $(".micro-tabs").css("display", "none");
             $("#btnBack").html(langMgr.getTranslation("Back"));
             $("#lookup_val").attr('placeholder',langMgr.getTranslation("LookUp"));
             
             var fixPositionFixedElements = function(elem){
    
                 elem = elem || document.documentElement;

                 // force a reflow by increasing size 1px
                 var width = elem.style.width,
                     px = elem.offsetWidth+1;

                 elem.style.width = px+'px';

                 setTimeout(function(){
                         // undo resize, unfortunately forces another reflow
                         elem.style.width = width;
                         elem = null;
                 }, 0);
         };
         
         fixPositionFixedElements();

         },

         _contactFormClicked: function(s, e) {
             this.navigateTo("contact", this.options.model);
         },


         _getCountryName: function(countryiso) {
             var returnval = "Unknown";
             $.each(countries, function(i, v) {
                 if (countryiso == v.iso) {
                     returnval = v.country;
                     return false;
                 }
             });
             return returnval;
         },

         _remoteSearchClicked: function() {

             var badgescan = this.options.model.badgescan;
             var surveyId = this.options.model.id;
             var lookupVal = $("#search-remote-box").val();
             var lookupValNoWildCard = $("#search-remote-box").val();
             var me = this;

             //min 3 characters required
             if (lookupVal.length > 2) {

                 $(".remote-data").html("<div style='padding:20px;' align='center'><img src='images/loading.gif' /></div>");
                 if ($("#search-scope").attr('checked')) {
                     lookupVal = lookupVal;
                 } else {
                     lookupVal = "%" + lookupVal + "%"
                 }

                 var networkState = navigator.connection.type;

                 if (navigator.onLine && networkState != 'none') {
                     //if(true) {
                     var postData = {
                         login: atob(badgescan.username),
                         password: atob(badgescan.password),
                         idSection: badgescan.idsection,
                         idLanguage: badgescan.languageid,
                         searchPattern: lookupVal,
                         idQuestionSearch: badgescan.idquestionsearch,
                         idQuestionOutput: badgescan.idquestionoutput
                     };

                     lookup.pull(badgescan.server, postData, function(response, error) {
                         if (response) {
                             //var userobj = JSON.parse(response);
                             var userobj = response;
                             //userobj = JSON.parse(response);

                             //var html = "<table class='tablesorter' id ='lookuptable' cellspacing='1'><thead><tr><th></th><th>first name</th><th>last name</th><th>email</th><th>company</th></tr></thead><tbody>";

                             var html = "<div class='top-holder'>";
                             html += "<div class='search-holder'><input type='text' id='search-remote-box' placeholder='search' />";
                             html += "<div class='online-status'></div></div>";
                             html += "<div class='pattern-holder'><a href='#' class='button' id='remote-search'>Refresh</a><input type='checkbox' id='search-scope'/><span>Exact matches only </span></span> </div></div>";
                             html += "<div class='remote-data-holder'>";
                             html += "<div class='remote-data'><div class='total-rec'></div><ul>";
                             //var html = "<ul>"
                             var count = 0;
                             $(userobj.AnswerList).each(function(i, user) {
                            	 
                            	 //make the first record highlighted
                            	 var checkedRecord = '';
                            	 var singleClickedClass = '';
                            	 var importNoiceVisibility = '';
                            	 //make the first record ready for clickable
                            	 if(i == 0) {
                            		 checkedRecord = " checked ";
                                	 singleClickedClass = " class='highlight_row singleclick' ";
                                	 importNoiceVisibility = " style=display:block ";
                            	 }
                            	 
                                 console.log(user);
                                 var country = "d"; //me._getCountryName(user.AnswerValue.countryiso);
                                 user.AnswerValue.country = country;
                                 user.AnswerValue.countryiso = country == "Unknown" ? "??" : user.AnswerValue.countryiso;
                                 var userDetails = JSON.stringify(user);
                                 userDetails = userDetails.replace(/'/g, '#!0');
                                 
                                 html += "<li"+singleClickedClass+"><table class='tablesorter' id ='lookuptable'><tbody>";
                                 html += "<tr style='display:none;'><td></td><td><input"+ checkedRecord+" class= 'chk-record' type='checkbox' data-record='" + userDetails + "'/></td></tr>";
                                 html += "<tr><td>First name</td><td>" + user.AnswerValue.firstname + "</td></tr>";
                                 html += "<tr><td>Last name</td><td>" + user.AnswerValue.lastname + "</td></tr>";
                                 //html += "<tr><td>Email</td><td>" + user.AnswerValue.email + "</td></tr>";
                                 html += "<tr><td>Company</td><td>" + user.AnswerValue.company + "</td></tr>";
                                 html += "</tbody></table><div class='clkimport'"+importNoiceVisibility+">" + importNotice + "</div></li>";
                                 count++;
                             })

                             //html += "</ul>";
                             //html += "</div><div class='import'><a href='#' class='button'>Select Contact</a></div><div class='total-rec'>There are <b id='count-res'>" + count + "</b> results for this request, please scroll to see all.</div></div>";

                             if(count == 0 || count == 1) {
                            	 verb = " is ";
                            	 info = "";
                                 resultSingPlu = " result ";
                             } else {
                            	 verb = " are ";
                            	 info = "Please scroll to see all.";
                                 resultSingPlu = " results ";
                             } 

                      	     html += "</ul>";
	                         html += "</div><div class='import'><a href='#' class='button'>Select Contact</a></div></div>";

                             
                             
                             //$(".remote-data").html(html);
                             //$("#count-res").html(count);
                             //$("table#lookuptable tbody").html(html);
                             $(".look-up-trigger").css('display', 'none');
                             $("#lookup-container").html(html);
                             
                             var countData = "<div class='total-rec'>There " + verb + " <b id='count-res'>" + count + "</b>"+resultSingPlu+"for this request</div>";
                             $(".total-rec").html(countData);

                             $(".qs_input, #search-remote-box").val(lookupValNoWildCard);
                             $("#lookup-container").removeClass("loading");

                         }
                     });

                 } else {

                     lookupVal = $("#search-remote-box").val();
                     loadingWidget.show();
                     setTimeout(function() {
                         databaseHelper.execQuery("SELECT response FROM SURVEYSDOWNLOADED WHERE surveyId=?", [surveyId], function(results, err) {
                             if (results && results.rows.length > 0) {
                                 var row = results.rows.item(0);
                                 var userobj = row.response;
                                 userobj = JSON.parse(userobj);


                                 var html = "<div class='top-holder'>";
                                 html += "<div class='search-holder'><input type='text' id='search-remote-box' placeholder='search' />";
                                 html += "<div class='offline-status'></div></div>";
                                 html += "<div class='pattern-holder'><a href='#' class='button' id='remote-search'>Refresh</a><input type='checkbox' id='search-scope'/><span>Exact matches only </span></span> </div></div>";
                                 html += "<div class='remote-data-holder'>";
                                 html += "<div class='remote-data'><div class='total-rec'></div><ul>";
                                 var count = 0;
                                 $(userobj.AnswerList).each(function(i, user) {
                                	 
                                	 //make the first record highlighted
                                	 var checkedRecord = '';
                                	 var singleClickedClass = '';
                                	 var importNoiceVisibility = '';
                                	
                                	

                                     var eValue = user.AnswerValue.email.toLowerCase();
                                     var fValue = user.AnswerValue.firstname.toLowerCase();
                                     var lValue = user.AnswerValue.lastname.toLowerCase();
                                     var cValue = user.AnswerValue.company.toLowerCase();
                                     var userInput = lookupVal.toLowerCase();
                                     //console.log(fValue.indexOf(userInput)!== -1);
                                     if (lValue.indexOf(userInput) !== -1 || cValue.indexOf(userInput) !== -1 || eValue.indexOf(userInput) !== -1 || fValue.indexOf(userInput) !== -1) {
                                                                             	 
                                    	 if(count == 0) {
                                    		 checkedRecord = " checked ";
                                        	 singleClickedClass = " class='highlight_row singleclick' ";
                                        	 importNoiceVisibility = " style=display:block ";
                                    	 } 
                                    	 
                                    	 var country = me._getCountryName(user.AnswerValue.countryiso);
                                         user.AnswerValue.country = country;
                                         user.AnswerValue.countryiso = country == "Unknown" ? "??" : user.AnswerValue.countryiso;

                                         html += "<li"+singleClickedClass+"><table class='tablesorter' id ='lookuptable'><tbody>";
                                         html += "<tr style='display:none;'><td></td><td><input"+checkedRecord+" class= 'chk-record' type='checkbox' data-record='" + JSON.stringify(user) + "'/></td></tr>";
                                         html += "<tr><td>First name</td><td>" + user.AnswerValue.firstname + "</td></tr>";
                                         html += "<tr><td>Last name</td><td>" + user.AnswerValue.lastname + "</td></tr>";
                                         //html += "<tr><td>Email</td><td>" + user.AnswerValue.email + "</td></tr>";
                                         html += "<tr><td>Company</td><td>" + user.AnswerValue.company + "</td></tr>";
                                         html += "</tbody></table><div class='clkimport'"+importNoiceVisibility+">" + importNotice + "</div></li>";

                                         count++;
                                     }


                                 })

                                 //html += "</ul>";
                                 //html += "</div><div class='import'><a href='#' class='button'>Select Contact</a></div><div class='total-rec'>There are <b id='count-res'>" + count + "</b> results for this request, please scroll to see all.</div></div>";

                                  if(count == 0 || count == 1) {
                            	 verb = " is ";
                            	 info = "";
                                 resultSingPlu = " result ";
                             } else {
                            	 verb = " are ";
                            	 info = "Please scroll to see all.";
                                 resultSingPlu = " results ";
                             }

                                 html += "</ul>";
                                 html += "</div><div class='import'><a href='#' class='button'>Select Contact</a></div></div>";

                                 
                                 $(".look-up-trigger").css('display', 'none');
                                 $("#lookup-container").html(html);
                                 
                                 var countData = "<div class='total-rec'>There " + verb + " <b id='count-res'>" + count + "</b>"+resultSingPlu+"for this request</div>";
                                 $(".total-rec").html(countData);

                                 $(".qs_input, #search-remote-box").val(lookupVal);
                                 $("#lookup-container").removeClass("loading");
                                 loadingWidget.hide();
                             }
                         })
                     }, 50);

                     //alert("offline");
                     /* loadingWidget.show();
                         var offlinemsg = ""; //langMgr.getTranslation("OfflineMode");
                         databaseHelper.execQuery("select * from CUSTOMER where surveyId =" + surveyId + " and (firstname like '" + lookupVal + "' or lastname like '" + lookupVal + "' or email like '" + lookupVal + "' or company like '" + lookupVal + "')", [], function (results, error) {
                             //console.log(results.rows.length);
                             if (results) {
                                 var count = results.rows.length;

                                 var html = "<ul>"
                                 for (var i = 0; i < count; i++) {

                                     var item = results.rows.item(i);

                                     var jsonObj = {};
                                     jsonObj.IdGuid = item.IdGuid;
                                     jsonObj.TemplateString = item.TemplateString;

                                     var phone1Data = item.phone1;
                                     var phone1obj = JSON.parse(phone1Data);

                                     var phone2Data = item.phone2;
                                     var phone2obj = JSON.parse(phone2Data);

                                     var mobileData = item.mobile;
                                     var mobileobj = JSON.parse(mobileData);

                                     var faxData = item.fax;
                                     var faxobj = JSON.parse(faxData);

                                     item.phone1country = phone1obj.c;
                                     item.phone1prefix = phone1obj.p;
                                     item.phone1areacode = phone1obj.a;
                                     item.phone1number = phone1obj.n;

                                     item.phone2country = phone2obj.c;
                                     item.phone2prefix = phone2obj.p;
                                     item.phone2areacode = phone2obj.a;
                                     item.phone2number = phone2obj.n;

                                     item.mobilecountry = mobileobj.c;
                                     item.mobileprefix = mobileobj.p;
                                     item.mobileareacode = mobileobj.a;
                                     item.mobilenumber = mobileobj.n;

                                     item.faxcountry = faxobj.c;
                                     item.faxprefix = faxobj.p;
                                     item.faxareacode = faxobj.a;
                                     item.faxnumber = faxobj.n;

                                     //console.log(item.countryiso);
                                     //search country name via iso in local database
                                     var country = "mmm" //me._getCountryName(item.countryiso);
                                     item.country = country
                                     item.countryiso = country == "Unknown" ? "??" : item.countryiso;
                                     jsonObj.AnswerValue = item;
                                     //console.log(jsonObj);
                                     //console.log(JSON.stringify(jsonObj));

                                     //console.log("firstname: " + item.firstname + " lname: " + item.lastname);
                                     html += "<li><table class='tablesorter' id ='lookuptable'><tbody>";
                                     html += "<tr style='display:none;'><td></td><td><input class= 'chk-record' type='checkbox' data-record='" + JSON.stringify(jsonObj) + "'/></td></tr>";
                                     html += "<tr><td>First name</td><td>" + item.firstname + "</td></tr>";
                                     html += "<tr><td>Last name</td><td>" + item.lastname + "</td></tr>";
                                     //html += "<tr><td>Email</td><td>" + item.email + "</td></tr>";
                                     html += "<tr><td>Company</td><td>" + item.company + "</td></tr>";
                                     html += "</tbody></table><div class='clkimport'>"+importNotice+"</div></li>";

                                 }

                                 html += "</ul>";
                                 $(".remote-data").html(html);
                                 $("#count-res").html(count);
                                 loadingWidget.hide();
                             }

                         });*/

                 }
             } else {
                 customAlert("Minlookupval", "Minlookupval");
             }


         },

         _importClicked: function() {
             var me = this;
             var json = "";
             $("#lookup-container table tr").each(function() {
                 if ($(this).find('.chk-record').attr('checked')) {
                     json = $(this).find('.chk-record').attr('data-record');
                     json = json.replace(/#!0/g, '\''); //single quote is replace with #!0
                     return false;
                 }
             })

             var cmsg = langMgr.getTranslation("OverwriteContact");
             var confirmed = function(btnIndex) {

                 var networkState = navigator.connection.type;

                 if (btnIndex == 1) {
                     //reset the previous answers
                     for (var keyQ in survey.questions) {
                         var curQ = survey.questions[keyQ];
                         var answers = curQ.answers;
                         console.log(JSON.stringify(answers));
                         if (answers) {
                             delete curQ.answers;
                         }
                     }
                     ciscoGlobalData.contactCollection = json;
                     me.navigateTo("contact", me.options.model);
                 }
             }

             if (json != "") {
                 var flag = 1;
                 //navigator.notification.confirm(cmsg, confirmed, ciscoGlobalData.appName);
                 /*$("#entryForm input, #entryForm select").each(function(){
                                                                      if($(this).val() != ""){
                                                                      flag = 1;
                                                                      return false;
                                                                      
                                                                      }
                        })*/

                 if (flag) {
                	 var labels = 'OK,'+langMgr.getTranslation("Cancel");
                     navigator.notification.confirm(cmsg, confirmed, ciscoGlobalData.appName,labels);
                 } else {
                     confirmed(1);
                 }
             } else {
                 customAlert("SelectContact");
             }

         },


         _lookupTrigger: function(s, e) {
             //this.navigateTo("contact", this.options.model);
             e.preventDefault();
             var lookupVal = $("#lookup_val").val();

             //min 3 characters required
             if (lookupVal.length > 2) {
                 //badgescan
                 var badgescan = this.options.model.badgescan;
                 var surveyId = this.options.model.id;
                 var me = this;

                 $("#lookup-container").addClass("loading");
                 var inputval = $("#lookup_val").val();
                 var popupInput = $(".quicksearch");

                 if (popupInput.length > 0) {
                     popupInput.hide();
                 }

                 var postData = {
                     login: atob(badgescan.username),
                     password: atob(badgescan.password),
                     idSection: badgescan.idsection,
                     idLanguage: badgescan.languageid,
                     searchPattern: "%" + inputval + "%",
                     idQuestionSearch: badgescan.idquestionsearch,
                     idQuestionOutput: badgescan.idquestionoutput
                 };


                 var networkState = navigator.connection.type;

                 if (navigator.onLine && networkState != 'none') {
                     //if(true) {
                     lookup.pull(badgescan.server, postData, function(response, error) {
                         if (response) {
                             //var userobj = JSON.parse(response);
                             var userobj = response;
                             //userobj = JSON.parse(userobj);
                             //console.log(userobj);

                             var html = "<div class='top-holder'>";
                             html += "<div class='search-holder'><input type='text' id='search-remote-box' placeholder='search' />";
                             html += "<div class='online-status'></div></div>";
                             html += "<div class='pattern-holder'><a href='#' class='button' id='remote-search'>Refresh</a><input type='checkbox' id='search-scope'/><span>Exact matches only </span></span> </div></div>";
                             html += "<div class='remote-data-holder'>";
                             html += "<div class='remote-data'><div class='total-rec'></div><ul>";
                             var count = 0;
                             $(userobj.AnswerList).each(function(i, user) {
                            	 
                            	 var checkedRecord = '';
                            	 var singleClickedClass = '';
                            	 var importNoiceVisibility = '';
                            	 //make the first record ready for clickable
                            	 if(i == 0) {
                            		 checkedRecord = " checked ";
                                	 singleClickedClass = " class='highlight_row singleclick' ";
                                	 importNoiceVisibility = " style=display:block ";
                            	 }
                            	 
                            	 
                                 var country = me._getCountryName(user.AnswerValue.countryiso);
                                 user.AnswerValue.country = country;
                                 user.AnswerValue.countryiso = country == "Unknown" ? "??" : user.AnswerValue.countryiso;
                                 
                                 var userDetails = JSON.stringify(user);
                                 userDetails = userDetails.replace(/'/g, '#!0');
                                 //console.log(userDetails);
                                 
                                 html += "<li"+ singleClickedClass +"><table class='tablesorter' id ='lookuptable'><tbody>";
                                 html += "<tr style='display:none;'><td></td><td><input" + checkedRecord + " class= 'chk-record' type='checkbox' data-record='" + userDetails + "'/></td></tr>";
                                 html += "<tr><td>First name</td><td>" + user.AnswerValue.firstname + "</td></tr>";
                                 html += "<tr><td>Last name</td><td>" + user.AnswerValue.lastname + "</td></tr>";
                                 //html += "<tr><td>Email</td><td>" + user.AnswerValue.email + "</td></tr>";
                                 html += "<tr><td>Company</td><td>" + user.AnswerValue.company + "</td></tr>";
                                 html += "</tbody></table><div class='clkimport'"+ importNoiceVisibility +">" + importNotice + "</div></li>";

                                 count++;
                             })
                             
                             
                             
                             if(count == 0 || count == 1) {
                            	 verb = " is ";
                            	 info = "";
                                 resultSingPlu = " result ";
                             } else {
                            	 verb = " are ";
                            	 info = "Please scroll to see all.";
                                 resultSingPlu = " results ";
                             }
                             
                             html += "</ul>";
                             html += "</div><div class='import'><a href='#' class='button'>Select Contact</a></div></div>";

                             $(".look-up-trigger").css('display', 'none');
                             $("#lookup-container").html(html);
                             
                             var countData = "<div class='total-rec'>There " + verb + " <b id='count-res'>" + count + "</b>"+resultSingPlu+"for this request</div>";
                             $(".total-rec").html(countData);

                             $(".qs_input, #search-remote-box").val(inputval);
                             $("#lookup-container").removeClass("loading");
                         } else {

                         }
                     });
                 } else {
                     loadingWidget.show();
                     setTimeout(function() {
                         //var userobj = localStorage.getItem("lookup_" + surveyId);
                         //userobj = JSON.parse(userobj);

                         databaseHelper.execQuery("SELECT response FROM SURVEYSDOWNLOADED WHERE surveyId=?", [surveyId], function(results, err) {
                             if (results && results.rows.length > 0) {
                                 var row = results.rows.item(0);
                                 var userobj = row.response;
                                 userobj = JSON.parse(userobj);




                                 //console.log(JSON.stringify(userobj));
                                 //console.log(localStorage.getItem("lookup_"+surveyId));
                                 //console.log(userobj.AnswerList.length)
                                 var html = "<div class='top-holder'>";
                                 html += "<div class='search-holder'><input type='text' id='search-remote-box' placeholder='search' />";
                                 html += "<div class='offline-status'></div></div>";
                                 html += "<div class='pattern-holder'><a href='#' class='button' id='remote-search'>Refresh</a><input type='checkbox' id='search-scope'/><span>Exact matches only </span></span> </div></div>";
                                 html += "<div class='remote-data-holder'>";
                                 html += "<div class='remote-data'><div class='total-rec'></div><ul>";
                                 var count = 0;
                                 $(userobj.AnswerList).each(function(i, user) {
                                	 
                                	 
                                	 //make the first record highlighted
                                	 var checkedRecord = '';
                                	 var singleClickedClass = '';
                                	 var importNoiceVisibility = '';

                                     var eValue = user.AnswerValue.email.toLowerCase();
                                     var fValue = user.AnswerValue.firstname.toLowerCase();
                                     var lValue = user.AnswerValue.lastname.toLowerCase();
                                     var cValue = user.AnswerValue.company.toLowerCase();
                                     var userInput = inputval.toLowerCase();
                                     //console.log(fValue.indexOf(userInput)!== -1);
                                     if (lValue.indexOf(userInput) !== -1 || cValue.indexOf(userInput) !== -1 || eValue.indexOf(userInput) !== -1 || fValue.indexOf(userInput) !== -1) {
                                         
                                    	 if(count == 0) {
                                    		 checkedRecord = " checked ";
                                        	 singleClickedClass = " class='highlight_row singleclick' ";
                                        	 importNoiceVisibility = " style=display:block ";
                                    	 } 
                                    	 
                                    	 var country = me._getCountryName(user.AnswerValue.countryiso);
                                         user.AnswerValue.country = country;
                                         user.AnswerValue.countryiso = country == "Unknown" ? "??" : user.AnswerValue.countryiso;

                                         html += "<li"+singleClickedClass+"><table class='tablesorter' id ='lookuptable'><tbody>";
                                         html += "<tr style='display:none;'><td></td><td><input"+checkedRecord+" class= 'chk-record' type='checkbox' data-record='" + JSON.stringify(user) + "'/></td></tr>";
                                         html += "<tr><td>First name</td><td>" + user.AnswerValue.firstname + "</td></tr>";
                                         html += "<tr><td>Last name</td><td>" + user.AnswerValue.lastname + "</td></tr>";
                                         //html += "<tr><td>Email</td><td>" + user.AnswerValue.email + "</td></tr>";
                                         html += "<tr><td>Company</td><td>" + user.AnswerValue.company + "</td></tr>";
                                         html += "</tbody></table><div class='clkimport'"+importNoiceVisibility+">" + importNotice + "</div></li>";

                                         count++;
                                     }


                                 })
                                 
                                     if(count == 0 || count == 1) {
                            	 verb = " is ";
                            	 info = "";
                                 resultSingPlu = " result ";
                             } else {
                            	 verb = " are ";
                            	 info = "Please scroll to see all.";
                                 resultSingPlu = " results ";
                             }

                                 //html += "</ul>";
                                 //html += "</div><div class='import'><a href='#' class='button'>Select Contact</a></div><div class='total-rec'>There are <b id='count-res'>" + count + "</b> results for this request, please scroll to see all.</div></div>";

                                 html += "</ul>";
                                 html += "</div><div class='import'><a href='#' class='button'>Select Contact</a></div></div>";


                                 
                                 
                                 
                                 $(".look-up-trigger").css('display', 'none');
                                 $("#lookup-container").html(html);
                                 
                                 var countData = "<div class='total-rec'>There " + verb + " <b id='count-res'>" + count + "</b>"+resultSingPlu+"for this request</div>";
                                 $(".total-rec").html(countData);

                                 $(".qs_input, #search-remote-box").val(inputval);
                                 $("#lookup-container").removeClass("loading");
                                 loadingWidget.hide();

                             }
                         })


                     }, 50);
                     /*loadingWidget.show();
                        //customAlert("OfflineDb", "OfflineDb");
                        var offlinemsg = ""; //langMgr.getTranslation("OfflineMode");
                        databaseHelper.execQuery("select * from CUSTOMER where surveyId =" + surveyId + " and (firstname like '%" + inputval + "%' or lastname like '%" + inputval + "%' or email like '%" + inputval + "%' or company like '%" + inputval + "%')", [], function (results, error) {
                            //console.log(results.rows.length);
                            if (results) {
                                var count = results.rows.length;
                                var html = "<div class='top-holder'>";
                                html += "<div class='search-holder'><input type='text' id='search-remote-box' placeholder='search' />";
                                html += "<div class='offline-status'></div></div>";
                                html += "<div class='pattern-holder'><a href='#' class='button' id='remote-search'>Refresh</a><input type='checkbox' id='search-scope'/><span>Exact matches only </span></span> </div></div>";
                                html += "<div class='remote-data-holder'>";
                                html += "<div class='remote-data'><ul>";
                                for (var i = 0; i < count; i++) {

                                    var item = results.rows.item(i);
                                    var jsonObj = {};
                                    jsonObj.IdGuid = item.IdGuid;
                                    jsonObj.TemplateString = item.TemplateString;

                                    var phone1Data = item.phone1;
                                    var phone1obj = JSON.parse(phone1Data);

                                    var phone2Data = item.phone2;
                                    var phone2obj = JSON.parse(phone2Data);

                                    var mobileData = item.mobile;
                                    var mobileobj = JSON.parse(mobileData);

                                    var faxData = item.fax;
                                    var faxobj = JSON.parse(faxData);

                                    item.phone1country = phone1obj.c;
                                    item.phone1prefix = phone1obj.p;
                                    item.phone1areacode = phone1obj.a;
                                    item.phone1number = phone1obj.n;

                                    item.phone2country = phone2obj.c;
                                    item.phone2prefix = phone2obj.p;
                                    item.phone2areacode = phone2obj.a;
                                    item.phone2number = phone2obj.n;

                                    item.mobilecountry = mobileobj.c;
                                    item.mobileprefix = mobileobj.p;
                                    item.mobileareacode = mobileobj.a;
                                    item.mobilenumber = mobileobj.n;

                                    item.faxcountry = faxobj.c;
                                    item.faxprefix = faxobj.p;
                                    item.faxareacode = faxobj.a;
                                    item.faxnumber = faxobj.n;

                                    //console.log(item.countryiso);
                                    //search country name via iso in local database
                                    var country = me._getCountryName(item.countryiso);
                                    item.country = country
                                    item.countryiso = country == "Unknown" ? "??" : item.countryiso;
                                    jsonObj.AnswerValue = item;
                                    //console.log(jsonObj);
                                    //console.log(JSON.stringify(jsonObj));

                                    //console.log("firstname: " + item.firstname + " lname: " + item.lastname);
                                    html += "<li><table class='tablesorter' id ='lookuptable'><tbody>";
                                    html += "<tr style='display:none;'><td></td><td><input class= 'chk-record' type='checkbox' data-record='" + JSON.stringify(jsonObj) + "'/></td></tr>";
                                    html += "<tr><td>First name</td><td>" + item.firstname + "</td></tr>";
                                    html += "<tr><td>Last name</td><td>" + item.lastname + "</td></tr>";
                                    //html += "<tr><td>Email</td><td>" + item.email + "</td></tr>";
                                    html += "<tr><td>Company</td><td>" + item.company + "</td></tr>";
                                    html += "</tbody></table><div class='clkimport'>"+importNotice+"</div></li>";
                                    
                                }
                                
                                html += "</ul>";
                                html += "</div><div class='import'><a href='#' class='button'>Select Contact</a></div><div class='total-rec'>There are <b id='count-res'>" + count + "</b> results for this request, please scroll to see all.</div></div>";
                                $(".look-up-trigger").css('display','none');
                                $("#lookup-container").html(html);
                                $(".qs_input, #search-remote-box").val(inputval);
                                $("#lookup-container").removeClass("loading");
                                loadingWidget.hide();
                            }

                        });*/
                 }
                 // }

             } else {
                 customAlert("Minlookupval", "Minlookupval");
             }
         },

         //override
         onNext: function(arg) {
             this.navigateTo("contact", this.options.model);
         },
         onPrev: function(arg) {
             //this.navigateTo("contactcollection", this.options.model);
        	 if($("html").hasClass("viacont")) {
                 this.navigateTo("contact", this.options.model);
             } else {
                 this.navigateTo("contactcollection", this.options.model);
             }
         },

     });
 })(jQuery);