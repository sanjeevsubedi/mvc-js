function DatabaseHelper(callback) {
    /*
        This method is used to initialize database and is called every time app is loaded.
    */
    function populateDB(tx) {        
        tx.executeSql('CREATE TABLE IF NOT EXISTS RESPONSE (id INTEGER PRIMARY KEY, surveyId INT,email VARCHAR(255), response TEXT, status INT, surveyTakenAt INT, updatedAt INT)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS SURVEYSDOWNLOADED (id INTEGER PRIMARY KEY, surveyId INT, filePath VARCHAR(500), response TEXT, status INT, downloadedOn INT)');
        //tx.executeSql('CREATE TABLE IF NOT EXISTS EVENTMONITOR (id INTEGER PRIMARY KEY, IdQuestion INT, IdSession INT, IdGuid VARCHAR(100),TemplateString TEXT, downloadedOn INT)');
        //tx.executeSql('CREATE TABLE IF NOT EXISTS CUSTOMER (id INTEGER PRIMARY KEY, contactid VARCHAR(20), firstname VARCHAR(50), lastname VARCHAR(50), title VARCHAR(20), salutation VARCHAR(20), company VARCHAR(50), position VARCHAR(50), country VARCHAR(50), countryiso VARCHAR(10), street1 VARCHAR(50), street2 VARCHAR(50), street3 VARCHAR(50), zip VARCHAR(10), city VARCHAR(50), state VARCHAR(50), email VARCHAR(50), url VARCHAR(50), phone1 VARCHAR(50), phone2 VARCHAR(50), mobile VARCHAR(50), fax VARCHAR(50), IdGuid VARCHAR(100),TemplateString TEXT, downloadedOn INT, surveyId INT)');
        
        /*tx.executeSql('CREATE INDEX IF NOT EXISTS contactid ON CUSTOMER (contactid)');
        tx.executeSql('CREATE INDEX IF NOT EXISTS IdGuid ON CUSTOMER (IdGuid)');
        tx.executeSql('CREATE INDEX IF NOT EXISTS surveyId ON CUSTOMER (surveyId)');
        tx.executeSql('CREATE INDEX IF NOT EXISTS fname ON CUSTOMER (firstname)');
        tx.executeSql('CREATE INDEX IF NOT EXISTS lname ON CUSTOMER (lastname)');
        tx.executeSql('CREATE INDEX IF NOT EXISTS email ON CUSTOMER (email)');
        tx.executeSql('CREATE INDEX IF NOT EXISTS company ON CUSTOMER (company)');*/

    }

    function errorCDB(err) {
        alert("Error processing SQL: " + err.code + "Message: " + err.message);
    }
    this.isReady = false;
    function successCDB() {
        this.isReady = true;
        if (callback) {
            callback();
        }
    }
    var size =  device.platform.toLowerCase() == "android" ? 4000 : 20000
    var db = window.openDatabase("CiscoSurvey", "1.0", "Cisco Survey", size);
    db.transaction(populateDB, errorCDB, successCDB);


    /*
        Use this method to execute any query.
        parameters
         query: Sql statment(string).
         params: This is array of objects. This will replace "?" in query in given order.
         callback: This method will be called after query execution is compled (failed or sucess) 
    */
    this.execQuery = function (query, params, callback) {
        var queryCB = function (tx) {
            var querySuccess = function (tx, results) {

                /*if (results.rowsAffected) {
                    console.log("Query: " + query + ", Rows Affected: " + results.rowsAffected);
                }
                else {
                    console.log("Query: " + query + ", results: " + results.rows.length);
                }*/
                if (callback) {
                    callback(results, null);
                }

                /*
                    This block of code can be used to itirate through rows on the results returned to callback method.
                */

                /*for (var i = 0; i < results.rows.length; i++) {
                    var row = results.rows.item(i);
                    var rowText = ""
                    for (var key in row) {
                        rowText += (key + " : " + row[key] + ", ");
                    }
                    
                    console.log(rowText);
                }*/
                
            };
            var errorQ = function (err) {
                console.log("Error executing SQL: " + err.code + ", Message: " + err.message + " Query: " + query);
                if (callback) {
                    callback(null, err);
                }
            };
            tx.executeSql(query, params? params:[], querySuccess, errorQ);
        };
        function errorT(err) {
            console.log("Error processing SQL: " + err.code);
        }
        db.transaction(queryCB, errorT);
    }

   

}