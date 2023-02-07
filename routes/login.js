const axios = require("axios");
const loginRouter = require("express").Router();
require("dotenv").config();
const jwt = require('jsonwebtoken')

const clientId = process.env.REACT_APP_CLIENT_ID;
const clientSecret = process.env.REACT_APP_CLIENT_SECRET;
let access_token;
let username;
const selectedScope="read:org";
const expireInDays = 7;
const ORGANISATION_NAME='tieto-cem';
const secret = process.env.REACT_APP_TOKEN_SECRET;
let requestUrlLogIn;

loginRouter.get("/logout", (req, res) => {
    let requestUrlLogOut=req.get("Referrer");
    res.clearCookie("payload");
    res.clearCookie("header-signature");
    console.log("requestUrlLogOut: ", requestUrlLogOut);
    return res.redirect(302, `${requestUrlLogOut}`);
})

loginRouter.get("/auth", (req, res) => {
    requestUrlLogIn=req.get("Referrer");
    console.log("requestUrlLogIn: ", requestUrlLogIn);
    res.redirect(`https://github.com/login/oauth/authorize?client_id=${clientId}&scope=${selectedScope}`)
})

loginRouter.get("/callback", (req, res, next) => {
    const requestToken = req.query.code;

    axios({
        method: 'post',
        url: `https://github.com/login/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&code=${requestToken}`,
        headers: {
            accept: 'application/json'
            },
    })
        .then((response) => {
            access_token = response.data.access_token;
            res.redirect(`/success`);
        })
        .catch((error) => next(error));
})

loginRouter.get("/success", function(req, res) {
    axios({
        method: 'get',
        url: `https://api.github.com/user`,
        headers: {
            Authorization: `Bearer ${access_token}`
        },
    })
        .then(response => {
            username = {username: response.data.login};
            axios({
                method: 'get',
                url: `https://api.github.com/user/orgs`,
                headers: {
                    Authorization: `Bearer ${access_token}`
                },
            })
                .then(response => {
                    // console.log("organisation", response.data);
                    let rightOrganization=false;
                    //poista
                    rightOrganization=true;

                    for (let i = 0; i < response.data.length; i++){
                        if(response.data[i].login === ORGANISATION_NAME){
                            rightOrganization=true;
                        }
                    }
                    if (rightOrganization) {
                        jwt.sign(username, secret, { expiresIn: `${expireInDays}d` }, (err, token) => {
                            let [header, payload, signature] = token.split('.');
                            console.log("header", header, "PL", payload, "signature", signature);
                            res.cookie("payload", { payload }, {
                                expires: new Date(Date.now() + expireInDays*86400*1000),
                                httpOnly: false,
                                sameSite: "strict"
                            })
                            res.cookie("header-signature", { header, signature}, {
                                expires: new Date(Date.now() + expireInDays*86400*1000),
                                httpOnly: true,
                                sameSite: "strict"
                            })
                            return res.redirect(302, `${requestUrlLogIn}`)
                        })
                    } else {
                        return res.redirect(302, `${requestUrlLogIn}loginFailed`);
                    }
                })
        })
})


module.exports = loginRouter;