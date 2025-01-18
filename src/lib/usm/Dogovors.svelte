<script>
  import MonoGrid from "../MonoGrid.svelte";
  import { mainObj } from "../../store";
  import { onMount } from "svelte";
  let agr_key;
  let href;
  let { IdDeclare, extparams } = $props();

  extparams.onSelect = (e) => {
    if (e.node.isSelected()) agr_key = `${e.data["agr_key"]}`;
  };

  let attach = async (e) => {
    const url = `${mainObj.baseUrl}/usm/newsid`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: mainObj.token,
      },
    });
    let res = await response.json();
    if (res.Error)
    {
      mainObj.alert(res.Error, "Error")
      return
    }
    let link = res.link + agr_key.toString() + '/'
    //console.log(link)
    href.href = link
    href.click();
  };

  onMount(async () => {});
</script>

<a bind:this={href} style="display: none;" target="_blank"></a>
<MonoGrid IdDeclare="1445" {extparams}>
  <div class="but" title="files">
    <button
      onclick={attach}
      class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab"
    >
      <i class="material-icons">attachment</i>
    </button>
  </div>
</MonoGrid>
