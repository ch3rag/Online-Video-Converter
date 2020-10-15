// src/store/services/thumbs.js
import { makeServicePlugin, BaseModel } from '@/feathers-vuex';
import feathersClient from '@/feathers-client';

class Thumbs extends BaseModel {
	/* eslint-disable */
	constructor(data, options) {
		super(data, options)
	}

	/* eslint-enable */

	// Required for $FeathersVuex plugin to work after production transpile.
	static modelName = 'Thumbs';

	// Define default properties here
	static instanceDefaults() {
		return {};
	}
}

const servicePath = 'thumbs';
const servicePlugin = makeServicePlugin({
	Model: Thumbs,
	service: feathersClient.service(servicePath),
	servicePath,
});

// Setup the client-side Feathers hooks.
feathersClient.service(servicePath).hooks({
	before: {
		all: [],
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
		get: [],
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
});

export default servicePlugin;
