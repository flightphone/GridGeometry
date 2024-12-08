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
    let Setting = {};
    if (IdDeclareSet && !params.SQLParams) {
        Setting = await createGrid({ id: IdDeclareSet, mode: "new" });
        Setting.ReferEdit.SaveFieldList.forEach(f => {
            SQLParams["@" + f] = Setting.MainTab[0][f];
        });
    }
    if (params.SQLParams)
        SQLParams = params.SQLParams;

    let TextParams = {}
    if (params.TextParams)
        TextParams = params.TextParams;
    for (let k in TextParams) {
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

    const Fcols = [];
    const ColumnTab = [];
    try {
        const parser = new XMLParser({ ignoreAttributes: false });
        let xmlCols = parser.parse(rd["paramvalue"]);
        xmlCols.GRID.COLUMN.forEach((f) => {
            if ((f["@_Visible"] == "1"))
                Fcols.push({
                    FieldName: f["@_FieldName"],
                    FieldCaption: f["@_FieldCaption"],
                    DisplayFormat: f["@_DisplayFormat"],
                    //Visible: (f["@_Visible"] == "1")
                })
            ColumnTab.push(f["@_FieldName"]);
        });
    }
    catch (err) {
        ;
    }

    const ReferEdit = { SaveFieldList: rd.savefieldlist?.split(","), Editors: [] };
    const DecName = rd["decname"];
    if (rd["editproc"]) {
        //Editors
        const sql = `select classname, decname, dstfield, groupdec, iddeclare, idmap, keyfield, srcfield from t_sysFieldMap where decname = '${DecName}'`;
        const sysFieldMap = await dba.dbquery(cnstr, sql);
        //console.log(sysFieldMap);
        Fcols.forEach((f) => {
            const EditField = {};
            EditField.FieldName = f.FieldName;
            EditField.FieldCaption = f.FieldCaption;
            EditField.DisplayFormat = f.DisplayFormat;
            if (ReferEdit.SaveFieldList.indexOf(f.FieldName) == -1)
                EditField.disabled = true;
            //join row
            const a = sysFieldMap.filter((m) => {
                return (m.dstfield == f.FieldName && m.classname);
            });
            if (a.length > 0) {
                jr = {};
                let GroupDec = "--";
                const ClassName = a[0]["classname"];
                if (ClassName == "Bureau.Finder" || ClassName == "Bureau.GridCombo") {
                    jr.classname = ClassName;
                    jr.IdDeclare = a[0]["iddeclare"];
                    GroupDec = a[0]["groupdec"];
                    const b = sysFieldMap.filter((m) => { return (m.groupdec == GroupDec) });
                    jr.fields = {};
                    b.forEach((rw) => {
                        jr.fields[rw["srcfield"]] = rw["dstfield"];
                    });
                }
                if (ClassName == "Bureau.GridCombo") {

                    const c = sysFieldMap.filter((m) => { return (m.groupdec == GroupDec && m.keyfield == 1) });
                    if (c.length > 0) {
                        jr.keyField = c[0]["srcfield"];
                        jr.valField = c[0]["dstfield"];
                    }

                }
                EditField.joinRow = jr;
            }
            ReferEdit.Editors.push(EditField);
        });
    }
    grid.Descr = rd["descr"];
    grid.DecName = DecName;
    grid.KeyF = rd["keyfield"];
    grid.DispField = rd["dispfield"];
    grid.KeyValue = rd["keyvalue"];
    grid.SQLParams = SQLParams;
    grid.TextParams = TextParams;
    grid.Fcols = Fcols;
    grid.ColumnTab = ColumnTab;
    grid.IdDeclareSet = IdDeclareSet;
    grid.EditProc = rd["editproc"]?.toLowerCase();;
    grid.DelProc = rd["delproc"]?.toLowerCase();
    grid.ReferEdit = ReferEdit;
    grid.Setting = Setting;
    grid.MainTab = MainTab;
    grid.DefaultValues = {
        audtuser: config.Account,
        last_change_user: config.Account
    }
    grid.Account = config.Account;
    return grid;

}

async function exec(params) {
    const cnstr = config.connectionString;
    const EditProc = params.EditProc;
    const SQLParams = params.SQLParams;
    const pars = [];
    for (const fname in SQLParams) {
        let val = SQLParams[fname];
        if (typeof val === 'string')
            val = val.replace("'", "''")
        val = val ? `'${val}'` : "null";
        val = `@${fname} = ${val}`;
        pars.push(val);
    }
    const strval = pars.join(", ")
    const sql = `set dateformat ymd; execute ${EditProc} ${strval}`;
    try {
        const MainTab = await dba.dbquery(cnstr, sql);
        console.log(MainTab);
        ColumnTab = [];
        for (const f in MainTab[0])
            ColumnTab.push(f);

        return {
            message: "OK",
            MainTab: MainTab,
            ColumnTab: ColumnTab
        };

    }
    catch (err) {
        console.log(sql);
        console.log(err);
        return {
            message: err
        }
    }
}

exports.createGrid = createGrid;
exports.exec = exec;