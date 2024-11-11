let active;


function clickTree(e, callback = (l)=>{})
{
    let sp = e.target.parentElement;
    let li = sp.parentElement;
    if (sp.classList.contains("fancytree-has-children"))
    {
        for (const child of li.children) {
            if (child.tagName == "UL")
            {
                if (child.style.cssText == "")
                {
                    child.style.cssText = "display:none;";
                    sp.classList.remove("fancytree-expanded");
                    sp.classList.remove("fancytree-exp-e");
                    sp.classList.add("fancytree-exp-c");
                }
                else
                {
                    child.style.cssText = "";    
                    sp.classList.add("fancytree-expanded");
                    sp.classList.add("fancytree-exp-e");
                    sp.classList.remove("fancytree-exp-c");
                }

            }
          }
    }
    else
    {
        if (active)
            active.classList.remove("fancytree-active");
        active = sp;
        sp.classList.add("fancytree-active");
        callback(li);
            //alert("item");    
    }
}
function dfs(elTree, elHTML)
{
    const li = document.createElement("LI");
    const sp0 = document.createElement("SPAN");
    const sp1 = document.createElement("SPAN");
    const sp2 = document.createElement("SPAN");
    const sp3 = document.createElement("SPAN");
    sp0.appendChild(sp1);
    sp0.appendChild(sp2);
    sp0.appendChild(sp3);
    li.appendChild(sp0);
    sp1.className = "fancytree-expander";
    sp2.className = "fancytree-icon"
    sp3.className = "fancytree-title";
    sp3.innerText = elTree.text;
    sp1.className = "fancytree-expander";
    if (elTree.children)
    {
        sp0.className = "fancytree-node fancytree-folder fancytree-has-children fancytree-exp-c fancytree-ico-cf";
        const ul = document.createElement("UL");
        ul.style.cssText = "display:none;";
        li.appendChild(ul);
        for (const ch of elTree.children)
            dfs(ch, ul);
    }
    else
    {
        const idmenu = document.createAttribute("idmenu");
        idmenu.value = elTree.id;
        li.setAttributeNode(idmenu);

        const link1 = document.createAttribute("link1");
        link1.value = elTree.attributes.link1;
        li.setAttributeNode(link1);

        const params = document.createAttribute("params");
        params.value = elTree.attributes.params;
        li.setAttributeNode(params);


        sp0.className = "fancytree-node fancytree-exp-n fancytree-ico-c";
    }
    elHTML.appendChild(li);
}

function CreateTreeTree(element=document.getElementById('tree'), data = [], callback = (l)=>{})
{
    let root = document.createElement("UL");
    root.className = "ui-fancytree fancytree-container fancytree-plain";
    for (const item of data)
    {
        dfs(item, root)    
    }
    root.onclick = (e) => {
        clickTree(e, callback);
    }
    element.innerHTML = "";
    element.appendChild(root);
}

export {CreateTreeTree}