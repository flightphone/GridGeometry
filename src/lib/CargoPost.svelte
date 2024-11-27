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
      },
    };
    agrid = new GridGeometry(1215, adiv, agridParam);
    await agrid.start();
    if (agrid.mid.Error) {
      mainObj.alert(agrid.mid.Error);
      return;
    }
    agrid.init();
    newRow();
  });
</script>

<div
  bind:this={adiv}
  class={mainObj.sheme}
  style="height:100%;width:100%"
></div>
