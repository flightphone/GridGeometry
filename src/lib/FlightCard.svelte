<script>
  import { mainObj, openMap } from "../store";
  import { onMount } from "svelte";
  import { Editor } from "../models/Editor";
  import { Splitter } from "../models/Splitter";
  import { GridGeometry } from "../models/GridGeometry";
  import { ModalDialog } from "../models/ModalDialog";
  import PaxFmcy from "./PaxFMCY.svelte";
  import Cargo from "./Cargo.svelte";
  import CargoPost from "./CargoPost.svelte";
  let { IdDeclare, extparams } = $props();
  let FC_PK = extparams.FC_PK;
  let FC_flNumber = $state("");
  let fcdiv;
  let editor;
  let split;
  let adiv;
  let agrid;
  let info;

  let tdiv;
  let tgrid;

  let pdiv;
  let pdialog;

  let cdiv;
  let cdialog;

  let s756 = $state(false);
  let QD_PK;

  let sdiv;
  let sdialog;

  let showPax = (e) => {
    pdialog.showModal();
  };

  openMap.get(extparams.id).toggle_shema = () => {
    adiv.classList.toggle("ag-theme-balham-dark");
    adiv.classList.toggle("ag-theme-balham");
  };

  let okfun = () => {
    let rs = agrid.gridApi.getSelectedNodes();
    if (!rs[0]) {
      mainObj.alert("not selected row");
      return;
    }
    let row = rs[0].data;
    row["QD_QTY"] = 1;
    row["QD_isPosted"] = true;
    rs[0].setData(row);
  };

  const saveData = {
    getPax: () => {
      return null;
    },
    getCargo: () => {
      return null;
    },
    getCargoPost: () => {
      return null;
    },
  };
  let save = async () => {
    const flight = {
      FlightCard: editor.WorkRow,
      OrderD: agrid.mid.MainTab.filter((e) => e.QD_isPosted),
      Pax: saveData.getPax(),
      Cargo: saveData.getCargo(),
      CargoPost: saveData.getCargoPost(),
      QD_PK: QD_PK,
    };
    const url = `${mainObj.baseUrl}/savefc`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
         Authorization: mainObj.token,
      },
      body: JSON.stringify(flight),
    });

    const res = await response.json();
    if (res.Error) 
      mainObj.alert(res.Error, "Error");
    else
      mainObj.alert("Flight card saved", "Warning");

  };

  onMount(async () => {
    pdialog = new ModalDialog("300px", "750px", () => {
      pdialog.close();
      okfun();
    });
    pdialog.content.appendChild(pdiv);

    cdialog = new ModalDialog("300px", "450px", () => {
      cdialog.close();
      okfun();
    });
    cdialog.content.appendChild(cdiv);

    sdialog = new ModalDialog("300px", "95%", () => {
      sdialog.close();
      okfun();
    });
    sdialog.content.appendChild(sdiv);

    let data = await mainObj.fetch(1636, "data", null, { FC_PK: FC_PK });
    FC_flNumber =
      data.MainTab[0]["FC_flNumber"] +
      " " +
      data.MainTab[0]["FC_Date"].substring(0, 10);
    document.title = FC_flNumber;
    const response = await fetch("./tmp/Editor1636.json");
    const ReferEdit = await response.json();
    const sp = new Splitter(split, fcdiv, "col");
    editor = new Editor(ReferEdit, fcdiv, { row: data.MainTab[0] });
    const agridParam = {
      TextParams: {
        FC_PK: data.MainTab[0]["FC_PK"],
      },
      onSelect: (ev) => {
        if (ev.node.isSelected())
          info.textContent = ev.data["Descr"].substring(0, 100);
      },
      onEnter: (data) => {
        //console.log(data);
        if (data["ClassName"] == "RegulationPrint.UTGPaxFMCY") {
          pdialog.showModal();
        }

        if (data["ClassName"] == "RegulationPrint.UTGCargo") {
          cdialog.showModal();
        }

        if (data["ClassName"] == "RegulationPrint.UTGCargoPost") {
          sdialog.showModal();
        }
      },
      gridOptions: {
        pagination: false,
        columnDefs: [
          {
            field: "NN",
            headerName: "NN",
            width: 50,
            filter: false,
            cellStyle: (e) => {
              if (e.data["SV_IsRequired"] == 1 && !e.data["QD_isPosted"]) {
                return { backgroundColor: "coral" };
              }
              return null;
            },
          },
          {
            field: "Caption",
            headerName: "Name",
            flex: 2,
          },
          {
            field: "QD_QTY",
            headerName: "Qty",
            //editable: true,
            width: 50,
            cellDataType: "number",
            filter: false,
            sortable: false,
            editable: (e) => {
              return e.data["ClassName"] == "RegulationPrint.UTGService";
            },
          },
          {
            field: "QD_Comment",
            headerName: "Comment",
            flex: 1,
            editable: true,
          },
          {
            field: "SV_RespRoleInfo",
            headerName: "Responsible",
            flex: 1,
          },
          {
            field: "QD_isPosted",
            headerName: " ",
            width: 40,
            editable: true,
            cellEditor: "agCheckboxCellEditor",
            cellDataType: "boolean",
            sortable: false,
            filter: false,
            resizable: false,
          },
          {
            field: "SV_CATEGORY",
            hide: true,
          },
        ],
        onCellEditingStopped: (e) => {
          //console.log(e);
          if (e.column.colId != "QD_isPosted") e.data["QD_isPosted"] = true;
          e.node.setData(e.data);
          e.api.redrawRows({ rowNodes: [e.node] });
          e.api.setFocusedCell(e.rowIndex, e.column.colId);
        },
      },
    };
    agrid = new GridGeometry("1638", adiv, agridParam);
    agrid.gridApi.setFilterModel({
      SV_CATEGORY: {
        filterType: "number",
        type: "lessThan",
        filter: 1,
      },
    });

    await agrid.start();
    if (agrid.mid.Error) {
      mainObj.alert(agrid.mid.Error, "Error");
      return;
    }

    //console.log(agrid.mid.MainTab);
    agrid.mid.MainTab.forEach((data) => {
      data["QD_isPosted"] = data["QD_isPosted"] == 1;
      if (data["ClassName"] == "RegulationPrint.UTGCargoPost") {
        QD_PK = data["QD_PK"];
        s756 = true;
      }
    });
    agrid.init();

    tgrid = new GridGeometry("1639", tdiv, {
      TextParams: {
        FLT_ID: data.MainTab[0]["FLT_ID"],
      },
      gridOptions: {
        pagination: false,
      },
    });
    await tgrid.start();
    if (tgrid.mid.Error) {
      mainObj.alert(tgrid.mid.Error, "Error");
      return;
    }
    tgrid.init();

    //editor.edit(data.MainTab[0]);
  });
