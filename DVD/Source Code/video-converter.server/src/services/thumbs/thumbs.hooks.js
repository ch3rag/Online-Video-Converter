const { authenticate } = require('@feathersjs/authentication').hooks;
const attachThumb = require('../../hooks/attachThumb');

module.exports = {
	before: {
		all: [authenticate('jwt')],
		find: [],
		get: [],
		create: [],
		update: [],
		patch: [],
		remove: [],
	},

	after: {
		all: [],
		find: [],
		get: [attachThumb],
		create: [],
		update: [],
		patch: [],
		remove: [],
	},

	error: {
		all: [],
		find: [],
		get: [],
		create: [],
		update: [],
		patch: [],
		remove: [],
	},
};
