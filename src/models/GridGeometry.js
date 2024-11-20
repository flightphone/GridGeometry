import { mainObj } from "../store";
import { createGrid } from 'ag-grid-community'

class GridGeometry {
    constructor(idDeclare, el, extparams) {
        this.idDeclare = idDeclare;
        this.extparams = extparams;
        this.gridOptions = {
            rowSelection: {
                mode: "singleRow",
                checkboxes: false,
                enableClickSelection: true,
            },

            onRowSelected: (ev) => {
                if (this.extparams.onSelect)
                    this.extparams.onSelect(ev);
            },
            /*
            onCellFocused: (e) => {
                //console.log(e);
                //current = e; currentI = current.rowIndex;
                //let rw = gridApi.rowModel.rowsToDisplay[e.rowIndex];
                let rw = e.api.getRowNode(e.rowIndex);
                rw.setSelected(true);
            },
            */

            defaultColDef: {
                sortable: true,
                filter: true,
                resizable: true
            },

            pagination: true,
            suppressExcelExport: true,

            /*   
            onCellFocused: (e) => {
                try {
                  console.log(e);  
                  let rw = e.api.rowModel.rowsToDisplay[e.rowIndex];
                  rw.setSelected(true);
                }
                catch {;}
            },
            */

        };
        this.gridApi = createGrid(el, this.gridOptions);
    }

    start = async () => {
        try {
            if (mainObj.jsonData) {
                const url = `/FinderStart${this.idDeclare}.json`;
                const response = await fetch(url);
                this.mid = await response.json();
            }
            else {
                const url = `${mainObj.baseUrl}React/FinderStart`;
                const bd = new FormData();
                bd.append("id", this.idDeclare);
                bd.append("mode", "new");
                if (this.extparams.SQLParams) bd.append("SQLParams", JSON.stringify(this.extparams.SQLParams));
                if (this.extparams.TextParams) bd.append("TextParams", JSON.stringify(this.extparams.TextParams));

                const response = await fetch(url, {
                    method: "POST",
                    body: bd,
                    cache: "no-cache",
                    //credentials: "include",
                });
                this.mid = await response.json();
            }
        }
        catch (err) {
            this.mid = { Error: err.toString() };
        }
    }

    init = () => {
        let columnDefs = [];
        this.mid.Fcols.forEach(el => {
            if (el.Visible) {
                columnDefs.push({ field: el.FieldName, headerName: el.FieldCaption, valueFormatter: (d) => mainObj.dateformat(d.value, el.DisplayFormat) })
            }
        });
        this.gridApi.setGridOption("columnDefs", columnDefs);
        this.gridApi.setGridOption("rowData", this.mid.MainTab);
    }

    updateTab = async () => {
        try {
            //const response = await fetch("/Finder.json");
            //const response = await fetch(url);
            if (mainObj.jsonData)
                return;
            this.gridApi.setGridOption("rowData", []);
            const url = `${mainObj.baseUrl}React/FinderStart`;
            const bd = new FormData();
            bd.append("id", this.idDeclare);
            bd.append("mode", "data");
            bd.append("page", this.mid.page.toString());
            bd.append("Fc", JSON.stringify(this.mid.Fcols)); //mid.Fcols
            if (this.mid.SQLParams)
                bd.append("SQLParams", JSON.stringify(this.mid.SQLParams));
            if (this.mid.TextParams)
                bd.append("TextParams", JSON.stringify(this.mid.TextParams));
            const response = await fetch(url, {
                method: "POST",
                body: bd,
                cache: "no-cache",
                //credentials: "include",
            });
            let data = await response.json();
            if (data.Error) {
                mainObj.alert(data.Error);
                return;
            }
            this.mid.MainTab = data.MainTab;
            this.gridApi.setGridOption("rowData", data.MainTab);

        }
        catch (err) {
            //this.mid = { Error: err.toString() };
            mainObj.alert(err.toString())
        }

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
        mainObj.open(newid, "Bureau.Finder", iddeclare, { TextParams: TextParams, title: title });
    };


    rowDelete = async () => {
        let rw = this.gridApi.getSelectedRows();
        if (!rw[0]) {
            mainObj.alert('not selected row');
            return;
        }

        let text = `delete record "${rw[0][this.mid.DispField]}"?`;
        let dires = mainObj.confirm(text);
        if (dires) {
            if (!mainObj.jsonData) {

                let SQLParams = {};
                SQLParams[this.mid.KeyF] = rw[0][this.mid.KeyF];
                if (this.mid.DelProc.toLowerCase().indexOf("_del_1") > -1) {
                    SQLParams["AUDTUSER"] = this.mid.Account;
                }

                const url = mainObj.baseUrl + "React/exec";
                let bd = new FormData();

                bd.append("EditProc", this.mid.DelProc);
                bd.append("SQLParams", JSON.stringify(SQLParams));
                bd.append("KeyF", this.mid.KeyF);
                bd.append("IdDeclare", this.idDeclare);
                bd.append("mode", "delete");

                const response = await fetch(url, {
                    method: "POST",
                    body: bd,
                    cache: "no-cache",
                    //credentials: "include",
                });

                const res = await response.json();
                if (res.message != "OK" && res.message != "Invalid storage type: DBNull.") {
                    mainObj.alert(res.message, "Error:");
                    return;
                }

            }
            this.gridApi.applyTransaction({ remove: rw });
        }

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
            findData.ReferEdit.SaveFieldList.map((f) => {
                SQLParams[f] = WorkRow[f];
            });

            const url = mainObj.baseUrl + "React/exec";
            let bd = new FormData();

            bd.append("EditProc", findData.EditProc);
            bd.append("SQLParams", JSON.stringify(SQLParams));
            bd.append("KeyF", findData.KeyF);
            bd.append("IdDeclare", findData.IdDeclare);
            bd.append("mode", "data");
            const response = await fetch(url, {
                method: "POST",
                body: bd,
                cache: "no-cache",
                //credentials: "include"
            });

            const res = await response.json();
            if (res.message != "OK") {
                mainObj.alert(res.message, "Error:");
                return false;
            }
            if (res.ColumnTab.length == 1) {
                WorkRow[findData.KeyF] = res.MainTab[0][res.ColumnTab[0]];
            } else {
                res.ColumnTab.map((column) => {
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