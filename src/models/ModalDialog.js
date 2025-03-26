import { creatediv } from "../store";
class ModalDialog {
    close = () => {
        this.dialog.close();
    }
    showModal = () => {
        this.dialog.showModal()
    }
    constructor(height = "400", width = "600", okfun = () => { this.close() }, al = false) {
        this.height = height;
        this.width = width;
        /*
        class="ag-panel ag-default-panel ag-dialog ag-ltr ag-popup-child ag-focus-managed"
        */
        this.dialog = creatediv("modal", document.querySelector("main"), "dialog");
        this.dialog.style.height = `${this.height}`;
        this.dialog.style.width = `${this.width}`;
        this.dialog.style.padding = "0px";
        let modalDialog = creatediv("modalDialog", this.dialog);
        this.content = creatediv("contentDialog", modalDialog)
        let dialogPanel = creatediv("dialogPanel", modalDialog);
        let dialogButton1 = creatediv("dialogButton", dialogPanel);
        let okbut = creatediv("mdl-button mdl-js-button mdl-button--raised", dialogButton1, "button");
        okbut.textContent = "OK";
        okbut.onclick = () => okfun();

        if (!al) {
            let dialogButton2 = creatediv("dialogButton", dialogPanel);
            let cancelbut = creatediv("mdl-button mdl-js-button mdl-button--raised", dialogButton2, "button");
            cancelbut.textContent = "Cancel";
            cancelbut.onclick = () => this.close();
        }





    }
}
export { ModalDialog }