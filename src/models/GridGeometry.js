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
            //const response = await fetch("/Finder.json");
            //const response = await fetch(url);
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
            this.gridApi.setGridOption("rowData", data.MainTab);

        }
        catch (err) {
            //this.mid = { Error: err.toString() };
            mainObj.alert(err.toString())
        }

    }

    openDetail = () => {
        let rs = this.gridApi.getSelectedNodes();
        if (!rs[0])
        {
            mainObj.alert('not selected row');
            return;
        }    
        
        let rw = rs[0].data;
        let val = rw[this.mid.KeyF];
        let TextParams = {};
        TextParams[this.mid.KeyF] = val;
        let iddeclare = this.mid.KeyValue;
        let title = rw[this.mid.DispField] + ' (detail) ';
        let newid = this.idDeclare+"_"+rw[this.mid.KeyF];
        mainObj.open(newid, "Bureau.Finder", iddeclare, {TextParams:TextParams, title:title});
      };

    rowDelete = () => {
        /*
        let rw = this.gridApi.getSelectedNodes();
        if (rw)
            alert(rw[0].data["AL_UTG"]);
        */
    }

    exportCsv = () => {
        this.gridApi.exportDataAsCsv();
    }

}

export { GridGeometry }