</script>

<div bind:this={pdiv} style="height:100%; width:100%">
  <PaxFmcy FC_PK={extparams.FC_PK} {saveData} />
</div>
<div bind:this={cdiv} style="height:100%; width:100%">
  <Cargo FC_PK={extparams.FC_PK} {saveData} />
</div>

<div bind:this={sdiv} style="height:100%; width:100%">
  {#if s756}
    <CargoPost {QD_PK} {saveData} />
  {/if}
</div>

<div class="mainapp">
  <div
    style="height:calc(100% - 6px); margin: 3px;border: 1px solid gray; display: flex;
  flex-direction: row;"
  >
    <div
      bind:this={fcdiv}
      style="width:300px; margin: 0px 0px 0px 3px;height:calc(100%)"
    ></div>
    <div bind:this={split} style="width:8px; background:lightgray"></div>

    <div style="flex-grow: 1; margin: 3px 3px 3px 0px; ">
      <div
        class="mdl-tabs mdl-js-tabs mdl-js-ripple-effect"
        style="height: 100%"
      >
        <div class="mdl-tabs__tab-bar" style="justify-content: start;">
          <a href="#starks-panel" class="mdl-tabs__tab is-active">service</a>
          <a href="#lannisters-panel" class="mdl-tabs__tab">tasks</a>
          <!--<a href="#targaryens-panel" class="mdl-tabs__tab">de-icing</a>-->
          <div
            style="flex-grow: 1;display: flex;
          flex-direction: row;
          justify-content: flex-end;
          align-items: center;"
          >
            <div class="but" title="save record">
              <button
                on:click={save}
                class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab"
              >
                <i class="material-icons">save</i>
              </button>
            </div>
            <!--
            <div class="but" title="add record">
              <button
                class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab"
              >
                <i class="material-icons">add</i>
              </button>
            </div>
            -->
          </div>
        </div>

        <div
          class="mdl-tabs__panel is-active"
          id="starks-panel"
          style="height: calc(100% - 50px);"
        >
          <div style="display:flex;flex-direction: column;height:100%">
            <div
              bind:this={adiv}
              class={mainObj.sheme}
              style="flex-grow: 1"
            ></div>
            <div
              style="height:28px;overflow:hidden;max-width:100%;display: flex;
            flex-direction: row;
            justify-content: flex-end;
            align-items: center;"
            >
              <div
                bind:this={info}
                style="margin-right:10px;max-width:99%;overflow:hidden;"
              ></div>
            </div>
          </div>
        </div>
        <div
          class="mdl-tabs__panel"
          id="lannisters-panel"
          style="height: calc(100% - 50px);"
        >
          <div
            bind:this={tdiv}
            class={mainObj.sheme}
            style="height: 100%"
          ></div>
        </div>
        <div class="mdl-tabs__panel" id="targaryens-panel">
          <ul>
            <li>Viserys</li>
            <li>Daenerys</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>
