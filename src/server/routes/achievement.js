'use strict';

const express = require('express');

const router = express.Router();

router.get('/admin', (req, res) => {
	const markup = {};
	res.render('achievement', {})
});

module.exports = router;
