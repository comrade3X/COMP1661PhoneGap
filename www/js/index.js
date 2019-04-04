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
            // Database initialize    
            dbContext = SqlOpenDb(dbName);
            this.createSQLTable();

            // Get list records in db
            this.getStorages();

            /** ----------------------------- */
            /** -- Binding page event -- */
            /** ----------------------------- */

            // Listing click event
            // Redirect to "Edit page"
            $(document).on('click', '#listing-table a', function (e) {
                e.preventDefault();
                e.stopImmediatePropagation();

                //get href of selected listview item and cleanse it
                var id = $(this).data('id');

                // Change view to "Edit page"
                $('#edit').data('id', id);
                $.mobile.changePage('#edit');
            });

            $(document).on('click', '#redirect-edit', function (e) {
                e.preventDefault();
                e.stopImmediatePropagation();

                //get href of selected listview item and cleanse it
                var param = $('#form-detail #txtId').val();

                // Change view to "Detail page"
                $('#edit').data('id', param);
                $.mobile.changePage('#edit');
            });

            /** Page beforechange change event */
            // Fetch data before page change
            $(document).on('pagebeforechange', function (e, data) {

                //get "to page" name
                var toPage = data.toPage[0].id;

                switch (toPage) {
                    case 'edit':
                        var id = $('#edit').data('id');
                        var storegae = { Id: id };
                        app.detailStorage(storegae, 'form-edit');
                        break;
                    case 'detail':
                        var id = $('#detail').data('id');
                        var storegae = { Id: id };
                        app.detailStorage(storegae, 'form-detail');
                        break;
                    case 'home':
                        app.getStorages();
                        break;
                    case 'create':
                        // Clean all input 
                        $('#form-create')[0].reset();
                        break;
                }
            });

            /** Form edit - submit event */
            $('#form-edit').on('submit', function (e) {
                e.preventDefault();
                e.stopImmediatePropagation();

                var storeage = getStorageRec('form-edit');

                var formValid = validateForm(storeage, 'form-edit');

                if (formValid) {
                    app.updateStorage(storeage);
                    $.mobile.changePage('#home');
                }
            });

            /** Form create - submit event */
            $('#form-create').on('submit', function (e) {
                e.preventDefault();
                var storeage = getStorageRec('form-create');

                var formValid = validateForm(storeage, 'form-create');

                if (formValid) {
                    app.addStorage(storeage);
                }
            });

            /** Delete button handle */
            $('#btn-delete').on('click', function (e) {
                e.preventDefault();
                e.stopImmediatePropagation();

                var id = $('#form-edit #txtId').val();

                var storeage = {
                    Id: id
                };

                app.deleteStorage(storeage);
                $.mobile.changePage('#home');
            });

            /**-- End Binding page event -- */
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
                $('#listing-table tbody').remove();

                list = ResultSetToJSON(data, "Id");

                var newRows = '';

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
                    newRows = '<tr><td colspan="4">No record found</td></tr>';
                }

                $('#listing-table').append(newRows);
                $('#listing-table').table('refresh');
            }).fail(function (err) {
                alert('Error. Function getStorages()');
            });
        },
        addStorage: function (Storage) {
            $.when(SqlInsertRecord(dbContext, tblStorage, Storage)).done(function (dta) {

                alert('Insert completed');

                $.mobile.changePage('#home');

            }).fail(function (err) {
                alert('Error. Function addStorage()');
                return;
            });
        },
        detailStorage: function (Storage, formId) {

            // Get detail Storage
            $.when(SqlGetRecordWhere(dbContext, tblStorage, Storage)).done(function (dta) {
                var list = ResultSetToJSON(dta, "Id");

                var obj = list[Storage.Id];

                if (!obj) {
                    alert('Error Function detailStorage(): record not found');
                    return;
                }
                $('#' + formId + ' #txtId').val(obj.Id);

                // JQM Set selected value
                $('#' + formId + ' #ddlType').val(obj.Type).attr('selected', true).siblings('option').removeAttr('selected');
                $('#' + formId + ' #ddlType').selectmenu("refresh", true);

                $('#' + formId + ' #txtAcreage').val(obj.Acreage);
                $('#' + formId + ' #txtPrice').val(obj.Price);

                // JQM Set selected value               
                $('#' + formId + ' #ddlFeature').val(obj.Features).attr('selected', true).siblings('option').removeAttr('selected');
                $('#' + formId + ' #ddlFeature').selectmenu("refresh", true);

                $('#' + formId + ' #txtCreatedDate').val(obj.CreatedDate);
                $('#' + formId + ' #txtNotes').val(obj.Notes);
                $('#' + formId + ' #txtReporter').val(obj.Reporter);

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

    function getStorageRec(formId) {
        var Storage = {
            Type: $('#' + formId + ' #ddlType > option:selected').val(),
            Acreage: $('#' + formId + ' #txtAcreage').val(),
            CreatedDate: $('#' + formId + ' #txtCreatedDate').val(),
            Features: $('#' + formId + ' #ddlFeature > option:selected').val(),
            Price: $('#' + formId + ' #txtPrice').val(),
            Notes: $('#' + formId + ' #txtNotes').val(),
            Reporter: $('#' + formId + ' #txtReporter').val()
        }

        if (formId === 'form-edit') {
            Storage.Id = $('#' + formId + ' #txtId').val();
        }

        return Storage;
    }

    function validateForm(storeage, formId) {
        var isValid = true;

        if (!storeage.Type) {
            isValid = false;
            $('#' + formId + ' #ddlType').focus();
            alert('Field Type is required');
            return isValid;
        }

        if (!storeage.Features) {
            isValid = false;
            $('#' + formId + ' #ddlFeature').focus();
            alert('Field Features is required');
            return isValid;
        }

        if (!storeage.Acreage) {
            isValid = false;
            $('#' + formId + ' #txtAcreage').focus();
            alert('Field Acreage is required');
            return isValid;
        }

        if (!storeage.Price) {
            isValid = false;
            $('#' + formId + ' #txtPrice').focus();
            alert('Field Price is required');
            return isValid;
        }

        if (!storeage.CreatedDate) {
            isValid = false;
            $('#' + formId + ' #txtCreatedDate').focus();
            alert('Created Date is required');
            return isValid;
        }

        if (!storeage.Reporter) {
            isValid = false;
            $('#' + formId + ' #txtReporter').focus();
            alert('Reporter is required');
            return isValid;
        }

        return isValid;
    }

    /** App initialize */
    document.addEventListener("deviceready", onDeviceReady, false);

    function onDeviceReady() {
        app.init();       
    }

    $('#test123').on('click',function(){
        showConfirmDialog();
    });

    function showConfirmDialog() {
        navigator.notification.confirm(
            'Press "Bell" button to take the bell, and "Vibrate" button to take vibrate!', onConfirm,
            'Ring a bell',
            'Vibrate'
        );
    }

    function onConfirm(button) {
        if (button == 1) {
            vibrate();
        } else {
            beep();
        }
    }

    function beep() {
        navigator.notification.beep(1);
    }
    function vibrate() {
        navigator.notification.vibrate(1000);
    }

});



