'use strict';

const Promise = require('bluebird');

const express = require('express');
const React = require('react');
const ReactDOMServer = require('react-dom/server');

const handler = require('../helpers/handler');
const Achievement = require('../helpers/achievement');

const AchievementForm = React.createFactory(
	require('../../client/components/forms/achievementAdmin.jsx')
);

const Editor = require('bookbrainz-data').Editor;
const AchievementType = require('bookbrainz-data').AchievementType;
const TitleType = require('bookbrainz-data').TitleType;

const router = express.Router();

router.get('/admin', (req, res) => {
	const EditorJSONPromise = new Editor()
		.orderBy('name')
		.fetchAll()
		.then((editors) => {
			return editors.map((editor) => {
				const editorJSON = editor.toJSON();
				return {
					id: editorJSON.id,
					name: editorJSON.name
				}
			});
		});

	const AchievementJSONPromise = new AchievementType()
		.orderBy('name')
		.fetchAll()
		.then((achievements) => {
			const achievementList = achievements.toJSON();
			achievementList.unshift({id: 'none', name: 'No Achievement'});
			console.log(achievementList);
			return achievementList;
		});

	const TitleJSONPromise = new TitleType()
		.orderBy('title')
		.fetchAll()
		.then((titles) => {
			const titleList = titles.toJSON();
			titleList.unshift({id: 'none', title: 'No Title'});
			return titleList;
		});

	Promise.join(EditorJSONPromise,
		AchievementJSONPromise,
		TitleJSONPromise,
		(editorJSON, achievementJSON, titleJSON) => {
			const props = {
				editor: editorJSON,
				achievement: achievementJSON,
				title: titleJSON
			}
			const markup = ReactDOMServer.renderToString(
				AchievementForm(props)
			);
			res.render('achievement', {
				props,
				markup
			});
		})
});

// XXX: need to authenticate admins once it is implemented
router.post('/admin/handler', (req, res) => {
	let achievement;
	let title;
	if (req.body.editor !== 'none') {
		const editorId = parseInt(req.body.editor, 10);
		if (req.body.achievement !== 'none') {
			const achievementId = parseInt(req.body.achievement, 10);
			achievement = Achievement.awardAchievement(editorId, achievementId)
				.then((unlock) => {
					let unlockJSON;
					if (unlock !== null) {
						unlockJSON = unlock.toJSON();
					}
					else {
						unlockJSON = {};
					}
					return unlockJSON;
				});
		}
		if (req.body.title !== 'none') {
			const titleId = parseInt(req.body.title, 10);
			title = Achievement.awardTitle(editorId, titleId)
				.then((unlock) => {
					let unlockJSON;
					if (unlock !== null) {
						unlockJSON = unlock.toJSON();
					}
					else {
						unlockJSON = {};
					}
					return unlockJSON;
				});
		}
	}
	const unlocks = Promise.join(
		achievement,
		title,
		(achievementJSON, titleJSON) => {
			const unlockJSON = {};
			unlockJSON.achievement = achievementJSON;
			unlockJSON.title = titleJSON;
			return unlockJSON;
		});
	handler.sendPromiseResult(res, unlocks);
});

module.exports = router;
