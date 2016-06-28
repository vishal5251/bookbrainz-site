/*
 * Copyright (C) 2016  Max Prettyjohns
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

'use strict';

const AchievementType = require('bookbrainz-data').AchievementType;
const AchievementUnlock = require('bookbrainz-data').AchievementUnlock;
const Editor = require('bookbrainz-data').Editor;
const TitleType = require('bookbrainz-data').TitleType;
const TitleUnlock = require('bookbrainz-data').TitleUnlock;
const CreatorRevision = require('bookbrainz-data').CreatorRevision;
const EditionRevision = require('bookbrainz-data').EditionRevision;
const PublicationRevision = require('bookbrainz-data').PublicationRevision;
const PublisherRevision = require('bookbrainz-data').PublisherRevision;
const WorkRevision = require('bookbrainz-data').WorkRevision;

const Promise = require('bluebird');
const achievement = {};
const Bookshelf = require('bookbrainz-data').bookshelf;

const _ = require('lodash');

function awardAchievement(editorId, achievementId) {
	const achievementAttribs = {
		editorId,
		achievementId
	};
	return new AchievementUnlock(achievementAttribs)
	.fetch()
	.then((unlock) => {
		let awardPromise;
		if (unlock === null) {
			awardPromise = new AchievementUnlock(achievementAttribs)
				.save(null, {method: 'insert'});
		}
		else {
			awardPromise = Promise.resolve(unlock);
		}
		return awardPromise;
	});
}

achievement.awardAchievement = awardAchievement;

function awardTitle(editorId, titleId) {
	const titleAttribs = {
		editorId,
		titleId
	};
	return new TitleUnlock(titleAttribs)
		.fetch()
		.then((unlock) => {
			let awardPromise;
			if (unlock === null) {
				awardPromise = new TitleUnlock(titleAttribs)
					.save(null, {method: 'insert'});
			}
			else {
				awardPromise = Promise.resolve(unlock);
			}
			return awardPromise;
		});
}

achievement.awardTitle = awardTitle;

// tiers = [{threshold, name, (titleName)}] (optional)
function testTiers(signal, editorId, tiers) {
	const promiseList = _.compact(tiers.map((tier) => {
		let achievementTierPromise;
		if (signal > tier.threshold) {
			const promises = [];
			promises.push(
				new AchievementType({
					name: tier.name
				})
					.fetch({require: true})
					.then((achievement) =>
						awardAchievement(editorId, achievement.id))
			)
			if (tier.titleName) {
				promises.push(
					new TitleType({title: tier.titleName})
						.fetch({require: true})
						.then((title) =>
							awardTitle(editorId, title.id))
				);
			}
			achievementTierPromise = Promise.all(promises);
		}
		else {
			achievementTierPromise = null
		}
		return achievementTierPromise;
	}));

	return Promise.all(promiseList);
}

function getTypeRevisions(revisionType, revisionString, editor) {
	return revisionType
		.query(function(qb) {
			qb.innerJoin('bookbrainz.revision',
				'bookbrainz.revision.id',
				`bookbrainz.${revisionString}.id`);
			qb.groupBy(`${revisionString}.id`,
				`${revisionString}.bbid`,
				'revision.id');
			qb.where('bookbrainz.revision.author_id', '=', editor);
		})
		.fetchAll()
		.then((out) => {
			return out.length;
		})
}

function getTypeCreation(revisionType, revisionString, editor) {
	return revisionType
		.query(function(qb) {
			qb.innerJoin('bookbrainz.revision',
				'bookbrainz.revision.id',
				`bookbrainz.${revisionString}.id`);
			qb.groupBy(`${revisionString}.id`,
				`${revisionString}.bbid`,
				'revision.id');
			qb.where('bookbrainz.revision.author_id', '=', editor)
			qb.leftOuterJoin('bookbrainz.revision_parent',
				'bookbrainz.revision_parent.child_id',
				`bookbrainz.${revisionString}.id`)
			qb.whereNull('bookbrainz.revision_parent.parent_id');
		})
		.fetchAll()
		.then((out) => {
			return out.length;
		});
}

function processRevisionist(editorId) {
	return new Editor({id: editorId})
		.fetch()
		.then((editor) => {
			const revisions = editor.attributes.revisionsApplied;
			const tiers = [
				{threshold: 250, name: 'Revisionist III',
					titleName: 'Revisionist'},
				{threshold: 50, name: 'Revisionist II'},
				{threshold: 1, name: 'Revisionist I'}
			];
			return testTiers(revisions, editorId, tiers);
		});
}

function processCreatorCreator(editorId) {
	return getTypeCreation(new CreatorRevision(), 'creator_revision', editorId)
		.then((rowCount) => {
			const tiers = [
				{threshold: 25, name: 'Creator Creator III',
					titleName: 'Creator Creator'},
				{threshold: 10, name: 'Creator Creator II'},
				{threshold: 1, name: 'Creator Creator I'}
			];
			return testTiers(rowCount, editorId, tiers);
		});
}

function processLimitedEdition(editorId) {
	return getTypeCreation(new EditionRevision(), 'edition_revision', editorId)
		.then((rowCount) => {
			const tiers = [
				{threshold: 25, name: 'Limited Edition III',
					titleName: 'Limited Edition'},
				{threshold: 10, name: 'Limited Edition II'},
				{threshold: 1, name: 'Limited Edition I'}
			];
			return testTiers(rowCount, editorId, tiers);
		});
}

function processPublisher(editorId) {
	return getTypeCreation(new PublicationRevision(),
		'publication_revision',
		editorId)
		.then((rowCount) => {
			const tiers = [
				{threshold: 25, name: 'Publisher III',
					titleName: 'Publisher'},
				{threshold: 10, name: 'Publisher II'},
				{threshold: 1, name: 'Publisher I'}
			];
			return testTiers(rowCount, editorId, tiers);
		});
}

function processPublisherCreator(editorId) {
	return getTypeCreation(new PublisherRevision(),
		'publisher_revision',
		editorId)
		.then((rowCount) => {
			const tiers = [
				{threshold: 25, name: 'Publisher Creator III',
					titleName: 'Publisher Creator'},
				{threshold: 10, name: 'Publisher Creator II'},
				{threshold: 1, name: 'Publisher Creator I'}
			];
			return testTiers(rowCount, editorId, tiers);
		});
}

function processWorkerBee(editorId) {
	return getTypeCreation(new WorkRevision(),
		'work_revision',
		editorId)
		.then((rowCount) => {
			const tiers = [
				{threshold: 25, name: 'Worker Bee III',
					titleName: 'Worker Bee'},
				{threshold: 10, name: 'Worker Bee II'},
				{threshold: 1, name: 'Worker Bee I'}
			];
			return testTiers(rowCount, editorId, tiers);
		});
}

function processSprinter(editorId) {
	const rawSql =
		`SELECT * from bookbrainz.revision WHERE author_id=${editorId} \
		and created_at > (SELECT CURRENT_DATE - INTERVAL \'1 hour\');`;

	return Bookshelf.knex.raw(rawSql)
		.then((out) => {
			const tiers = [
				{threshold: 10, name: 'Sprinter', titleName: 'Sprinter'}
			];
			return testTiers(out.rowCount, editorId, tiers);
		});
}


function processFunRunner(editorId) {
	const rawSql =
		`SELECT DISTINCT created_at::date from bookbrainz.revision \
		WHERE author_id=${editorId} \
		and created_at > (SELECT CURRENT_DATE - INTERVAL \'6 days\');`;

	return Bookshelf.knex.raw(rawSql)
		.then((out) => {
			const tiers = [
				{threshold: 7, name: 'Fun Runner', titleName: 'Fun Runner'}
			];
			return testTiers(out.rowCount, editorId, tiers);
		});
}

function processMarathoner(editorId) {
	const rawSql =
		`SELECT DISTINCT created_at::date from bookbrainz.revision \
		WHERE author_id=${editorId} \
		and created_at > (SELECT CURRENT_DATE - INTERVAL \'29 days\');`;
	
	return Bookshelf.knex.raw(rawSql)
		.then((out) => {
			const tiers = [
				{threshold: 30, name: 'Marathoner', titleName: 'Marathoner'}
			];
			return testTiers(out.rowCount, editorId, tiers);
		});
}


achievement.processPageVisit = () => {

};

achievement.processEdit = (userid) =>
	Promise.all(
		processRevisionist(userid),
		processCreatorCreator(userid),
		processLimitedEdition(userid),
		processPublisher(userid),
		processPublisherCreator(userid),
		processWorkerBee(userid),
		processSprinter(userid),
		processFunRunner(userid),
		processMarathoner(userid)
	);


achievement.processComment = () => {

};

module.exports = achievement;
