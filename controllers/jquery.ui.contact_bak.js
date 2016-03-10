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

            this._countryCodes = [];
            this._prefixLookup = [];
            for (var i = 0; i < countries.length; i++) {
                var country = countries[i];
                country.label = country.country;
                this._countryCodes.push({ label: "+" + country.c_code, country: country });
                this._prefixLookup["+" + country.c_code] = country.c_prefix;
            }

            

            $.validator.addMethod(
                "phoneNo",
                function (value, element) {
                    return (""==value || /^[0-9\- ]+$/.test(value));
                },
                "Please enter valid phone number."
            );

            $.validator.addMethod(
                "phoneCode",
                function (value, element) {
                    return (""==value || /^\+{0,1}[0-9]{1,3}$/.test(value));
                },
                "Please enter valid country code."
            );
            $.validator.addMethod(
              "requiredIfNotCard",
              function (value, element) {
                  var hasCard = (savedImageName && savedImageName != "") ;
                  var hasValue = value && value != "";
                  return hasCard || hasValue;
              },
              "This field is required."
          );

        },
        //called when widget is called with no parameter of only options after widget is created 
        _init: function () {
            $.ui.mainController.prototype._init.call(this);
            $(".fancybox", this.element).fancybox();
            Custom.init(this.element);
            var me = this;
            var contrySelect = $("[name='country']", this.element);
            var contryIsoSelect = $("[name='country_iso']", this.element);

            var countryCode = $("#phoneCode, #mobileCode", this.element);
            var countryPrefix = $("#phonePrefix, #mobilePrefix", this.element);

            $("#phoneCode, #mobileCode", this.element)
            .autocomplete({
                source: this._countryCodes,
                minLength: 0,
                select: function (event, ui) {
                    var country = ui.item.country;
                    var countryPrefix = $(this).nextAll("#phonePrefix, #mobilePrefix");
                    if ((country.c_prefix || country.c_prefix == 0) && country.c_prefix != -1) {
                        countryPrefix.text("(" + country.c_prefix + ")");
                    }
                    else {
                        countryPrefix.text("");
                    }
                }
            })
            .focus(function (e) {
                var val = $(this).val();
                if (!/^\+/.test(val)) {
                    $(this).autocomplete("search", "+" + val);
                }
                else {
                    $(this).autocomplete("search", val);
                }

            })
            .blur(function () {
                var code = $(this).val();
                if (code && code != "") {
                    if (!/^\+/.test(code)) {
                        code = "+" + code;
                        $(this).val(code);
                    }
                    var countryPrefix = $(this).nextAll("#phonePrefix, #mobilePrefix");
                    var prefix = me._prefixLookup[code];
                    if ((prefix || prefix == 0) && prefix != -1) {
                        countryPrefix.text("(" + prefix + ")");
                    }
                    else {
                        countryPrefix.text("");
                    }
                }
                else {
                    countryPrefix.text("");
                }
            });


            var countryChanged = function (event, ui) {

                var country = ui.item;

                if (!country) {
                    country = { "iso": "", "country": "", "c_code": -1, "c_prefix": 0 };
                }

                contryIsoSelect.val(country.iso);


                countryCode.each(function () {
                    var val = $(this).val();
                    if (country.c_code != -1) {
                        countryCode.val("+" + country.c_code);
                    }
                    else {
                        countryCode.val("");
                    }

                    if ((country.c_prefix || country.c_prefix == 0) && country.c_prefix != -1) {
                        countryPrefix.text("(" + country.c_prefix + ")");
                    }
                    else {
                        countryPrefix.text("");
                    }


                });

            }

            $("#country", this.element)
            .autocomplete({
                source: countries,
                minLength: 0,
                select: countryChanged
            })
            .focus(function (e) {
                var val = $(this).val();
                $(this).autocomplete("search", val);
            });

            $("#entryForm ", this.element).validate(
            {
                rules: {
                    lname: "requiredIfNotCard",
                    companyName: "requiredIfNotCard",
                    country: "requiredIfNotCard",
                    mobileNo: "phoneNo",
                    phoneNo: "phoneNo",
                    phoneCode: "phoneCode",
                    mobileCode: "phoneCode"
                },
                groups: {
                    phone: "phoneCode phoneNo",
                    mobile: "mobileCode mobileNo"
                },
                errorPlacement: function (error, element) {
                    var name = element.attr("name"); 
                    if (name=="phoneCode"|| name=="phoneNo"){
                        error.insertAfter("[name='phoneNo']");
                    }
                    else if (name=="mobileCode"|| name=="mobileNo"){
                        error.insertAfter("[name='mobileNo']");
                    }
                    else {
                        error.insertAfter(element);
                    }
                }
            });
            /*$("#entryForm #date").datepicker({
            changeMonth: true,
            changeYear: true
            });*/

            if (imageFullPath && imageFullPath != "") {
                $("#cardPreview").attr("src", imageFullPath).show();
                $("#cardPreview").parent().attr("href", imageFullPath);
            }
            

            

            

            for (var i = 0; i < countries.length; i++) {
                var country = countries[i];
                var template = $('<option class="option" value="' + country.country + '">' + country.country + '</option>').data("country", country);
                var templateIso = $('<option class="option" value="' + country.iso + '">' + country.iso + '</option>').data("country", country);


                contrySelect.append(template);
                contryIsoSelect.append(templateIso);
            }

            this._loadContact();
            //masterPageController.hideNextBtn(false);
            //masterPageController.hideBackBtn(true);
        },
        _loadContact: function () {
            var contactInfo = this.options.model.contactInfo;
            if (contactInfo) {
                savedImageName = contactInfo.imageName;
                for (var key in contactInfo) {
                    if ("imageName" == key) {
                        var imagePath = "Cisco/pictures/" + contactInfo[key];
                        filesystemHelper.getFile(imagePath, function (file) {
                            file.getFullPath()
                            $("#cardPreview").attr("src", file.getFullPath() + "?((new Date()) * 1)").show();
                            $("#cardPreview").parent().attr("href", file.getFullPath() + "?((new Date()) * 1)");
                        }, true);
                    }
                    else {
                        var inp = $("[name='" + key + "']", this.element);
                        if (inp.length > 0) {
                            var type = inp.attr("type");
                            if (!type) {
                                type = inp.prop("tagName");
                            }
                            if (type.toLowerCase() == "checkbox" || type.toLowerCase() == "radio") {
                                inp.filter("[value='" + contactInfo[key] + "']").each(function (i) { this.checked = true; });
                            }
                            else {
                                inp.val(contactInfo[key]);
                            }
                        }
                        else {
                            var nonInput = $("#" + key, this.element);
                            if (nonInput.length > 0) {
                                nonInput.text(contactInfo[key]);
                            }
                        }
                    }

                }
            }
        },
        _captureCardClicked: function (s, e) {
            navigator.camera.getPicture($.proxy(this._cameraSuccess, this), $.proxy(this._cameraError, this), { quality: 75,
                destinationType: Camera.DestinationType.DATA_FILE
            });
        },
        _cameraSuccess: function (imageUri) {
            var me = this;
            console.log("camera success: " + imageUri);
            filesystemHelper.getFile(imageUri, function (file) {
                console.log("got image file");
                setTimeout(function () {
                    if (fileName == "") {
                        if(me.options.model.contactInfo && me.options.model.contactInfo.imageName && me.options.model.contactInfo.imageName!=""){
                            fileName = me.options.model.contactInfo.imageName;
                        }
                        else{
                            fileName = "Pic_" + ciscoDeviceId + "_" + ((new Date()) * 1) + ".jpeg";
                        }
                    }
                    var imagePath = "Cisco/pictures/" + fileName;
                    console.log(imagePath);
                    file.moveTo(imagePath, function (entity) {
                        if (entity) {
                            //$("#captureCard").data("CardImageName", entity.name);
                            //$("#captureCard").data("CardImageFullPath", entity.fullPath);
                            savedImageName = entity.name;
                            imageFullPath = entity.fullPath;
                            $("#cardPreview").attr("src", entity.fullPath + "?" +((new Date()) * 1)).show();
                            $("#cardPreview").parent().attr("href", entity.fullPath + "?" + ((new Date()) * 1));
                            customAlert("ImageSaved");
                        }
                        else {
                            //$("#captureCard").data("CardImageName", "");
                            //$("#captureCard").data("CardImageFullPath", "");
                            savedImageName = "";
                            imageFullPath = "";
                            $("#cardPreview").attr("src", "").hide();
                            $("#cardPreview").parent().attr("href", "");
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
        //destructor
        destroy: function () {
            $.Widget.prototype.destroy.call(this);
        },
        save: function (arg) {
            var jsonObj = "{";
            var temp = '"#name": "#value"';
            if ($("#entryForm").valid()) {
                $("#entryForm input:not(:checkbox, :radio), #entryForm select, #entryForm input:checked, #entryForm #mobilePrefix, #entryForm #phonePrefix", this.element).each(function (i) {
                    var input = $(this);
                    var name = input.attr("name");
                    var val = "";
                    if (name && name != "") {
                        val = input.val();
                    }
                    else {
                        name = input.attr("id");
                        val = input.text();
                    }
                    if (i > 0) {
                        jsonObj += ",\n\t";
                    }
                    jsonObj += temp.replace("#name", name).replace("#value", val);
                    //contactInfo[name] = val;
                });

                jsonObj += "}";
                this.options.model.contactInfo = eval("(" + jsonObj + ")");
                this.options.model.contactInfo.imageName = savedImageName;

                return true;
            }
            return false;
        },
        //override
        onNext: function (arg) {
             if(this.save()){
                 var type = $.ui.surveyQuestionBase.getWidgetName(masterPageController._survey.questions[0]);
                 this.navigateTo(type, masterPageController._survey.questions[0]);
             }
        },
        onPrev: function (arg) {

        },
        _countryCodes: null,
        _prefixLookup: null

    });
})(jQuery);