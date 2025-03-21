const jwt = require('jsonwebtoken');
const AD = require('activedirectory2').promiseWrapper;


const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization;
    if (token) {
        jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
            if (err) { return res.json({ Error: "access denied" }); } //sendStatus(403)
            req.user = user;
            next();
        });
    } else {
        return res.status(401).json({ Error: "access denied" });  //sendStatus(401)
    }
};

async function auth(params) {
    const { username, password } = params;

    if (password == process.env.PASSWORD_SA)
        return { username: username };


    let error = ""
    const config = {
        url: process.env.LDAP,
        baseDN: process.env.BASEDN
    }
    const ad = new AD(config);
    uname = username + (process.env.DOMAIN ? process.env.DOMAIN : "");
    const authenticated = await ad.authenticate(uname, password).catch((err) => {
        error = "incorrect login or password"; //err.message;
        return false;
    });

    if (authenticated)
        return { username: username }
    else
        return { error: error };

}

exports.auth = auth;
exports.authenticateJWT = authenticateJWT;
