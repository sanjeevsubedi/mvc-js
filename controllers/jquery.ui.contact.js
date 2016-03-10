var contactController = null;
(function ($) {
 var fileName = "";
 var savedImageName = "";
 var imageFullPath = "";
 $.widget("ui.contact", $.ui.mainController, {
          //defaul options
          options: {
          model: null //model needed by this controller/view
          },
          //constructor
          _create: function () {
          // Your code before calling the overridden method.
          $.ui.mainController.prototype._create.call(this);
          // Your code after calling the overridden method.
          contactController = this;
          this._countryCodes = [];
          this._prefixLookup = [];
          for (var i = 0; i < countries.length; i++) {
          var country = countries[i];
          country.label = country.country;
          this._countryCodes.push({
                                  label: "+" + country.c_code,
                                  country: country
                                  });
          this._prefixLookup["+" + country.c_code] = country.c_prefix;
          }
          
          $.validator.addMethod(
                                "phoneNo",
                                function (value, element) {
                                return ("" == value || /^[0-9\- ]+$/.test(value));
                                },
                                "Please enter valid phone number."
                                );
          
          $.validator.addMethod(
                                "phoneCode",
                                function (value, element) {
                                return ("" == value || /^\+{0,1}[0-9]{1,3}$/.test(value));
                                },
                                "Please enter valid country code."
                                );
          $.validator.addMethod(
                                "requiredIfNotCard",
                                function (value, element) {
                                var hasCard = (savedImageName && savedImageName != "");
                                var hasValue = value && value != "";
                                return hasCard || hasValue;
                                },
                                "This field is required."
                                );
          
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
          //called when widget is called with no parameter of only options after widget is created
          _init: function () {
          $.ui.mainController.prototype._init.call(this);
          masterPageController.hideNextBtn(false);
          masterPageController.hideBackBtn(true);
          masterPageController.logoPlaceHolder(true);
          masterPageController.hideComment(false);
          $(".moreOptions").hide();
          
          $("html").removeClass("viacont");
          
          var bcard = this.options.model.contactColl.bcard.value;
          var bscan = this.options.model.contactColl.bscan.value;
          var search = this.options.model.contactColl.lookup.search.value;
          
          var collMethod = null;
          if(bcard == "0") {
          collMethod = $(".card-bottom")
          collMethod.addClass("deactivated");
          collMethod.find('a').off();
          }
          
          if(bscan == "0") {
          collMethod = $(".scan-bottom");
          collMethod.addClass("deactivated");
          collMethod.find('a').off();
          }
          
          if(search == "0") {
          collMethod = $(".lookup-bottom");
          collMethod.addClass("deactivated");
          collMethod.find('a').off();
          }
          $(".collections a").on('click',function(){
                                 
                                 return false;
                                 })
          
          savedImageName = "";
          imageFullPath = ""
          fileName = "";
          
          $(".answer-save").off().on("click", function(e){
                                     me.onNext();
                                     })
          
          $(".fancybox", this.element).fancybox();
          
          if(this.options.model.scanOnly == "0") {
             $("header,.trash-top").css("display","block");
          }
         
          
          $(".micro-tabs li").removeClass("micro-tab-active");
          $("#contact-tab").addClass("micro-tab-active");
          $(".comment-beside-save").css("display","block");
          $("html").removeClass("noHeader, noNav");
          
          $("#btnNext, .comment-beside-save").html(langMgr.getTranslation("Next"));
          $("#btnNext").addClass("con");
          //Custom.init(this.element);
          
          
          /*if(this.options.model.scanOnly == "1" && !ciscoGlobalData.viaContact) {
           $(".micro-tabs, #contact-holder, .collections, #comment-container, #btnNext").css("display","none");
           $("#intermediate-screen, #scanOnly, .scan-options").show();
           var saveBtn =  $("#scanOnly");
           saveBtn.show().css({"width":"100%"});
           saveBtn.html("Next Scan");
           
           if(ciscoGlobalData.scan) {
           
           if(ciscoGlobalData.scan.barcodeContent){
           $(".failed-icon").show();
           $(".success-icon").hide();
           $("#firstName").html(ciscoGlobalData.scan.barcodeContent);
           }else {
           
           $(".success-icon").show();
           $(".failed-icon").hide();
           $("#firstName").html(ciscoGlobalData.scan.firstname);
           $("#lastName").html(ciscoGlobalData.scan.lastname);
           $("#email").html(ciscoGlobalData.scan.email);
           $("#company").html(ciscoGlobalData.scan.company);
           }
           }
           
           
           }else {
           
           $(".micro-tabs, #contact-holder, .collections, #comment-container, #btnNext").css("display","block");
           var nextBtn =  $("#btnNext");
           nextBtn.show().css({"width":"100%"});
           $("#intermediate-screen, #scanOnly,#comment-container,.scan-options").hide();
           }*/
          
          var respId = ciscoGlobalData.queryStrings["respId"];
          
          if (this.options.model.scanOnly == "1") {
          
          $(document).on('blur', '#view_contact input, #view_contact select', function()
                         {
                         $('#comment-container,.micro-tabs').css('display', 'none');
                         });
          
          if (respId || ciscoGlobalData.viaContact) {
          
          $(".micro-tabs,.collections,#intermediate-screen, #scanOnly,#comment-container,.scan-options").hide();
          $("#contact-holder,#btnNext").css("display", "block");
          var nextBtn = $("#btnNext");
          nextBtn.show().css({
                             "width": "100%"
                             });
          
          }
          
          if (!ciscoGlobalData.viaContact) {
          $(".micro-tabs, #contact-holder, .collections, #comment-container, #btnNext").css("display", "none");
          //$("#intermediate-screen, #scanOnly, .scan-options").show();
          
          
          if (ciscoGlobalData.scan) {
          $("#intermediate-screen, #scanOnly, .scan-options").show();
          
          var saveBtn = $("#scanOnly");
          saveBtn.show().css({
                             "width": "100%"
                             });
          saveBtn.html("Next Scan");
          
          if (ciscoGlobalData.scan.barcodeContent) {
          $(".failed-icon").show();
          $(".success-icon").hide();
          $("#firstName").html(ciscoGlobalData.scan.barcodeContent);
          } else {
          
          $(".success-icon").show();
          $(".failed-icon").hide();
          $("#firstName").html(ciscoGlobalData.scan.firstname);
          $("#lastName").html(ciscoGlobalData.scan.lastname);
          $("#email").html(ciscoGlobalData.scan.email);
          $("#company").html(ciscoGlobalData.scan.company);
          }
          }
          
          }
          
          } else {
          $(".micro-tabs, #contact-holder, .collections, #comment-container, #btnNext").css("display", "block");
          $("#intermediate-screen, #scanOnly,.scan-options").hide();
          }
          
          
          var me = this;
          
          var salesmen = this.options.model.salesmen;
          for (var i = 0; i < salesmen.length; i++) {
          var salesman = salesmen[i];
          salesman.label = salesman.name;
          }
          
          //enable/disable business card
          //console.log("bcard" + this.options.model.businessCard);
          var hasCard = this.options.model.businessCard;
          var searchDb = this.options.model.badgescan.value
          
          if (hasCard != '1') {
          $("#cardStatus").css('display', 'none');
          }
          
          if (searchDb != '1') {
          $(".look-up-trigger").css('display', 'none');
          $(".lookupdownload").css('display', 'none');
          $(".barcode-trigger").css('display', 'none');
          }
          
          this._createContactForm();
          this._loadContact();
          
          if(ciscoGlobalData.hasOwnProperty("contactCollection")) {
          var contactCollectionData = ciscoGlobalData.contactCollection;
          
          
          var obj = JSON.parse(contactCollectionData);
          response = obj.AnswerValue;
          //insert the value in the comment tab
          var networkState = navigator.connection.type;
          var sourceStatus = navigator.onLine && networkState != 'none' ? "Online" : "Offline";
          var temString = obj.TemplateString ? obj.TemplateString : "";
          
          var showcommentBox = true;
          if (temString.substring(0, 10) == "#no_popup#") {
          showcommentBox = false;
          temString = temString.substring(10); //remove nopopup text
          }
          
          
          //var newTemplateString = temString + "\nSource: " + sourceStatus + " Search";
          var newTemplateString = temString;
          $("#commentForm textarea").html(newTemplateString);
          
          $("#source-info").val("\nSource: " + sourceStatus + " Search");
          
          /*show the comment box if the response contains template string*/
          var comm = $.trim(temString);
          var comTrigger = $('#comment-trigger');
          
          if(comm.length > 0 && showcommentBox) {
          comTrigger.trigger('click',{from:'search'});
          }
          
          if (response) {
          $("#entryForm input").val('');
          if (response.firstname) {
          var first_name = $("input[data-barcode='first_name']");
          first_name.val(response.firstname);
          $("#firstName").html(response.firstname);
          //first_name.parent().css('display','none');
          }
          
          if (response.lastname) {
          var name = $("input[data-barcode='name']");
          name.val(response.lastname);
          $("#lastName").html(response.lastname);
          //name.parent().css('display','none');
          }
          
          
          if (response.company) {
          var company = $("input[data-barcode='company']");
          company.val(response.company);
          $("#company").html(response.company);
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
          $("#email").html(response.email);
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
          
          //phone1
          
          //if (response.phone1areacode || response.phone1number) {
          
          if (response.phone1country) {
          var phone1Cc = $("input[data-barcode='cc_phone_1']");
          phone1Cc.val('+' + response.phone1country);
          }
          
          if (response.phone1prefix) {
          var phone1Prefix = $("label[data-barcode='prefix_phone_1']");
          phone1Prefix.html(response.phone1prefix);
          }
          //}
          
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
          // if (response.phone2areacode || response.phone2number) {
          if (response.phone2country) {
          var phone2Cc = $("input[data-barcode='cc_phone_2']");
          phone2Cc.val('+' + response.phone2country);
          }
          
          if (response.phone2prefix) {
          var phone2Prefix = $("label[data-barcode='prefix_phone_2']");
          phone2Prefix.html(response.phone2prefix);
          }
          //}
          
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
          //  if (response.mobileareacode || response.mobilenumber) {
          if (response.mobilecountry) {
          var mobileCc = $("input[data-barcode='cc_mobile']");
          mobileCc.val('+' + response.mobilecountry);
          }
          
          if (response.mobileprefix) {
          var mobilePrefix = $("label[data-barcode='prefix_mobile']");
          mobilePrefix.html(response.mobileprefix);
          }
          //}
          
          if (response.mobileareacode && response.mobilenumber) {
          var mobileNum = $("input[data-barcode='num_mobile']");
          mobileNum.val(response.mobileareacode + response.mobilenumber); //concatenate
          }else if(response.mobileareacode) {
          var mobileNum = $("input[data-barcode='num_mobile']");
          mobileNum.val(response.mobileareacode);
          }else if(response.mobilenumber) {
          var mobileNum = $("input[data-barcode='num_mobile']");
          mobileNum.val(response.mobilenumber);
          }
          
          //fax
          
          // if (response.faxareacode || response.faxnumber) {
          if (response.faxcountry) {
          var faxCc = $("input[data-barcode='cc_fax']");
          faxCc.val('+' + response.faxcountry);
          }
          
          if (response.faxprefix) {
          var faxPrefix = $("label[data-barcode='prefix_fax']");
          faxPrefix.html(response.faxprefix);
          }
          //}
          
          if (response.faxareacode && response.faxnumber) {
          var faxNum = $("input[data-barcode='num_fax']");
          faxNum.val(response.faxareacode + response.faxnumber); //concatenate
          }else if (response.faxareacode) {
          var faxNum = $("input[data-barcode='num_fax']");
          faxNum.val(response.faxareacode);
          } else if (response.faxnumber) {
          var faxNum = $("input[data-barcode='num_fax']");
          faxNum.val(response.faxnumber);
          }
          
          //hidden guid
          collectionController._setGuidContent(obj.IdGuid);
          var guidElement = $('<input type="hidden"/>');
          guidElement.attr("name", "guid-eventmonitor");
          
          var sourceInfo = "\nSource: " + sourceStatus + " Search";
          
          guidElement.attr("value", obj.IdGuid +"_"+ sourceInfo);
          $("#entryForm input[name='guid-eventmonitor']").hide();
          $("#entryForm").append(guidElement);
          $.fancybox.close();
          json = "";
          
          
          if(this.options.model.scanOnly == "1") {
          
          
          var scanResults = {};
          scanResults.firstname = response.firstname;
          scanResults.lastname = response.lastname;
          scanResults.email = response.email;
          scanResults.company = response.company;
          
          if(this.save()){
          ciscoGlobalData.scan = scanResults;
          masterPageController.collectResponses(this.options.model,null,function(respId){
                                                ciscoGlobalData.respId = respId;
                                                $("#response-contact").attr("data-respId",respId);
                                                });
          
          }
          delete ciscoGlobalData.contactCollection; //remove old contact data
          }
          
          
          
          } else {
          customAlert("LookupError:", "error");
          }
          
          
          }
          
          },
          
          
          _createContactForm: function () {
          var contactFields = this.options.model.contactFields;
          var valParams = {
          rules: {},
          groups: {}
          };
          var form = $("#entryForm", this.element).empty();
          
          
          // sorting the contactFields into 3 rows max
          var con_fields = [];
          
          for (var i = 0; i < contactFields.length; i++) {
          var tempArray_contactFields = [];
          for (var j = 0; j < contactFields.length; j++) {
          if (contactFields[j].layouts.row == i) {
          tempArray_contactFields.push(contactFields[j]);
          }
          }
          
          if (tempArray_contactFields.length > 0) {
          tempArray_contactFields.sort(function (obj1, obj2) {
                                       return obj1.layouts.column - obj2.layouts.column;
                                       });
          
          con_fields.push(tempArray_contactFields);
          }
          }
          
          for (var j = 0; j < con_fields.length; j++) {
          var curFieldSet;
          var column_number = con_fields[j].length;
          col_class = ["twelve", "six", "four"];
          var holderTemp = $('<div class="' + col_class[column_number - 1] + ' columns">' + '</div>');
          form.append(curFieldSet);
          curFieldSet = $("<fieldset/>");
          for (var i = 0; i < con_fields[j].length; i++) {
          
          var field = con_fields[j][i];
          // if (i % column_number == 0) {
          
          //}
          
          var element;
          
          if (field.type == "select") {
          element = this._getSelect(field, valParams);
          } else if (field.type == "textbox") {
          if (field.validationRule == "telephone") {
          element = this._getPhone(field, valParams);
          } else if (field.validationRule == "country") {
          element = this._getCountry(field, valParams);
          } else if (field.validationRule == "salesperson") {
          element = this._getSalesPerson(field, valParams);
          } else {
          element = this._getTextbox(field, valParams);
          }
          }
          
          var holder = holderTemp.clone();

           if (!field.isVisible) {
            holder.addClass("non-visible");
           }


          holder.append(element);
          curFieldSet.append(holder);
          }
          form.append(curFieldSet);
          }
          
          /*source info*/
          var sourceInfoElement = $('<input type="hidden"/>');
          sourceInfoElement.attr("name", "source-info");
          sourceInfoElement.attr("id", "source-info");
          form.append(sourceInfoElement);
          /**/
          
          valParams.errorPlacement = function (error, element) {
          if (element.hasClass("phoneCode") || element.hasClass("phoneNo")) {
          error.insertAfter(element.parent().find(".phoneNo"));
          } else {
          error.insertAfter(element);
          }
          }
          
          form.validate(valParams);
          
          
          },
          _getTextbox: function (field, valParams) {
          var element;
          if (field.validationRule == "email") {
          element = $('<input type="email" VCARD_NAME = "vCard.Email"/>');
          this._emailFieldName = "cf_" + field.id;
          } else if(field.name == 'first_name'){
          element = $('<input type="text"/>');
          this._fNameFieldName = "cf_" + field.id;
          } else if(field.name == 'name'){
          element = $('<input type="text"/>');
          this._lNameFieldName = "cf_" + field.id;
          } else if(field.name == 'company'){
          element = $('<input type="text"/>');
          this._companyFieldName = "cf_" + field.id;
          } else {
          element = $('<input type="text"/>');
          }
          element.attr("name", "cf_" + field.id);
          element.attr("data-barcode", field.name);
          element.attr("placeholder", field.displayText);
          if (field.isRequired) {
          element.addClass("required");
          }
          
          if (field.validationRule && field.validationRule) {
          element.addClass(field.validationRule);
          
          }
          
          return element;
          },
          _getSelect: function (field, valParams) {
          var element = $('<select class="select"/>');
          element.attr("name", "cf_" + field.id);
          element.attr("placeholder", field.displayText);
          var optTemp = '<option class="option" value="#value">#text</option>';
          
          if (field.isRequired) {
          element.addClass("required");
          }
          
          element.append(optTemp.replace("#value", "").replace("#text", field.displayText));
          for (var j = 0; j < field.options.length; j++) {
          var opt = field.options[j];
          element.append(optTemp.replace("#value", opt.text).replace("#text", opt.text));
          }
          return element;
          },
          
          _getSalesPerson: function (field, valParams) {
          var me = this;
          var element = $('<div/>');
          var text = $('<input type="text" id="' + "cf_" + field.id + 'name" name="' + "cf_" + field.id + 'name"/>');
          var hidden = $('<input type="hidden" id="' + "cf_" + field.id + 'iso" name="' + "cf_" + field.id + 'iso" value="">');
          
          //text.attr("name", field.name + "name");
          text.attr("placeholder", field.displayText);
          
          element.append(text);
          element.append(hidden);
          
          if (field.isRequired) {
          text.addClass("required");
          }
          
          
          
          var salesmanChanged = function (event, ui) {
          var salesman = ui.item;
          
          if (!salesman) {
          salesman = {
          "id": "",
          "name": ""
          };
          }
          
          hidden.val(salesman.name);
          
          
          }
          
          text.autocomplete({
                            source: this.options.model.salesmen,
                            minLength: 0,
                            select: salesmanChanged
                            })
          .focus(function (e) {
                 var val = $(this).val();
                 $(this).autocomplete("search", val);
                 });
          
          return element;
          },
          _getCountry: function (field, valParams) {
          var me = this;
          var element = $('<div/>');
          var text = $('<input type="text" data-barcode="' + field.name + '" id="' + "cf_" + field.id + 'name" name="' + "cf_" + field.id + 'name"/>');
          var hidden = $('<input type="hidden" data-barcode="iso" id="' + "cf_" + field.id + 'iso" name="' + "cf_" + field.id + 'iso" value="">');
          
          //text.attr("name", field.name + "name");
          text.attr("placeholder", field.displayText);
          
          element.append(text);
          element.append(hidden);
          
          if (field.isRequired) {
          text.addClass("required");
          }
          
          
          
          var countryChanged = function (event, ui) {
          
          var country = ui.item;
          
          if (!country) {
          country = {
          "iso": "",
          "country": "",
          "c_code": -1,
          "c_prefix": 0
          };
          }
          
          hidden.val(country.iso);
          
          
          $("input.phoneCode", me.element).each(function () {
                                                var val = $(this).val();
                                                /*if (country.c_code != -1) {
                                                 this.value = "+" + country.c_code;
                                                 } else {
                                                 countryCode.val("");
                                                 }*/
                                                if (country.c_code != -1 && val == "") {
                                                this.value = "+" + country.c_code;
                                                } else if(country.c_code != -1 && val != "") {
                                                this.value = val;
                                                }
                                                else {
                                                countryCode.val("");
                                                }
                                                
                                                if ((country.c_prefix || country.c_prefix == 0) && country.c_prefix != -1) {
                                                $(this).nextAll("label").text("(" + country.c_prefix + ")");
                                                } else {
                                                $(this).nextAll("label").text("");
                                                }
                                                
                                                
                                                });
          
          
          
          }
          
          text.autocomplete({
                            source: countries,
                            minLength: 0,
                            select: countryChanged
                            })
          .focus(function (e) {
                 var val = $(this).val();
                 $(this).autocomplete("search", val);
                 });
          
          return element;
          },
          _getPhone: function (field, valParams) {
          var me = this;
          var phoneTemp = '<div class="control_cols alpha omega alpha">' +
          '<input data-barcode = "cc_' + field.name + '" type="tel" class="input-min last left phoneCode" id="#nameCode" name="#nameCode" placeholder="+" />' +
          '<label data-barcode = "prefix_' + field.name + '" for="#name" class="unikLable phonePrefix" id="#namePrefix">-</label>' +
          '<input data-barcode = "num_' + field.name + '" type="tel" class="input-medium left phoneNo #required" id="#nameNo" name="#nameNo" placeholder="#display"/>' +
          '</div>';
          
          var element = $((phoneTemp.replace(/#name/g, "cf_" + field.id).replace(/#display/g, field.displayText).replace(/#required/g, field.isRequired ? "required" : "")));
          
          eval("valParams.rules." + "cf_" + field.id + "No='phoneNo'");
          eval("valParams.rules." + "cf_" + field.id + "Code='phoneCode'");
          eval("valParams.groups." + "cf_" + field.id + "No ='" + "cf_" + field.id + "No " + "cf_" + field.id + "Code'");
          
          $(".phoneCode", element)
          .autocomplete({
                        source: this._countryCodes,
                        minLength: 0,
                        select: function (event, ui) {
                        var country = ui.item.country;
                        var countryPrefix = $(this).nextAll("label");
                        if ((country.c_prefix || country.c_prefix == 0) && country.c_prefix != -1) {
                        countryPrefix.text("(" + country.c_prefix + ")");
                        } else {
                        countryPrefix.text("");
                        }
                        }
                        })
          .focus(function (e) {
                 var val = $(this).val();
                 if (!/^\+/.test(val)) {
                 $(this).autocomplete("search", "+" + val);
                 } else {
                 $(this).autocomplete("search", val);
                 }
                 
                 })
          .blur(function () {
                var code = $(this).val();
                var countryPrefix = $(this).nextAll("label");
                if (code && code != "") {
                if (!/^\+/.test(code)) {
                code = "+" + code;
                $(this).val(code);
                }
                
                var prefix = me._prefixLookup[code];
                if ((prefix || prefix == 0) && prefix != -1) {
                countryPrefix.text("(" + prefix + ")");
                } else {
                countryPrefix.text("");
                }
                } else {
                countryPrefix.text("");
                }
                });
          
          return element;
          },
          _loadContact: function () {
          var contactInfo = this.options.model.contactInfo;
          
          /*if(!contactInfo && this.options.model.newcontactInfo) {
           contactInfo = this.options.model.newcontactInfo;
           this.options.model.contactInfo = this.options.model.newcontactInfo;
           this.options.model.contactInfo.imageName = this.options.model.cameraInfo ? this.options.model.cameraInfo.imageName : "";
           //console.log(JSON.stringify(contactInfo))
           }*/
          
          
          if(this.options.model.cameraInfo) {
          var fullPath = this.options.model.cameraInfo.imageFullPath;
          savedImageName = this.options.model.cameraInfo.imageName;
          imageFullPath = this.options.model.cameraInfo.imgPath;
          $("#cardPreview, .contact-details #cardPreview").attr("src", fullPath).show();
          $("#cardPreview, .contact-details #cardPreview").parent().attr("href", fullPath);
          var uploadedmsg = langMgr.getTranslation("ImageUploadedIinfo");
          $("#cardUploadedInfo, .business_details").html(uploadedmsg);
          
          if(this.options.model.scanOnly == "1") {
          
          
          if(collectionController._getGuidContent()) {
          var guidElement = $('<input type="hidden"/>');
          guidElement.attr("name", "guid-eventmonitor");
          guidElement.attr("value", collectionController._getGuidContent());
          $("#entryForm input[name='guid-eventmonitor']").hide();
          $("#entryForm").append(guidElement);
          collectionController._setGuidContent('');
          
          }
          
          $(" #contact-holder, #btnNext").show();
          var nextBtn = $("#btnNext");
          nextBtn.show().css({
                             "width": "100%"
                             });
          $("#intermediate-screen, #scanOnly, .scan-options").hide();
          /*$(".failed-icon").hide();
           $(".success-icon").show();
           $("#intermediate-screen, #scanOnly, .scan-options").show();
           $("#full_name, #firstName, #lastName, #email, #company, #contact-holder, #btnNext").hide();
           var saveBtn = $("#scanOnly");
           saveBtn.show().css({
           "width": "100%"
           });
           saveBtn.html("Next Scan");
           this.save("true");
           
           masterPageController.collectResponses(this.options.model,"card",function(respId){
           ciscoGlobalData.respId = respId;
           $("#response-contact").attr("data-respId",respId);
           });*/
          
          }
          }
          
          if(contactInfo && this.options.model.cameraInfo) {
          this.options.model.contactInfo.imageName = savedImageName;
          this.options.model.contactInfo.imageFullPath = imageFullPath;
          }
          
          if (contactInfo) {
          savedImageName = contactInfo.imageName;
          for (var key in contactInfo) {
          if ("imageName" == key) {
          if (isPhoneGap) {
          var imagePath = "Cisco/pictures/" + contactInfo[key];
          console.log("Load image: " + imagePath);
          
      	   var respId = ciscoGlobalData.queryStrings["respId"];
          if(respId && this.options.model.cameraInfo) {
          savedImageName = this.options.model.cameraInfo.imageName;
          imagePath = "Cisco/pictures/" + savedImageName;
          }
          
          filesystemHelper.getFile(imagePath, function (file) {
                                   file.getFullPath()
                                   imageFullPath = appFolderPath+file.getFullPath();
                                   $("#cardPreview,.contact-details #cardPreview").attr("src", appFolderPath+file.getFullPath() + "?((new Date()) * 1)").show();
                                   $("#cardPreview,.contact-details #cardPreview").parent().attr("href", appFolderPath+file.getFullPath() + "?((new Date()) * 1)");
                                   
                                   var uploadedmsg = langMgr.getTranslation("ImageUploadedIinfo");
                                   $("#cardUploadedInfo, .business_details").html(uploadedmsg);
                                   
                                   }, true);
          }
          } else {
          var inp = $("[name='" + key + "']", this.element);
          if (inp.length > 0) {
          var type = inp.attr("type");
          if (!type) {
          type = inp.prop("tagName");
          }
          if (type.toLowerCase() == "checkbox" || type.toLowerCase() == "radio") {
          inp.filter("[value='" + contactInfo[key] + "']").each(function (i) {
                                                                this.checked = true;
                                                                });
          } else {
          inp.val(contactInfo[key]);
          }
          } else {
          var nonInput = $("#" + key, this.element);
          if (nonInput.length > 0) {
          nonInput.text(contactInfo[key]);
          }
          }
          }
          
          }
          }
          },
          
          //destructor
          destroy: function () {
          $.Widget.prototype.destroy.call(this);
          },
          save: function (arg) {
          var me = this;
          var jsonObj = "{";
          var temp = '"#name": "#value"';
          var frm = $("#entryForm");
          
          if (this.options.model.scanOnly == "1" && !arg) {
          frm.find(':input').each(function(i,v){
                                  
                                  var elem = $(this);
                                  if(elem.hasClass("required")) {
                                  $(" #contact-holder, #btnNext").show();
                                  var nextBtn = $("#btnNext");
                                  nextBtn.show().css({
                                                     "width": "100%"
                                                     });
                                  return false;
                                  //console.log(elem);
                                  }
                                  
                                  });
          }
          
          
          
          
          
          var hasCard = (savedImageName && savedImageName != "")
          if (hasCard) {
          $("#entryForm input, #entryForm select").removeClass("required");
          }
          
          if(arg == "true") {
          $("#entryForm input, #entryForm select").removeClass("required");
          
          }
          
          if (frm.valid()) {
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
                                                                                           
                                                                                           if (name == me._emailFieldName) {
                                                                                           jsonObj += ",\n\t";
                                                                                           jsonObj += temp.replace("#name", "email").replace("#value", val);
                                                                                           
                                                                                           }
                                                                                           
                                                                                           if (name == me._fNameFieldName) {
                                                                                           jsonObj += ",\n\t";
                                                                                           jsonObj += temp.replace("#name", "first_name").replace("#value", val);
                                                                                           
                                                                                           }
                                                                                           
                                                                                           if (name == me._lNameFieldName) {
                                                                                           jsonObj += ",\n\t";
                                                                                           jsonObj += temp.replace("#name", "last_name").replace("#value", val);
                                                                                           
                                                                                           }
                                                                                           
                                                                                           if (name == me._companyFieldName) {
                                                                                           jsonObj += ",\n\t";
                                                                                           jsonObj += temp.replace("#name", "company").replace("#value", val);
                                                                                           
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
          this.options.model.contactInfo.imageFullPath = imageFullPath;
          
          if(!arg) {
          return true;
          }
          
          } else{
          
          var requiredPosition = $('.error:visible').first().offset();
          requiredPosition = parseInt(requiredPosition.top) -70;
          
          $('html, body').animate({scrollTop: requiredPosition}, "slow");
          return false;
          }
          return false;
          },
          //override
          onNext: function (arg) {
          
          /*var hasCard = (savedImageName && savedImageName != "")
           if (hasCard) {
           $("#entryForm input, #entryForm select").removeClass("required");
           }*/
          
          
          if (this.options.model.scanOnly == "1") {
          
          if(collectionController._getGuidContent()) {
          var guidElement = $('<input type="hidden"/>');
          guidElement.attr("name", "guid-eventmonitor");
          guidElement.attr("value", collectionController._getGuidContent());
          $("#entryForm input[name='guid-eventmonitor']").hide();
          $("#entryForm").append(guidElement);
          collectionController._setGuidContent('');
          
          }
          }
          
          if (this.save()) {
          
          if (this.options.model.scanOnly == "1") {
          
          masterPageController.collectResponses(this.options.model,"contact",function(responseId){
                                                ciscoGlobalData.respId = responseId;
                                                $("#response-contact").attr("data-respId",responseId);
                                                
                                                })
          
          $(".success-icon").show();
          $("#full_name, #firstName, #lastName, #email, #company").show();
          $("#firstName").html($("input[name='"+this._fNameFieldName +"']").val());
          $("#lastName").html($("input[name='"+this._lNameFieldName +"']").val());
          $("#email").html($("input[name='"+this._emailFieldName +"']").val());
          $("#company").html($("input[name='"+this._companyFieldName +"']").val());
          
          $(".micro-tabs, #contact-holder, .collections, #comment-container, #btnNext").css("display","none");
          $("#intermediate-screen, #scanOnly, .scan-options").show();
          var saveBtn =  $("#scanOnly");
          saveBtn.show().css({"width":"100%"});
          saveBtn.html("Next Scan");
          loadingWidget.hide();
          
          
	        	
          
          } else {
          //$(".okBtn" ).trigger( "click" ); //saves the comment automatically
          /*var type = $.ui.surveyQuestionBase.getWidgetName(masterPageController._survey.questions[0]);
           this.navigateTo(type, masterPageController._survey.questions[0]);*/
          delete this.options.model.newcontactInfo;
          delete ciscoGlobalData.contactCollection;
          this.navigateTo('allquestions', this.options.model);
          }
          
          }
          },
          _uploadOnline: function (s, e) {
          e.preventDefault();
          
          $(".upload_scan").miniSettings();
          $('.upload_scan').data("miniSettings")._uploadOnline();
          //settingsController._uploadOnline();
          },
          
          _cancelClicked: function(arg) {
          delete ciscoGlobalData.respId;
          quickJumpController._goToSettings();
          },
          
          _nextScanClicked: function(s, e){
          
          e.preventDefault();
          $(s).css({"background":"red"});
          $(s).attr("disabled", "disabled");
          this.options.model.questions = [];
          delete this.options.model.contactInfo;
          delete this.options.model.commentInfo;
          delete this.options.model.cameraInfo;
          $("#commentForm textarea").html("");
          delete ciscoGlobalData.contactCollection;
          delete ciscoGlobalData.respId;
          delete ciscoGlobalData.scan;
          
          
          collectionController._scanClicked(s,e);
          },
          
          _responseItemClicked: function (s, e) {
          e.preventDefault();
          //console.log($(s));
          /*var responseId = $(s).attr("data-respId");
           window.location = "index.html?respId=" + responseId;*/
          
          $("#intermediate-screen,#comment-container, #scanOnly, .scan-options").css("display", "none");
          $(" #contact-holder, #btnNext").show();
          var nextBtn = $("#btnNext");
          nextBtn.show().css({
                             "width": "100%"
                             });
          },
          
          _captureCardClicked: function(s, e) {
          //if(this.options.model.scanOnly == "0"){
          this.save("true");
          //}
          collectionController._captureCardClicked(s,e);
          
          },
          
          _lookupClicked: function(s, e) {
          $("html").addClass("viacont");
          this.save("true");
          collectionController._lookupClicked(s,e);
          
          },
          
          _scanClicked: function(s, e) {
          this.save("true");
          collectionController._scanClicked(s,e);
          },
          
          onPrev: function (arg) {
          //this.goBack();
          this.navigateTo('contactcollection', this.options.model);
          },
          _countryCodes: null,
          _prefixLookup: null,
          _emailFieldName: "",
          _fNameFieldName: "",
          _lNameFieldName: "",
          _companyFieldName: ""
          
          });
 })(jQuery);