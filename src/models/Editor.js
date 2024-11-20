import { creatediv } from "../store";
import { ModalDialog } from "./ModalDialog";
import { GridGeometry } from "./GridGeometry";
import { mainObj } from "../store";


class Editor {
    constructor(ReferEdit, element, manager = {}) {
        this.WorkRow = {};
        this.FControls = new Map();
        
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

        let openfinder = (ht) => {
            ht.dialog.showModal();
            //ht.cnt.classList.toggle("winhide");
        }



        this.element = element;
        this.ReferEdit = ReferEdit;
        element.onclick = click;

        let root = creatediv("lil-gui root", element);
        let children = creatediv("children", root);

        ReferEdit.Editors.forEach(column => {
            let inp;
            let FCon = { DisplayFormat: column.DisplayFormat };
            let classname = "";

            let classController = "controller string";
            if (column.joinRow && column.joinRow.classname) {
                classController = "controller option";
                classname = column.joinRow.classname;

            }


            let controller = creatediv(classController, children);
            //controller.setAttribute("id", column.FieldName);
            let name = creatediv("name", controller);
            name.innerText = column.FieldCaption;
            let widget = creatediv("widget", controller);
            if (classController == "controller string") {
                inp = creatediv("", widget, "INPUT");
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
                let display = document.createElement("div");
                if (classname == "Bureau.GridCombo") {
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
                display = creatediv(classdisplay, widget);
                FCon.display = display;

                if (classname == "Bureau.Finder") {

                    const cnt = document.createElement("div"); //creatediv(mainObj.sheme, document.querySelector("main"));
                    cnt.style.width = "100%";
                    cnt.style.height = "100%";
                    cnt.className = mainObj.sheme;
                    let grid = new GridGeometry(column.joinRow.IdDeclare, cnt, {});
                    grid.mid = column.joinRow.FindConrol;
                    grid.init();
                    grid.updateTab();
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
                        }
                        dialog.close();
                    }
                    dialog = new ModalDialog(500, 800, okfun);
                    dialog.content.appendChild(cnt);
                    inp.dialog = dialog;
                }
            }

            FCon.control = inp;
            if (classname == "Bureau.GridCombo") {
                this.FControls.set(column.joinRow.valField, FCon);
            }
            else
                this.FControls.set(column.FieldName, FCon);
        });

        //console.log(this.FControls)    ;

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
        this.FControls.forEach((column, FieldName) => {
            this.setVal(FieldName);
        }
        )


    }

}

export { Editor }