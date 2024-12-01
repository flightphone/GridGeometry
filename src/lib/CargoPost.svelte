<script>
  import { mainObj } from "../store";
  import { onMount } from "svelte";
  import { GridGeometry } from "../models/GridGeometry";
  let { QD_PK } = $props();
  let adiv;
  let agrid;

  let newRow = () => {
    let nn = 0;
    let data = agrid.mid.MainTab;
    data.forEach((row) => {
      if (row["CM_NN"] > nn) nn = row["CM_NN"];
    });
    nn += 1;
    let rw = {};
    agrid.mid.ColumnTab.forEach((c) => {
      rw[c] = "";
    });
    rw["CM_NN"] = nn;
    agrid.mid.MainTab.push(rw);
    agrid.gridApi.setGridOption("rowData", agrid.mid.MainTab);
  };

  onMount(async () => {
    const agridParam = {
      TextParams: {
        QD_PK: QD_PK,
      },
      gridOptions: {
        pagination: false,
        defaultColDef: {
          sortable: false,
          filter: false,
          resizable: true,
          editable: true,
          flex: 1,
        },
        onCellEditingStopped: (e) => {
            //console.log(e.rowIndex);
            if (e.rowIndex == agrid.mid.MainTab.length - 1)
                newRow();
        },
        onCellKeyDown: (e) => {
          if (e.rowIndex == agrid.mid.MainTab.length - 1)
            return;
          if (e.event.code == "Delete" && (e.event.altKey || e.event.ctrlKey || e.event.shiftKey))
          {
            agrid.mid.MainTab.splice(e.rowIndex, 1);
            agrid.gridApi.setGridOption("rowData", agrid.mid.MainTab);
          }
        }
      },
    };
    agrid = new GridGeometry(1215, adiv, agridParam);
    await agrid.start();
    if (agrid.mid.Error) {
      mainObj.alert(agrid.mid.Error);
      return;
    }
    agrid.init();
    /*
    let columnDefs = agrid.gridApi.getGridOption("columnDefs");
    columnDefs.push({
      field: "Action",
      headerName: " ",
      cellRenderer: (e) => {return "<button>&#10005;</button>"}, 
      editable: false,
      width: 10,
      
    })
    agrid.gridApi.setGridOption("columnDefs", columnDefs);
    */
    newRow();
  });
</script>

<div
  bind:this={adiv}
  class={mainObj.sheme}
  style="height:100%;width:100%"
></div>
