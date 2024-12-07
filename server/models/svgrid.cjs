const config = require('../config.cjs');
const dba = require('../dba.cjs');
const { XMLParser } = require("fast-xml-parser");

async function createGrid(params) {
    const grid = {}
    const id = params.id;
    let sql = "declare @id varchar(32) = ?; select iddeclare, decname, descr, dectype, decsql, keyfield, dispfield, keyvalue, dispvalue, keyparamname, dispparamname, isbasename, descript, addkeys, tablename, editproc, delproc, image_bmp, savefieldlist, p.paramvalue from t_rpdeclare d left join t_sysparams p on 'GridFind' + d.decname = p.paramname where iddeclare = @id";
    const cnstr = config.connectionString;
    const t_rp = await dba.dbquery(cnstr, sql, [id]);

    const rd = t_rp[0];
    let SQLText = rd.decsql;
    SQLText = SQLText.replace('[Account]', config.Account);
    const IdDeclareSet = rd["dispparamname"];

    let SQLParams = {};
    if (IdDeclareSet && !params.SQLParams) {
        const Setting = await createGrid({ id: IdDeclareSet, mode: "new" });
        Setting.ReferEdit.SaveFieldList.forEach(f => {
            SQLParams["@" + f] = Setting.MainTab[0][f];
        });
    }
    if (params.SQLParams)
        SQLParams = params.SQLParams;

    let TextParams = {}
    if (params.TextParams)
        TextParams = params.TextParams;
    for (let k in TextParams)
    {
        SQLText = SQLText.replace(`[${k}]`, TextParams[k]);
    }        


    let declarestr = "";
    const pars = [];
    for (const p in SQLParams) {
        let pname = p;
        if (pname.substring(0, 1) != "@")
            pname = "@" + pname;
        declarestr = declarestr + `declare ${pname} varchar(64) = ?; `
        pars.push(SQLParams[p]);
    }
    SQLText = declarestr + SQLText;
    const MainTab = await dba.dbquery(cnstr, SQLText, pars);


    if (params.mode == "data") {
        grid.MainTab = MainTab;
        return grid;
    }
    //end update MainTab
    //columns
    const parser = new XMLParser({ ignoreAttributes: false });

    const Fcols = [];
    const ColumnTab = [];
    let xmlCols = parser.parse(rd["paramvalue"]);
    xmlCols.GRID.COLUMN.forEach((f) => {
        Fcols.push({
            FieldName: f["@_FieldName"],
            FieldCaption: f["@_FieldCaption"],
            DisplayFormat: f["@_DisplayFormat"],
            Visible: (f["@_Visible"] == "1")
        })
        ColumnTab.push(f["@_FieldName"]);
    });

    grid.Descr = rd["descr"];
    grid.KeyF = rd["keyfield"];
    grid.DispField = rd["dispfield"];
    grid.KeyValue = rd["keyvalue"];
    grid.SQLParams = SQLParams;
    grid.TextParams = TextParams;
    grid.Fcols = Fcols;
    grid.ColumnTab = ColumnTab;
    //grid.IdDeclareSet = IdDeclareSet;
    grid.ReferEdit = { SaveFieldList: rd.savefieldlist.split(",") };
    grid.MainTab = MainTab;

    return grid;

}

exports.createGrid = createGrid;