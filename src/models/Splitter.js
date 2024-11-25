class Splitter {
    constructor(elsp, eldiv, direct) {
        //this.direct = direct;

        this.x = 0;
        this.y = 0;
        this.mode = false;
        elsp.style.cursor = `${direct}-resize`;
        elsp.parentElement.addEventListener("mousedown", (e) => {

            if (e.target == elsp) {
                this.x = e.clientX;
                this.y = e.clientY;
                this.mode = true;
            }

        });
        elsp.parentElement.addEventListener("mousemove", (e) => {
            if (this.mode) {
                const dx = e.clientX - this.x;
                const dy = e.clientY - this.y;
                this.x = e.clientX;
                this.y = e.clientY;
                if (direct == "col") {
                    let w = Number.parseInt(eldiv.style.width);
                    w = w + dx;
                    eldiv.style.width = `${w}px`;
                }
            }

        });
        elsp.parentElement.addEventListener("mouseup", (e) => {
            this.x = 0;
            this.y = 0;
            this.mode = false;
        });
        elsp.addEventListener("mouseup", (e) => {
            this.x = 0;
            this.y = 0;
            this.mode = false;
        });

    }
}
export { Splitter }