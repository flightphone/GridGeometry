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
            if (el.className == "widget")
            {
                //finder!!!
                let ht = el.querySelector("INPUT");
                if (ht) {
                    ht.focus();
                    return;
                }
            }
        };



        this.element = element;
        this.ReferEdit = ReferEdit;
        element.onclick = click;
        let classname;
        let root = creatediv("lil-gui root", element);
        let children = creatediv("children", root);
        ReferEdit.Editors.forEach(column => {
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
                let inp = creatediv("", widget, "INPUT");
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
                else
                {
                    let inp = creatediv("", widget, "INPUT");
                    inp.style.width = "0px";
                    inp.onkeydown = (event) => {if (event.keyCode == 13) alert('aa')};
                }
                let display = creatediv(classdisplay, widget);

            }
        });
        //console.log(root.innerHTML);
        let innerHTML = `
        <div class="lil-gui root">
        <div class="children">
      <div class="lil-gui">
        <button class="title" aria-expanded="false">Folder</button>
        <div class="children" style="">
          <div class="controller string">
            <div class="name" id="lil-gui-name-7">string</div>
            <div class="widget">
              <input
                type="text"
                spellcheck="false"
                aria-labelledby="lil-gui-name-7"
              />
            </div>
          </div>
          <div class="controller string">
            <div class="name" id="lil-gui-name-7">string</div>
            <div class="widget">
              <input
                type="date"
                spellcheck="false"
                aria-labelledby="lil-gui-name-7"
              />
            </div>
          </div>
          <label class="controller boolean"
            ><div class="name" id="lil-gui-name-2">boolean</div>
            <div class="widget">
              <input type="checkbox" aria-labelledby="lil-gui-name-2" />
            </div></label
          >

          <div class="lil-gui">
            <button class="title" aria-expanded="false" style=""
              >Sub Folder</button
            >
            <div class="children" style="">
              <div class="controller string">
                <div class="name" id="lil-gui-name-7">string</div>
                <div class="widget">
                  <input
                    type="text"
                    spellcheck="false"
                    aria-labelledby="lil-gui-name-7"
                  />
                </div>
              </div>
              <div class="controller string selected">
                <div class="name" id="lil-gui-name-7">string</div>
                <div class="widget">
                  <input
                    type="date"
                    spellcheck="false"
                    aria-labelledby="lil-gui-name-7"
                  />
                </div>
              </div>
              <label class="controller boolean"
                ><div class="name" id="lil-gui-name-2">boolean</div>
                <div class="widget">
                  <input type="checkbox" aria-labelledby="lil-gui-name-2" />
                </div></label
              >
            </div>
          </div>
        </div>
      </div>
      <div class="controller option">
        <div class="name" id="lil-gui-name-5">options</div>
        <div class="widget">
          <select on:change={change} aria-labelledby="lil-gui-name-5"
            ><option>Small</option><option>Medium</option><option>Large</option
            ></select
          >
          <div class="display">Small</div>
        </div>
      </div>
      <label class="controller boolean"
        ><div class="name" id="lil-gui-name-6">boolean</div>
        <div class="widget">
          <input type="checkbox" aria-labelledby="lil-gui-name-6" />
        </div></label
      >
      <div class="controller string">
        <div class="name" id="lil-gui-name-7">string</div>
        <div class="widget">
          <input
            type="text"
            spellcheck="false"
            aria-labelledby="lil-gui-name-7"
          />
        </div>
      </div>
      <div class="controller string">
        <div class="name" id="lil-gui-name-7">string</div>
        <div class="widget">
          <input
            type="text"
            spellcheck="false"
            aria-labelledby="lil-gui-name-7"
          />
        </div>
      </div>
      <div class="controller string">
        <div class="name" id="lil-gui-name-7">string</div>
        <div class="widget">
          <input
            type="text"
            spellcheck="false"
            aria-labelledby="lil-gui-name-7"
          />
        </div>
      </div>
      <div class="controller number">
        <div class="name" id="lil-gui-name-8">number</div>
        <div class="widget">
          <input type="text" aria-labelledby="lil-gui-name-8" />
        </div>
      </div>
    </div>
      </div>`


        function creatediv(className, parent, tagname = "DIV") {
            const res = document.createElement(tagname);
            if (className)
                res.className = className;
            parent.appendChild(res);
            return res;
        }

    }

}

export { Editor }