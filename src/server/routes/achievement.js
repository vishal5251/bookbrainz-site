'use strict';

const express = require('express');
const React = require('react');
const ReactDOMServer = require('react-dom/server');

const AchievementForm = React.createFactory(
	require('../../client/components/forms/achievementAdmin.jsx')
);

const router = express.Router();

router.get('/admin', (req, res) => {
	const markup = ReactDOMServer.renderToString(AchievementForm({}));
	res.render('achievement', {
		markup
	})
});

module.exports = router;
