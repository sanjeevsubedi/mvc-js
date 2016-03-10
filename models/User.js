function User() {
    this.id;
    this.email;
    this.company;
    this.isValid = false;

    ModelBase.call(this);

    this.login = function (email, psw, callback) {
        var me = this;
        this.callApi("login", { email: email, password: psw }, function (user, err) {
            if (user) {
                me.id = user.user_id;
                me.email = user.email;
                me.isValid = user.valid_user;
                me.company = user.company;
                if (me.isValid) {
                    callback(me);
                }
                else {
                    callback(null, "Incorrect login");
                }
            }
            else {
                if (!isPhoneGap) {
                    var user = new User();
                    user.id = 2
                    user.email = "sanjeev";
                    user.isValid = true;
                    callback(user, null);
                }
                else {
                    callback(null, err);
                }
            }
        });
    }

    this.forgotPass = function (email,callback) {
        var me = this;
        //me.status = true;
        //callback(me);
        this.callApi("forgot", { email: email}, function (response, err) {
            if (response) {
                if (response.valid_user && response.sent) {
                    me.validUser = true;
                    me.sent = true;
                	callback(me);
                }
                else if (!response.valid_user && !response.sent) {
                    me.validUser = false;
                    me.sent = false;
                	callback(me);
                }
                else if (response.valid_user && !response.sent) {
                    me.validUser = true;
                    me.sent = false;
                	callback(me);
                }
                else {
                	callback(null);
                }
            }
            else {
               callback(null, err);
            }
        });
    }
    
    this.sendPushToken = function (user_id,token_no,device_type,callback) {
        var me = this;
        //me.status = true;
        //callback(me);
        this.callApi("pushtoken", { userId: user_id, token: token_no, device: device_type }, function (response, err) {
            if (response) {
               	callback(response);
            }
            else {
               callback(null, err);
            }
        });
    }
    
    this.loadFromStorage = function () {
        if (localStorage.userInfo && localStorage.userInfo != "") {
            try{
                var user = eval("(" + localStorage.userInfo + ")");
                this.id = user.id;
                this.email = user.email;
                this.company = user.company;
                return true;
            }
            catch (ex) {
                console.log(ex.message);
            }

        }
        return false;
    }

    this.saveToStorage = function () {
        localStorage.userInfo = JSON.stringify({id:this.id, email: this.email, company: this.company});
    }
}
User.prototype = new ModelBase();
User.prototype.constructor = User;