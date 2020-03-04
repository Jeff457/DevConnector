const jwt = require("jsonwebtoken");
const config = require("config");


module.exports = function (req, res, next) {
    const authHeader = req.header("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");

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