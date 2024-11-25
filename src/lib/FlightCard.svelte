<script>
  import { mainObj, openMap } from "../store";
  import { onMount } from "svelte";
  import { Editor } from "../models/Editor";
  import { Splitter } from "../models/Splitter";
  let { IdDeclare, extparams } = $props();
  let FC_PK = extparams.FC_PK;
  let FC_flNumber = $state("");
  let fcdiv;
  let editor;
  let split;
  onMount (async () => {
    let data = await mainObj.fetch(1636, "data", null, {FC_PK:FC_PK})
    FC_flNumber = data.MainTab[0]["FC_flNumber"] + " " + data.MainTab[0]["FC_Date"].substring(0, 10);
    document.title = FC_flNumber;
    const response = await fetch("/tmp/Editor1636.json");
    const ReferEdit = await response.json();
    const sp = new Splitter(split, fcdiv, "col");
    editor = new Editor(ReferEdit, fcdiv, {row:data.MainTab[0]});
    
    //editor.edit(data.MainTab[0]); 
    
  })
</script>

<div class="mainapp">
  <div class="appbar1">
    <div class="but" title="add record">
      <button
        class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab"
      >
        <i class="material-icons">save</i>
      </button>
    </div>
  </div>
  <div style="height:calc(100% - 60px); margin: 3px;border: 1px solid gray; display: flex;
  flex-direction: row;"
  >
  <!--height:calc(100% - 6px)-->
    <div bind:this={fcdiv} style="width:300px; margin: 3px 0px 3px 3px;border: 1px solid gray;height:calc(100% - 6px)">


    </div>
    <div bind:this={split} style="width:5px; background:lightgray"></div>    
    <div style="flex-grow: 1; margin: 3px 3px 3px 0px;border: 1px solid gray; ">

    </div>
  </div>
</div>
