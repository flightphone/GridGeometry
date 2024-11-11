<script>
  export let isOpen = false;
  export let title = "";

  function closeModal() {
    isOpen = false;
  }
</script>

{#if isOpen}
  <div class="modal-backdrop" on:click={closeModal}>
    <div class="modal mdl-card mdl-shadow--2dp" on:click|stopPropagation>
      <div class="mdl-card__title">
        <h4 class="mdl-card__title-text">{title}</h4>
      </div>
      <div class="mdl-card__supporting-text" style="flex-grow: 1">
        <slot></slot>
      </div>
      <div class="mdl-card__actions mdl-card--border" style="display:flex; justify-content: center">
        <div>
          <button
            class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect"
            on:click={closeModal}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal {
    width: 80vw;
    height: 80vh;
  }
</style>
