function Barcode() {
    
    this.pull = function (server,postdata,callback) {
        $.ajax({
               url: server,
               type: "POST",
               dataType: "json",
               data: postdata,
               beforeSend: function( xhr ) {
               loadingWidget.show();
               },
               success: function (resp) {
               console.log("Barcode Api: Success");
               loadingWidget.hide();
               callback(resp, null);
               },
               error: function (e, m, err) {
               console.log("Barcode Api: Error: " + m + " Exp: " + err);
               loadingWidget.hide();
               callback(null, err);
               }
               });
    	
    }
    
    
}

var barcode = new Barcode();