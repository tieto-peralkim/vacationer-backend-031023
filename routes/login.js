const axios = require("axios");
const loginRouter = require("express").Router();
require("dotenv").config();
const jwt = require("jsonwebtoken");

const clientId = process.env.REACT_APP_GHUB_ID;
const clientSecret = process.env.REACT_APP_GHUB_SECRET;
const secret = process.env.REACT_APP_JWT_SECRET;
const frontUrl = process.env.REACT_APP_FRONT_ADDRESS;

const ORGANISATION_NAME = "tieto-cem";
const SELECTEDSCOPE = "read:org";
const EXPIRATIONDAYS = 7;

/**
 * @openapi
 * /auth:
 *  get:
 *      tags: ["login"]
 *      summary: Redirection to Github Authorization
 *      description: Redirection to Github Authorization
 */
loginRouter.get("/auth", (req, res) => {
    res.redirect(
        `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=${SELECTEDSCOPE}`
    );
});

/**
 * @openapi
 * /callback:
 *  get:
 *      tags: ["login"]
 *      summary: Callback endpoint for Github Authorization
 *      description: Callback endpoint for Github Authorization
 *      responses:
 *          302:
 *              description: Redirection to front page or to loginFailed page
 */
loginRouter.get("/callback", (req, res, next) => {
    const requestToken = req.query.code;

    axios({
        method: "post",
        url: `https://github.com/login/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&code=${requestToken}`,
        headers: {
            accept: "application/json",
        },
    })
        .then((response) => {
            let access_token = response.data.access_token;
            axios({
                method: "get",
                url: `https://api.github.com/user`,
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }).then((response) => {
                let username = { username: response.data.login };
                axios({
                    method: "get",
                    url: `https://api.github.com/user/orgs`,
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                    },
                }).then((response) => {
                    let rightOrganization = false;

                    for (let i = 0; i < response.data.length; i++) {
                        if (response.data[i].login === ORGANISATION_NAME) {
                            rightOrganization = true;
                        }
                    }
                    if (rightOrganization) {
                        jwt.sign(
                            username,
                            secret,
                            { expiresIn: `${EXPIRATIONDAYS}d` },
                            (err, token) => {
                                let [header, payload, signature] =
                                    token.split(".");
                                res.cookie(
                                    "payload",
                                    { payload },
                                    {
                                        expires: new Date(
                                            Date.now() +
                                                EXPIRATIONDAYS * 86400 * 1000
                                        ),
                                        httpOnly: false,
                                        sameSite: "strict",
                                    }
                                );
                                res.cookie(
                                    "header-signature",
                                    { header, signature },
                                    {
                                        expires: new Date(
                                            Date.now() +
                                                EXPIRATIONDAYS * 86400 * 1000
                                        ),
                                        httpOnly: true,
                                        sameSite: "strict",
                                    }
                                );
                                return res.redirect(302, `${frontUrl}/`);
                            }
                        );
                    } else {
                        return res.redirect(302, `${frontUrl}/loginFailed`);
                    }
                });
            });
        })
        .catch((error) => next(error));
});

/**
 * @openapi
 * /logout:
 *  get:
 *      tags: ["login"]
 *      summary: Redirection to frontpage after logout
 *      description: Redirection to frontpage after logout
 *      responses:
 *          302:
 *              description: Redirection to frontpage
 */
loginRouter.get("/logout", (req, res) => {
    res.clearCookie("payload");
    res.clearCookie("header-signature");
    return res.redirect(302, `${frontUrl}/`);
});

module.exports = loginRouter;
