const jwt = require("jsonwebtoken");
const config = require("config");
const BEARER_LEN = 7;


module.exports = function (req, res, next) {
    // expecting Authorization: Bearer <token>
    const token = req.header("Authorization").substring(BEARER_LEN);

    if (!token) {
        return res.status(401).json({ msg: "Missing auth token" });
    }

    try {
        const decoded = jwt.verify(token, config.get("JWT.secret"));

        req.user = decoded.user;
        next();
    } catch (err) {
        return res.status(401).json({ msg: "Invalid auth token" });
    }
};