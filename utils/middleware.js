const jwt = require("jsonwebtoken");
const Vacationer = require("../models/vacationer");

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: "unknown endpoint" });
};

const errorHandler = (error, req, res, next) => {
    console.error(error.message);

    if (error.name === "ValidationError") {
        console.error("Error validating!", error);
        res.status(422).send({ error: error.message });
    } else {
        console.error(error);
        res.status(500).json(error);
    }
    next(error);
};

const checkAuthentication = (req, res, next) => {
    if (!req.cookies["payload"] || !req.cookies["header-signature"]) {
        res.statusMessage = "Not allowed!";
        res.status(401).end();
    } else {
        const authCookie =
            req.cookies["header-signature"].header +
            "." +
            req.cookies["payload"].payload +
            "." +
            req.cookies["header-signature"].signature;
        let decodedUser;

        try {
            jwt.verify(
                authCookie,
                process.env.REACT_APP_JWT_SECRET,
                (err, user) => {
                    if (err) {
                        console.log(err);
                        res.statusMessage = "Token error";
                        res.status(401).end();
                    } else {
                        decodedUser = user.username;
                        next();
                    }
                }
            );
        } catch (e) {
            res.statusMessage = "Verification error";
            res.status(401).end();
        }
    }
};

function isAdmin() {
    return async function(req, res, next) {
        if (!req.cookies.admin.isAdmin) {
            return res.status(403).send("Access denied.");
        }
        
        next();
    };
};

module.exports = {
    unknownEndpoint,
    errorHandler,
    checkAuthentication,
    isAdmin
};
