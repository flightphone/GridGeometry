<script>
  import "ag-grid-community/styles/ag-grid.css";
  import "ag-grid-community/styles/ag-theme-balham.css";
  import { GridGeometry } from "../models/GridGeometry";
  import { mainObj, openMap } from "../store";
  import { onMount } from "svelte";

  let { IdDeclare, extparams } = $props();
  

  let adiv;
  let agrid;
  let Descr = $state("loading...");
  let DelProc = $state(false);
  let EditProc = $state(false);
  let KeyValue = $state(false);
  let IdDeclareSet = $state(false);

  //console.log(extparams.id);
  
  openMap.get(extparams.id).toggle_shema = ()=> {
    adiv.classList.toggle("ag-theme-balham-dark");
    adiv.classList.toggle("ag-theme-balham");
  }
  

  onMount(async () => {
    agrid = new GridGeometry(IdDeclare, adiv, extparams);
    await agrid.start();
    if (agrid.mid.Error) {
      mainObj.alert(agrid.mid.Error);
      return;
    }
    agrid.init();
    if (extparams.title) Descr = extparams.title;
    else Descr = agrid.mid.Descr;

    DelProc = agrid.mid.DelProc;
    EditProc = agrid.mid.EditProc;
    KeyValue = agrid.mid.KeyValue;
    IdDeclareSet = agrid.mid.IdDeclareSet;
    
  });
</script>

<div class="mainapp">
  <div class="appbar">
    <h5 style="flex-grow: 1; margin-left: 20px;">
      {Descr}
    </h5>
    <slot>

    </slot>
    {#if DelProc}
      <div class="but">
        <button
          class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab"
        >
          <i class="material-icons">add</i>
        </button>
      </div>
    {/if}
    {#if EditProc}
      <div class="but">
        <button
          class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab"
        >
          <i class="material-icons">edit</i>
        </button>
      </div>
    {/if}
    {#if DelProc}
      <div class="but">
        <button
          on:click={agrid.rowDelete}
          class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab"
        >
          <i class="material-icons">delete</i>
        </button>
      </div>
    {/if}
    <div class="but">
      <button
        on:click={agrid.updateTab}
        class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab"
      >
        <i class="material-icons">refresh</i>
      </button>
    </div>
    {#if KeyValue}
      <div class="but">
        <button on:click={agrid.openDetail}
          class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab"
        >
          <i class="material-icons">details</i>
        </button>
      </div>
    {/if}

    {#if IdDeclareSet}
      <div class="but">
        <button 
          class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab"
        >
          <i class="material-icons">settings</i>
        </button>
      </div>
    {/if}

    <div class="but">
      <button
        on:click={agrid.exportCsv}
        class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab"
      >
        <i class="material-icons">download</i>
      </button>
    </div>
  </div>

  <div bind:this={adiv} class="{mainObj.sheme}" style="flex-grow: 1"></div>
</div>
