<script>
  import "./css/skin-win8/ui.fancytree.css";
  import "./css/tree.css";
  import { CreateTreeTree, treeMap } from "./models/TreeCore";
  import { onMount } from "svelte";
  import MonoGrid from "./lib/MonoGrid.svelte";
  import Dogovors from "./lib/Dogovors.svelte";
  import FlightCard from "./lib/FlightCard.svelte";
  import FlightCardsList from "./lib/FlightCardsList.svelte";
  import { mainObj, openMap, openIDs } from "./store";
  import { ModalDialog } from "./models/ModalDialog";
  import Login from "./lib/Login.svelte";

  let smenu = true;
  let dialog;
  let treediv;
  let mode =
    mainObj.sheme == "ag-theme-balham-dark" ? "wb_sunny" : "brightness_2";
  let title = "Main Menu";

  let currentActive = "-1";
  let opens = [];
  let tok = "";

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
    if (link1 == "exit") return Login;
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
    if (link1 == "exit") {
      mainObj.token = "";
      localStorage.setItem("access_token", "");
    }
    mainObj.open(id, link1, params, {});
  }

  const startapp = async () => {
    const alertdialog = new ModalDialog(
      "160px",
      "80%",
      () => {
        alertdialog.close();
      },
      true
    );

    mainObj.alert = (text, title = "message") => {
      alertdialog.content.innerHTML = `<div class="title-dialog"><h8>${title}</h8></div>
      <div class="content-dialog">
      <h5>${text}</h5>
      </div>
      `;
      alertdialog.showModal();
      //alert(text);
    };

    const confirmdialog = new ModalDialog("160px", "80%", () => {
      mainObj.confirmFun();
      confirmdialog.close();
    });

    mainObj.confirm = (text, title = "question", callback = () => {}) => {
      mainObj.confirmFun = callback;
      confirmdialog.content.innerHTML = `<div class="title-dialog"><h8>${title}</h8><div>
      <div class="content-dialog" style="">
      <h5>${text}</h5>
      </div>`;
      confirmdialog.showModal();
      return false;
    };

    let startid = window.location.hash.replace("#", "");
    if (startid && startid.substring(0, 2) == "FC") {
      smenu = false;
      let fc_pk = startid.substring(2);
      mainObj.open(startid, "FlightCard", "", { FC_PK: fc_pk });
      return;
    }

    //let url = mainObj.baseUrl + "ustore/gettree";
    //let url = "./tmp/tree.json";
    let data;
    if (mainObj.jsonData) {
      let url = "./json_grids/gettree.json";
      //let url = "./usmart/tree.json";
      const res = await fetch(url);
      data = await res.json();
    } else {
      try {
        let url = mainObj.baseUrl + "/gettree";
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
            Authorization: mainObj.token,
          },
        });
        data = await res.json();
        //console.log(data);
        if (data.Error) {
          if (data.Error == "access denied") mainObj.open("-1", "exit", {});
          else mainObj.alert(data.Error, "Error:");
          return;
        }
      } catch (err) {
        mainObj.alert(err.toString(), "Error:");
      }
    }
    CreateTreeTree(treediv, data, openItem);

    let startobj = treeMap.get(startid);
    if (startobj) mainObj.open(startid, startobj.link1, startobj.params);
  };
  onMount(async () => {
    mainObj.token = localStorage.getItem("access_token");
    tok = mainObj.token;
    if (!mainObj.token) mainObj.open("-1", "exit", {});
    else startapp();
  });
</script>

<main>
  {#if smenu && tok}
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
  <div style="width:95%; height:300px">
  <CargoPost QD_PK="F3053171-EBE8-47EC-9D4E-1CF6309862F5"></CargoPost>
   </div>
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
