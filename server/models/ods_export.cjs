const escp = ['&amp;', '&apos;', '&quot;', '&gt;', '&lt;']
const echar = ['&', "'", '"', '>', '<']

function xmlString(s) {
    res = `${s}`;
    for (i in echar) {
        e = echar[i];
        c = escp[i];
        res = res.replace(e, c);
    }
    return res
}

function dateformat(dat, f) {
    if (!dat || f == "#")
        return dat;
    d = dat.toISOString();
    f = f.replace('yyyy', d.substr(0, 4));
    f = f.replace('yy', d.substr(2, 2));
    f = f.replace('MM', d.substr(5, 2));
    f = f.replace('dd', d.substr(8, 2));
    f = f.replace('HH', d.substr(11, 2));
    f = f.replace('mm', d.substr(14, 2));
    return f;
}


function getCols(recordset) {
    cols = {}
    for (c in recordset.columns) {
        cols[c] = recordset.columns[c].type().type.name
    }
    return cols
}
function setFields(sxml, row, cols) {
    for (c in cols) {
        col_type = cols[c];
        if (col_type == "Int" || col_type == "Float") {
            const fc = new RegExp(`<table:table-cell((?!table:table-cell).|\n)*?\\[${c}\\](.|\n)*?</table:table-cell>`);
            const el = sxml.match(fc)
            if (el) {
                const src = el[0]
                const dst = src.replace(`<text:p>[${c}]</text:p>`, '').replace(`office:value-type="string"`, `office:value-type="float" office:value="${row[c]}"`).replace('calcext:value-type="string"', 'calcext:value-type="float"')
                sxml = sxml.replace(src, dst)
            }
        }
        else {
            const val = (row[c]) ? (col_type == "DateTime") ? dateformat(row[c], "dd.MM.yyyy") : row[c] : "";
            sxml = sxml.replace(`[${c}]`, xmlString(val))
        }
    }
    return sxml
}
function setTemplate(sxml, df_head, df_detail, field_name) {
    let res = sxml
    //console.log(res)
    const frow = new RegExp(`<table:table-row((?!table:table-row).|\n)*?\\[${field_name}\\](.|\n)*?</table:table-row>`);
    const el = res.match(frow);
    if (el) {
        const src = el[0]

        const ficols = /\[(.*?)\]/g;
        const recols = src.matchAll(ficols);
        const matchAll = Array.from(recols);
        const dcols = getCols(df_detail)
        const cols = {}
        matchAll.forEach((e) => {
            cols[e[1]] = dcols[e[1]];
        })
        let dst = "";
        df_detail.forEach((rw) => {
            const rws = setFields(src, rw, cols)
            dst = dst + rws;
        });
        
        res = res.replace(src, dst)
        res = res.replace(/table:number-rows-repeated="(.*?)"/g, 'table:number-rows-repeated="100"')
        
        
    }
    hcols = getCols(df_head)
    res = setFields(res, df_head[0], hcols)
    return res
}


exports.setTemplate = setTemplate;