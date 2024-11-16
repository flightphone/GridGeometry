<script>
  import "../css/lil-gui.css";
  import { Editor } from "../models/Editor";
  import { onMount } from "svelte";
  let gu;
  let description = $state("");
  let ed;
  let manager = {
    onclick: (e) => {
      description = e;
    }
  };

  
/*
  let change = (e) => {
    //alert(e.target.tagName);
    let el = e.target;
    let ht = el.parentElement.querySelector(".display");
    if (ht) ht.innerHTML = e.target.value;
  };
  */
  onMount(async () => {
    const url = "/Finder.json";
    const res = await fetch(url);
    const data = await res.json();
    ed = new Editor(data.ReferEdit, gu, manager)
    
  });
</script>

<div class="lil-out autoPlace" style="width: 600px;" >
  <div
    bind:this={gu} style="height:400px;border: 1px solid gray;"
  >
  </div>
  <div class="lil-gui description">
    {description}
  </div>
</div>
