<script>
  import MonoGrid from "./MonoGrid.svelte";
  import {mainObj} from "../store";
  let url = $state("")
  let href;
  let extp = {
    onSelect: (e)=>{
        if (e.node.isSelected())
            url = `${mainObj.baseUrl}Docfiles/dir?id=${e.data["agr_key"]}/`;
    }
  };
  let attach = (e) => {
    href.click();
  }
</script>
<a bind:this={href} href={url} style="display: none;" target = "_blank"></a>
<MonoGrid IdDeclare="1445" extparams={extp}>
    <div class="but">
        <button on:click={attach}
          class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab"
        >
          <i class="material-icons">attachment</i>
        </button>
      </div>
</MonoGrid>