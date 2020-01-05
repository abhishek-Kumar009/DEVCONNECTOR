const express = require('express');
const router = express.Router();

// @router GET /api/posts
// desc: add an user

router.get('/', (req, res) => res.send('Posts route'));

module.exports = router;