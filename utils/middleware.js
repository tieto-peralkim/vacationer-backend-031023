const jwt = require('jsonwebtoken')

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: "unknown endpoint" });
};

const errorHandler = (error, req, res, next) => {
    console.error(error.message);

    if (error.name == "ValidationError") {
        console.error("Error validating!", error);
        res.status(422).send({ error: error.message });
    } else {
        console.error(error);
        res.status(500).json(error);
    }
    next(error);
};

const checkAuthentication = (req, res, next) => {
    console.log("Authenticating, req.cookies", req.cookies);

    if (!req.cookies["payload"] || !req.cookies["header-signature"]) {
        res.statusMessage = "Not allowed!";
        res.status(401).end();
    }
    else {
        const authCookie = req.cookies["header-signature"].header + "." + req.cookies["payload"].payload + "." + req.cookies["header-signature"].signature;
        let decodedUser;
        console.log("Authenticated, req.cookies", req.cookies);

        try {
            jwt.verify(authCookie, process.env.REACT_APP_JWT_SECRET, (err, user) => {
                if (err) {
                    console.log(err);
                    res.statusMessage = "Token error";
                    res.status(401).end();
                } else {
                    decodedUser = user.username;
                    console.log("decodedUser", decodedUser);
                    next()
                }
            })
        } catch (e) {
            res.statusMessage = "Verification error";
            res.status(401).end();
        }
    }
}

module.exports = {
    unknownEndpoint,
    errorHandler,
    checkAuthentication
};
