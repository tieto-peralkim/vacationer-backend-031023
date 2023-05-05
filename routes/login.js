"use strict";

const axios = require("axios");
const loginRouter = require("express").Router();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const Vacationer = require("../models/vacationer");

const clientId = process.env.REACT_APP_GHUB_ID;
const clientSecret = process.env.REACT_APP_GHUB_SECRET;
const secret = process.env.REACT_APP_JWT_SECRET;
const frontUrl = process.env.REACT_APP_FRONT_ADDRESS;

const maxNameLength = 12;
const minNameLength = 3;
const ORGANISATION_NAME = "tieto-cem";
const SELECTEDSCOPE = "read:org";
const EXPIRATIONDAYS = 7;

/**
 * @openapi
 * /checkStatus:
 *  get:
 *      tags: ["login"]
 *      summary: Check that API is up
 *      description: Check that API is up
 *      responses:
 *          200:
 *              description: Status ok
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: string
 */
loginRouter.get("/checkStatus", (req, res) => {
    res.status(200).send("Status ok");
});

/**
 * @openapi
 * /checkAuthorization:
 *  get:
 *      tags: ["login"]
 *      summary: Redirection to check permissions of Github Authorization
 *      description: Redirection to check permissions of Github Authorization
 */
loginRouter.get("/checkAuthorization", (req, res) => {
    res.redirect(
        `https://github.com/settings/connections/applications/${clientId}`
    );
});

/**
 * @openapi
 * /login:
 *  get:
 *      tags: ["login"]
 *      summary: Redirection to Github Authorization
 *      description: Redirection to Github Authorization
 */
loginRouter.get("/login", (req, res) => {
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
            const access_token = response.data.access_token;
            const config = {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            };
            Promise.all([
                axios.get("https://api.github.com/user", config),
                axios.get("https://api.github.com/user/orgs", config),
            ])
                .then((response) => {
                    let usernameJSON = { username: response[0].data.login };
                    let username = usernameJSON.username;
                    let organisations = response[1].data;
                    let rightOrganization = false;

                    for (let i = 0; i < organisations.length; i++) {
                        if (organisations[i].login === ORGANISATION_NAME) {
                            rightOrganization = true;
                        }
                    }
                    if (rightOrganization) {
                        Vacationer.find({ nameId: username }).then(
                            (foundVacationer) => {
                                if (!foundVacationer.length) {
                                    console.log(
                                        "User does not exist, creating a user:",
                                        username
                                    );

                                    let newName = username;
                                    if (username.length < minNameLength) {
                                        return res
                                            .status(400)
                                            .json(
                                                `Username under ${minNameLength} characters`
                                            );
                                    }

                                    if (username.length > maxNameLength) {
                                        newName = newName.slice(
                                            0,
                                            maxNameLength
                                        );
                                    }

                                    let userInfo = {
                                        name: newName,
                                        nameId: username,
                                    };

                                    let newUser = new Vacationer(userInfo);
                                    console.log("newUser", newUser);

                                    newUser
                                        .save()
                                        .then((savedVacationer) => {
                                            console.log(
                                                "savedVacationer",
                                                savedVacationer
                                            );
                                        })
                                        .catch((error) => {
                                            console.error(error);
                                            console.error(
                                                "Error code:",
                                                error.code
                                            );
                                            next(error);
                                        });
                                } else {
                                    console.log("User found in database!");
                                }
                            }
                        );

                        jwt.sign(
                            usernameJSON,
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
                })
                .catch((error) => {
                    next(error);
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
