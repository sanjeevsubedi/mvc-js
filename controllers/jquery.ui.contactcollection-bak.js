 (function ($) {
	  var fileName = "";
	  var savedImageName = "";
	  var imageFullPath = "";
	  var survey = null;
     $.widget("ui.contactcollection", $.ui.mainController, {
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
         },

         //called when widget is called with no parameter of only options after widget is created
         _init: function () {
             $.ui.mainController.prototype._init.call(this);
             masterPageController.hideNextBtn(true);
             masterPageController.hideBackBtn(true);
             masterPageController.hideComment(true);
             $(".micro-tabs").css("display","none");
             $("html").removeClass("noHeader");
             $("header").css("display","block");
             //$("html").addClass("noHeader");
             
             var searchDb = this.options.model.badgescan.value;
             if (searchDb != '1') {
                 $("#lookupdownload").css('display', 'none');
                 
             }
             $(".comment-beside-save").css("display","none");
         },
         
         _contactFormClicked: function (s,e) {
        	 this.navigateTo("contact", this.options.model);
         },
         
         _lookupClicked: function (s,e) {
        	 this.navigateTo("lookup", this.options.model);
         },

         _getCountryName: function (countryiso) {
             var returnval = "Unknown";
             $.each(countries, function (i, v) {
                 if (countryiso == v.iso) {
                     returnval = v.country;
                     return false;
                 }
             });
             return returnval;
         },
         _scanClicked: function (s, e) {


             //alert("sdf");
             var me = this;
             this.navigateTo("contact", me.options.model);
             var surveyId = me.options.model.id;
             cordova.plugins.barcodeScanner.scan(
                 function (result) {

                     /*alert("We got a barcode\n" +
                                                "Result: " + result.text + "\n" +
                                                "Format: " + result.format + "\n" +
                                                "Cancelled: " + result.cancelled);*/


                     if (result.text) {
                         /*alert("We got a barcode\n" +
                                                "Result: " + result.text + "\n" +
                                                "Format: " + result.format + "\n" +
                                                "Cancelled: " + result.cancelled);*/

                         var barcodeValue = result.text;
                         //console.log(barcodeValue);
                         // $("#entryForm input").val(result.text);
                         var splitted_val = barcodeValue.split("|");

                         //lookup value format (GUID|firstname|lastname|company|countryiso|email.....)
                         //Has predefined format
                         var lookupValue = splitted_val[0]; //GUID//"7cd05a41-3272-41b3-815f-b5238173ab95";
                         //console.log(lookupValue);

                         var badgescan = me.options.model.badgescan;
                         var postData = {
                             login: atob(badgescan.username),
                             password: atob(badgescan.password),
                             idSection: badgescan.idsection,
                             idLanguage: badgescan.languageid,
                             searchPattern: lookupValue,
                             idQuestionSearch: badgescan.idquestionsearch,
                             idQuestionOutput: badgescan.idquestionoutput
                         };


                         var networkState = navigator.connection.type;
                         //var calledTimes = 0;
                         var finalGuid = "";
                         var barcodecallback = function (response, error) {
                             //console.log("Barcode response");
                             //calledTimes ++ ;

                             $("#entryForm input[type=text]").val('');
                             //$("#commentForm textarea").text('');

                             if (navigator.onLine && networkState != 'none') {
                                 //search online
                                 console.log("Read online db");
                                 //customAlert("OnlineDb", "OnlineDb");
                                 response = response.AnswerList;
                                 var actualResponse = response[0];
                                 response = actualResponse.AnswerValue;

                                 var country = me._getCountryName(response.countryiso);
                                 response.country = country;
                                 response.TemplateString = actualResponse.TemplateString;
                                 finalGuid = actualResponse.IdGuid; 
                                 //for own record purpose
                                 response.source = "Source: Barcode Online";

                                 //console.log(response);
                             } else {
                                 //search local database
                                                 //console.log("offline");
                                                 var userobj = localStorage.getItem("lookup_"+surveyId);
                                                 userobj = JSON.parse(userobj);
                                                 
                                                 //var response = {};
                                                 var found = false;
                                                 
                                                 $(userobj.AnswerList).each(function (i, user) {
                                                                            
                                                                            var IdGuid = user.IdGuid;
                                                                            var contactId = user.AnswerValue.contactid;
                                             
                                                                            
                                                                            //console.log(IdGuid.indexOf(lookupValue)!== -1);
                                                                        if (IdGuid.indexOf(lookupValue)!== -1 || contactId.indexOf(lookupValue)!== -1) {
                                                                           
                                                                            response = user.AnswerValue;
                                                                            
                                                                            var country = me._getCountryName(response.countryiso);
                                                                            response.country = country;
                                                                            response.TemplateString = user.TemplateString;
                                                                            
                                                                            //for own record purpose
                                                                            response.source = "Source: Barcode Offline";
                                                                            found = true;
                                                                            finalGuid = IdGuid; 
                                                                            return false;
                                                                            
                                                                        }
                                                    })
                                                 
                                                 
                                                 if(!found) {
                                                 console.log("Read embedded barcode content");
                                                 var response = {};
                                                 response.firstname = splitted_val[1];
                                                 response.lastname = splitted_val[2];
                                                 response.company = splitted_val[3];
                                                 response.countryiso = splitted_val[4];
                                                 response.email = splitted_val[5];
                                                 response.phone1country = splitted_val[6];
                                                 response.phone1prefix = splitted_val[7];
                                                 response.phone1areacode = splitted_val[8];
                                                 response.phone1number = splitted_val[9];
                                                 response.salutation = splitted_val[10];
                                                 response.position = splitted_val[11];
                                                 response.mobilecountry = splitted_val[12];
                                                 response.mobileprefix = splitted_val[13];
                                                 response.mobileareacode = splitted_val[14];
                                                 response.mobilenumber = splitted_val[15];
                                                 response.title = splitted_val[16];
                                                 response.city = splitted_val[17];
                                                 response.street1 = splitted_val[18];
                                                 response.zip = splitted_val[19];
                                                 response.street2 = splitted_val[20];
                                                 response.street3 = splitted_val[21];
                                                 response.faxcountry = splitted_val[22];
                                                 response.faxprefix = splitted_val[23];
                                                 response.faxareacode = splitted_val[24];
                                                 response.faxnumber = splitted_val[25];
                                                 response.phone2country = splitted_val[26];
                                                 response.phone2prefix = splitted_val[27];
                                                 response.phone2areacode = splitted_val[28];
                                                 response.phone2number = splitted_val[29];
                                                 response.url = splitted_val[30];
                                                 response.state = splitted_val[31];
                                                 //response.country = splitted_val[32];
                                                 var country = me._getCountryName(response.countryiso);
                                                 response.countryiso = country == "Unknown" ? "??" : response.countryiso;
                                                 response.country = country;
                                                 
                                                 //for own record purpose
                                                 response.source = "Source: Barcode Content";
                                                 }

                                                 
                                                 
                                /* var count = response.rows.length;
                                 
                                 if(count == 0 && calledTimes == 1) {
									 databaseHelper.execQuery("select * from CUSTOMER where contactid = ? and surveyId = ?", [lookupValue, surveyId], barcodecallback)
                                 } else if (count > 0) {
                                     //customAlert("OfflineDb", "OfflineDb");
                                     console.log("Read local db content");
                                     response = response.rows.item(0);

                                     //prepare necessary proper
                                     var phone1Data = response.phone1;
                                     var phone1obj = JSON.parse(phone1Data);

                                     var phone2Data = response.phone2;
                                     var phone2obj = JSON.parse(phone2Data);

                                     var mobileData = response.mobile;
                                     var mobileobj = JSON.parse(mobileData);

                                     var faxData = response.fax;
                                     var faxobj = JSON.parse(faxData);

                                     response.phone1country = phone1obj.c;
                                     response.phone1prefix = phone1obj.p;
                                     response.phone1areacode = phone1obj.a;
                                     response.phone1number = phone1obj.n;

                                     response.phone2country = phone2obj.c;
                                     response.phone2prefix = phone2obj.p;
                                     response.phone2areacode = phone2obj.a;
                                     response.phone2number = phone2obj.n;

                                     response.mobilecountry = mobileobj.c;
                                     response.mobileprefix = mobileobj.p;
                                     response.mobileareacode = mobileobj.a;
                                     response.mobilenumber = mobileobj.n;

                                     response.faxcountry = faxobj.c;
                                     response.faxprefix = faxobj.p;
                                     response.faxareacode = faxobj.a;
                                     response.faxnumber = faxobj.n;
                                     var country = me._getCountryName(response.countryiso);
                                     response.countryiso = country == "Unknown" ? "??" : response.countryiso;
                                     response.country = country;

                                     //for own record purpose
                                     response.source = "Source: Barcode Offline";

                                 } else {
                                     //customAlert("BarCodeContent", "BarCodeContent");
                                     //read the embedded barcode content
                                     console.log("Read embedded barcode content");
                                     var response = {};
                                     response.firstname = splitted_val[1];
                                     response.lastname = splitted_val[2];
                                     response.company = splitted_val[3];
                                     response.countryiso = splitted_val[4];
                                     response.email = splitted_val[5];
                                     response.phone1country = splitted_val[6];
                                     response.phone1prefix = splitted_val[7];
                                     response.phone1areacode = splitted_val[8];
                                     response.phone1number = splitted_val[9];
                                     response.salutation = splitted_val[10];
                                     response.position = splitted_val[11];
                                     response.mobilecountry = splitted_val[12];
                                     response.mobileprefix = splitted_val[13];
                                     response.mobileareacode = splitted_val[14];
                                     response.mobilenumber = splitted_val[15];
                                     response.title = splitted_val[16];
                                     response.city = splitted_val[17];
                                     response.street1 = splitted_val[18];
                                     response.zip = splitted_val[19];
                                     response.street2 = splitted_val[20];
                                     response.street3 = splitted_val[21];
                                     response.faxcountry = splitted_val[22];
                                     response.faxprefix = splitted_val[23];
                                     response.faxareacode = splitted_val[24];
                                     response.faxnumber = splitted_val[25];
                                     response.phone2country = splitted_val[26];
                                     response.phone2prefix = splitted_val[27];
                                     response.phone2areacode = splitted_val[28];
                                     response.phone2number = splitted_val[29];
                                     response.url = splitted_val[30];
                                     response.state = splitted_val[31];
                                     //response.country = splitted_val[32];
                                     var country = me._getCountryName(response.countryiso);
                                     response.countryiso = country == "Unknown" ? "??" : response.countryiso;
                                     response.country = country;

                                     //for own record purpose
                                     response.source = "Source: Barcode Content";

                                 }*/
                             }
                             if (response) {
                                 $("#entryForm input").val('');
                                 if (response.firstname) {
                                     var first_name = $("input[data-barcode='first_name']");
                                     first_name.val(response.firstname);
                                     //first_name.parent().css('display','none');
                                 }

                                 if (response.lastname) {
                                     var name = $("input[data-barcode='name']");
                                     name.val(response.lastname);
                                     //name.parent().css('display','none');
                                 }


                                 if (response.company) {
                                     var company = $("input[data-barcode='company']");
                                     company.val(response.company);
                                     //company.parent().css('display','none');
                                 }

                                 if (response.city) {
                                     var city = $("input[data-barcode='city']");
                                     city.val(response.city);
                                     //city.parent().css('display','none');
                                 }

                                 if (response.title) {
                                     var title = $("input[data-barcode='title']");
                                     title.val(response.title);
                                     //title.parent().css('display','none');
                                 }

                                 if (response.salutation) {
                                     var salutation = $("input[data-barcode='salutation']");
                                     salutation.val(response.salutation);
                                     //salutation.parent().css('display','none');
                                 }

                                 if (response.position) {
                                     var position = $("input[data-barcode='position']");
                                     position.val(response.position);
                                     //position.parent().css('display','none');
                                 }

                                 if (response.street1) {
                                     var street1 = $("input[data-barcode='address']");
                                     street1.val(response.street1);
                                     //street1.parent().css('display','none');
                                 }

                                 if (response.street2) {
                                     var street2 = $("input[data-barcode='address_2']");
                                     street2.val(response.street2);
                                     //street2.parent().css('display','none');
                                 }

                                 if (response.street3) {
                                     var street3 = $("input[data-barcode='address_3']");
                                     street3.val(response.street3);
                                     //street3.parent().css('display','none');
                                 }

                                 if (response.zip) {
                                     var zip = $("input[data-barcode='zip']");
                                     zip.val(response.zip);
                                     //zip.parent().css('display','none');
                                 }

                                 if (response.state) {
                                     var state = $("input[data-barcode='state']");
                                     state.val(response.state);
                                     //state.parent().css('display','none');
                                 }

                                 if (response.url) {
                                     var url = $("input[data-barcode='url']");
                                     url.val(response.url);
                                     //url.parent().css('display','none');
                                 }

                                 if (response.email) {
                                     var email = $("input[data-barcode='email']");
                                     email.val(response.email);
                                     //email.parent().css('display','none');
                                 }

                                 if (response.contactid) {
                                     var contactid = $("input[data-barcode='contact_id']");
                                     contactid.val(response.contactid);
                                     //contactid.parent().css('display','none');
                                 }

                                 if (response.country) {
                                     var country = $("input[data-barcode='country']");
                                     country.val(response.country);
                                     //country.parent().css('display','none');
                                 }

                                 if (response.countryiso) {
                                     var countryiso = $("input[data-barcode='iso']");
                                     countryiso.val(response.countryiso);
                                     //countryiso.parent().css('display','none');
                                 }

                                 if (response.phone1country) {
                                     var phone1Cc = $("input[data-barcode='cc_phone_1']");
                                     phone1Cc.val('+' + response.phone1country);
                                 }

                                 if (response.phone1prefix) {
                                     var phone1Prefix = $("label[data-barcode='prefix_phone_1']");
                                     phone1Prefix.html(response.phone1prefix);
                                 }

                                 if (response.phone1areacode && response.phone1number) {
                                     var phone1Num = $("input[data-barcode='num_phone_1']");
                                     phone1Num.val(response.phone1areacode + response.phone1number); //concatenate
                                 }else if (response.phone1areacode) {
                                     var phone1Num = $("input[data-barcode='num_phone_1']");
                                     phone1Num.val(response.phone1areacode); 
                                 }else if (response.phone1number) {
                                     var phone1Num = $("input[data-barcode='num_phone_1']");
                                     phone1Num.val(response.phone1number);
                                 }

                                 //phone2
                                 if (response.phone2country) {
                                     var phone2Cc = $("input[data-barcode='cc_phone_2']");
                                     phone2Cc.val('+' + response.phone2country);
                                 }

                                 if (response.phone2prefix) {
                                     var phone2Prefix = $("label[data-barcode='prefix_phone_2']");
                                     phone2Prefix.html(response.phone2prefix);
                                 }

                                 if (response.phone2areacode && response.phone2number) {
                                     var phone2Num = $("input[data-barcode='num_phone_2']");
                                     phone2Num.val(response.phone2areacode + response.phone2number); //concatenate
                                 }else if (response.phone2areacode) {
                                     var phone2Num = $("input[data-barcode='num_phone_2']");
                                     phone2Num.val(response.phone2areacode);
                                 }else if (response.phone2number) {
                                     var phone2Num = $("input[data-barcode='num_phone_2']");
                                     phone2Num.val(response.phone2number); 
                                 }

                                 //mobile
                                 if (response.mobilecountry) {
                                     var mobileCc = $("input[data-barcode='cc_mobile']");
                                     mobileCc.val('+' + response.mobilecountry);
                                 }

                                 if (response.mobileprefix) {
                                     var mobilePrefix = $("label[data-barcode='prefix_mobile']");
                                     mobilePrefix.html(response.mobileprefix);
                                 }

                                 if (response.mobileareacode && response.mobilenumber) {
                                     var mobileNum = $("input[data-barcode='num_mobile']");
                                     mobileNum.val(response.mobileareacode + response.mobilenumber); //concatenate
                                 }else if (response.mobileareacode) {
                                     var mobileNum = $("input[data-barcode='num_mobile']");
                                     mobileNum.val(response.mobileareacode); 
                                 }else if (response.mobilenumber) {
                                     var mobileNum = $("input[data-barcode='num_mobile']");
                                     mobileNum.val(response.mobilenumber); 
                                 }

                                 //fax
                                 if (response.faxcountry) {
                                     var faxCc = $("input[data-barcode='cc_fax']");
                                     faxCc.val('+' + response.faxcountry);
                                 }

                                 if (response.faxprefix) {
                                     var faxPrefix = $("label[data-barcode='prefix_fax']");
                                     faxPrefix.html(response.faxprefix);
                                 }

                                 if (response.faxareacode && response.faxnumber) {
                                     var faxNum = $("input[data-barcode='num_fax']");
                                     faxNum.val(response.faxareacode + response.faxnumber); //concatenate
                                 }else if (response.faxareacode) {
                                     var faxNum = $("input[data-barcode='num_fax']");
                                     faxNum.val(response.faxareacode); 
                                 }else if (response.faxnumber) {
                                     var faxNum = $("input[data-barcode='num_fax']");
                                     faxNum.val(response.faxnumber); 
                                 }


                                 //insert the value in the comment tab
                                 var newTemplateString = response.TemplateString ? response.TemplateString + "\n" + response.source : "\n" + response.source;
                                 $("#commentForm textarea").html(newTemplateString);
                                 
                                 
                                 //reset the previous answers
                                 for (var keyQ in survey.questions) {
                                     var curQ = survey.questions[keyQ];
                                     var answers = curQ.answers;
                                     //console.log(JSON.stringify(answers));
                    	             if (answers) {
                    	            	 delete curQ.answers; 
                    	            }
                                 }

                             }
                             
                             //create hidden guid
                             var guidElement = $('<input type="hidden"/>');
                             guidElement.attr("name", "guid-eventmonitor");
                             guidElement.attr("value", finalGuid);
                             $("#entryForm input[name='guid-eventmonitor']").hide();
                             $("#entryForm").append(guidElement);

                         }

                         if (navigator.onLine && networkState != 'none') {

                             barcode.pull(badgescan.server, postData, barcodecallback);

                         } else {
                                                 var response = {};
                                                 barcodecallback(response, null);
                             //alert("read offline barcode")
                            // databaseHelper.execQuery("select * from CUSTOMER where IdGuid = ? and surveyId = ?", [lookupValue, surveyId], barcodecallback)
                         }


                         //create hidden guid
                        /* var guidElement = $('<input type="hidden"/>');
                         guidElement.attr("name", "guid-eventmonitor");
                         guidElement.attr("value", lookupValue);
                         $("#entryForm input[name='guid-eventmonitor']").hide();
                         $("#entryForm").append(guidElement);*/

                     }
                 },
                 function (error) {
                     alert("Scanning failed: " + error);
                 });


         },
         _cameraSuccess: function (imageUri) {
             var me = this;
             console.log("camera success: " + imageUri);
             filesystemHelper.getFile(imageUri, function (file) {
                 console.log("got image file");
                 setTimeout(function () {
                     /*if (fileName == "") {
                         if (me.options.model.contactInfo && me.options.model.contactInfo.imageName && me.options.model.contactInfo.imageName != "") {
                             fileName = me.options.model.contactInfo.imageName;
                         } else {*/
                             fileName = "Pic_" + ciscoDeviceId + "_" + ((new Date()) * 1) + ".jpeg";
                         /*}
                     }*/
                     var imagePath = "Cisco/pictures/" + fileName;
                     console.log(imagePath);
                     file.moveTo(imagePath, function (entity) {
                         if (entity) {
                             savedImageName = entity.name;
                             imageFullPath = appFolderPath+entity.fullPath;
                             var imageData = {"imageName":entity.name, "imageFullPath":imageFullPath + "?" + ((new Date()) * 1),"imgPath":imageFullPath};
                             me.options.model.cameraInfo = imageData;
                             
                             if (me.options.model.contactInfo && me.options.model.contactInfo.imageName && me.options.model.contactInfo.imageName != "") {
                            	 me.options.model.contactInfo.imageName = savedImageName;
                            	 me.options.model.contactInfo.imageFullPath = imageFullPath;
                            }

                            
                             customAlert("ImageSaved");
                             me.navigateTo("contact", me.options.model);
                         } else {
                             savedImageName = "";
                             imageFullPath = "";
                             me.options.model.cameraInfo = "";
                             customAlert("ImageNotSaved");
                         }
                     });
                 }, 200);
             }, true, true);
         },
         _cameraError: function (message) {
             setTimeout(function () {
                 customAlert("CameraFailed", message);
             }, 10);
         },
         _captureCardClicked: function (s, e) {
             var me = this;
            //this.navigateTo("contact", me.options.model);
             navigator.camera.getPicture($.proxy(this._cameraSuccess, this), $.proxy(this._cameraError, this), {
                 quality: 75,
                 targetWidth: 500,
                 targetHeight: 500,
                 destinationType: Camera.DestinationType.DATA_FILE
             });
         },
         _lookupDownloadClicked: function (sender, e) {
             
         //alert("sss");
         var badgescan = this.options.model.badgescan;
         //console.log(badgescan);
         var postData = {
         login: atob(badgescan.username),
         password: atob(badgescan.password),
         idSection: badgescan.idsection,
         idLanguage: badgescan.languageid,
         searchPattern: '%',
         idQuestionSearch: badgescan.idquestionsearch,
         idQuestionOutput: badgescan.idquestionoutput,
         server : badgescan.server
         };
         
         //console.log("aaa");
         //console.log(postdata);
         var surveyId = this.options.model.id;
         var msg = langMgr.getTranslation("LookupConfirmed");
         /*var postData = {
          login: "AppUser1",
          password: "APIReg!1",
          idSection: "1",
          idLanguage: "1",
          searchPattern: "%",
          idQuestionSearch: "1",
          idQuestionOutput: "1"
          };*/
         
         //console.log(postdata);
         //console.log(postData);
         var server = postData.server;
         //console.log(server);
         var confirmed = function (buttonIndex) {
         if (buttonIndex == 1) {
         var networkState = navigator.connection.type;
         
         if (navigator.onLine && networkState != 'none') {
         
         lookup.pull(server, postData, function (response, error) {
                     if (response) {
                     var data = JSON.stringify(response);
                     localStorage.setItem("lookup_"+surveyId, data);
                     
                     //console.log(localStorage.getItem("lookup_"+surveyId));
                     databaseHelper.execQuery("DELETE FROM CUSTOMER where surveyId = ?", [surveyId], function () {
                                              jQuery(response.AnswerList).each(function (i, value) {
                                                                               //console.log(results.insertId);
                                                                               var contactid = value.AnswerValue.contactid ? value.AnswerValue.contactid : "";
                                                                               var firstname = value.AnswerValue.firstname ? value.AnswerValue.firstname : "";
                                                                               var lastname = value.AnswerValue.lastname ? value.AnswerValue.lastname : "";
                                                                               var title = value.AnswerValue.title ? value.AnswerValue.title : "";
                                                                               var salutation = value.AnswerValue.salutation ? value.AnswerValue.salutation : "";
                                                                               var company = value.AnswerValue.company ? value.AnswerValue.company : "";
                                                                               var position = value.AnswerValue.position ? value.AnswerValue.position : "";
                                                                               var country = value.AnswerValue.country ? value.AnswerValue.country : "";
                                                                               var countryiso = value.AnswerValue.countryiso ? value.AnswerValue.countryiso : "";
                                                                               var street1 = value.AnswerValue.street1 ? value.AnswerValue.street1 : "";
                                                                               var street2 = value.AnswerValue.street2 ? value.AnswerValue.street2 : "";
                                                                               var street3 = value.AnswerValue.street3 ? value.AnswerValue.street3 : "";
                                                                               var zip = value.AnswerValue.zip ? value.AnswerValue.zip : "";
                                                                               var city = value.AnswerValue.city ? value.AnswerValue.city : "";
                                                                               var state = value.AnswerValue.state ? value.AnswerValue.state : "";
                                                                               var email = value.AnswerValue.email ? value.AnswerValue.email : "";
                                                                               var url = value.AnswerValue.url ? value.AnswerValue.url : "";
                                                                               //phone1
                                                                               var phone1obj = {};
                                                                               phone1obj.c = value.AnswerValue.phone1country ? value.AnswerValue.phone1country : "";
                                                                               phone1obj.p = value.AnswerValue.phone1prefix ? value.AnswerValue.phone1prefix : "";
                                                                               phone1obj.a = value.AnswerValue.phone1areacode ? value.AnswerValue.phone1areacode : "";
                                                                               phone1obj.n = value.AnswerValue.phone1number ? value.AnswerValue.phone1number : "";
                                                                               var phone1 = JSON.stringify(phone1obj);
                                                                               
                                                                               //phone2
                                                                               var phone2obj = {};
                                                                               phone2obj.c = value.AnswerValue.phone2country ? value.AnswerValue.phone2country : "";
                                                                               phone2obj.p = value.AnswerValue.phone2prefix ? value.AnswerValue.phone2prefix : "";
                                                                               phone2obj.a = value.AnswerValue.phone2areacode ? value.AnswerValue.phone2areacode : "";
                                                                               phone2obj.n = value.AnswerValue.phone2number ? value.AnswerValue.phone2number : "";
                                                                               var phone2 = JSON.stringify(phone2obj);
                                                                               
                                                                               //mobile
                                                                               var mobileobj = {};
                                                                               mobileobj.c = value.AnswerValue.mobilecountry ? value.AnswerValue.mobilecountry : "";
                                                                               mobileobj.p = value.AnswerValue.mobileprefix ? value.AnswerValue.mobileprefix : "";
                                                                               mobileobj.a = value.AnswerValue.mobileareacode ? value.AnswerValue.mobileareacode : "";
                                                                               mobileobj.n = value.AnswerValue.mobilenumber ? value.AnswerValue.mobilenumber : "";
                                                                               var mobile = JSON.stringify(mobileobj);
                                                                               
                                                                               //fax
                                                                               var faxobj = {};
                                                                               faxobj.c = value.AnswerValue.faxcountry ? value.AnswerValue.faxcountry : "";
                                                                               faxobj.p = value.AnswerValue.faxprefix ? value.AnswerValue.faxprefix : "";
                                                                               faxobj.a = value.AnswerValue.faxareacode ? value.AnswerValue.faxareacode : "";
                                                                               faxobj.n = value.AnswerValue.faxnumber ? value.AnswerValue.faxnumber : "";
                                                                               var fax = JSON.stringify(faxobj);
                                                                               
                                                                               //var IdQuestion = value.IdQuestion;
                                                                               //var IdSession = value.IdSession;
                                                                               var IdGuid = value.IdGuid;
                                                                               var TemplateString = value.TemplateString;
                                                                               
                                                                               
                                                                               databaseHelper.execQuery("INSERT INTO CUSTOMER (contactid, firstname, lastname, title, salutation, company, position, country, countryiso, street1, street2, street3, zip, city, state, email, url, phone1, phone2, mobile, fax, IdGuid, TemplateString, downloadedOn, surveyId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [contactid, firstname, lastname, title, salutation, company, position, country, countryiso, street1, street2, street3, zip, city, state, email, url, phone1, phone2, mobile, fax, IdGuid, TemplateString, ((new Date()) * 1), surveyId], function (results, err) {
                                                                                                        /*if (results && results.rowsAffected > 0) {
                                                                                                        
                                                                                                        databaseHelper.execQuery("select * from CUSTOMER", [], function (results, error) {
                                                                                                                                 console.log(results.rows.length);
                                                                                                                                 //console.log(results.rows.item(0).IdGuid);
                                                                                                                                 
                                                                                                                                 });
                                                                                                        }*/
                                                                                                        
                                                                                                        })
                                                                               
                                                                               })
                                              
                                              /*loadingWidget.show();
                                              jQuery(".progress").html('Indexing database for good performance.<br>It might take several minutes.').css({'margin-top':'10px','width':'165px'});

                                              databaseHelper.execQuery("select surveyId from CUSTOMER where surveyId= ?", [surveyId], function (results, error) {
                                                                       
                                                                       customAlert("LookupDataDownloaded");
                                                                       loadingWidget.hide();
                                                                       
                                                                       })*/
                                              
                                              
                                              customAlert("LookupDataDownloaded");
                                              })
                     }
                     })
         
         } else {
         customAlert("CheckInternetLookup");
         }
         
         }
         }
         navigator.notification.confirm(msg, confirmed, ciscoGlobalData.appName);
         },
         
         _settingsMiniClicked: function () {
           var me = this;
       	   var msg = langMgr.getTranslation("GoToSettings");
              navigator.notification.confirm(msg,
                  function (buttonIndex) {
                      if (buttonIndex == 1) {
                    	  me.navigateTo('miniSettings', me.options.model);
                      }

                  },ciscoGlobalData.appName);
         },
         
         //override
         onNext: function (arg) {
             this.navigateTo("contact", this.options.model);
         },
         onPrev: function (arg) {
             window.location = "index.html";
         },

     });
 })(jQuery);