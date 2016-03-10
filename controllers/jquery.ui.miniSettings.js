var settingsController = null;
(function ($) {
    var uploadInProgress = false;

    /*
    Response statauses
    1 = New
    2 = Marked for copying to file
    3 = copied to file
    4 = uploaded
    */

    $.widget("ui.miniSettings", $.ui.mainController, {
        //defaul options
        options: {
            model: null //model needed by this controller/view            
        },
        //constructor
        _create: function () {
            $.ui.mainController.prototype._create.call(this);
            survey = masterPageController._survey;
            settingsController = this;
            
        },
        //called when widget is called with no parameter of only options after widget is created 
        _init: function () {
             var me = this;
            $.ui.mainController.prototype._init.call(this);
            masterPageController.logoPlaceHolder(false);
            masterPageController.hideNextBtn(true);
            masterPageController.hideBackBtn(true);
            masterPageController.hideComment(true);
            $(".micro-tabs, .trash-top").css("display","none");
            $("html").addClass("noNav");
            $(".moreOptions").show();
           
            
            me._calculatePedingSurveys();
             
           /* if(!this.element.data("initCalled")){
             this.element.data("initCalled", true);
                if (!localStorage.serverIp || localStorage.serverIp == "") {
              
                    var callback = function (valid) {
                        if (!valid) {
                            me._changeServerIp(callback);
                        }
                        else {
                            window.location = "index.html"
                        }
                    }
                    this._changeServerIp(callback);
             }
            }*/
            
           
            
            
        },
        _newContactClicked:function () {
        	//window.location = "index.html?surveyId=" + ciscoGlobalData.curSurveyId;
        	delete this.options.model.cardImageName;
            delete this.options.model.responses;
        	delete this.options.model.contactInfo;
            delete this.options.model.commentInfo;
            delete this.options.model.newcontactInfo;
            delete this.options.model.cameraInfo;
            delete ciscoGlobalData.contactCollection; //remove old contact data 
            $("#commentForm textarea").html("");
        	this.navigateTo("contactcollection", survey);
        },
        _surveyListClicked: function () {
            //this.navigateTo("surveyList", null);
            window.location = "index.html";
        },
        _logoutClicked: function () {
            localStorage.userInfo = "";
            window.location = "index.html";
        },
        _historyClicked: function (s, e) {
            e.preventDefault();
            this.navigateTo("responseHistory", null);
        },
        _uploadLocal: function(){


                    var networkState = navigator.connection.type;

                    if (navigator.onLine && networkState != 'none') {
                        var me = this;
                        databaseHelper.execQuery("DELETE FROM SURVEYSDOWNLOADED", [], function () {
                            filesystemHelper.getDirRecursively("Cisco/surveys/" + me._responseTxtFilename, function (dir) {
                                console.log("gotdir callback");
                                if (dir) {
                                    dir.removeRecursively(function () {
                                            console.log("delete sucess");
                                            
                                            localStorage.serverPathSavedOn = "";
                                            localStorage.baseServerPath = mainServer;
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

     


            /*this._serverPath = "http://" + localStorage.serverIp + "/meplan";
            this._upload();*/
        	/*var me = this;
        	 if (localStorage.serverIp && localStorage.serverIp != "") {
        		 this._serverPath = "http://" + localStorage.serverIp + "/meplan";
                 this._upload();
        	 }else {
        		 var callback = function (valid) {
                     if (valid) {
                    	me._serverPath = "http://" + localStorage.serverIp + "/meplan";
                        me._upload();
                     }
                     else {
                     }
                 }
                 this._changeServerIp(callback);
        	 }*/
        },
        _uploadOnline: function () {
            this._serverPath = baseServerPath;
            //this._upload();
            var networkState = navigator.connection.type;
            if (navigator.onLine && networkState != 'none') {
            	this._upload();
            } else {
            	 customAlert("CheckInternetUpload");
            }
        },
        _upload: function (s, e) {
            var me = this;
            if (!uploadInProgress) {
                uploadInProgress = true;
                this._createFile(function () {
                    me._uploadResponse();
                });
            }
            else {
                customAlert("UploadInPrg");
            }
        },
        _uploadResponse: function () {
        	var me = this;
        	loadingWidget.show("UploadingResponse");
        	FiletransferHelper.uploadTextFile("Cisco/responses/" + me._responseTxtFilename, me._serverPath + "/client?method=upload_survey_data"
            	, function(success){
            		if(success){
            		    console.log("Result uploaded sucessfully.");
            		    databaseHelper.execQuery("UPDATE RESPONSE SET STATUS=4, response='' WHERE STATUS=3", [], function () {
            		        me._uploadImages();
            		    });
            		}
            		else{
            			customAlert("UploadFailed");
            			loadingWidget.hide();
            			uploadInProgress = false;
            			//me._uploadImages();
            		}
            	});
            
        },
        _createFile: function (callback) {
            var me = this;
            me._responseTxtFilename = ciscoDeviceId + "_" + ((new Date()) * 1) + ".txt";
            if (isPhoneGap) {                
                var selectQueryExecuted = function (results, err) {
                    if (results.rows.length > 0) {
                        loadingWidget.show("PreparingResp");
                        console.log("Cisco/responses/" + me._responseTxtFilename);
                        filesystemHelper.getFile("Cisco/responses/" + me._responseTxtFilename, function (file) {
                            if (file) {
                                var funcLoop = function () {
                                    if (file.isWriterAvailable()) {
                                        var saveText = "[";
                                        for (var i = 0; i < results.rows.length; i++) {
                                            var resp = results.rows.item(i);
                                            
                                            /* uploaded date added*/
                                            /*var newResp = JSON.parse(resp.response);
                                            newResp.surveyTakenAt = resp.surveyTakenAt;
                                            var newRespStr = JSON.stringify(newResp);
                                            */
                                            
                                            saveText += ((i > 0 ? "," : "") + resp.response);
                                            /*if (saveText.length > 2000) {
                                                console.log("size limit exceeded");
                                                file.saveText(saveText);
                                                saveText = "";
                                            }*/
                                        }
                                        saveText += "]";
                                        file.saveText(saveText);
                                        databaseHelper.execQuery("UPDATE RESPONSE SET status=3 WHERE STATUS=2", [], function () {
                                            if (callback) {
                                                callback();
                                            }
                                        });
                                    }
                                    else {
                                        setTimeout(funcLoop, 100);
                                    }
                                }
                                funcLoop();
                            }
                            else {
                                uploadInProgress = false;
                                loadingWidget.hide();
                            }
                        });
                    }
                    else {
                        //uploadInProgress = false;
                        me._uploadImages();
                    }

                };

                var updateQueryExecuted = function () {
                    databaseHelper.execQuery("SELECT * FROM RESPONSE WHERE STATUS=2", [], selectQueryExecuted);
                }
                filesystemHelper.getFile("Cisco/responses/" + me._responseTxtFilename, function (file) {
                    if (file) {
                        file.deleteFile();
                    }
                    databaseHelper.execQuery("UPDATE RESPONSE SET status=2 WHERE STATUS<>4", [], updateQueryExecuted);
                }, true);
                
            }
        },
        _uploadImages: function(){
            console.log("in uploadImages");
            var me = this;
        	filesystemHelper.getDir("Cisco/pictures/", function(dirEntry){
        		console.log("got dir " + dirEntry);                                    
        		if (dirEntry != null) {
        		    function success(entries) {
        		        //var i;
        		        var uploading = 0;
        		        var uploaded = 0;
        		        var failed = 0;
        		        var fileCount = entries.length;
        		        if (fileCount == 0) {
        		            loadingWidget.hide();
        		            uploadInProgress = false;
        		            me._callbackSuccessUpload();
        		            //customAlert("UploadSuccess", "UploadSuccess");
        		            return;
        		        }
        		        loadingWidget.show("UploadingImage", [0, fileCount]);
        		        var uploadImageAt = function (i) {
        		            console.log("Images qued: " + i);
        		            if (uploading < 5) {
        		                var entry = entries[i];

        		                if (entry.isFile) {
        		                    uploading++;
        		                    FiletransferHelper.uploadImageFile(entry, me._serverPath + "/client?method=upload_card_image"
			        	                	, function (success) {
			        	                	    uploading--;
			        	                	    if (success) {
			        	                	        uploaded++;
			        	                	        console.log("Uploaded " + entry.fullPath);
			        	                	    }
			        	                	    else {
			        	                	        failed++;
			        	                	        console.log("Upload failed " + entry.fullPath);
			        	                	    }
			        	                	    var msg = langMgr.getTranslation("UploadingImage", [uploaded, fileCount]);
			        	                	    if (failed > 0) {
			        	                	        msg += " (" + failed + " "+ langMgr.getTranslation("Failed") +")";
			        	                	    }
			        	                	    loadingWidget.showText(msg);
			        	                	});

        		                }
        		                i++;
        		            }
        		            if (i >= fileCount) {
        		                var checkUploaded = function () {
        		                    //console.log("Check upload");
        		                    //console.log("Length: " + fileCount + " Uploaded" + uploaded + " failed " + failed );
        		                    if (fileCount <= (uploaded + failed)) {
        		                        loadingWidget.hide();
        		                        uploadInProgress = false;
        		                        me._callbackSuccessUpload();
        		                        //customAlert("UploadSuccess", "UploadSuccess");
        		                    }
        		                    else {
        		                        setTimeout(checkUploaded, 1000);
        		                    }
        		                };
        		                checkUploaded();
        		            }
        		            else {
        		                setTimeout(function () { uploadImageAt(i); }, 1000);
        		            }

        		        }
        		        if (fileCount > 0) {
        		            uploadImageAt(0);
        		        }



        		    }

        		    function fail(error) {
        		        //customAlert("Failed to list directory contents: " + error.code);
        		        loadingWidget.hide();
        		        uploadInProgress = false;
        		    }

        		    // Get a directory reader
        		    var directoryReader = dirEntry.createReader();

        		    // Get a list of all the entries in the directory
        		    directoryReader.readEntries(success, fail);
        		}
        		else {
        			me._callbackSuccessUpload();
        		    uploadInProgress = false;
        		    loadingWidget.hide();
        		}
        	});
        },        
        _changeResponseClicked: function (s, e) {
            var me = this;
            loadingWidget.show();
            
            if (isPhoneGap) {
                databaseHelper.execQuery("SELECT id, email, surveyTakenAt, response from RESPONSE WHERE surveyId = ? AND STATUS<>4", [ciscoGlobalData.curSurveyId], function (results, err) {
                    if (results) {
                        var context = [];
                        for (var i = 0; i < results.rows.length; i++) {
                            var item = results.rows.item(i);
                            var resData = JSON.parse(item.response)
                            item.cardImageName = resData.cardImageName;
                            item.imageFullPath = resData.contactInfo.imageFullPath;


                            var email = item.email ? item.email  : "";
                            var firstName = resData.contactInfo.first_name ? resData.contactInfo.first_name : "";
                            var lastName = resData.contactInfo.last_name ? resData.contactInfo.last_name : "";
                            var company = resData.contactInfo.company ? resData.contactInfo.company : "";
                                         
                            item.newemail = email + '_' + firstName + '_' + lastName + '_' + company;


                            //item.newemail = item.email + '_' + resData.contactInfo.first_name + '_' + resData.contactInfo.last_name + '_' + resData.contactInfo.company;
                            console.log("id: " + item.id + " card: " + resData.contactInfo.imageFullPath);
                            //item.imageFullPath = item.contactInfo.imageFullPath;
                            //console.log("id: " + item.id + " email: " + item.email);
                            context.push(item);
                            
                            
                            /*imagePath =  "Cisco/pictures/" + resData.cardImageName;
                            
                            if(resData.cardImageName) {
                                
                                filesystemHelper.getFile(imagePath, function (file) {
                                                         file.getFullPath()
                                                         imageFullPath = appFolderPath+file.getFullPath();
                                                         item.imageFullPath = imageFullPath;
                                                         context.push(item);
                                                        
                                                         }, true);
                                
                                } else {
                                     item.imageFullPath = "";
                                     context.push(item);
                                }*/
                        }
                        me.navigateTo("responseList", context);
                        loadingWidget.hide();
                    }
                });
            }
            else {
                var fakeRespList = [
                    { id: "1", email: "usr1@cisco.com", surveyTakenAt: "" + ((new Date()) * 1 - 24.3 * 60 * 60 * 1000), status: "2" },
                    { id: "2", email: "usr2@cisco.com", surveyTakenAt: "" + ((new Date()) * 1 - 22.22 * 60 * 60 * 1000), status: "2" },
                    { id: "3", email: "usr3@cisco.com", surveyTakenAt: "" + ((new Date()) * 1 - 12.6 * 60 * 60 * 1000), status: "2" },
                    { id: "4", email: "usr4@cisco.com", surveyTakenAt: "" + ((new Date()) * 1 - 10.5 * 60 * 60 * 1000), status: "2" },
                    { id: "5", email: "usr5@cisco.com", surveyTakenAt: "" + ((new Date()) * 1 - 5.1 * 60 * 60 * 1000), status: "0" },
                    { id: "6", email: "usr6@cisco.com", surveyTakenAt: "" + ((new Date()) * 1 - 3.66 * 60 * 60 * 1000), status: "0" },
                    { id: "7", email: "usr7@cisco.com", surveyTakenAt: "" + ((new Date()) * 1 - .2 * 60 * 60 * 1000), status: "0" }
                ];

                me.navigateTo("responseList", fakeRespList);
                loadingWidget.hide();
            }
        },
        _changeServerClicked: function (s, e) {
             console.log("server changed");
            
            this._changeServerIp(function(response){

                if(response){


                     var networkState = navigator.connection.type;

                    if (navigator.onLine && networkState != 'none') {
                        var me = this;
                        databaseHelper.execQuery("DELETE FROM SURVEYSDOWNLOADED", [], function () {
                            filesystemHelper.getDirRecursively("Cisco/surveys/" + me._responseTxtFilename, function (dir) {
                                console.log("gotdir callback");
                                if (dir) {
                                    dir.removeRecursively(function () {
                                            console.log("delete sucess");
                                            
                                            localStorage.serverPathSavedOn = "";
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
            });
        },
        _changeServerIp: function (callback) {
            loadingWidget.show();
             if(!callback){
                callback = function(){};
             }
            var msg = langMgr.getTranslation("EnterIp")
            var promptCallback = function (results) {
                //alert("ri: " + results.buttonIndex + ", inp: " + results.input );
                if (results.buttonIndex == 1 && results.input != "") {
                    var ip = results.input1;
                    //alert(ip);
                    //if (ip != "" && /\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/.test(ip)) {
                      
                    var pattern = /^[a-z0-9-\.]+\.[a-z]{2,4}/;

                    if(pattern.test(ip)) {

                        localStorage.serverIp = ip;
                        //baseServerPath = getBasePath();
                        baseServerPath = "http://" + localStorage.serverIp + "/exporm";
                        localStorage.setItem('baseServerPath', baseServerPath);
                        localStorage.backupServer = false;
                        callback(true);
                    }
                    else {
                        customAlert("InvalidIp", function () {
                            callback(false);
                        });

                    }
                }
                else {
                    callback(false);
                }

                loadingWidget.hide();
            }
            navigator.notification.prompt(msg, promptCallback, ciscoGlobalData.appName);
             
             
        },
        _uploadTemp: function (s, e) {
            e.preventDefault();
            uploadInProgress = true;
            this._serverPath = baseServerPath;
            var me = this;
            filesystemHelper.getDir("Cisco/tempResponses/", function (dirEntry) {
                console.log("got dir " + dirEntry);
                if (dirEntry != null) {
                    function success(entries) {
                        var uploading = 0;
                        var uploaded = 0;
                        var failed = 0;
                        var fileCount = entries.length;
                        if (fileCount == 0) {
                            loadingWidget.hide();
                            uploadInProgress = false;
			    customAlert("UploadSuccess", "UploadSuccess");
                            return;
                        }
                        loadingWidget.show("UploadingText", [0, fileCount]);
                        var uploadImageAt = function (i) {
                            console.log("Text files qued: " + i);
                            if (uploading ==0) {
                                var entry = entries[i];

                                if (entry.isFile) {
                                    uploading++;
                                    FiletransferHelper.uploadTextFile(entry, "http://192.168.1.62/cisco/client.php?access=url.com"
			        	                	, function (success) {
			        	                	    uploading--;
			        	                	    if (success) {
			        	                	        uploaded++;
			        	                	        console.log("Uploaded " + entry.fullPath);
			        	                	    }
			        	                	    else {
			        	                	        failed++;
			        	                	        console.log("Upload failed " + entry.fullPath);
			        	                	    }
			        	                	   
			        	                	    var msg = langMgr.getTranslation("UploadingText", [uploaded, fileCount]);
			        	                	    if (failed > 0) {
			        	                	        msg += " (" + failed + " " + langMgr.getTranslation["Failed"] + ")";
			        	                	    }
			        	                	    loadingWidget.show(msg);
			        	                	});

                                }
                                i++;
                            }
                            if (i >= fileCount) {
                                var checkUploaded = function () {
                                    //console.log("Check upload");
                                    //console.log("Length: " + fileCount + " Uploaded" + uploaded + " failed " + failed );
                                    if (fileCount <= (uploaded + failed)) {
                                        loadingWidget.hide();
                                        uploadInProgress = false;
                                        customAlert("UploadSuccess", "UploadSuccess");
                                    }
                                    else {
                                        setTimeout(checkUploaded, 1000);
                                    }
                                };
                                checkUploaded();
                            }
                            else {
                                setTimeout(function () { uploadImageAt(i); }, 1000);
                            }

                        }
                        if (fileCount > 0) {
                            uploadImageAt(0);
                        }
                    }

                    function fail(error) {
                        //customAlert("Failed to list directory contents: " + error.code);
                        loadingWidget.hide();
                        uploadInProgress = false;
                    }

                    // Get a directory reader
                    var directoryReader = dirEntry.createReader();

                    // Get a list of all the entries in the directory
                    directoryReader.readEntries(success, fail);
                }
                else {
                    uploadInProgress = false;
                    loadingWidget.hide();
                }
            });           

        },
        onPrev: function (arg) {
        	 this.navigateTo('contactcollection', this.options.model);
            //window.location = "index.html";
        },
        
        _callbackSuccessUpload: function() {
        	var pendElem = $("#pendingResponses");
        	
        	window.plugin.notification.local.cancelAll();
        	localStorage.removeItem('notification');
             
            pendElem.removeClass("red-banner");
            pendElem.addClass("green-banner");
            pendElem.html(langMgr.getTranslation("PendMsg"));
        	customAlert("UploadSuccess", "UploadSuccess");
        	$(".success-icon").show();
        	$(".contact-details").html("<b>Upload successful</b>");
    	   $("#full_name, #firstName, #lastName, #email, #company, .contact-details #cardStatus, .failed-icon").hide();
    	   collectionController._setBarCodeContent('');
           delete ciscoGlobalData.scan;
        },
        //destructor
        destroy: function () {
            $.Widget.prototype.destroy.call(this);
        },
        _responseTxtFilename: "",
        _serverPath: ""
    });
})(jQuery);
