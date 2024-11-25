const prodaction = false;
const back_url = 'http://127.0.0.1:5000/';

let openMap = new Map();
let openIDs = []

let sheme = localStorage.sheme ? localStorage.sheme : "ag-theme-balham-dark";
if (sheme == "ag-theme-balham")
    document.querySelector("BODY").classList.toggle("dark");

let mainObj = {
    jsonData: true,
    baseUrl: ((prodaction) ? '' : back_url),

    getForm: (id, link1, params) => {
        return null;
    },

    activate: () => { },

    open: (id, link1, params, extparams = {}) => {
        if (!openMap.get(id)) {
            extparams.id = id;
            if (link1 == "RegulationPrint.Refer.referExtTarif") {
                extparams.editorJson = "/tmp/Editor1233.json";
            }
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
        //25.05.2022 history
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

    sheme: sheme,//"ag-theme-balham-dark",

    dateformat: function (d, f) {
        if (d == null)
            return ""
        if (!f)
            return d;

        if (f == "text" || f == "hide" || f == 'password' || f == 'disabled' || f == null || f == "")
            return d;

        if (f.indexOf('.0') > -1) {
            let res = f.match(/0\.(0+)/);

            let n = 0;
            if (res)
                if (res.length > 1) {
                    n = res[1].length;
                }

            if (n > 0) return Number(d.toString()).toFixed(n);
            else return d;
        }

        if (f.indexOf('dd.MM') > -1) {
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
            return f;
        }

        return d;
    },

    fetch: async (idDeclare, mode, SQLParams, TextParams) => {
        let mid;
        try {

            if (mainObj.jsonData) {
                const url = `/json_grids/FinderStart${idDeclare}.json`;
                const response = await fetch(url);
                mid = await response.json();
            }
            else {
                const url = `${mainObj.baseUrl}React/FinderStart`;
                const bd = new FormData();
                bd.append("id", idDeclare);
                bd.append("mode", mode);
                if (SQLParams) bd.append("SQLParams", JSON.stringify(SQLParams));
                if (TextParams) bd.append("TextParams", JSON.stringify(TextParams));

                const response = await fetch(url, {
                    method: "POST",
                    body: bd,
                    cache: "no-cache",
                    //credentials: "include",
                });
                mid = await response.json();
            }
        }
        catch (err) {
            mid = { Error: err.toString() };
        }
        return mid;
    }
}

//history transfer
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