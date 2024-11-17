import { creatediv } from "../store";
import { ModalDialog } from "./ModalDialog";
import { GridGeometry } from "./GridGeometry";
import { mainObj } from "../store";


class Editor {
    constructor(ReferEdit, element, manager = {}) {

        let change = (e) => {
            let el = e.target;
            let ht = el.parentElement.querySelector(".display");
            let sel = e.target;
            if (ht) ht.innerHTML = sel.options[sel.selectedIndex].text;
        };

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
        let classname;
        let root = creatediv("lil-gui root", element);
        let children = creatediv("children", root);

        ReferEdit.Editors.forEach(column => {
            let inp;

            let classController = "controller string";
            if (column.joinRow && column.joinRow.classname) {
                classController = "controller option";
                classname = column.joinRow.classname;
            }


            let controller = creatediv(classController, children);
            controller.setAttribute("id", column.FieldName);
            let name = creatediv("name", controller);
            name.innerText = column.FieldCaption;
            let widget = creatediv("widget", controller);
            if (classController == "controller string") {
                inp = creatediv("", widget, "INPUT");
                let typ = "text";
                if (column.DisplayFormat == "dd.MM.yyyy")
                    typ = "date"
                inp.setAttribute("type", typ);
                inp.setAttribute("spellcheck", "false");
            }

            if (classController == "controller option") {
                let classdisplay = "finder";
                if (classname == "Bureau.GridCombo") {
                    classdisplay = "display";
                    let sel = creatediv("", widget, "select");
                    sel.onchange = change;
                    column.joinRow.FindConrol.MainTab.forEach((e) => {
                        let opt = creatediv("", sel, "option");
                        opt.value = e[column.joinRow.keyField];
                        opt.text = e[column.joinRow.FindConrol.DispField]
                    });
                }
                else {

                    inp = creatediv("", widget, "INPUT");
                    inp.style.width = "0px";
                    inp.onkeydown = (event) => { if (event.keyCode == 13) openfinder(inp) };
                }

                let display = creatediv(classdisplay, widget);
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
                        let rw = rs[0].data;
                        let val = rw[grid.mid.KeyF];
                        let title = rw[grid.mid.DispField];
                        display.textContent = title;
                        dialog.close();
                    }
                    dialog = new ModalDialog(500, 800, okfun);
                    dialog.content.appendChild(cnt);
                    inp.dialog = dialog;
                }
            }
        });



    }

}

export { Editor }