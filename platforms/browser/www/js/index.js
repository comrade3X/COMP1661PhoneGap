/*
 * Author: Tien Dung
 * Email: dungltgt60872@fpt.edu.vn
 */

$(function () {

    // Define Web SQL DB context   
    var dbContext;
    var dbName = "MyStorage";
    var tblStorage = "Storage";

    var app = {
        init: function () {
            // Open Web SQL database
            dbContext = SqlOpenDb(dbName);

            // Create SQL table
            this.createSQLTable();

            // Insert sample record;
            // var storegae = getStorageRec();
            // this.addStorage(storegae);
           
            // // Delete
            // this.deleteStorage(storegae2);
            // console.log('app processing init...');

            this.getStorages();

            $(document).on('click', '#listing-table a', function (e) {
                e.preventDefault();
                e.stopImmediatePropagation();

                //get href of selected listview item and cleanse it
                var param = $(this).data('id');

                $('#edit').data('id', param);
                $.mobile.changePage('#edit');
            });

            $(document).on('pagebeforechange', function (e, data) {
                //get "to page" name
                var toPage = data.toPage[0].id;

                switch (toPage) {
                    case 'edit':
                        var id = $('#edit').data('id');
                        var storegae = { Id: id };
                        app.detailStorage(storegae);
                        break;
                    case 'home':
                        app.getStorages();
                        break;
                    case 'pgRptContact':
                        app.ContactRpt();
                        break;
                }
            });

            $('#btn-update').on('click', function (e) {
                e.preventDefault();
                e.stopImmediatePropagation();

                var storeage = getStorageRec();             
               
                app.updateStorage(storeage);
                $.mobile.changePage('#home');
            });
        },
        createSQLTable: function () {
            var tblStructure = {};
            tblStructure.Id = DB_INTEGER;
            tblStructure.Type = DB_TEXT;
            tblStructure.Acreage = DB_FLOAT;
            tblStructure.CreatedDate = DB_TEXT;
            tblStructure.Features = DB_TEXT;
            tblStructure.Price = DB_FLOAT;
            tblStructure.Notes = DB_TEXT;
            tblStructure.Reporter = DB_TEXT;

            SqlCreateTable(dbContext, tblStorage, tblStructure, "Id", "Id");
        },
        getStorages: function () {

            var list = {};

            $.when(SqlGetRecords(dbContext, tblStorage, "Id")).done(function (data) {

                // Clean table
                $('#listing-table tbody tr').remove();

                // return json object of all records
                list = ResultSetToJSON(data, "Id");

                var newRows = '';

                // Check list records is empty                 
                if (!$.isEmptyObject(list)) {

                    for (var n in list) {
                        var rec = list[n];

                        var eachRow = '<tr>';
                        eachRow += '<td>' + '<a data-id="' + rec.Id + '">' + rec.Type + '</a>' + '</td>';
                        eachRow += '<td>' + rec.Acreage + ' m2' + '</td>';
                        eachRow += '<td>' + rec.Features + '</td>';
                        eachRow += '<td>' + '$' + rec.Price + '</td>';
                        eachRow += '<td>' + rec.CreatedDate + '</td>';
                        eachRow += '<td>' + rec.Notes + '</td>';
                        eachRow += '<td>' + rec.Reporter + '</td>';
                        eachRow += '</tr>';

                        newRows += eachRow;
                    }
                } else {
                    newRows = 'No record found';
                }

                $('#listing-table').append(newRows);
                $('#listing-table').table('refresh');
            }).fail(function (err) {
                alert('Error. Function getStorages()');
            });
        },
        addStorage: function (Storage) {
            $.when(SqlInsertRecord(dbContext, tblStorage, Storage)).done(function (dta) {
                console.log('Insert completed');
            }).fail(function (err) {
                alert('Error. Function detailStorage()');
                return;
            });
        },
        detailStorage: function (Storage) {
            // Get detail Storage
            $.when(SqlGetRecordWhere(dbContext, tblStorage, Storage)).done(function (dta) {
                var list = ResultSetToJSON(dta, "Id");

                var obj = list[Storage.Id];

                if (!obj) {
                    alert('Error Function detailStorage(): record not found');
                    return;
                }
                $('#txtId').val(obj.Id);
                $('#txtType').val(obj.Type);
                $('#txtAcreage').val(obj.Acreage);
                $('#txtPrice').val(obj.Price);
                $('#txtFeature').val(obj.Features);
                var createdDate = dateFormat(obj.CreatedDate);
                $('#txtCreatedDate').val(createdDate);
                $('#txtNotes').val(obj.Notes);
                $('#txtReporter').val(obj.Reporter);

            }).fail(function (err) {
                alert('Error. Function detailStorage()');
                return;
            });
        },
        deleteStorage: function (Storage) {
            $.when(SqlDeleteRecordWhere(dbContext, tblStorage, Storage)).done(function () {
                alert('Record deleted');
            }).fail(function (err) {
                alert('Error. Function deleteStorage()');
                return;
            });
        },
        updateStorage: function (Storage) {
            var updateRec = { Id: Storage.Id };

            $.when(SqlUpdateRecordWhere(dbContext, tblStorage, Storage, updateRec)).done(function () {
                alert('Record Updated');
            }).fail(function (err) {
                alert('Error. Function updateStorage()');
                return;
            });
        }
    };

    function getStorageRec() {
        var Storage = {
            Id: $('#txtId').val(),
            Type: $('#txtType').val(),
            Acreage: $('#txtAcreage').val(),
            CreatedDate: $('#txtCreatedDate').val(),
            Features: $('#txtFeature').val(),
            Price: $('#txtPrice').val(),
            Notes: $('#txtNotes').val(),
            Reporter: $('#txtReporter').val()
        }

        return Storage;
    }

    function dateFormat(date) {
        var from = date.split("/")
        var createdDate = new Date(from[2], from[1] - 1, from[0]);

        var day = ("0" + createdDate.getDate()).slice(-2);
        var month = ("0" + (createdDate.getMonth() + 1)).slice(-2);
        var res = createdDate.getFullYear() + "-" + (month) + "-" + (day);
        return res;
    }

    document.addEventListener("deviceready", onDeviceReady, false);

    function onDeviceReady() {
        app.init();
    }
});



