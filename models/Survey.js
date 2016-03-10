function Survey() {
    var $ = jQuery;
    this.questions = new Array();
    this.allDocs = new Array();
    this.salesmen = new Array();
    this.loadXML = function (loadedCallback, fullpath) {
        //alert(fullpath);
        $.ajax({
            url: appFolderPath+fullpath + "?" + ((new Date) * 1),
            type: "GET",
            dataType: "text",
            context: this,
            timeout:5000,
            success: function (resp) {
                this.parseSurveyXml(resp, loadedCallback);
            },
            /*error: function (e, m) {
                alert("load Xml: " + m);
            }*/
            error: function(x, t, m) {
            	console.log("load xml error")
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
    
    
    this.RGBToHex = function(red,green,blue){
        var rgb = blue | (green << 8) | (red << 16);
        return '#' + (0x1000000 + rgb).toString(16).slice(1)
    }

    
    this.hexToRGB = function(hex)
    {
        hex = hex.replace(/[^0-9A-F]/gi, '');
        var bigint = parseInt(hex, 16);
        var r = (bigint >> 16) & 255;
        var g = (bigint >> 8) & 255;
        var b = bigint & 255;

        return [r,g,b];
    }

    
    

    this.parseSurveyXml = function (resp, loadedCallback) {
        var surveyXmlObj = $(resp);
        var me = this;

        me.id = surveyXmlObj.filter("survey").attr("id");
        me.title = surveyXmlObj.find(">title").text();
        me.scanOnly = surveyXmlObj.find(">scan_only").text();
        me.location = surveyXmlObj.find(">location").text();
        me.businessCard = surveyXmlObj.find(">business_card").text();
        
        var badgescanobj = {};
        badgescanobj.server = surveyXmlObj.find(">badgescan>server").text();
        badgescanobj.username = surveyXmlObj.find(">badgescan>username").text();
        badgescanobj.password = surveyXmlObj.find(">badgescan>password").text();
        badgescanobj.idsection = surveyXmlObj.find(">badgescan>idsection").text();
        badgescanobj.idquestionsearch = surveyXmlObj.find(">badgescan>idquestionsearch").text();
        badgescanobj.idquestionoutput = surveyXmlObj.find(">badgescan>idquestionoutput").text();
        badgescanobj.languageid = surveyXmlObj.find(">badgescan>language_id").text();
        badgescanobj.value = surveyXmlObj.find(">badgescan>value").text();
        me.badgescan = badgescanobj;
        
        
        var contactCollObj = {};
        
        contactCollObj.lookup = {};
        contactCollObj.bcard = {};
        contactCollObj.bscan = {};
        contactCollObj.lookup.search = {};
        contactCollObj.lookup.download = {};
        contactCollObj.lookup.search.value = surveyXmlObj.find(">contactcoll>lookup>search>value").text();
        contactCollObj.lookup.download.value = surveyXmlObj.find(">contactcoll>lookup>download>value").text();
        contactCollObj.bcard.value = surveyXmlObj.find(">contactcoll>bcard>value").text();
        contactCollObj.bscan.value = surveyXmlObj.find(">contactcoll>bscan>value").text();
        me.contactColl = contactCollObj;
        
        surveyXmlObj.find("salesmen>salesman").each(function () {
            var salesman = {};
            salesman.id = $(this).attr("id");
            salesman.name = $.trim($(this).text());
            me.salesmen.push(salesman);
        });
        
        me.allResources = new Array();
        //common survey resources
        surveyXmlObj.find("survey_resources>resource").each(function () {
            var newResource = {};
            var objO = $(this);
            newResource.id = objO.attr("id") * 1;
            newResource.type = objO.children("type").text();
            newResource.mimeType = objO.children("mime").text();
            newResource.title = objO.children("title").text();
            newResource.name = objO.children("name").text();
            newResource.path = objO.children("path").text();
            me.allDocs.push(newResource);
            me.allResources.push(newResource);
        });

        me.designTemplate = {};
        surveyXmlObj.find("templates>template_field").each(function () {
            var templ = $(this);
            me.designTemplate.id = templ.attr("id");
            me.designTemplate.name = $("name", templ).text();
            me.designTemplate.fontFamily = $("font_family", templ).text();
            me.designTemplate.fontColor = $("font_color", templ).text();
            me.designTemplate.bgImage = $("bg_image", templ).text();

            var themColor = $("bg_color", templ).text();
            me.designTemplate.themeColor = themColor;
            
            /*var hoverRbg = me.hexToRGB(themColor);
            
            //console.log(hoverRbg);
            var r = hoverRbg[0] + 300
            var g = hoverRbg[1] + 300
            var b = hoverRbg[2] + 300
          
            var hoverColor = me.RGBToHex(r,g,b);
            alert(hoverColor)*/
            me.designTemplate.themeHoverColor = $("bg_color_hover", templ).text();//hoverColor;
            
            
            me.designTemplate.logo = $("logo_image", templ).text();
            me.designTemplate.logoMobile = $("logo_image_mobile", templ).text();
            
            me.designTemplate.type = $("type", templ).text();
            
            if(me.designTemplate.type == "s") {
            	me.designTemplate.logo = $("logo_image_mobile", templ).text();
            }
            
            var surveyTitleSettings = $("survey_title_settings", templ);
            me.designTemplate.surveyTitleColor = $("color", surveyTitleSettings).text();
            me.designTemplate.surveyTitleSize =  $("size", surveyTitleSettings).text();
            
            var questionTitleSettings = $("question_title_settings", templ);
            me.designTemplate.questionTitleColor = $("color", questionTitleSettings).text();
            me.designTemplate.questionTitleSize =  $("size", questionTitleSettings).text();
            
            var optionSettings = $("option_settings", templ);
            me.designTemplate.optionColor = $("color", optionSettings).text();
            me.designTemplate.optionSize =  $("size", optionSettings).text();


        });
        
        me.company = {};
        surveyXmlObj.find("companys>company_field").each(function () {
            var org = $(this);
            me.company.id = org.attr("id");
            me.company.name = $("name", org).text();
        });

        var contactFields = [];
        surveyXmlObj.find("contacts>contact_field").each(function () {
            var contactField = {};
            contactField.id = $(this).attr("id");
            contactField.name = $("identifier", this).text();
            contactField.displayText = $("name", this).text();
            contactField.type = $("type", this).text();
            contactField.isRequired = $("is_required", this).text() == "1";
            contactField.isVisible = $("is_visible", this).text() == "1";
            contactField.validationRule = $("validation_rule", this).text();

            var layouts={};
            layouts.row = $("layout row", this).text();
            layouts.column = $("layout column", this).text();

            contactField.layouts=layouts;

            var options = [];
            $("options>option", this).each(function(){
                var option = {};
                option.id = $(this).attr("id");
                option.text = $(this).text();
                options.push(option);
            });
            contactField.options = options;
            contactFields.push(contactField);
        });

        me.contactFields = contactFields;
        //me.allResources = new Array();
        surveyXmlObj.find("questions>question").each(function () {
            var newQuestion = {};
            var objQ = $(this);
            newQuestion.id = objQ.attr("id") * 1;
            newQuestion.type = objQ.children("type").text();
            newQuestion.subType = objQ.children("input_type").text();
            newQuestion.text = objQ.children("text").text();
            newQuestion.isRequired = objQ.children("is_compulsory").text() == "1";

            newQuestion.options = new Array();
            objQ.find("options:not([type='horizontal'])>option").each(function () {
                var newOption = {};
                var objO = $(this);
                newOption.id = objO.attr("id") * 1;
                newOption.type = objO.attr("type");
                var txt = $("text",objO);
                newOption.text = txt.length>0?txt.text():objO.text();
                newQuestion.options.push(newOption);
                newOption.subOptionType = $("suboptions", objO).attr("type");
                var dropdownOptions = [];
                $("dropdownOptions>option", objO).each(function () {
                    var subOption = {};
                    subOption.id = $(this).attr("id");
                    subOption.text = $(this).text();
                    dropdownOptions.push(subOption);
                });
                newOption.dropdownOptions = dropdownOptions;

                var subOptions = [];
                $("suboptions>suboption", objO).each(function () {
                    var subOption = {};
                    subOption.id = $(this).attr("id");
                    subOption.text = $(this).text();
                    subOptions.push(subOption);
                });
                newOption.subOptions = subOptions;

                newOption.resources = new Array();
                objO.find(">resources>resource").each(function () {
                    var newResource = {};
                    var objO = $(this);
                    newResource.id = objO.attr("id") * 1;
                    newResource.type = objO.children("type").text();
                    newResource.mimeType = objO.children("mime").text();
                    newResource.title = objO.children("title").text();
                    newResource.name = objO.children("name").text();
                    newResource.path = objO.children("path").text();
                    newOption.resources.push(newResource);
                    me.allResources.push(newResource);
                    me.allDocs.push(newResource);
                    
                });
            });
            newQuestion.horizontalOptions = new Array();
            objQ.find("options[type='horizontal']>option").each(function () {
                var newOption = {};
                var objO = $(this);
                newOption.id = objO.attr("id") * 1;
                newOption.type = objO.attr("type");
                newOption.text = objO.text();
                newQuestion.horizontalOptions.push(newOption);            

            });


            newQuestion.resources = new Array();
            objQ.find(">resources>resource").each(function () {
                var newResource = {};
                var objO = $(this);
                newResource.id = objO.attr("id") * 1;
                newResource.type = objO.children("type").text();
                newResource.mimeType = objO.children("mime").text();
                newResource.title = objO.children("title").text();
                newResource.name = objO.children("name").text();
                newResource.path = objO.children("path").text();
                newQuestion.resources.push(newResource);
                me.allResources.push(newResource);
                me.allDocs.push(newResource);
            });

            newQuestion.logics = new Array();
            objQ.find("logics>logic").each(function () {
                var newLogic = {};
                var logicNode = $(this);
                newLogic.jumpTo = $(this).attr("jumpTo") * 1;
                newLogic.conditions = new Array();
                logicNode.find("conditions>condition").each(function () {
                    var newCondition = {};
                    var conditionNode = $(this);
                    newCondition.groupLogic = conditionNode.attr("groupLogic");
                    newCondition.operator = conditionNode.attr("operator");
                    newCondition.value = conditionNode.attr("value");

                    newLogic.conditions.push(newCondition);
                });

                newQuestion.logics.push(newLogic);
            });

            newQuestion.optionResources = [];
            objQ.find(">option_resources>option_resource").each(function () {
                var newResource = {};
                var objO = $(this);
                newResource.id = objO.attr("id") * 1;
                newResource.row = objO.children("row").text();
                newResource.column = objO.children("column").text();
                newResource.type = objO.children("type").text();
                newResource.mimeType = objO.children("mime").text();
                newResource.title = objO.children("title").text();
                newResource.name = objO.children("name").text();
                newResource.path = objO.children("path").text();
                newQuestion.optionResources["key_" + newResource.row + "_" + newResource.column] = newResource;
                me.allResources.push(newResource);
                me.allDocs.push(newResource);
            });

            newQuestion.optionSelectList = [];
            objQ.find("select_options>select_option").each(function(){
                var newOptionList = [];
                var obj = $(this);
                var row = $("row", this).text();
                var column = $("column", this).text();

                $(">option_list>option", this).each(function(){
                    var id=$(this).attr("id");
                    var text = $(this).text();
                    newOptionList.push({
                        id: id, 
                        text: text
                    });
                })

                newQuestion.optionSelectList["key_" + row + "_" + column] = newOptionList;
            

            });


            me.questions.push(newQuestion);

        });

        /*this.allResources = new Array();
        for (var i = 0; i < this.questions.length; i++) {
            var curQ = this.questions[i];
            if (curQ.resources) {
                for (var j = 0; j < curQ.resources.length; j++) {
                    var curR = curQ.resources[j];
                    this.allResources.push(curR);

                }
            }
        }*/

        if (!isPhoneGap) {
            this.commentInfo = {
                "comment":"This is fake comment to test load",
                "assignTo": "true",
                "salesman": 3,
                "telemarketingQualification":"false",
                "email":"dev@2.com",
                "receiveEmail":"true"
            }
        }

        loadedCallback(this);
    }
    this.sendStatus = function (success) {
        var data = {
            survey_id: this.id, 
            device_id: ciscoDeviceId, 
            success: success
        };
        $.ajax({
            url: baseServerPath + "/client?method=download_status",
            type: "POST",
            context: this,
            data: data,
            success: function (resp) {
                console.log("download status: " + resp);
            },
            error: function (e, m) {
                console.log("download status error: " + m);
            }
        });
    };
}

Survey.isAnswerValid = function (question) {
    //return !question.isRequired || (question.answers && question.answers.length > 0);
    if(question.isRequired) {
        if(question.answers && question.answers.length > 0) {
            var ans = question.answers;
            console.log(JSON.stringify(ans));
            return true;
        } else {
            return false;
        }
    }else {
        return true;
    }
};