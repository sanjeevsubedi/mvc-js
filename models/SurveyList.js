function SurveyList() {
    var $ = jQuery;
    var fullPath = "";
    var clrs;
    this.getData = function (loadedCallback) {
        var me = this;
        if (isPhoneGap) {
            filesystemHelper.getFile("Cisco/surveys/survey_list_"+ciscoGlobalData.curUser.id+".json", function (file) {
                if (file != null && file.getFileLength()>0) {
                    //console.log("survey list available");
                    me.loadLocalFile(file.getFullPath(), loadedCallback);
                }
                else {
                    //console.log("survey list not available");
                    FiletransferHelper.downloadFile(baseServerPath + "/client?method=list_survey&uid=" + ciscoGlobalData.curUser.id, "Cisco/surveys/survey_list_"+ciscoGlobalData.curUser.id+".json", function (path) {
                        if (path == null) {
                            
                        	//alert("Couldn't get survey list.");
                        	
                        	clrs = setInterval(function(){
                        		customAlert("SurveyListError");
                        		window.location = "index.html"; 
                        	}, 5000);
                        	
                            
                        	loadingWidget.hide();
                        }
                        else {
                        	clearInterval(clrs);
                            me.loadLocalFile(path, loadedCallback);
                        }
                    });
                }
            }, false);
        }
        else {
            me.loadLocalFile("xml/surveylist.json", loadedCallback);
        }
    }

    this.loadLocalFile = function (url, loadedCallback) {
        $.ajax({
            url: appFolderPath+url + "?" + ((new Date) * 1),
            type: "GET",
            dataType: "text",
            context: this,
            timeout:5000,
            success: function (resp) {
                loadedCallback(eval("(" + resp + ")"));
            },
            /*error: function (e, m) {
                alert("Load Survey List: " + m);
            }*/
            error: function(x, t, m) {
                if(t==="timeout") {
                	 customAlert("ConnectionTimeOut");
                    $.ajax(this);
                } else {
                	customAlert("ConnectionError");
                	$.ajax(this);
                	/*clrs = setInterval(function(){
                		$.ajax(this); }, 5000);*/
                	
                }
            }
        });
    }

    

}

var surveyList = new SurveyList();