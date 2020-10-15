const users = require('./users/users.service.js');
const uploads = require('./uploads/uploads.service.js');
const convert = require('./convert/convert.service.js');
const message = require('./message/message.service.js');
const authmanagement = require('./authmanagement/authmanagement.service.js');
const streams = require('./streams/streams.service.js');
const thumbs = require('./thumbs/thumbs.service.js');

// Changed Unnamed Funtion To Anonymous
// eslint-disable-next-line no-unused-vars
module.exports = (app) => {
	app.configure(users);
	app.configure(uploads);
	app.configure(convert);
	app.configure(message);
	app.configure(authmanagement);
	app.configure(streams);
	app.configure(thumbs);
};
