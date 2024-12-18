<script>
  import { mainObj } from "../store";
  import { onMount } from "svelte";
  import { GridGeometry } from "../models/GridGeometry";
  let { FC_PK, saveData } = $props();
  let adiv;
  let agrid;
  let acols = ["F", "C", "M", "Y"];

  saveData.getPax = ()=>{
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
            flex: 2,
          },
          
          {
            field: "F",
            headerName: "F",
            flex: 1,
            editable: true,
            filter: false,
            sortable: false,
            cellDataType: "number",
            
          },
          {
            field: "C",
            headerName: "C",
            flex: 1,
            editable: true,
            cellDataType: "number",
            filter: false,
            sortable: false,
            
          },
          {
            field: "M",
            headerName: "M",
            flex: 1,
            editable: true,
            cellDataType: "number",
            filter: false,
            sortable: false,
            
          },
          {
            field: "Y",
            headerName: "Y",
            flex: 1,
            editable: true,
            cellDataType: "number",
            filter: false,
            sortable: false,
            
          },

          {
            field: "tot",
            headerName: "Total",
            flex: 1,
            cellDataType: "number",
            filter: false,
            sortable: false,
            
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
            field: "QD_Comment",
            headerName: "Comment",
            editable: true,
            flex: 2,
            filter: false,
            sortable: false,
          }
        ],
        onCellEditingStopped: (e) => {
            let r = 0;
            acols.forEach((c)=> {
                if (e.data[c])
                    r += e.data[c];
            })
            e.data["tot"] = r;
            e.node.setData(e.data);
        }
      },
    };
    agrid = new GridGeometry(1640, adiv, agridParam);
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
