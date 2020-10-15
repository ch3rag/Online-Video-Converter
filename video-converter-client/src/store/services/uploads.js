// src/store/services/uploads.js
import { makeServicePlugin, BaseModel } from '@/feathers-vuex';
import feathersClient from '@/feathers-client';

class Uploads extends BaseModel {
	/* eslint-disable */
	constructor(data, options) {
		super(data, options)
	}

	/* eslint-enable */

	// Required for $FeathersVuex plugin to work after production transpile.
	static modelName = 'Uploads';

	// Define default properties here
	static instanceDefaults() {
		return {
			description: '',
			originalName: '',
			newNameWithPath: '',
			format: '',
			videoBitrate: 0,
			audioBitrate: 0,
			resolution: '',
			duration: 0,
			fps: 0,
			fileSize: 0,
			thumbnail: '',
		};
	}
}

const servicePath = 'uploads';
const servicePlugin = makeServicePlugin({
	Model: Uploads,
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
