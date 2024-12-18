<script>
  import MonoGrid from "./MonoGrid.svelte";
  import { mainObj } from "../store";
  import { onMount } from "svelte";
  let url = $state("");
  let href;
  let { IdDeclare, extparams } = $props();

  extparams.onSelect = (e) => {
    if (e.node.isSelected())
      url = `${mainObj.baseUrl}Docfiles/dir?id=${e.data["agr_key"]}/`;
  };

  let attach = (e) => {
    href.click();
  };

  onMount(async () => {});
</script>

<a bind:this={href} href={url} style="display: none;" target="_blank"></a>
<MonoGrid IdDeclare="1445" extparams={extparams}>
  <div class="but" title="files">
    <button
      onclick={attach}
      class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab"
    >
      <i class="material-icons">attachment</i>
    </button>
  </div>
</MonoGrid>
