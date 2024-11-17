const prodaction = false;
const back_url = 'http://127.0.0.1:5000/';

let openMap = new Map();
let openIDs = []

let mainObj = {
    baseUrl: ((prodaction) ? '' : back_url),

    getForm: (id, link1, params) => {
        return null;
    },

    activate: () => { },

    open: (id, link1, params, extparams = {}) => {
        if (!openMap.get(id)) {
            extparams.id = id;
            let c = mainObj.getForm(id, link1, params);
            if (c === "not implemented")
                return;

            let obj = {
                Control: c,
                IdDeclare: params,
                extparams: extparams
            };
            openMap.set(id, obj);
            openIDs.push(id);
        } else if (openMap.get(id).activate) openMap.get(id).activate();
        mainObj.current = id;
        //25.05.2022 история по якорям
        window.location.hash = id;
        //11.11.2024
        mainObj.activate();
    },

    alert: (text, title = "message") => { alert(text); },
    confirm: (text, title = "question") => { return confirm(text); },
    alarm: (method, param) => {
        openMap.forEach((value) => {
            let m = value[method];
            if (m) {
                m(param);
            }
        });
    },

    sheme: "ag-theme-balham-dark",
    
    dateformat: function (d, f) {
        if (d == null)
            return ""
        //if (!d) return d;
        if (f == "text" || f == "hide" || f == 'password' || f == 'disabled' || f == null || f == "")
            return d;

        if (d.length != 24) {
            let res = f.match(/0\.(0+)/);

            let n = 0;
            if (res)
                if (res.length > 1) {
                    n = res[1].length;
                }

            if (n > 0) return Number(d.toString()).toFixed(n);
            else return d;
        }
        else {
            try {
                f = f.replace("yyyy", d.substr(0, 4));
                f = f.replace("yy", d.substr(2, 2));
                f = f.replace("MM", d.substr(5, 2));
                f = f.replace("dd", d.substr(8, 2));
                f = f.replace("HH", d.substr(11, 2));
                f = f.replace("mm", d.substr(14, 2));
            } catch (error) {
                f = error.toString()
            }
        }
        return f;
    }
}

//история переходов
window.addEventListener(
    "popstate",
    function () {
        let hi = window.location.hash.replace("#", "");
        if (hi != mainObj.current && openMap.get(hi)) {
            mainObj.current = hi;
            mainObj.activate();
        }
    },
    false
);

function creatediv(className, parent, tagname = "DIV") {
    const res = document.createElement(tagname);
    if (className)
        res.className = className;
    parent.appendChild(res);
    return res;
}

export { mainObj, openMap, openIDs, creatediv }