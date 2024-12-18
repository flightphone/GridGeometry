<script>
  import { mainObj } from "../store";
  import { onMount } from "svelte";
  import { GridGeometry } from "../models/GridGeometry";
  let { FC_PK, saveData } = $props();
  let adiv;
  let agrid;
  
  saveData.getCargo = ()=>{
    return agrid.mid.MainTab;
  }

  onMount(async () => {
    const agridParam = {
      SQLParams: {
        FC_PK: FC_PK,
      },
      gridOptions: {
        pagination: false,
        columnDefs: [
          {
            field: "Name",
            headerName: " ",
            filter: false,
            sortable: false,
            flex: 1,
          },

          {
            field: "AODB",
            headerName: "AODB",
            flex: 1,
            cellDataType: "number",
            filter: false,
            sortable: false
          },
          
          {
            field: "W",
            headerName: "Weight",
            flex: 1,
            editable: true,
            filter: false,
            sortable: false,
            cellDataType: "number",
            
          },
          {
            field: "P",
            headerName: "Place",
            flex: 1,
            editable: true,
            cellDataType: "number",
            filter: false,
            sortable: false,
          },
        {
            field: "QD_Comment",
            headerName: "Comment",
            editable: true,
            flex: 2,
            filter: false,
            sortable: false,
          }
        ]
      },
    };
    agrid = new GridGeometry(1641, adiv, agridParam);
    await agrid.start();
    if (agrid.mid.Error) {
      mainObj.alert(agrid.mid.Error);
      return;
    }
    agrid.init();
  });
</script>

<div
  bind:this={adiv}
  class={mainObj.sheme}
  style="height:100%;width:100%"
></div>
