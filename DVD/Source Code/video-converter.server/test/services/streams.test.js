/* eslint-disable no-undef */

const app = require('../../src/app');

describe('\'streams\' service', () => {
	it('registered the service', () => {
		const service = app.service('streams');
		expect(service).toBeTruthy();
	});
});
