function ModelBase() {
    
}

ModelBase.prototype.callApi = function (method, postData, callback) {
    console.log("Api: " + baseServerPath + "/client?method=" + method);
    $.ajax({
        url: baseServerPath + "/client?method=" + method,
        type: "POST",
        dataType: "json",
        data: postData,
        success: function (resp) {
            console.log("Api: Success");
            callback(resp, null);
        },
        error: function (e, m, err) {
            console.log("Api: Error: " + m + " Exp: " + err);
            callback(null, err);
        }
    });
};