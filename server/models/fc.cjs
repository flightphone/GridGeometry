const config = require('../config.cjs');
const mssql = require('mssql');
const svgrid = require('./svgrid.cjs');

async function save(fc, Account) {
    const sqlConfig = config.sqlConfig;
    const pool = new mssql.ConnectionPool(sqlConfig);
    await pool.connect();
    //FlightCard
    const fcparams = [
        "FC_PK",
        "FC_AL",
        "FC_Cancel",
        "FC_flState",
        "FC_flCategory",
        "FC_flType",
        "FC_STD",
        "FC_ETD",
        "FC_ATD",
        "FC_STA",
        "FC_ETA",
        "FC_ATA",
        "FC_AR",
        "FC_StandNum",
        "FC_Terminal",
        "FC_Gate",
        "FC_PaxAdlt",
        "FC_PaxChld",
        "FC_PaxInf",
        "FC_PaxQty",
        "FC_TotlBagWt",
        "FC_ExcBagWt",
        "FC_CargoWt",
        "FC_PostWt",
        "FC_apAddInfo",
        "FC_SpecCond",
        "FC_PaxChekInTime",
        "FC_PaxChekOutTime",
        "FC_PaxBoardingOn",
        "FC_PaxBoardingOff",
        "FC_DispReadyTime",
        "FC_OBT",
        "FC_LateArrival",
        "FC_DelayCodePr",
        "FC_DelayCodeFin",
        "FC_DelayMinute",
        "FC_Supervisor",
        "FC_LastEditionUser",
        "FC_Crew",
        "FC_ACVersion",
        "FC_RM",
        "FC_CU",
        "FC_LS"
    ];

    const SQLParams = {};
    fc.FlightCard["FC_LastEditionUser"] = Account;
    fcparams.forEach((e) => {
        SQLParams[e] = fc.FlightCard[e];
    });
    //date time parse
    const datef = [
        "FC_STD",
        "FC_ETD",
        "FC_ATD",
        "FC_STA",
        "FC_ETA",
        "FC_ATA",
        "FC_PaxChekInTime",
        "FC_PaxChekOutTime",
        "FC_PaxBoardingOn",
        "FC_PaxBoardingOff",
        "FC_DispReadyTime",
        "FC_OBT"
    ];
    datef.forEach((f)=>{
        if (SQLParams[f])
            SQLParams[f] = SQLParams[f].substring(0, 16).replace("T", " ");
    })
    //console.log(SQLParams);
    await svgrid.exec_proc({
        EditProc: "p_FlightCards_Edit_Light",
        SQLParams: SQLParams
    }, Account, pool);


    //OrderD
    const OrderH = {
        QH_PK: fc.FlightCard.FC_PK,
        QH_DateCreate: '2025-01-01',
        QH_AudtUser: Account,
        QH_Total: null,
        QH_Comment: null,
        QH_flState: null
    }
    await svgrid.exec_proc({
        EditProc: "p_OrderH_EDIT",
        SQLParams: OrderH
    }, Account, pool);

    let pax = false;
    let cargo = false;

    for (let i in fc.OrderD) {
        const e = fc.OrderD[i];
        if (e.QD_LineNo == 23)
            pax = true;

        if (e.QD_LineNo == 24)
            cargo = true;

        e["QD_AudtUser"] = Account;
        e["QD_AudtDate"] = '2025-01-01';

        await svgrid.exec_proc({
            EditProc: "p_OrderD_EDIT",
            SQLParams: {
                QD_PK: e.QD_PK,
                QD_QH: e.QD_QH,
                QD_QTY: e.QD_QTY,
                QD_LineNo: e.QD_LineNo,
                QD_SV: e.QD_SV,
                QD_Comment: e.QD_Comment,
                QD_AudtUser: e.QD_AudtUser,
                QD_AudtDate: e.QD_AudtDate,
                QD_isPosted: 1
            }
        }, Account, pool);
    }
    //Complex Service
    if (cargo)
        for (let i in fc.Cargo) {
            const e = fc.Cargo[i];
            await svgrid.exec_proc({
                EditProc: "p_cargoForm_edit",
                SQLParams: {
                    FC_PK: fc.FlightCard.FC_PK,
                    Name: e.Name,
                    W: e.W,
                    P: e.P,
                    QD_Comment: e.QD_Comment,
                    Account: Account
                }
            }, Account, pool);
        }

    if (pax)
        for (let i in fc.Pax) {
            const e = fc.Pax[i];
            await svgrid.exec_proc({
                EditProc: "p_PaxForm_Edit",
                SQLParams: {
                    FC_PK: fc.FlightCard.FC_PK,
                    Name: e.Name,
                    F: e.F,
                    C: e.C,
                    M: e.M,
                    Y: e.Y,
                    I: e.tot,
                    QD_Comment: e.QD_Comment,
                    Account: Account
                }
            }, Account, pool);
        }

    if (fc.QD_PK) {
        for (let i in fc.CargoPost) {
            const e = fc.CargoPost[i];
            if (!e.CM_Number)
                continue;

            e.CM_FC = fc.QD_PK;
            await svgrid.exec_proc({
                EditProc: "p_CargoMnD_EDIT",
                SQLParams: e
            }, Account, pool);
        }

        await svgrid.exec_proc({
            EditProc: "p_CargoMnH_EDIT",
            SQLParams: {
                FC_PK: fc.QD_PK,
                AUDTUSER: Account
            }
        }, Account, pool);

    }

    
    return { message: "OK" }

}

exports.save = save;