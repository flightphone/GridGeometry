import { mainObj } from "../store";
import { createGrid } from 'ag-grid-community'

const filterParams = {
    comparator: (filterLocalDateAtMidnight, cellValue) => {
      const dateAsString = cellValue;
      const d = dateAsString;
      if (dateAsString == null) return -1;
      
      const cellDate = new Date(
        Number(d.substr(0, 4)),
        Number(d.substr(5, 2)) - 1,
        Number(d.substr(8, 2)),
      );
  
      if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
        return 0;
      }
  
      if (cellDate < filterLocalDateAtMidnight) {
        return -1;
      }
  
      if (cellDate > filterLocalDateAtMidnight) {
        return 1;
      }
      return 0;
    },
    inRangeFloatingFilterDateFormat: "Do MMM YYYY",
  };

class GridGeometry {
    constructor(idDeclare, el, extparams) {
        this.inited = false;
        this.idDeclare = idDeclare;
        this.extparams = extparams;
        

        this.localParam = `FindGrid${idDeclare}`;


        this.gridOptions = {
            pagination: false,
            loading: true,
            rowSelection: {
                mode: "singleRow",
                checkboxes: false,
                enableClickSelection: true,
            },



            onRowSelected: (ev) => {
                if (this.extparams.onSelect)
                    this.extparams.onSelect(ev);
            },

            onCellFocused: (e) => {
                //console.log(e);
                let rw = e.api.getDisplayedRowAtIndex(e.rowIndex);
                rw.setSelected(true);
            },


            onCellKeyDown: (e) => {
                if (e.event.code == "Enter" && this.extparams.onEnter) {
                    e.node.setSelected(true);
                    this.extparams.onEnter(e.node.data);
                }
                if (e.event.code == "Delete" && this.extparams.onDelete) {
                    e.node.setSelected(true);
                    this.extparams.onDelete();
                }
            },
            onCellDoubleClicked: (e) => {
                if (this.extparams.onEnter) {
                    e.node.setSelected(true);
                    this.extparams.onEnter(e.node.data);
                }
            },


            defaultColDef: {
                sortable: true,
                filter: true,
                resizable: true
            },

            pagination: false,
            //paginationPageSize: 200000,
            //paginationPageSizeSelector: [200000],
            suppressExcelExport: true,



        };
        if (extparams.gridOptions) {
            for (let par in extparams.gridOptions)
                this.gridOptions[par] = extparams.gridOptions[par];
        }
        this.gridApi = createGrid(el, this.gridOptions);
    }

    start = async () => {
        this.mid = await mainObj.fetch(this.idDeclare, "new", this.extparams.SQLParams, this.extparams.TextParams);
    }

    init = () => {
        if (!this.gridOptions.columnDefs) {
            
            let columnDefs = [];
            this.mid.Fcols.forEach(el => {
                //if (el.Visible) 
                {

                    let col = {
                        field: el.FieldName,
                        headerName: el.FieldCaption,
                        valueFormatter: (d) => mainObj.dateformat(d.value, el.DisplayFormat)
                    };
                    let key = `${this.localParam}_width_${el.FieldName}`;
                    let val = localStorage.getItem(key);
                    if (val)
                    {
                        col.width = val;
                    }
                    else
                        col.width = 100;
                    if (el.DisplayFormat && el.DisplayFormat.indexOf("yyyy") > -1)
                    {
                        col.filter =  'agDateColumnFilter';    
                        col.filterParams =  filterParams;
                    }
                    columnDefs.push(col)
                }
            });
            //console.log(columnDefs);
            this.gridApi.setGridOption("columnDefs", columnDefs);
        }
        this.gridApi.setGridOption("rowData", this.mid.MainTab);
        this.gridApi.setGridOption("loading", false);
        //save width
        let wcols = this.gridApi.getColumns();
        wcols.forEach((col) => {
            col.addEventListener('widthChanged', (e) => {
                //console.log(e);
                let key = `${this.localParam}_width_${e.column.colId}`;
                let val = e.column.actualWidth;
                localStorage.setItem(key, val);
            });

        });
        this.inited = true;
        //25.03.2025
        if (this.extparams.onUpdateData)
            this.extparams.onUpdateData(this.mid.MainTab.length);

    }

