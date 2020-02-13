const bcrypt = require("bcryptjs");
const config = require("config");
const express = require("express");
const gravatar = require("gravatar");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../models/User");


/*
* @route    GET api/users
* @desc     Get all users
* @access   Public
*/
router.get("/", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

/*
* @route    POST api/users
* @desc     Create a new user
* @access   Public
*/
router.post(
    "/",
    [
        check("name", "Name is required").not().isEmpty(),
        check("email", "Please include a valid email").isEmail(),
        check("password", "Please enter a password with 6 or more characters").isLength({ min: 6 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;

        try {
            let user = await User.findOne({ email });

            if (user) {
                return res.status(400).json({ errors: [{ msg: "User already exists" }] });
            }

            const avatar = gravatar.url(email, { s: "200", r: "pg", d: "mm" });

            user = new User({ name, email, avatar, password });

            const salt = await bcrypt.genSalt();
            user.password = await bcrypt.hash(password, salt);
            await user.save();

            const payload = {
                user: {
                    id: user.id
                }
            };

            jwt.sign(
                payload,
                config.get("JWT.secret"),
                { expiresIn: config.get("JWT.expiration") },
                (err, token) => {
                    if (err) {
                        throw err;
                    }

                    res.json({ token });
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server error");
        }
    });

module.exports = router;