// variables for database table maintenance
var DB_REAL = "REAL";
var DB_INTEGER = "INTEGER";
var DB_BLOB = "BLOB";
var DB_TEXT = "TEXT";
var DB_FLOAT = "FLOAT";
var DB_NUMERIC = "NUMERIC";

function Left(str, n) {    
    var s = str + '';
    var iLen = s.length;
    if (n <= 0) {
        return "";
    } else if (n >= iLen) {
        return str;
    } else {
        return s.substr(0, n);
    }
}

function Len(str) {    
    if (typeof (str) === 'object') {
        return str.length;
    }
    str += '';
    return str.length;
}

function SqlOpenDb(shortName, version, displayName, maxSize) {    
    var db, dbsize = 1;
    try {
        if (!window.openDatabase) {
            return 0;
        } else {
            if (typeof (shortName) === 'undefined') {
                return 0;
            }
            if (typeof (version) === 'undefined') version = "";
            if (typeof (displayName) === 'undefined') displayName = shortName;
            if (typeof (maxSize) === 'undefined') maxSize = dbsize * (1024 * 1024);
            db = openDatabase(shortName, version, displayName, maxSize);
        }
    } catch (e) {
        return 0;
    }
    return db;
}

function SqlExecute(db, sqlList) {    
    db.transaction(function (transaction) {        
        for (var i = 0; i < sqlList.length; i++) {            
            (function (tx, sql) {
                if (typeof (sql) === 'string') sql = [sql];
                if (typeof (sql[1]) === 'string') sql[1] = [sql[1]];
                var args = (typeof (sql[1]) === 'object') ? sql.splice(1, 1)[0] : [];
                var sql_return = sql[1] || function () { };
                var sql_error = sql[2] || function () { };
                tx.executeSql(sql[0], args, sql_return, sql_error);
            }(transaction, sqlList[i]));
        }
    });
}

function SqlCreateTable(db, TableName, FieldsAndTypes, PrimaryKey, AutoIncrement) {    
    var sb = "(";
    for (item in FieldsAndTypes) {
        sb += "[" + item + "] " + FieldsAndTypes[item];
        if (item == PrimaryKey) {
            sb += " NOT NULL PRIMARY KEY";
        }
        if (item == AutoIncrement) {
            sb += " AUTOINCREMENT";
        }
        sb += ", ";
    }
    sb = Left(sb, (Len(sb) - 2));
    sb += ")";
    sb = "CREATE TABLE IF NOT EXISTS [" + TableName + "] " + sb + ";";
    return Execute(db, sb);
}

function SqlInsertRecord(db, tblName, tblRecord) {    
    var qry, flds = "", vals = "", avals = [];
    for (var key in tblRecord) {
        flds += "[" + key + "],";
        vals += "?,";
        avals.push(tblRecord[key]);
    }
    flds = Left(flds, Len(flds) - 1);
    vals = Left(vals, Len(vals) - 1);
    
    qry = "INSERT INTO [" + tblName + "] (" + flds + ") VALUES (" + vals + ");";
    return Execute(db, qry, avals);
}

function SqlUpdateRecordWhere(db, tblName, tblRecord, tblWhere) {    
    var qry = "", vals = "", wvals = "", avals = [];
    for (item in tblRecord) {
        vals += "[" + item + "] = ?,";
        avals.push(tblRecord[item]);
    }
    for (item in tblWhere) {
        wvals += "[" + item + "] = ? AND ";
        avals.push(tblWhere[item]);
    }
    vals = Left(vals, Len(vals) - 1);
    wvals = Left(wvals, Len(wvals) - 5);
    qry = "UPDATE [" + tblName + "] SET " + vals + " WHERE " + wvals + ";";
    return Execute(db, qry, avals);
}

function SqlGetRecordWhere(db, tblName, tblWhere) {    
    var qry = "", vals = "", avals = [];
    for (item in tblWhere) {
        vals += "[" + item + "] = ? AND ";
        avals.push(tblWhere[item]);
    }
    vals = Left(vals, Len(vals) - 5);
    qry = "SELECT * FROM [" + tblName + "] WHERE " + vals + ";";   
    return Execute(db, qry, avals);
}

function SqlUpdateRecords(db, tblName, tblRecord) {    
    var vals = "", avals = [];
    for (item in tblRecord) {
        vals = vals + "[" + item + "] = ?,";
        avals.push(tblRecord[item]);
    }
    vals = Left(vals, Len(vals) - 1);
    var qry = "UPDATE [" + tblName + "] SET " + vals + ";";
    return Execute(db, qry, avals);
}

function Execute(db, qry, args) {   
    if (typeof (args) === 'undefined') args = [];
    return $.Deferred(function (d) {
        db.transaction(function (tx) {
            tx.executeSql(qry, args, successWrapper(d), failureWrapper(d));
        });
    });
};

function SqlGetRecords(db, TableName, PrimaryKey) {    
    var qry = "SELECT * FROM [" + TableName + "] ORDER BY [" + PrimaryKey + "]";
    return Execute(db, qry);
};

function SqlGetDistinctField(db, TableName, FldName) {    
    var qry = "SELECT DISTINCT [" + FldName + "] FROM [" + TableName + "] ORDER BY [" + FldName + "]";
    return Execute(db, qry);
};

function successWrapper(d) {    
    return (function (tx, data) {
        d.resolve(data)
    })
};

function failureWrapper(d) {   
    return (function (tx, error) {
        console.log(error);
        d.reject(error)
    })
};

function ResultSetToJSON(results, PrimaryKey) {  
    var Records = {};
    var len = results.rows.length - 1, priKey, i, row;   
    for (i = 0; i <= len; i++) {       
        row = results.rows.item(i);        
        priKey = row[PrimaryKey];           
        Records[priKey] = row;
    }
    return Records;
}

function SqlDeleteRecordWhere(db, tblName, tblWhere) {  
    var qry, wvals = "", avals = [];
    for (item in tblWhere) {
        wvals += "[" + item + "] = ? AND ";
        avals.push(tblWhere[item]);
    }   
    wvals = Left(wvals, Len(wvals) - 5);
    qry = "DELETE FROM [" + tblName + "] WHERE " + wvals + ";";
    return Execute(db, qry, avals);
};