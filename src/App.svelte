<script>
  import "./css/skin-win8/ui.fancytree.css";
  import { CreateTreeTree, treeMap } from "./models/TreeCore";
  import { onMount } from "svelte";
  import MonoGrid from "./lib/MonoGrid.svelte";
  import Dogovors from "./lib/Dogovors.svelte";
  import { mainObj, openMap, openIDs } from "./store";

  let dialog;
  let treediv;
  let mode = "wb_sunny"; //"brightness_2";
  let title = "Main Menu";

  let currentActive = "-1";
  let opens = [];

  function openModal() {
    dialog.showModal();
  }

  function closeModal() {
    dialog.close();
  }

  function togleMode() {
    mode = mode == "wb_sunny" ? "brightness_2" : "wb_sunny";
    document.querySelector("BODY").classList.toggle("dark");
    mainObj.sheme =
      mainObj.sheme == "ag-theme-balham-dark"
        ? "ag-theme-balham"
        : "ag-theme-balham-dark";
    mainObj.alarm("toggle_shema");
  }

  mainObj.getForm = (id, link1, params) => {
    if (link1 == "RegulationPrint.Dgs.DogovorList") return Dogovors;
    if (params) return MonoGrid;
    else return "not implemented";
  };
  mainObj.activate = () => {
    currentActive = mainObj.current;
    opens = openIDs;
  };

  function openItem(e) {
    dialog.close();
    let id = e.getAttribute("idmenu");
    let link1 = e.getAttribute("link1");
    let params = e.getAttribute("params");
    mainObj.open(id, link1, params, {});
  }

  onMount(async () => {
    let url = mainObj.baseUrl + "ustore/gettree";
    if (mainObj.jsonData)
      url = "/gettree.json";

    const res = await fetch(url);
    const data = await res.json();
    CreateTreeTree(treediv, data, openItem);
    let startid = window.location.hash.replace("#", "");
    let startobj = treeMap.get(startid);
    if (startobj) mainObj.open(startid, startobj.link1, startobj.params);
  });
</script>

<main>
  <div class="menubut">
    <button
      class="mdl-button mdl-js-button mdl-button--fab darkop"
      on:click={openModal}
    >
      <i class="material-icons">menu</i>
    </button>
  </div>
  <div class="menubut2">
    <button
      class="mdl-button mdl-js-button mdl-button--fab darkop"
      on:click={togleMode}
    >
      <i class="material-icons">{mode}</i>
    </button>
  </div>

  <dialog bind:this={dialog} class="modal">
    <div
      style="display:flex; flex-direction: column; align-items: center;width:100%"
    >
      <div
        style="position: absolute; right:10px; top:10px;"
        on:click={closeModal}
      >
        <button>&#10005;</button>
      </div>
      <div class="mdl-card__title">
        <h4 class="mdl-card__title-text">{title}</h4>
      </div>

      <div
        bind:this={treediv}
        style="flex-grow: 1; overflow-y: auto;height:400px;width:100%; margin:5px;border 1px solid lightgray;"
      ></div>

      <div
        class="mdl-card__actions mdl-card--border"
        style="display:flex; justify-content: center;align-items:center"
      >
        <div>
          <button
            class="mdl-button mdl-js-button mdl-button--raised"
            on:click={closeModal}
          >
            <div class="button-text">Close</div>
          </button>
        </div>
      </div>
    </div>
  </dialog>
  

  {#each opens as e}
    <div hidden={e != currentActive}>
      <svelte:component
        this={openMap.get(e).Control}
        IdDeclare={openMap.get(e).IdDeclare}
        extparams={openMap.get(e).extparams}
      />
    </div>
  {/each}
</main>
