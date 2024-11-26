<script>
  import "./css/skin-win8/ui.fancytree.css";
  import { CreateTreeTree, treeMap } from "./models/TreeCore";
  import { onMount } from "svelte";
  import MonoGrid from "./lib/MonoGrid.svelte";
  import Dogovors from "./lib/Dogovors.svelte";
  import FlightCard from "./lib/FlightCard.svelte";
  import FlightCardsList from "./lib/FlightCardsList.svelte";
  import PaxFmcy from "./lib/PaxFMCY.svelte";
  import { mainObj, openMap, openIDs } from "./store";


  let smenu = true;
  let dialog;
  let treediv;
  let mode = (mainObj.sheme == "ag-theme-balham-dark") ? "wb_sunny" : "brightness_2";
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
    localStorage.sheme = mainObj.sheme;    
    mainObj.alarm("toggle_shema");
  }

  mainObj.getForm = (id, link1, params) => {
    if (link1 == "RegulationPrint.FlightCardsList") return FlightCardsList;
    if (link1 == "FlightCard") return FlightCard;
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
    let startid = window.location.hash.replace("#", "");
    if (startid && startid.substring(0, 2) == "FC") {
      smenu = false;
      let fc_pk = startid.substring(2);
      mainObj.open(startid, "FlightCard", "", {FC_PK:fc_pk});
      return;
    }

    //let url = mainObj.baseUrl + "ustore/gettree";
    let url = "/tmp/tree.json";
    if (mainObj.jsonData) url = "/json_grids/gettree.json";

    const res = await fetch(url);
    const data = await res.json();
    CreateTreeTree(treediv, data, openItem);

    let startobj = treeMap.get(startid);
    if (startobj) mainObj.open(startid, startobj.link1, startobj.params);
  });
</script>

<main>
  {#if smenu}
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
  {/if}
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
  <!--
  <PaxFmcy FC_PK="AAA"></PaxFmcy>
  -->
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
