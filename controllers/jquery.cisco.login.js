(function($) {
	$.widget("cisco.login", $.ui.mainController, {
		// defaul options
		options : {
			model : null
		// model needed by this controller/view
		},
		// constructor
		_create : function() {
			$.ui.mainController.prototype._create.call(this);

		},
		// called when widget is called with no parameter of only options after
		// widget is created
		_init : function() {
			$.ui.mainController.prototype._init.call(this);
			masterPageController.hideNextBtn(true);
			masterPageController.hideBackBtn(true);
			loadingWidget.hide();
			$("#login", this.element).validate();
			$(".micro-tabs, header, #pendingResponses").css("display", "none");
			$("html").addClass("noHeader, loginscreen");
            localStorage.clear();
		},
		// destructor
		destroy : function() {
			$.Widget.prototype.destroy.call(this);
		},
		onNext : function(arg) {
			var me = this;
			if ($("#login", this.element).valid()) {
				loadingWidget.show();
				var usr = {};
				usr.email = $("#Email", this.element).val();
				usr.password = $("#Password", this.element).val();

				ciscoGlobalData.curUser = new User();
				ciscoGlobalData.curUser.login(usr.email, usr.password,
						function(user, error) {
							if (user) {
								user.saveToStorage();

								window.location = "";
								loadingWidget.hide();
							} else {
								ciscoGlobalData.appName = " ";
								customAlert("LoginError", error);
								loadingWidget.hide();
							}
						});
			} else {

			}
		},

		_login : function() {
			var me = this;

			var networkState = navigator.connection.type;
			// check internet
			if (navigator.onLine && networkState != 'none') {

				if ($("#login", this.element).valid()) {
					loadingWidget.show();
					var usr = {};
					usr.email = $("#Email", this.element).val();
					usr.password = $("#Password", this.element).val();

					ciscoGlobalData.curUser = new User();
					ciscoGlobalData.curUser.login(usr.email, usr.password,
							function(user, error) {
								if (user) {
									user.saveToStorage();
									
									var userId = ciscoGlobalData.curUser.id;
									var device_type = device.platform.toLowerCase();
									
									/*get the token*/
									if (device.platform.toLowerCase() != "android") {	
									pushNotification = window.plugins.pushNotification;
				                                      pushNotification.register(
				                                                                tokenHandler,
				                                                                errorHandler,
				                                                                {
				                                                                "badge":"true",
				                                                                "sound":"true",
				                                                                "alert":"true",
				                                                                "ecb":"onNotificationAPN"
				                                                                });
				                                      
				                                      // result contains any error description text returned from the plugin call
				                                      function errorHandler (error) {
				                                    	  alert('error = ' + error);
				                                      }
				                                      
				                                      // iOS
				                                      function onNotificationAPN (event) {
					                                      if ( event.alert ) {
					                                    	  navigator.notification.alert(event.alert);
					                                      }
					                                      
					                                      if ( event.sound ) {
						                                      var snd = new Media(event.sound);
						                                      snd.play();
					                                      }
					                                      
					                                      if ( event.badge ) {
					                                    	  pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, event.badge);
					                                      }
				                                      }
				                                      
				                                      function tokenHandler (result) {
					                                      console.log(result);
					                                      // Your iOS push server needs to know the token before it can push to this device
					                                      // here is where you might want to send it the token for later use.
					                                      //alert('device token = ' + result);
					                                      
					                                      ciscoGlobalData.curUser.sendPushToken(userId,result,device_type,function(response){
					  										window.location = "";
					  										loadingWidget.hide();
					  									});
				                                      }
				                                      
				                                      // result contains any message sent from the plugin call
				                                      function successHandler (result) {
				                                    	  alert('result = ' + result);
				                                      }
				                                      // result contains any error description text returned from the plugin call
				                                      function errorHandler (error) {
				                                    	  alert('error = ' + error);
				                                      }
									
									} else if (device.platform.toLowerCase() == "android"){

											pushNotification = window.plugins.pushNotification;
						                    pushNotification.register(
						                        successHandlerAndroid,
						                        errorHandlerAndroid,
						                        {
						                        "senderID":"992312373308",
						                        "ecb":"onNotificationAndroid"
						                    })

						                    // result contains any message sent from the plugin call
						                    function successHandlerAndroid (result) {
						                    	//alert("successhandler");
						                    	console.log(result)
						                        
						                    }

						                    // result contains any error description text returned from the plugin call
						                    function errorHandlerAndroid (error) {
						                        alert('error = ' + error);
						                    }

						                    // Android and Amazon Fire OS
						                     onNotificationAndroid = function (e) {
						                   
						                    	//alert("onnotification");
						                    	console.log(e.event);
						                        
						                        switch( e.event ){
							                        case 'registered':
							                            if ( e.regid.length > 0 ){

								                            ciscoGlobalData.curUser.sendPushToken(userId,e.regid,device_type,function(response){
						  										window.location = "";
						  										loadingWidget.hide();
						  									});
							                               
							                                console.log("regID = " + e.regid);
							                            }
							                        break;

							                        case 'message':
							                           
							                        break;

							                        case 'error':
							                           
							                        break;

							                        default:
							                            
							                        break;
						                      }
						                    }
          

									} else {

										window.location = "";
										loadingWidget.hide();
									}
								} else {
									ciscoGlobalData.appName = " ";
									//customAlert("LoginError", error);
									customAlert("InvalidUserPassword");
									loadingWidget.hide();
								}
							});
				} 
			} else {
				customAlert("CheckInternet");
			}
		},

		_forgot : function() {
			if ($("#login", this.element).valid()) {
				loadingWidget.show();
				var usr = {};
				usr.email = $("#Email", this.element).val();
				ciscoGlobalData.curUser = new User();
				ciscoGlobalData.curUser.forgotPass(usr.email, function(
						response, error) {
					if (response) {
						if (response.validUser) {
							if (response.sent) {
								$(".login-trigger, .forgot-btn").hide();
								$(".forgot-trigger, .login").show();
								$("#Password").parent().show();
								customAlert("ResetPass");
							} else {
								customAlert("MailProblem");
							}
						} else {
							customAlert("UserNotExists");
						}
					} else {
						customAlert("ForgotPasswordError", error);
					}
				});
				loadingWidget.hide();
			}

			return false;
		},
		_loginTrigger : function() {
			$("#Password").parent().slideDown("fast");
			$(".forgot-trigger, .login").css('display', 'block');
			$(".login-trigger, .forgot-btn").hide();
			return false;
		},
		_forgotTrigger : function() {
			$("#Password").parent().slideUp("fast");
			$(".forgot-trigger, .login").hide();
			$(".login-trigger, .forgot-btn").css('display', 'block');
			return false;

			// var forgotPath = onlinePath+'user/auth/forget_password';
			// window.open(encodeURI(forgotPath, '_system', 'location=yes'));
		},
		onPrev : function(arg) {

		}
	});
})(jQuery);