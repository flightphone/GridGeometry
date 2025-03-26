<script>
  import { GridGeometry } from "../models/GridGeometry";
  import { mainObj, openMap } from "../store";
  import { onMount } from "svelte";
  import { Editor } from "../models/Editor";
  import { ModalDialog } from "../models/ModalDialog";

  let { IdDeclare, extparams } = $props();

  let adiv;
  let agrid;
  let Descr = $state("");
  let DelProc = $state(false);
  let EditProc = $state(false);
  let KeyValue = $state(false);
  let IdDeclareSet = $state(false);
  let loadState = $state("loading...");
  let totalRows = $state(0);
  let filteredRows = $state(0);
  let version = $state("1.0.1");

  let editDialog;
  let settingDialog;
  let editor;
  let setting;

  let action = "edit";
  

  openMap.get(extparams.id).toggle_shema = () => {
    adiv.classList.toggle("ag-theme-balham-dark");
    adiv.classList.toggle("ag-theme-balham");
  };

  //const gridEvent = {}

  let openEdit = () => {
    action = "edit";
    let rs = agrid.gridApi.getSelectedNodes();
    if (!rs[0]) {
      mainObj.alert("not selected row");
      return;
    }
    let rw = rs[0].data;
    editor.edit(rw);
    editDialog.showModal();
  };

  let openNew = () => {
    action = "add";
    let rw = {};
    agrid.mid.ColumnTab.forEach((c) => {
      rw[c] = "";
    });
    editor.edit(rw);
    editDialog.showModal();
  };

  let openSetting = () => {
    let rw = agrid.mid.Setting.MainTab[0];
    setting.edit(rw);
    settingDialog.showModal();
  };

  let save = async () => {
    try {
      let res = await agrid.save(editor.WorkRow, action);
      if (res) editDialog.close();
    } catch (err) {
      mainObj.alert(err.toString(), "Error:");
    }
  };

  let saveSetting = () => {
    settingDialog.close();
    for (let f in setting.WorkRow)
      agrid.mid.Setting.MainTab[0][f] = setting.WorkRow[f];
    agrid.mid.Setting.ReferEdit.SaveFieldList.map((f) => {
      agrid.mid.SQLParams[f] = setting.WorkRow[f];
    });
    //console.log(agrid.mid.SQLParams);
    loadState = "loading...";  //25/03/2025
    totalRows = 0;
    filteredRows = 0;
    agrid.updateTab();
  };

  let rowDelete = async () => {
    try {
      await agrid.rowDelete();
    } catch (err) {
      mainObj.alert(err.toString());
    }
  };

  let updateData = () => {
    loadState = "loading...";  //25/03/2025
    totalRows = 0;
    filteredRows = 0;
    agrid.updateTab();
  }

  onMount(async () => {
    if (window.electronAPI)
    {
      version = window.electronAPI.version();
    }

    extparams.onUpdateData = (nrow) => {
      loadState = "";
      totalRows = nrow;
      filteredRows = agrid.gridApi.getDisplayedRowCount();
    }
    //25.03.2025
    extparams.gridOptions =  { onFilterChanged: (e) => {
      filteredRows = e.api.getDisplayedRowCount();
    }}
    agrid = new GridGeometry(IdDeclare, adiv, extparams);
    await agrid.start();
    if (agrid.mid.Error) {
      if (agrid.mid.Error == "access denied") {
        mainObj.open("-1", "exit", {});
      } else mainObj.alert(agrid.mid.Error, "Error");
      return;
    }
    agrid.init();
    
    if (extparams.title) Descr = extparams.title;
    else Descr = agrid.mid.Descr;

    DelProc = agrid.mid.DelProc;
    EditProc = agrid.mid.EditProc;
    KeyValue = agrid.mid.KeyValue;
    IdDeclareSet = agrid.mid.IdDeclareSet;
    if (EditProc) {
      editDialog = new ModalDialog("600px", "900px", save);
      if (extparams.editorJson) {
        const resp = await fetch(extparams.editorJson);
        const edJson = await resp.json();
        agrid.mid.ReferEdit = edJson;
        //console.log(edJson);
        editor = new Editor(edJson, editDialog.content, {});

        //agrid.mid.ReferEdit.Editors = edJson.Editors;
      } else {
        editor = new Editor(agrid.mid.ReferEdit, editDialog.content, {});
      }

      extparams.onEnter = openEdit;
    }

    if (DelProc) {
      extparams.onDelete = rowDelete;
    }

    if (IdDeclareSet) {
      settingDialog = new ModalDialog("200px", "700px", saveSetting);
      setting = new Editor(
        agrid.mid.Setting.ReferEdit,
        settingDialog.content,
        {}
      );
    }
    //17/01/2025
    if (extparams.onMount) extparams.onMount(agrid);
  });
