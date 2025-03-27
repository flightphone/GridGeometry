<script>
  import MonoGrid from "../MonoGrid.svelte";
  import { mainObj } from "../../store";
  let url = $state("");
  let print = $state(false);
  let href;
  let hrefFile;
  let { IdDeclare, extparams } = $props();
  let mid;
  let FC_PK;

  extparams.onMount = (e) => {
    mid = e?.mid;
    if (e?.mid?.SaveFieldList) {
      //console.log(e?.mid?.SaveFieldList)
      hrefFile.download = e.mid.SaveFieldList.split(",")[1] + ".ods";
      print = true;
    }
  };

  extparams.onSelect = (e) => {
    if (e.node.isSelected()) {
      url = `${window.location.origin}/#FC${e.data["FC_PK"]}`;
      FC_PK = e.data["FC_PK"];
    }
  };

  extparams.onEnter = (e) => {
    if (FC_PK) {
      if (window.electronAPI) window.electronAPI.open(url);
      else href.click();
    }
  };

  let attach = async (e) => {
    //console.log(mid?.SQLParams)
    const query = {
      SaveFieldList: mid?.SaveFieldList,
      SQLParams: mid?.SQLParams,
    };
    const url = `${mainObj.baseUrl}/usm/print`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
          Authorization: mainObj.token,
        },
        body: JSON.stringify(query),
      });
      if (response.status != 200) {
        const data = await response.json();
        mainObj.alert(data.Error, "Error");
      } else {
        //console.log(hrefFile.download);
        const data = await response.blob();
        const burl = window.URL.createObjectURL(data);
        hrefFile.href = burl;
        hrefFile.click();
      }
    } catch (ex) {
      console.log(ex.message);
    }
  };
</script>

<a bind:this={href} href={url} style="display: none;" target="_blank"></a>
<a bind:this={hrefFile} href="#" style="display: none;" target="_blank"></a>
<MonoGrid {IdDeclare} {extparams}>
  <div class="but" title="Print">
    {#if print}
      <button
        onclick={attach}
        class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab"
      >
        <i class="material-icons">print</i>
      </button>
    {/if}
  </div>
</MonoGrid>
