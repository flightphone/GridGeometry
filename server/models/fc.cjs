const config = require('../config.cjs');
const mssql = require('mssql');
const svgrid = require('./svgrid.cjs');

async function save(fc, Account) {
    //const sqlConfig = config.sqlConfig;
    //const pool = new mssql.ConnectionPool(sqlConfig);
    //await pool.connect();
    const OrderH = {
        QH_PK: fc.FlightCard.FC_PK,
        QH_DateCreate: '2025-01-01',
        QH_AudtUser: Account,
        QH_Total: null,
        QH_Comment: null,
        QH_flState: null
    }
    await svgrid.exec({
        EditProc: "p_OrderH_EDIT",
        SQLParams: OrderH
    }, Account);

    
    for (i in fc.OrderD) {
        const e = fc.OrderD[i];
        e["QD_AudtUser"] = Account;
        e["QD_AudtDate"] = '2025-01-01';

        await svgrid.exec({
            EditProc: "p_OrderD_EDIT",
            SQLParams: {
                QD_PK : e.QD_PK,
                QD_QH : e.QD_QH,
                QD_QTY: e.QD_QTY,
                QD_LineNo: e.QD_LineNo,
                QD_SV : e.QD_SV,
                QD_Comment : e.QD_Comment,
                QD_AudtUser : e.QD_AudtUser,
                QD_AudtDate: e.QD_AudtDate,
                QD_isPosted: 1
            }
        }, Account);
    }

    return {message: "OK"}

}

exports.save = save;