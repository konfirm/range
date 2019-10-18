/* global source, describe, it, each, expect */

const Range = source('Entity/Range');
const RangeCollection = source('Entity/RangeCollection');
const main = source('main');

describe('main.js', () => {
	it('provides Range', (next) => {
		expect(main).to.contain('Range');

		next();
	});

	it('provides RangeCollection', (next) => {
		expect(main).to.contain('RangeCollection');

		next();
	});
});
