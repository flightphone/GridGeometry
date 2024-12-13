<script>
  import { GridGeometry } from "../models/GridGeometry";
  import { mainObj, openMap } from "../store";
  import { onMount } from "svelte";
  import { Editor } from "../models/Editor";
  import { ModalDialog } from "../models/ModalDialog";

  let { IdDeclare, extparams } = $props();

  let adiv;
  let agrid;
  let Descr = $state("loading...");
  let DelProc = $state(false);
  let EditProc = $state(false);
  let KeyValue = $state(false);
  let IdDeclareSet = $state(false);

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
      mainObj.alert(err.toString());
    }
    //console.log(editor.WorkRow);
  };

  let saveSetting = () => {
    settingDialog.close();
    for (let f in setting.WorkRow)
      agrid.mid.Setting.MainTab[0][f] = setting.WorkRow[f];
    agrid.mid.Setting.ReferEdit.SaveFieldList.map((f) => {
      agrid.mid.SQLParams[f] = setting.WorkRow[f];
    });
    //console.log(agrid.mid.SQLParams);
    agrid.updateTab();
  };

  let rowDelete = async () => {
    try {
      await agrid.rowDelete();
    } catch (err) {
      mainObj.alert(err.toString());
    }
  };

  onMount(async () => {
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
        agrid.mid.ReferEdit.Editors = edJson.Editors;
        //console.log(edJson);
        editor = new Editor(edJson, editDialog.content, {});

        //agrid.mid.ReferEdit.Editors = edJson.Editors;
      } else editor = new Editor(agrid.mid.ReferEdit, editDialog.content, {});

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
          on:click={openNew}
          class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab"
        >
          <i class="material-icons">add</i>
        </button>
      </div>
    {/if}
    {#if EditProc}
      <div class="but" title="edit record">
        <button
          on:click={openEdit}
          class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab"
        >
          <i class="material-icons">edit</i>
        </button>
      </div>
    {/if}
    {#if DelProc}
      <div class="but" title="delete record">
        <button
          on:click={rowDelete}
          class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab"
        >
          <i class="material-icons">delete</i>
        </button>
      </div>
    {/if}
    <div class="but" title="refresh">
      <button
        on:click={agrid.updateTab}
        class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab"
      >
        <i class="material-icons">refresh</i>
      </button>
    </div>
    {#if KeyValue}
      <div class="but" title="detail">
        <button
          on:click={agrid.openDetail}
          class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab"
        >
          <i class="material-icons">details</i>
        </button>
      </div>
    {/if}

    {#if IdDeclareSet}
      <div class="but" title="settings">
        <button
          on:click={openSetting}
          class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab"
        >
          <i class="material-icons">settings</i>
        </button>
      </div>
    {/if}

    <div class="but" title="export csv">
      <button
        on:click={agrid.exportCsv}
        class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab"
      >
        <i class="material-icons">download</i>
      </button>
    </div>
  </div>

  <div bind:this={adiv} class={mainObj.sheme} style="flex-grow: 1"></div>
</div>
