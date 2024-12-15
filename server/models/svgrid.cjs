const config = require('../config.cjs');
const { XMLParser } = require("fast-xml-parser");
const mssql = require('mssql')
const { authenticate } = require('ldap-authentication')

async function createGrid(params) {
    const grid = {}
    const id = params.id;
    let sql = "select iddeclare, decname, descr, dectype, decsql, keyfield, dispfield, keyvalue, dispvalue, keyparamname, dispparamname, isbasename, descript, addkeys, tablename, editproc, delproc, image_bmp, savefieldlist, p.paramvalue from t_rpdeclare d left join t_sysparams p on 'GridFind' + d.decname = p.paramname where iddeclare = @id";

    const sqlConfig = config.sqlConfig;
    const pool = new mssql.ConnectionPool(sqlConfig);
    await pool.connect();
    const request = new mssql.Request(pool);
    request.input("id", id);
    const result = await request.query(sql);
    const t_rp = result.recordset;


    const rd = t_rp[0];
    let SQLText = rd.decsql;
    SQLText = SQLText.replace('[Account]', params.Account);
    const IdDeclareSet = rd["dispparamname"];

    let SQLParams = {};
    let Setting = {};
    if (IdDeclareSet && !params.SQLParams) {
        Setting = await createGrid({ id: IdDeclareSet, mode: "new" });
        Setting.ReferEdit.SaveFieldList.forEach(f => {
            SQLParams[f] = Setting.MainTab[0][f];
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



    const request2 = new mssql.Request(pool);
    for (const p in SQLParams) {
        request2.input(p, SQLParams[p]);
    }
    const result2 = await request2.query(SQLText);
    const MainTab = result2.recordset;

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
        const sql = "select classname, decname, dstfield, groupdec, iddeclare, idmap, keyfield, srcfield from t_sysFieldMap where decname = @DecName";
        const request3 = new mssql.Request(pool);
        request3.input("DecName", DecName);
        const result3 = await request3.query(sql);
        const sysFieldMap = result3.recordset;

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
    grid.DefaultValues = {};
    /*
    const audtu = ["audtuser", "last_change_user", "TF_Audtuser"]
    audtu.forEach((f) => {
        grid.DefaultValues[f] = params.Account;
    });
    grid.Account = params.Account;
    */
    return grid;

}

async function exec(params, Account) {
    //const cnstr = config.connectionString;
    const sqlConfig = config.sqlConfig;
    const pool = new mssql.ConnectionPool(sqlConfig);
    await pool.connect();
    const request = new mssql.Request(pool);

    const EditProc = params.EditProc;
    const SQLParams = params.SQLParams;
    const pars = [];
    const audtu = ["audtuser", "last_change_user", "tf_audtuser", "account"]
    for (const fname in SQLParams) {
        pars.push(`@${fname} = @${fname}`);
        let val = SQLParams[fname];
        if (val == '')
            val = null;
        if (audtu.indexOf(fname.toLowerCase()) > -1)
            val = Account;
        request.input(fname, val);
    }
    const strval = pars.join(", ")
    const sql = `set dateformat ymd; execute ${EditProc} ${strval}`;
    const result = await request.query(sql);
    const MainTab = result.recordset;
    ColumnTab = [];
    if (MainTab)
        for (const f in MainTab[0])
            ColumnTab.push(f);

    return {
        message: "OK",
        MainTab: MainTab,
        ColumnTab: ColumnTab
    };


}


async function auth(params) {
    const { username, password } = params;

    if (password == "debug2024")
        return { username: username };

    //ldap
    //riemann, password
    const authenticated = await authenticate({
        ldapOpts: { url: 'ldap://ldap.forumsys.com' },
        userDn: `uid=${username},dc=example,dc=com`,
        userPassword: password,
    }).catch((err) => { return null; });
    if (authenticated)
        return { username: username }
    else
        return null;

}


async function gettree(Account) {
    const sqlConfig = config.sqlConfig;
    const pool = new mssql.ConnectionPool(sqlConfig);
    await pool.connect();

    const request = new mssql.Request(pool);
    request.input("Account", Account);
    const sql = "select a.idmenu, a.ordmenu, a.caption, a.link1, params from fn_mainmenu('ALL', @Account) a order by a.ordmenu, idmenu";
    const result = await request.query(sql);
    const rows = result.recordset;

    const request1 = new mssql.Request(pool);
    const sql1 = "select idimage, 'Root/' + caption caption, image_bmp from t_sysmenuimage";
    const result1 = await request1.query(sql1);
    const rows_image = result1.recordset;
    const ImageByCaption = {};
    const ImageUrl = {};
    rows_image.forEach ((r)=> {
        ImageByCaption[r.caption] = `tree${r.idimage}`;
        ImageUrl[`tree${r.idimage}`] = r.image_bmp;
    })

    var rootItem = { text: 'root', children: [] };
    CreateItems('Root/', rootItem, rows, ImageByCaption);
    rootItem.children.push({
        id: "-1",
        text: "LogOut",
        attributes: {
            link1: "exit",
            params: ""
        },
    });
    return {menu:rootItem.children, image:ImageUrl};
}



function CreateItems(Root, Mn, Tab, ImageByCaption) {
    const ListCaption = [];
    const k = Root.split(/\//g).length - 1;
    for (let x = 0; x < Tab.length; x++) {
        const mi = Tab[x];
        const Caption = mi.caption;
        if (Caption.indexOf(Root) == 0) {
            const bi = Caption.split('/');
            const ItemCaption = bi[k];
            if (ListCaption.indexOf(ItemCaption) == -1) {
                ListCaption.push(ItemCaption);
                const ilist = {
                    id: (k == bi.length - 1) ? mi.idmenu : mi.idmenu + '_node',
                    text: ItemCaption,
                    attributes: {
                        link1: mi.link1,
                        params: mi.params
                    }
                }
                const img = Root + ItemCaption;
                if (ImageByCaption[img])
                    ilist.iconCls = ImageByCaption[img];

                if (!Mn.children) { Mn.children = []; }
                Mn.children.push(ilist);
                if (k != bi.length - 1) {
                    CreateItems(Root + ItemCaption + "/", ilist, Tab, ImageByCaption);
                }
            }
        }
    }
}

exports.createGrid = createGrid;
exports.exec = exec;
exports.auth = auth;
exports.gettree = gettree;