    updateTab = async () => {

        if (mainObj.jsonData)
            return;
        
        this.gridApi.setGridOption("loading", true);    
        this.gridApi.setGridOption("rowData", []);

        let data = await mainObj.fetch(this.idDeclare, "data", this.mid.SQLParams, this.mid.TextParams);
        if (data.Error) {
            mainObj.alert(data.Error, "Error");
            return;
        }
        this.mid.MainTab = data.MainTab;
        this.gridApi.setGridOption("rowData", data.MainTab);
        this.gridApi.setGridOption("loading", false);    //26.03.2025
        //25.03.2025
        if (this.extparams.onUpdateData)
            this.extparams.onUpdateData(this.mid.MainTab.length);

    }

    openDetail = () => {
        let rs = this.gridApi.getSelectedNodes();
        if (!rs[0]) {
            mainObj.alert('not selected row');
            return;
        }

        let rw = rs[0].data;
        let val = rw[this.mid.KeyF];
        let TextParams = {};
        TextParams[this.mid.KeyF] = val;
        let iddeclare = this.mid.KeyValue;
        let title = rw[this.mid.DispField] + ' (detail) ';
        let newid = this.idDeclare + "_" + rw[this.mid.KeyF];
        mainObj.open(newid, "Bureau.Finder", iddeclare, { SQLParams: TextParams, TextParams: TextParams, title: title });
    };


    rowDelete = async () => {
        let rw = this.gridApi.getSelectedRows();
        if (!rw[0]) {
            mainObj.alert('not selected row');
            return;
        }

        let text = `delete record "${rw[0][this.mid.DispField]}"?`;
        let dires = mainObj.confirm(text, "Delete Record", async ()=>
        //if (dires) 
        {
            if (!mainObj.jsonData) {

                let SQLParams = {};
                SQLParams[this.mid.KeyF] = rw[0][this.mid.KeyF];
                if (this.mid.DelProc.toLowerCase().indexOf("_del_1") > -1) {
                    SQLParams["AUDTUSER"] = null;
                }

                const url = `${mainObj.baseUrl}/exec`;
                let query = {
                    EditProc: this.mid.DelProc,
                    SQLParams: SQLParams
                }
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json;charset=utf-8",
                        'Authorization': mainObj.token
                    },
                    body: JSON.stringify(query),
                });


                const res = await response.json();
                if (res.Error) {
                    mainObj.alert(res.Error, "Error");
                    return false;
                }

            }
            this.gridApi.applyTransaction({ remove: rw });
        });

    }

    exportCsv = () => {
        this.gridApi.exportDataAsCsv();
    }

    save = async (WorkRow, action) => {
        let findData = this.mid;
        for (let f in findData.DefaultValues) {
            WorkRow[f] = findData.DefaultValues[f];
        }
        for (let f in findData.TextParams) {
            WorkRow[f] = findData.TextParams[f];
        }
        //save db
        if (!mainObj.jsonData) {
            let SQLParams = {};
            findData.ReferEdit.SaveFieldList.forEach((f) => {
                SQLParams[f] = WorkRow[f];
            });
            findData.ReferEdit.Editors.forEach((f) => {
                if (f.DisplayFormat == "dd.MM.yyyy HH:mm" && SQLParams[f.FieldName])
                    SQLParams[f.FieldName] = SQLParams[f.FieldName].substring(0, 16).replace("T", " ");
                if (f.DisplayFormat == "#,##0.00" && SQLParams[f.FieldName])
                    SQLParams[f.FieldName] = SQLParams[f.FieldName].toString().replace(",", ".");
            });

            
            const url = `${mainObj.baseUrl}/exec`;
            let query = {
                EditProc: findData.EditProc,
                SQLParams: SQLParams
            }
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json;charset=utf-8",
                    'Authorization': mainObj.token
                },
                body: JSON.stringify(query),
            });

            const res = await response.json();
            if (res.Error) {
                throw res.Error;
            }
            //console.log(res.ColumnTab);
            if (res.ColumnTab.length == 1) {
                WorkRow[findData.KeyF] = res.MainTab[0][res.ColumnTab[0]];
            } else {
                res.ColumnTab.forEach((column) => {
                    WorkRow[column] = res.MainTab[0][column];
                });
            }
        }
        //save db

        if (action == "edit") {
            let rs = this.gridApi.getSelectedNodes();
            let curRow = rs[0];
            if (curRow) {
                curRow.setData(WorkRow);
            }
        }

        if (action == "add") {
            findData.MainTab.unshift(WorkRow);
            this.gridApi.setGridOption("rowData", findData.MainTab);

        }
        return true;
    };
}



export { GridGeometry }