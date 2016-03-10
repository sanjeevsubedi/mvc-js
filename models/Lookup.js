function Lookup() {

    this.pull = function (server,postdata,callback) {
        $.ajax({
        	xhrFields: {
	        	onprogress: function (e) {
		        	if (e.lengthComputable) {
		        			jQuery(".loadingBg").css({'z-index':'1000'});
		        			var dataDownloaded = langMgr.getTranslation("DataDownloaded");
				        	jQuery(".progress").html(Math.ceil(e.loaded / e.total * 100) + '% ' + dataDownloaded).css({'margin-top':'10px','width':'165px'});
				    }
	        	}
        	},
            url: server,
            type: "POST",
            dataType: "json",
            data: postdata,
            beforeSend: function( xhr ) {
           	 	//$("#lookup-container").html("Loading ...");
        	 jQuery(".loadingBg").css({'z-index':'1000'});	
        	 loadingWidget.show();
        	 var requestData = langMgr.getTranslation("RequestData")
        	 jQuery(".progress").html(requestData + '...');
           	 },
            success: function (resp) {
                console.log("Lookup Api: Success");
                loadingWidget.hide();
                callback(resp, null);
            },
            error: function (e, m, err) {
                console.log("Lookup Api: Error: " + m + " Exp: " + err);
                loadingWidget.hide();
                callback(null, err);
            }
        });
    	
    }


}

var lookup = new Lookup();