const express = require("express");
const router = express.Router();

// privacy policy
router.get("/privacy", (req, res) => {
    res.render("pages/privacy");
});

// terms
router.get("/terms", (req, res) => {
    res.render("pages/terms");
})

module.exports = router;