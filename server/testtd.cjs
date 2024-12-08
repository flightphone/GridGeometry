//TDS 7.3.B
const sql = require('mssql')

const sqlConfig = {
    user: "sa",
    password: "aA12345678",
    database: "uFlights",
    server: 'localhost\\SQLEXPRESS',
    /*
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    */
    options: {
        encrypt: false, 
        tdsVersion: "7_3_B",
        //trustServerCertificate: true
    }
}

const test = async () => {
    try {
        // make sure that any items are correctly URL encoded in the connection string
        //await sql.connect(sqlConfig)
        ///const result = await sql.query("set dateformat ymd; select top 3 * from Airlines")
        //console.dir(result)
        const pool = new sql.ConnectionPool(sqlConfig);
        await pool.connect();
        const request = new sql.Request(pool);
        request.input("AL_RF", "НеРФ");
        result = await request.query("set dateformat ymd; select top 3 * from Airlines where AL_RF = @AL_RF");
        console.dir(result);
    } catch (err) {
        console.log(err.toString());
    }
};

test();