</script>

<div class="mainapp">
  <div class="appbar">
    <h5 style="flex-grow: 1; margin-left: 20px;">
      {Descr}
    </h5>

    <slot></slot>
    {#if DelProc}
      <div class="but" title="add record">
        <button
          onclick={openNew}
          class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab"
        >
          <i class="material-icons">add</i>
        </button>
      </div>
    {/if}
    {#if EditProc}
      <div class="but" title="edit record">
        <button
          onclick={openEdit}
          class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab"
        >
          <i class="material-icons">edit</i>
        </button>
      </div>
    {/if}
    {#if DelProc}
      <div class="but" title="delete record">
        <button
          onclick={rowDelete}
          class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab"
        >
          <i class="material-icons">delete</i>
        </button>
      </div>
    {/if}
    <div class="but" title="refresh">
      <button
        onclick={updateData}
        class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab"
      >
        <i class="material-icons">refresh</i>
      </button>
    </div>
    {#if KeyValue}
      <div class="but" title="detail">
        <button
          onclick={agrid.openDetail}
          class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab"
        >
          <i class="material-icons">details</i>
        </button>
      </div>
    {/if}

    {#if IdDeclareSet}
      <div class="but" title="settings">
        <button
          onclick={openSetting}
          class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab"
        >
          <i class="material-icons">settings</i>
        </button>
      </div>
    {/if}

    <div class="but" title="export csv">
      <button
        onclick={agrid.exportCsv}
        class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab"
      >
        <i class="material-icons">download</i>
      </button>
    </div>
  </div>

  <div bind:this={adiv} class={mainObj.sheme} style="flex-grow: 1"></div>

  <!--status bar-->
  <div class="ag-status-bar">
    <div class="ag-status-bar-left" data-ref="eStatusBarLeft" role="status">
      <div
        class="ag-status-name-value ag-status-panel ag-status-panel-total-row-count"
        aria-hidden="false"
      >
        <span data-ref="eLabel">&nbsp;&nbsp;Rows:</span>&nbsp;
        <span data-ref="eValue" class="ag-status-name-value-value">{totalRows}</span>
      </div>

      <div
        class="ag-status-name-value ag-status-panel ag-status-panel-filtered-row-count"
        aria-hidden="false"
      >
        <span data-ref="eLabel">&nbsp;&nbsp;&nbsp;&nbsp;Filtered:</span>&nbsp;
        <span data-ref="eValue" class="ag-status-name-value-value">{filteredRows}</span>
      </div>
    </div>
    <!--
    <div
      class="ag-status-bar-center"
      data-ref="eStatusBarCenter"
      role="status"
    >
    {loadState}
    </div>
    -->
    <div class="ag-status-bar-right" data-ref="eStatusBarRight" role="status">
      
      <div class="ag-status-panel ag-status-panel-aggregations">
        <!--AG-NAME-VALUE-->
        <div
          class="ag-status-name-value"
          data-ref="avgAggregationComp"
          aria-hidden="false"
        >
          <span data-ref="eLabel">Version:</span>
          <span data-ref="eValue" class="ag-status-name-value-value">{version} &nbsp;</span>
        </div>
        
       
      </div>
    </div>
  </div>
  <!--status bar-->
</div>
