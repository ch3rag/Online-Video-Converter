import feathersVuex from 'feathers-vuex';
import feathersClient from './feathers-client';

const {
	makeServicePlugin,
	makeAuthPlugin,
	BaseModel,
	models,
	FeathersVuex,
} = feathersVuex(
	feathersClient,
	{
		serverAlias: 'api',
		idField: '_id',
		whitelist: ['$regex', '$options'],
	},
);

export {
	makeAuthPlugin,
	makeServicePlugin,
	BaseModel,
	models,
	FeathersVuex,
};
