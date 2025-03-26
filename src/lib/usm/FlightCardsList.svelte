<script>
  import MonoGrid from "../MonoGrid.svelte";
  let url = $state("");
  let href;
  let { IdDeclare, extparams } = $props();
  extparams.onSelect = (e) => {
    if (e.node.isSelected())
      url = `${window.location.origin}/#FC${e.data["FC_PK"]}`;
  };

  extparams.onEnter = (e) => {
    if (window.electronAPI) window.electronAPI.open(url);
    else href.click();
  };

  let attach = (e) => {
    if (window.electronAPI) window.electronAPI.open(url);
    else href.click();
  };
</script>

<a bind:this={href} href={url} style="display: none;" target="_blank"></a>
<MonoGrid IdDeclare="134" {extparams}>
  <div class="but" title="FlightCard">
    <button
      onclick={attach}
      class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab"
    >
      <i class="material-icons">flight</i>
    </button>
  </div>
</MonoGrid>
