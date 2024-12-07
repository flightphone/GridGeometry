import { creatediv } from "../store";
import { ModalDialog } from "./ModalDialog";
import { GridGeometry } from "./GridGeometry";
import { mainObj } from "../store";


class Editor {
    constructor(ReferEdit, element, manager = {}) {
        this.WorkRow = {};
        
        if (manager.row) {
            for (let column in manager.row) {
                this.WorkRow[column] = manager.row[column] == null ? "" : manager.row[column];
            }
        }
        this.dependencies = new Map();
        this.FControls = new Map();
        this.element = element;
        this.ReferEdit = ReferEdit;

        let click = (e) => {
            let description;
            let el = e.target;
            if (el.parentElement.classList.contains("widget")) {
                description = el.parentElement.parentElement.id;
            } else if (el.parentElement.classList.contains("controller")) {
                description = el.parentElement.id;
            } else description = "";
            if (manager.onclick)
                manager.onclick(description);

            if (el.tagName == "BUTTON") el.parentElement.classList.toggle("closed");
            if (el.className == "name") {
                let ht = el.parentElement.querySelector("INPUT");
                if (ht) {
                    ht.focus();
                    return;
                }
                ht = el.parentElement.querySelector("SELECT");
                if (ht) {
                    ht.focus();
                    return;
                }
            }
            if (el.className == "widget") {
                //finder!!!
                let ht = el.querySelector("INPUT");
                if (ht) {
                    ht.focus();
                    openfinder(ht);
                    return;
                }
            }
        };

        let openfinder = async (ht) => {
            ht.dialog.showModal();
            if (!ht.grid.inited) {
                await ht.grid.start();
                ht.grid.init();
            }
            //ht.cnt.classList.toggle("winhide");
        }
        element.onclick = click;

        let root = creatediv("lil-gui root", element);
        let children = creatediv("children", root);
        let childrens = [children];
        let ngroup = 0;

        ReferEdit.Editors.forEach(async (column) => {
            //Group
            if (column.FieldName == "$start_group") {
                const liclass = (ngroup > 0) ? "lil-gui closed" : "lil-gui";
                let lil_gui = creatediv(liclass, childrens[childrens.length - 1]);
                let button = creatediv("title", lil_gui, "button");
                button.textContent = column.FieldCaption;
                let child = creatediv("children", lil_gui);
                childrens.push(child);
                ngroup += 1;
                return;
            }

            if (column.FieldName == "$stop_group") {
                childrens.splice(-1, 1);
                return;
            }
            let inp;
            let FCon = { DisplayFormat: column.DisplayFormat };
            let classname = "";

            let classController = "controller string";
            if (column.joinRow && column.joinRow.classname) {
                classController = "controller option";
                classname = column.joinRow.classname;

            }


            let controller = creatediv(classController, childrens[childrens.length - 1]);
            let name = creatediv("name", controller);
            name.innerText = column.FieldCaption;
            let widget = creatediv("widget", controller);
            if (classController == "controller string") {
                inp = creatediv("", widget, "INPUT");
                if (column.disabled)
                    inp.disabled = true;
                let typ = "text";
                if (column.DisplayFormat == "dd.MM.yyyy")
                    typ = "date"

                if (column.DisplayFormat == "dd.MM.yyyy HH:mm")
                    typ = "datetime-local"
                inp.setAttribute("type", typ);
                inp.setAttribute("spellcheck", "false");
                inp.onchange = (e) => {
                    this.WorkRow[column.FieldName] = inp.value;
                }

            }

            if (classController == "controller option") {
                let classdisplay = "finder";
                if (classname == "Bureau.GridCombo") {
                    //depend
                    if (column.joinRow.params)
                    {
                        for (let par in column.joinRow.params) {
                            const fname = column.joinRow.params[par];
                            let da = this.dependencies.get(fname);
                            if (da)
                                da.push(column.joinRow.valField)
                            else
                                da = [column.joinRow.valField];  
                            this.dependencies.set(fname, da);      
                        } 
                    }
                    if (!column.joinRow.FindConrol) {

                        const TextParams = {};
                        if (column.joinRow.params && manager.row) {
                            for (let par in column.joinRow.params) {
                                const fname = column.joinRow.params[par];
                                TextParams[par] = manager.row[fname];
                            }
                        }
                        column.joinRow.FindConrol = await mainObj.fetch(column.joinRow.IdDeclare, "new", TextParams, TextParams);
                    }

                    classdisplay = "display";
                    inp = creatediv("", widget, "select");
                    column.joinRow.FindConrol.MainTab.forEach((e) => {
                        let opt = creatediv("", inp, "option");
                        opt.value = e[column.joinRow.keyField];
                        opt.text = e[column.joinRow.FindConrol.DispField]
                    });
                    inp.onchange = (e) => {
                        display.textContent = inp.options[inp.selectedIndex].text;
                        this.WorkRow[column.joinRow.valField] = inp.value;
                        for (let s in column.joinRow.fields) {
                            let f = column.joinRow.fields[s];
                            if (f != column.joinRow.valField) {
                                this.WorkRow[f] = inp.options[inp.selectedIndex].text;
                                break;
                            }
                        }
                    };
                }
                else {
                    inp = creatediv("", widget, "INPUT");
                    inp.style.width = "0px";
                    inp.onkeydown = (event) => { if (event.keyCode == 13) openfinder(inp) };
                }
                let display = creatediv(classdisplay, widget);
                FCon.display = display;

                if (classname == "Bureau.Finder") {

                    const cnt = document.createElement("div"); //creatediv(mainObj.sheme, document.querySelector("main"));
                    cnt.style.width = "100%";
                    cnt.style.height = "100%";
                    cnt.className = mainObj.sheme;
                    const gridManager = {};
                    const grid = new GridGeometry(column.joinRow.IdDeclare, cnt, gridManager);
                    if (mainObj.jsonData) {
                        grid.mid = column.joinRow.FindConrol;
                        grid.init();
                    }
                    else {
                        //await grid.start();
                        //column.joinRow.FindConrol = grid.mid;
                    }

                    //grid.updateTab();
                    let dialog;
                    let okfun = () => {
                        let rs = grid.gridApi.getSelectedNodes();
                        if (!rs[0]) {
                            mainObj.alert('not selected row');
                            return;
                        }
                        let row = rs[0].data;
                        for (let s in column.joinRow.fields) {
                            let f = column.joinRow.fields[s];
                            this.WorkRow[f] = row[s];
                            this.setVal(f);
                            this.updateDepend(f);
                        }
                        dialog.close();
                    }
                    gridManager.onEnter = okfun;
                    dialog = new ModalDialog("500px", "800px", okfun);
                    dialog.content.appendChild(cnt);
                    inp.dialog = dialog;
                    inp.grid = grid;
                }
            }

            FCon.control = inp;
            FCon.joinRow = column.joinRow;
            let fname = (classname == "Bureau.GridCombo") ? column.joinRow.valField : column.FieldName;
            this.FControls.set(fname, FCon);
            if (manager.row) {
                this.setVal(fname);
            }


        });
        //this.initialize(ReferEdit, element, manager);
        //console.log(this.FControls)    ;

    }


