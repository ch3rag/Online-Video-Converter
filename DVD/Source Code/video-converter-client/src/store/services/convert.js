// src/store/services/convert.js
import { makeServicePlugin, BaseModel } from '@/feathers-vuex';
import feathersClient from '@/feathers-client';

class Convert extends BaseModel {
	/* eslint-disable */
	constructor(data, options) {
		super(data, options)
	}

	/* eslint-enable */

	// Required for $FeathersVuex plugin to work after production transpile.
	static modelName = 'Convert';

	// Define default properties here
	static instanceDefaults() {
		return {
			name: '',
			format: '',
			width: 0,
			height: 0,
			originalVideoId: '',
			type: '',
			isAudioDisabled: false,
			frameRate: 0,
			durationStart: 0,
			durationEnd: 0,
			audioBitrate: 0,
			videoBitrate: 0,
		};
	}
}

const servicePath = 'convert';
const servicePlugin = makeServicePlugin({
	Model: Convert,
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
