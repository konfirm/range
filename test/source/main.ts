import * as test from 'tape';
import * as main from '../../source/main';
import { Range } from '../../source/Entity/Range';
import { RangeCollection } from '../../source/Entity/RangeCollection';

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
