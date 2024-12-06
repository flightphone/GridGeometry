<script>
  import { mainObj, openMap } from "../store";
  import { onMount } from "svelte";
  import { createGrid } from "ag-grid-community";

  let { IdDeclare, extparams } = $props();
  let adiv;

  onMount(async () => {
    const resp = await fetch("http://localhost:1793/air");
    //const resp = await fetch("/air");
    const row = await resp.json();
    if (row.code)
    {
        mainObj.alert(row.code);
        return;
    }
    
    const gridOptions = {
      rowSelection: {
        mode: "singleRow",
        checkboxes: false,
        enableClickSelection: true,
      },
      onRowSelected: (ev) => {
        if (extparams.onSelect) extparams.onSelect(ev);
      },
      onCellFocused: (e) => {
        //console.log(e);
        let rw = e.api.getDisplayedRowAtIndex(e.rowIndex);
        rw.setSelected(true);
      },
      onCellKeyDown: (e) => {
        if (e.event.code == "Enter" && this.extparams.onEnter) {
          e.node.setSelected(true);
          extparams.onEnter(e.node.data);
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
        resizable: true,
      },
      pagination: true,
      suppressExcelExport: true,
      columnDefs: [
        {
          field: "AL_PK",
          headerName: "AL_PK",
          flex: 1
        },
        {
          field: "AL_UTG",
          headerName: "AL_UTG",
          flex: 1
        },
        {
          field: "AL_NameRu",
          headerName: "AL_NameRu",
          flex: 3
        }
      ],
      rowData: row
    };
    const gridApi = createGrid(adiv, gridOptions);
  });
</script>

<div class="mainapp">
  <div class="appbar">
    <h5 style="flex-grow: 1; margin-left: 20px;">Air</h5>
  </div>

  <div bind:this={adiv} class={mainObj.sheme} style="flex-grow: 1"></div>
</div>
