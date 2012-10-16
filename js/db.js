window.dao =  {

    syncURL: __config['medico_url'] + __config['sync'],

    initialize: function(callback) {
        var self = this;
        this.db = window.openDatabase(dbname, "1.0", "Medico Clicnic system", 5 * 1024 * 1024);

        // Testing if the table exists is not needed and is here for logging purpose only. We can invoke createTable
        // no matter what. The 'IF NOT EXISTS' clause will make sure the CREATE statement is issued only if the table
        // does not already exist.
        this.db.transaction(
            function(tx) {
                tx.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='suggestion_word'", this.txErrorHandler,
                    function(tx, results) {
                        if (results.rows.length == 1) {
                            log('Using existing suggestion word table in local SQLite database');
                        }
                        else
                        {
                            log('Suggestion word  table does not exist in local SQLite database');
                            self.createTable(callback);
                        }
                    });
            }
        )

    },
        
    createTable: function(callback) {
        this.db.transaction(
            function(tx) {
                var sql =
                    "CREATE TABLE IF NOT EXISTS suggestion_word ( " +
                    "suggestion_word_id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                    "word VARCHAR(64), " +
                    "empid INTEGER, " +
                    "helptypeid INTEGER, " +
                    "lastupdate VARCHAR(64)"+
                    ")";
                tx.executeSql(sql);
            },
            this.txErrorHandler,
            function() {
                log('Table suggestion word successfully CREATED in local SQLite database');
                callback();
            }
        );
    },
    
    clearSuggestion : function  (callback) {
      	 this.db.transaction(
            function(tx) {
                tx.executeSql('DELETE FROM suggestion_word');
            },
            this.txErrorHandler,
            function() {
                log('Table suggestion_word successfully CLEAR in local SQLite database');
                callback();
            }
        );
    },
    dropTable:
     function(callback) {
        this.db.transaction(
            function(tx) {
                tx.executeSql('DROP TABLE IF EXISTS suggestion_word');
            },
            this.txErrorHandler,
            function() {
                log('Table suggestion_word successfully DROPPED in local SQLite database');
                callback();
            }
        );
    },
    
    setSuggestionWord : function (txt,callback, type) {
    	var self = this;
    	
    	this.db.transaction(
            function(tx) {
                var sql = "SELECT * FROM suggestion_word where helptypeid="+type+" and  word = '"+txt+"'";
                //log('Local SQLite database: "SELECT * FROM suggestion_word type = '+type+'"');
                tx.executeSql(sql, this.txErrorHandler,
                    function(tx, results) {
                       var len = results.rows.length;
                        var arr;
                        if (len==0) {
                        	arr = new Array();
                        	arr[0] = {word:txt, helpTypeId: type };
                        	
                        	self.loadSuggestion(arr, function () {
                        		//notthing 
                        		log ('add new word');
                        		callback();
                        	});
                        }
                        
                    }
                );
            }
        );
    },
    
    findSuggestionWord : function (txt,callback,helpTypeId) {
    	this.db.transaction(
            function(tx) {
                var sql = "SELECT * FROM suggestion_word where helptypeid="+helpTypeId+" and  word like '"+txt+"%' limit 20";
                //log('Local SQLite database: "SELECT * FROM suggestion_word type = '+type+'"');
                tx.executeSql(sql, this.txErrorHandler,
                    function(tx, results) {
                        var len = results.rows.length,
                            suggestion = [],
                            i = 0;
                        for (; i < len; i = i + 1) {
                            suggestion[i] = results.rows.item(i);
                        }
                        log(len + ' rows found');
                        callback(suggestion);
                    }
                );
            }
        );
    },
    
    findSuggestionType: function (type, callback) {
    	if (typeof type=='undefined' || type==null  || type==0) return;
    	this.db.transaction(
            function(tx) {
                var sql = "SELECT * FROM suggestion_word where helptypeid="+type;
                log('Local SQLite database: "SELECT * FROM suggestion_word type = '+type+'"');
                tx.executeSql(sql, this.txErrorHandler,
                    function(tx, results) {
                        var len = results.rows.length,
                            suggestion = [],
                            i = 0;
                        for (; i < len; i = i + 1) {
                            suggestion[i] = results.rows.item(i);
                        }
                        log(len + ' rows found');
                        callback(suggestion);
                    }
                );
            }
        );
    },

    findSugestionAll: function(callback) {
        this.db.transaction(
            function(tx) {
                var sql = "SELECT * FROM suggestion_word";
                log('Local SQLite database: "SELECT * FROM suggestion_word"');
                tx.executeSql(sql, this.txErrorHandler,
                    function(tx, results) {
                        var len = results.rows.length,
                            employees = [],
                            i = 0;
                        for (; i < len; i = i + 1) {
                            employees[i] = results.rows.item(i);
                        }
                        log(len + ' rows found');
                        callback(employees);
                    }
                );
            }
        );
    },
	
    getLastSync: function(callback) {
        this.db.transaction(
            function(tx) {
                var sql = "SELECT MAX(lastupdate) as lastSync FROM suggestion_word";
                tx.executeSql(sql, this.txErrorHandler,
                    function(tx, results) {
                        var lastSync = results.rows.item(0).lastSync;
                        log('Last local timestamp is ' + lastSync);
                        callback(lastSync);
                    }
                );
            }
        );
    },

    sync: function(callback) {

        var self = this;
        log('Starting synchronization...');
        this.getLastSync(function(lastSync){
            self.getChanges(self.syncURL, lastSync,
                function (changes) {
                    if (changes.length > 0) {
                        self.applyChanges(changes, callback);
                    } else {
                        log('Nothing to synchronize');
                        callback();
                    }
                }
            );
        });

    },

    getChanges: function(syncURL, modifiedSince, callback) {

        $.ajax({
            url: syncURL,
            data: {modifiedSince: modifiedSince},
            dataType:"json",
            success:function (data) {
                log("The server returned " + data.length + " changes that occurred after " + modifiedSince);
                callback(data);
            },
            error: function(model, response) {
                alert(response.responseText);
            }
        });

    },

    loadSuggestion : function (data,callback) {
    	 this.db.transaction(
            function(tx) {
                var l = data.length;
          		var sql;
                log('Inserting or Updating in local database:');
                var e;
                for (var i = 0; i < l; i++) {
                    e = data[i];
                    log(e.suggestionWordId + ' ' + e.word + ' ' + e.empId + ' ' + e.helpTypeId +' '+ e.lastupdate);
                    var params;
                    if (typeof e.suggestionWordId=='undefined') {
                    	sql =
	                    "INSERT OR REPLACE INTO suggestion_word (word, helptypeid) " +
	                    "VALUES (?, ?)";
                    	params = [e.word, e.helpTypeId];
                    } else {
                    	sql =
	                    "INSERT OR REPLACE INTO suggestion_word (suggestion_word_id, word, empid, helptypeid, lastupdate) " +
	                    "VALUES (?, ?, ?, ?, ?)";
                    	params = [e.suggestionWordId, e.word, e.empId, e.helpTypeId, e.lastupdate];
                    }
                    
                    tx.executeSql(sql, params);
                }
                log('Synchronization complete (' + l + ' items synchronized)');
            },
            this.txErrorHandler,
            function(tx) {
                callback();
            }
        );
    },

    txErrorHandler: function(tx) {
        alert(tx.message);
    }
};


$('#reset').on('click', function() {
    dao.dropTable(function() {
       dao.createTable();
    });
});


$('#sync').on('click', function() {
    dao.sync(renderList);
});

$('#render').on('click', function() {
    renderList();
});

$('#clearLog').on('click', function() {
    $('#log').val('');
});

function log(msg) {
    //$('#log').val($('#log').val() + msg + '\n');
    console.log (msg);
}
