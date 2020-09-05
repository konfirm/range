const test = require('tape');
const main = require('../../source/main.js');
const Range = require('../../source/Entity/Range.js');
const RangeCollection = require('../../source/Entity/RangeCollection.js');

test('main.js', (t) => {
	t.ok(typeof main === 'object', 'exports an object');

	t.test('Range', (t) => {
		t.ok('Range' in main, 'exports Range');
		t.ok(typeof main.Range === 'function', 'Range is a function');
		t.equal(main.Range, Range, 'main.Range is Entity/Range')

		t.end();
	});

	t.test('RangeCollection', (t) => {
		t.ok('RangeCollection' in main, 'exports Range');
		t.ok(typeof main.RangeCollection === 'function', 'RangeCollection is a function');
		t.equal(main.RangeCollection, RangeCollection, 'main.RangeCollection is Entity/RangeCollection')

		t.end();
	});

	t.end();
});
