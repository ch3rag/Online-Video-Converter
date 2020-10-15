const { authenticate } = require('@feathersjs/authentication').hooks;
const { hashPassword, protect } = require('@feathersjs/authentication-local').hooks;
const verifyHooks = require('feathers-authentication-management').hooks;

const {
	iff, isProvider, preventChanges, disallow,
} = require('feathers-hooks-common');

const { setField } = require('feathers-authentication-hooks');
const { Forbidden } = require('@feathersjs/errors');
const sendVerificationEmail = require('../../hooks/sendVerificationEmail');

// Retrict Reading To Only Record Belonging To The Querying User
const readRestrict = [
	setField({
		from: 'params.user._id',
		as: 'params.query._id',
	}),
];

module.exports = {
	before: {
		all: [],
		find: [
			authenticate('jwt'),
			...readRestrict,
		],
		get: [
			authenticate('jwt'),
			...readRestrict,
		],
		create: [
			hashPassword('password'),
			verifyHooks.addVerification(),
		],
		update: [
			authenticate('jwt'),
			disallow('external'),
		],
		patch: [
			authenticate('jwt'),
			...readRestrict,
			iff(isProvider('external'), preventChanges(
				true,
				'isVerified',
				'verifyToken',
				'verifyShortToken',
				'verifyExpires',
				'verifyChanges',
				'resetToken',
				'resetShortToken',
				'resetExpires',
			)),
		],
		remove: [
			authenticate('jwt'),
			disallow('external'),
		],
	},

	after: {
		all: [
			// Make sure the password field is never sent to the client
			// Always must be the last hook
			protect('password'),
		],
		find: [
			disallow('external'),
		],
		get: [
			verifyHooks.removeVerification(),
			iff(isProvider('external'), (context) => {
				if (!context.result.isVerified) {
					throw new Forbidden('User not verified.');
				}
				return context;
			}),
		],
		create: [
			sendVerificationEmail,
			verifyHooks.removeVerification(),
		],
		update: [],
		patch: [
			verifyHooks.removeVerification(),
		],
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
