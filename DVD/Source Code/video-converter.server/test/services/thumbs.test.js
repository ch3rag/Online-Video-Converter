/* eslint-disable no-undef */

const app = require('../../src/app');

describe('\'thumbs\' service', () => {
	it('registered the service', () => {
		const service = app.service('thumbs');
		expect(service).toBeTruthy();
	});
});
