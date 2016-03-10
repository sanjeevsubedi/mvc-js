function FilesystemHelper() {
			var allFiles = [];
            var failCB = function (msg) {
                return function () {
                    console.log('[FAIL] ' + msg);
                }
            },
            fileSystem;

            var filesQue = new Array();
            var fileSystemStatus = 0;

            //console.log("on request file system");

            //window.webkitStorageInfo.requestQuota(PERSISTENT, 1024*1024, function(grantedBytes) {
                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, function () {
                    console.log("failed getting fs");
                    var func = failCB('requestFileSystem');
                    func();
                    fileSystemStatus = -1;
                });
            /*}, function(e) {
            console.log('Error', e); 
            });*/
            //console.log("requested file system");
            
            function gotFS(fs) {
                //console.log("got file system");
                fileSystem = fs;
                fileSystemStatus = 1;
                appFolderPath = fs.root.toURL(); //set the application folder path
            }

            this.getDir = function (dirName, callback, parent) {
                var me = this;
                if (!parent) {
                    parent = fileSystem.root;
                }
                if (fileSystemStatus == -1) {
                    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0
                    , function (fs) { gotFS(fs); me.getDir(dirName, callback) }
                    , function () {
                        var func = failCB('requestFileSystem');
                        func();
                        fileSystemStatus = -1;
                        if (callback) {
                            callback(null);
                        }
                    });
                }
                else {
                    parent.getDirectory(dirName, { create: false, exclusive: false },
                            function (dir) {
                                callback(dir);
                            },
                            function () {
                                callback(null);
                            });
                }
            }

    this.getDirRecursively = function (path, callback) {
        var dirParts = path.split("/");
        var i=0;
        var me = this;
        var loop = function (parent) {
            console.log("getting: " + dirParts[i]);
            var curDir = dirParts[i];
            if (!curDir || curDir=="undefined") {
                callback(parent, null);
            }
            else {
                me.getDir(curDir, function (entry) {
                    i++;
                    console.log("callback: " + curDir);
                    if (i == dirParts.length || !curDir) {
                        callback(entry, null);
                    }
                    else {
                        if (entry) {
                            console.log("got: " + curDir);
                            loop(entry);
                        }
                        else {
                            callback(null, "Dir chain broken");
                        }
                    }
                }, parent);
            }
        };

        loop();

    }
    
    this.getFileFromEntry = function(entry, callback, readonly){
        var newFile = new File(entry, readonly, callback);
        newFile.setEntry(entry);
    }
    
    this.getFileFromPath = function (fileName, callback, readonly, isFullUrl) {
        var me = this;
        //console.log("on get file");
        if (fileSystemStatus == -1) {
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0
            , function (fs) { gotFS(fs); me.getFile(fileName, callback,readonly, isFullUrl) }
            , function () {
                var func = failCB('requestFileSystem');
                func();
                fileSystemStatus = -1;
                if (callback) {
                    callback(null);
                }
            });
        }
        else {
        	if(!allFiles[fileName]){
	            filesQue.push({ fileName: fileName, callback: callback, isFullUrl:isFullUrl});
	            var funcPoll = function () {
	                if (fileSystemStatus == 0) {
	                    setTimeout(funcPoll, 100);
	                }
	                else {
	                    if (fileSystemStatus == 1) {
	                        while (filesQue.length > 0) {
	                            var fileItem = filesQue.splice(0, 1)[0];
	                            if (fileItem.callback) {
	                            	var newFile = new File(fileItem.fileName, readonly, fileItem.callback, fileItem.isFullUrl);
	                            	newFile.getFile();
	                                //fileItem.callback(newFile)
	                            }
	                        }
	                    }
	                    else {
	                        if (fileItem.callback) {
	                            fileItem.callback(null)
	                        }
	                    }
	                }
	            }
	            funcPoll();
        	}
        	else{
        		if (callback) {
                    callback(allFiles[fileName]);
                }        		
        	}
        }

    }
    
    this.getFile = function(fileName, callback, readonly, isFullUrl){
        if(typeof fileName =="string"){
            this.getFileFromPath(fileName, callback, readonly, isFullUrl);
        }
        else if(typeof fileName =="object"){
           this.getFileFromEntry(fileName, callback, readonly);
        }
    }

    function File(FILENAME, readonly, callback, isFullUrl) {
        var writer = { available: false };
        var reader = { available: false }
        var entry = null;
        var parentDir = null;
        //console.log("creating file");
        var fail = failCB('getFile');
        var me = this;
        function gotFileEntry(fileEntry) {
            var fail = failCB('createWriter');
            entry = fileEntry;
            reader.available = true;
            if(!readonly){
	            fileEntry.createWriter(gotFileWriter, function(){
    				fail();
    				if(callback){    					
    	            	callback(null)
    	            }
    			});
	            //readText();
            }
            else{
            	if(callback){
                    allFiles[FILENAME] = me;
                    callback(me);                    
	            }            	
            }
        }
        
        this.setEntry = function(entry){
            gotFileEntry(entry);
        }
        

        var fileParts = {};
        if(FILENAME && FILENAME.split){
            fileParts = FILENAME.split("/");
        }
        var createDirRecursively = function(i, parent){
        	
        	var filePart = fileParts[i];
        	//console.log("Filepart: " + filePart);
        	if(filePart && filePart!=""){
        		if(i== fileParts.length-1){
        			parentDir = parent;
        			parent.getFile(filePart, { create: !readonly, exclusive: false },
                            gotFileEntry, function(){
		        				fail();
		        				if(callback){
		        	            	callback(null)
		        	            }
		        			}
        			);
        			
        		}
        		else{
        			parent.getDirectory(filePart, {create: true, exclusive: false},
		        			function(dir){
	        					curDir = dir
	        					createDirRecursively(++i, dir);
		        			},
		        			function(){
		        				console.log("Creating directory '"+ filePart +"' failed")
		        			}
	        			);	
        		}
        	}
        	
        }
        
        this.getFile = function(){
        	me = this;
        	if(isFullUrl){
        		console.log("Is full uri: " + FILENAME);
                window.resolveLocalFileSystemURI(FILENAME, function(entry){
        				console.log("Resolve success");
        				gotFileEntry(entry);         				
        			}, function(evt){
                      console.log("Resolve failed");
    				  fail();
    				  if(callback){
    	            	 callback(null)
    	              }
    			})
        	}
        	else{
        		createDirRecursively(0, fileSystem.root);
        	}
        }
        
        this.moveTo = function(path, callback){
        	console.log("In moveTo");
        	if(entry){     
        		console.log("has entry and dest file: " + path);
        		var newFile = new File(path, false, function(file){
        			if(file){
        				console.log("Dest file created");
        				var parent = file.getParent();
        				console.log(parent.fullPath);
        				var fileName = file.getName();
        				//file.deleteFile(function(deletedFile){
        					entry.moveTo(parent, fileName ,function(movedEntry){
		        					console.log("Move success");
		        					callback(movedEntry);
			        			},
			        			function(err){
			        				console.log("Move failed: " + err.code);
		        					callback(null);
			        			});	
        				//});
        			}
        			else{
        				console.log("could not create Dest file");
        				callback(null);
        			}
	        	});
        		
        		newFile.getFile();
        	}
        }
        

        function gotFileWriter(fileWriter) {
            //console.log("got writer");
            writer.available = true;
            writer.object = fileWriter;
            var length = fileWriter.length;
            fileWriter.seek(length);            
            if(callback){
            	allFiles[FILENAME] = me;
            	//alert(me.getFullPath());
            	callback(me);
            }
        }
        this.isReaderAvailable = function () {
            return reader.available;
        }
        this.isWriterAvailable = function () {
            return writer.available;
        }
        this.getFileEntry = function () {
            return entry;
        };
        this.getFileLength = function () {
            if (writer.available) {
                return writer.object.length;
            }
            else {
                return NaN;
            }
        };
        this.getFullPath = function(){
        	return entry.fullPath;
        }
        this.getName = function(){
        	return entry.name;
        }
        
        this.getParent = function(){
        	return parentDir;
        }
        
        this.saveText = function (txt) {
            //console.log("on save text");
            if (writer.available) {
                writer.available = false;
                writer.object.onwriteend = function (evt) {
                    writer.available = true;
                    //writer.object.seek(0);
                }
                writer.object.write(txt);
            }

            return false;
        }

        this.readText = function (onReadComplete) {
            //console.log("on read text");          
            var readText = ""
            if (entry) {
                entry.file(function (dbFile) {
                    var reader = new FileReader();
                    reader.onloadend = function (evt) {
                        readText = evt.target.result;
                        onReadComplete(readText);
                    }
                    reader.readAsText(dbFile);
                }, function () {
                    var func = failCB("FileReader")
                    func() ;
                    onReadComplete(null);
                });
            }

            return false;
        }
        this.deleteFile = function(callback){
        	entry.remove(function(entry){
        		console.log("Deleted: " + FILENAME);
        		if(callback){
        			callback(entry)
        		}
        	},function(){
        		console.log("Delete failed: " + FILENAME);
        		if(callback){
        			callback(null);
        		}
        	});
        	allFiles[FILENAME] = null;
        }
    }




}
