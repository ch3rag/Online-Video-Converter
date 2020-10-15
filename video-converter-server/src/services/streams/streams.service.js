// Initializes the `streams` service on path `/streams`
const fs = require('fs');
const mime = require('mime-types');
const hooks = require('./streams.hooks');
const logger = require('../../logger');

module.exports = (app) => {
	// Initialize our service with any options it requires
	// eslint-disable-next-line
	app.use('/streams', async (req, res, next) => {
		const { method } = req;
		if (method === 'GET') {
			// eslint-disable-next-line
			await app.service('uploads').get(req.url.substr(1, req.url.length - 1))
				.then((result) => {
					let path;
					if (result.format !== 'mp4') {
						path = result.streamPath;
					} else {
						path = result.newNameWithPath;
					}
					const stat = fs.statSync(path);
					const fileSize = stat.size;
					const { range } = req.headers;
					if (range) {
						const parts = range.replace(/bytes=/, '').split('-');
						const start = parseInt(parts[0], 10);
						const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
						const chunkSize = (end - start) + 1;
						const file = fs.createReadStream(path, { start, end });
						const head = {
							'Content-Range': `bytes ${start}-${end}/${fileSize}`,
							'Accept-Ranges': 'bytes',
							'Content-Length': chunkSize,
							'Content-Type': mime.lookup(result.newNameWithPath),
						};
						res.writeHead(206, head);
						file.pipe(res);
					} else {
						const head = {
							'Content-Length': fileSize,
							'Content-Type': mime.lookup(result.newNameWithPath),
						};
						res.writeHead(200, head);
						fs.createReadStream(path).pipe(res);
					}
				})
				.catch((err) => {
					logger.error(err);
				});
		}
	});

	// Get our initialized service so that we can register hooks
	// const service = app.service('streams');

	// service.hooks(hooks);
};