    updateCombo = async (column) => {
        
        if (!column.joinRow || !column.joinRow.params || column.control.tagName != "SELECT")
            return;
        
        const TextParams = {};
        for (let par in column.joinRow.params) {
            const fname = column.joinRow.params[par];
            TextParams[par] = this.WorkRow[fname];
        }
        const data = await mainObj.fetch(column.joinRow.IdDeclare, "data", TextParams, TextParams);
        console.log(data);
        column.joinRow.FindConrol.MainTab = data.MainTab;
        column.control.innerHTML = "";
        column.joinRow.FindConrol.MainTab.forEach((e) => {
            let opt = creatediv("", column.control, "option");
            opt.value = e[column.joinRow.keyField];
            opt.text = e[column.joinRow.FindConrol.DispField]
        });

    }

    updateDepend = (fname) => {
        const da = this.dependencies.get(fname);
        if (!da)
            return;
        da.forEach(async (f) => {
            const col = this.FControls.get(f);
            await this.updateCombo(col);
            this.setVal(f);
        })    
    }

    setVal = (FieldName) => {
        let column = this.FControls.get(FieldName);
        if (!column)
            return;
        let dt = this.WorkRow[FieldName];
        if (column.DisplayFormat == "dd.MM.yyyy") {
            if (dt)
                dt = dt.substring(0, 10);
        }

        if (column.DisplayFormat == "dd.MM.yyyy HH:mm") {
            if (dt)
                dt = dt.substring(0, 16);//.replace("T", " ")
        }
        column.control.value = dt;



        if (column.display) {
            if (column.control.tagName == "SELECT") {
                let sel = column.control;
                let opt = sel.options[sel.selectedIndex];
                if (opt)
                    column.display.textContent = opt.text;
                else
                    column.display.textContent = "";
            }
            else
                column.display.textContent = column.control.value;
        }
    }

    edit = (row) => {
        this.WorkRow = {};
        for (let column in row) {
            this.WorkRow[column] = row[column] == null ? "" : row[column];
        }
        this.FControls.forEach(async (column, FieldName) => {
            await this.updateCombo(column)
            this.setVal(FieldName);
        }
        )


    }

}

export { Editor }