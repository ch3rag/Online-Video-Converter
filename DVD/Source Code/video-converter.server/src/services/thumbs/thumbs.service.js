// Initializes the `thumbs` service on path `/thumbs`
const { Thumbs } = require('./thumbs.class');
const hooks = require('./thumbs.hooks');

// Changed Unnamed Funtion To Anonymous
module.exports = (app) => {
	const options = {
		paginate: app.get('paginate'),
	};

	// Initialize our service with any options it requires
	app.use('thumbs', new Thumbs(options, app));

	// Get our initialized service so that we can register hooks
	const service = app.service('thumbs');

	service.hooks(hooks);
};
