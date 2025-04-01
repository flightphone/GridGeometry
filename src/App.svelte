<script>
  import "./css/skin-win8/ui.fancytree.css";
  import "./css/tree.css";
  import { CreateTreeTree, treeMap } from "./models/TreeCore";
  import { onMount } from "svelte";
  import MonoGrid from "./lib/MonoGrid.svelte";
  import Dogovors from "./lib/usm/Dogovors.svelte";
  import FlightCard from "./lib/usm/FlightCard.svelte";
  import FlightCardsList from "./lib/usm/FlightCardsList.svelte";
  import ServiceReport from "./lib/usm/ServiceReport.svelte";
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
  let href;

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
    if (window.electronAPI) {
      //26.03.2025
      let etheme = (mainObj.sheme == "ag-theme-balham") ? "light" : "dark";
      window.electronAPI.setTheme(etheme);
    }
    mainObj.alarm("toggle_shema");
  }

  mainObj.getForm = (id, link1, params) => {
    if (link1 == "RegulationPrint.FlightCardsList") return FlightCardsList;
    if (link1 == "FlightCard") return FlightCard;
    if (link1 == "RegulationPrint.Dgs.DogovorList") return Dogovors;
    if (
      link1 == "RegulationPrint.ServiceReport" ||
      link1 == "RegulationPrint.repSDM" ||
      link1 == "RegulationPrint.TowReport"
    )
      return ServiceReport;
    if (link1 == "exit") return Login;
    if (params) return MonoGrid;
    else return "not implemented";
  };
  mainObj.activate = () => {
    currentActive = mainObj.current;
    opens = openIDs;
  };

  function openItem(e, button) {
    dialog.close();
    let id = e.getAttribute("idmenu");
    let link1 = e.getAttribute("link1");
    let params = e.getAttribute("params");
    if (link1 == "exit") {
      mainObj.token = "";
      localStorage.setItem("access_token", "");
    }
    if (button == 2) {
      let link = `${window.location.origin}/#${id}`;
      if (window.electronAPI) {
        window.electronAPI.open(link);
      } else {
        href.href = link;
        href.click();
      }
    } else mainObj.open(id, link1, params, {});
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
      //<div><h8>${title}</h8></div>
      //<div><h7>${title}</h7></div>
      alertdialog.content.innerHTML = `
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
      confirmdialog.content.innerHTML = `<div class="content-dialog" style="">
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
  <a bind:this={href} style="display: none;" target="_blank"></a>
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

  <dialog bind:this={dialog} class="modal" style="height:100%;width:100%">
    <!--
    <div
      style="display:flex; flex-direction: column; align-items: center;width:100%"
    >
    -->
    <div class="modalDialog">
      
      <div class="titleButton"
        style="position: absolute; right:10px; top:10px;"
        on:click={closeModal}
      >
        &#10005;
      </div>
      
      <div>
      <!--<div class="titlePanel" style="justify-content:start;height:30px">-->
        <div style="margin-left: 25px;"><h4>{title}</h4></div>
      </div>

      <div
        bind:this={treediv}
        style="flex-grow: 1; overflow-y: auto;align-items: center;height:100%;width:calc(100%-20px);margin-left:20px;"
      ></div>

      <!--class="mdl-card__actions mdl-card--border"-->
<!--
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
      -->
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
