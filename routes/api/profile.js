const express = require("express");
const router = express.Router();
const request = require("request");
const config = require("config");
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator");

/*
* @route    GET api/profile/me
* @desc     Get current user's profile
* @access   Public
*/
router.get("/me", auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate("user", ["name", "avatar"]);

        if (!profile) {
            return res.status(400).json({ errors: [{ msg: "There is no profile for this user" }] });
        }

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

/*
* @route    GET api/profile/
* @desc     Get all profiles
* @access   Public
*/
router.get("/", async (req, res) => {
    try {
        const profiles = await Profile.find().populate("user", ["name", "avatar"]);
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

/*
* @route    GET api/profile/user/:user_id
* @desc     Get a profile by user id
* @access   Public
*/
router.get("/user/:user_id", async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populated("user", ["name", "avatar"]);

        if (!profile) {
            return res.status(400).json({ msg: "Profile not found" });
        }

        res.json(profile);
    } catch (err) {
        console.error(err.message);

        if (err.kind === "ObjectId") {
            return res.status(400).json({ msg: "Profile not found" });
        }

        res.status(500).send("Server Error");
    }
});

/*
* @route    POST api/profile
* @desc     Create or update a user profile
* @access   Private
*/
router.post(
    "/",
    [
        auth,
        [
            check("status", "Status is required").not().isEmpty(),
            check("skills", "Skills is required").not().isEmpty(),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            youtube,
            twitter,
            facebook,
            linkedin,
            instagram,
            skills,
            ...rest
        } = req.body;
        const profileFields = { user: req.user.id, ...rest };

        if (skills) {
            profileFields.skills = skills.split(",").map(skill => skill.trim());
        }

        profileFields.social = {
            youtube: youtube,
            twitter: twitter,
            facebook: facebook,
            linkedin: linkedin,
            instagram: instagram,
        };

        try {
            let profile = await Profile.findOne({ user: req.user.id });

            if (profile) {
                // update existing profile
                profile = await Profile.findOneAndUpdate(
                    { user: req.user.id }, { $set: profileFields }, { new: true }
                );
            } else {
                // create a new profile
                profile = new Profile(profileFields);
                await profile.save();
            }

            res.json(profile);
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server Error");
        }
    }
);

/*
* @route    DELETE api/profile
* @desc     Delete profile, user, and posts
* @access   Private
*/
router.delete("/", auth, async (req, res) => {
    try {
        // remove the profile
        await Profile.findOneAndRemove({ user: req.user.id });

        // remove the user's posts

        // remove the user
        await User.findOneAndRemove({ _id: req.user.id });

        res.json({ msg: "User deleted" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

/*
* @route    PUT api/profile/experience
* @desc     Add profile experience
* @access   Private
*/
router.put(
    "/experience",
    [
        auth,
        [
            check("title", "Title is required").not().isEmpty(),
            check("company", "Company is required").not().isEmpty(),
            check("from", "From data is required").not().isEmpty(),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const profile = await Profile.findOne({ user: req.user.id });
            profile.experience.unshift({ ...req.body });
            await profile.save();
            res.json(profile);
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server Error");
        }
    }
);

/*
* @route    DELETE api/profile/experience/:experience_id
* @desc     Delete experience from profile
* @access   Private
*/
router.delete("/experience/:experience_id", auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        const indexToRemove = profile.experience.map(item => item.id).indexOf(req.params.experience_id);
        if (indexToRemove > -1) {
            // only remove the single experience
            profile.experience.splice(indexToRemove, 1);
            await profile.save();
            return res.json(profile);
        }

        res.status(400).json({ msg: "Experience not found" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

/*
* @route    PUT api/profile/education
* @desc     Add education to profile
* @access   Private
*/
router.put(
    "/education",
    [
        auth,
        [
            check("school", "School is required").not().isEmpty(),
            check("degree", "Degree is required").not().isEmpty(),
            check("fieldOfStudy", "Field of Study is required").not().isEmpty(),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const profile = await Profile.findOne({ user: req.user.id });
            profile.education.unshift({ ...req.body });
            await profile.save();
            res.json(profile);
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server Error");
        }
    }
);

/*
* @route    DELETE api/profile/education/:education_id
* @desc     Delete education from profile
* @access   Private
*/
router.delete("/education/:education_id", auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        const indexToRemove = profile.education.map(item => item.id).indexOf(req.params.education_id);
        if (indexToRemove > -1) {
            // only remove the single education element
            profile.education.splice(indexToRemove, 1);
            await profile.save();
            return res.json(profile);
        }

        res.status(400).json({ msg: "Education not found" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

/*
* @route    GET api/profile/github/:username
* @desc     Get user repos from Github
* @access   Public
*/
router.get("/github/:username", async (req, res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${
                req.params.username
                }/repos?per_page=5&sort=created:asc&client_id=${
                config.get("Github.id")
                }&client_secret=${config.get("Github.secret")}`,
            method: "GET",
            headers: { "user-agent": "nodejs" },
        };

        request(options, (error, response, body) => {
            if (error) {
                console.error(error);
            }

            if (response.statusCode !== 200) {
                return res.status(400).json({ msg: "No Github profile found" });
            }

            res.json(JSON.parse(body));
        })
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;