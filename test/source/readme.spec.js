const test = require('tape');
const main = require('../../source/main.js');
const Range = require('../../source/Entity/Range.js');
const RangeCollection = require('../../source/Entity/RangeCollection.js');

test('README', (t) => {
	t.test('Usage', (t) => {
		t.equal(main.Range, Range, 'Range is exported');
		t.equal(main.RangeCollection, RangeCollection, 'RangeCollection is exported');

		t.test('Range', (t) => {
			t.test('new Range(0, 10)', (t) => {
				const range = new Range(0, 10);

				t.ok(range.contains(0), 'range contains 0');
				t.ok(range.contains(10), 'range contains 10');
				t.notOk(range.contains(11), 'range does not contain 11');

				t.end();
			});

			t.test('new Range(0, 2, 3, 7, 8, 10)', (t) => {
				const range = new Range(0, 2, 3, 7, 8, 10);

				t.ok(range.contains(0), 'range contains 0');
				t.ok(range.contains(10), 'range contains 10');
				t.notOk(range.contains(11), 'range does not contain 11');

				t.end();
			});

			t.test('new Range(10)', (t) => {
				const range = new Range(10);

				t.notOk(range.contains(0), 'range does not contain 0');
				t.ok(range.contains(10), 'range contains 10');
				t.notOk(range.contains(11), 'range does not contain 11');

				t.end();
			});

			t.test('new Range()', (t) => {
				const range = new Range();

				t.ok(range.contains(-Infinity), 'range contains -Infinity');
				t.ok(range.contains(Infinity), 'range contains Infinity');

				t.end();
			});

			t.test('Properties', (t) => {
				const range = new Range(100, 199);

				t.equal(range.min, 100, 'min equals 100');
				t.equal(range.max, 199, 'max equals 199');
				t.equal(range.size, 100, 'size equals 100');

				t.end();
			});

			t.test('contains', (t) => {
				const range = new Range(100, 199);

				t.ok(range.contains(100), 'range contains 100');
				t.ok(range.contains(150), 'range contains 150');
				t.notOk(range.contains(200), 'range does not contain 200');

				t.ok(range.contains(100, 150), 'range contains 100, 150');
				t.notOk(range.contains(100, 200), 'range does not contain 100, 200');

				t.end();
			});

			t.test('toString', (t) => {
				const range = new Range(100, 199);

				t.equal(String(range), '100..199', 'String(range) is "100..199"');
				t.equal(range.toString(), '100..199', 'range.toString() is "100..199"');
				t.equal('range:' + range, 'range:100..199', '"range:"+range is "range:100..199"');
				t.equal(`range:${range}`, 'range:100..199', '"range:"+range is "range:100..199"');

				t.equal(range.toString('/'), '100/199', 'range.toString("/") is "100/199"');

				t.end();
			});

			t.test('toHex', (t) => {
				const range = new Range(100, 199);

				t.equal(range.toHex(), '64..c7', 'range.toHex() is "64..c7"');
				t.equal(range.toHex(4), '0064..00c7', 'range.toHex(4) is "0064..00c7"');
				t.equal(range.toHex(7), '0000064..00000c7', 'range.toHex(7) is "0000064..00000c7"');

				t.equal(range.toHex(0, '/'), '64/c7', 'range.toHex(0, "/") is "64/c7"');
				t.equal(range.toHex(4, '/'), '0064/00c7', 'range.toHex(4, "/") is "0064/00c7"');
				t.equal(range.toHex(7, '/'), '0000064/00000c7', 'range.toHex(7, "/") is "0000064/00000c7"');

				t.end();
			});

			t.test('toJSON', (t) => {
				const range = new Range(100, 199);

				t.deepEqual(range.toJSON(), { min: 100, max: 199 }, 'range.toJSON() is { min: 100, max: 199 }');
				t.deepEqual(new Range(100).toJSON(), { min: 100 }, 'new Range(100).toJSON() is { min: 100 }');

				t.end();
			});

			t.test('[Symbol.iterator]', (t) => {
				const range = new Range(0, 5);
				let index = 0;

				for (const value of range) {
					t.equal(value, index, `for..of index ${index} equals ${value}`);
					++index;
				}

				t.deepEqual([...range], [0, 1, 2, 3, 4, 5], 'expanded equal [0,1,2,3,4,5]');

				t.throws(() => [...new Range()], /^Error: Range is infinite/, 'Prevents iteration over infinite range');

				t.end();
			});

			t.test('Range.fromString("123..789")', (t) => {
				const range = Range.fromString('123..789');

				t.equal(range.min, 123, 'min is 123');
				t.equal(range.max, 789, 'max is 789');
				t.equal(range.size, 667, 'size is 667');

				t.end();
			});

			t.test('Range.fromString("123/789", "/")', (t) => {
				const range = Range.fromString('123/789', '/');

				t.equal(range.min, 123, 'min is 123');
				t.equal(range.max, 789, 'max is 789');
				t.equal(range.size, 667, 'size is 667');

				t.end();
			});

			t.test('Range.fromHex("7b..315")', (t) => {
				const range = Range.fromHex('7b..315');

				t.equal(range.min, 123, 'min is 123');
				t.equal(range.max, 789, 'max is 789');
				t.equal(range.size, 667, 'size is 667');

				t.end();
			});

			t.test('Range.fromHex("7b/315", "/")', (t) => {
				const range = Range.fromHex('7b/315', '/');

				t.equal(range.min, 123, 'min is 123');
				t.equal(range.max, 789, 'max is 789');
				t.equal(range.size, 667, 'size is 667');

				t.end();
			});

			t.test('Range.fromJSON("{min:123,max:789}")', (t) => {
				const range = Range.fromJSON('{ "min": 123, "max": 789 }');

				t.equal(range.min, 123, 'min is 123');
				t.equal(range.max, 789, 'max is 789');
				t.equal(range.size, 667, 'size is 667');

				t.end();
			});

			t.end();
		});

		t.test('RangeCollection', (t) => {
			t.test('new RangeCollection', (t) => {
				const collection = new RangeCollection(
					new Range(0, 3),
					new Range(7, 10)
				);

				t.ok(collection.contains(0), 'collection contains 0');
				t.ok(collection.contains(3), 'collection contains 3');
				t.ok(collection.contains(7), 'collection contains 7');
				t.ok(collection.contains(10), 'collection contains 10');

				t.notOk(collection.contains(4), 'collection does not contain 4');
				t.notOk(collection.contains(11), 'collection does not contain 11');

				t.end();
			});

			t.test('properties', (t) => {
				const collection = new RangeCollection(
					new Range(100, 110),
					new Range(200, 210)
				);

				t.equal(collection.min, 100, 'min equals 100');
				t.equal(collection.max, 210, 'max equals 210');
				t.equal(collection.size, 22, 'size equals 22');

				t.end();
			});

			t.test('contains', (t) => {
				const collection = new RangeCollection(
					new Range(100, 110),
					new Range(200, 210)
				);

				t.ok(collection.contains(100), 'collection contains 100');
				t.ok(collection.contains(200), 'collection contains 200');
				t.ok(collection.contains(100, 200), 'collection contains 100, 200');

				t.notOk(collection.contains(150), 'collection does not contain 150');
				t.notOk(collection.contains(100, 150), 'collection does not contain 100, 150');

				t.end();
			});

			t.test('toString', (t) => {
				const collection = new RangeCollection(
					new Range(100, 110),
					new Range(200, 210)
				);

				t.equal(
					collection.toString(),
					'100..110,200..210',
					'collection.toString() is "100..110,200..210"'
				);
				t.equal(
					String(collection),
					'100..110,200..210',
					'String(collection) is "100..110,200..210"'
				);
				t.equal(
					collection.toString('/'),
					'100/110,200/210',
					'collection.toString() is "100/110,200/210"'
				);
				t.equal(
					collection.toString('..', '/'),
					'100..110/200..210',
					'collection.toString() is "100..110/200..210"'
				);
				t.equal(
					collection.toString(':', '/'),
					'100:110/200:210',
					'collection.toString() is "100:110/200:210"'
				);

				t.end();
			});

			t.test('toHex', (t) => {
				const collection = new RangeCollection(
					new Range(100, 110),
					new Range(200, 210)
				);

				t.equal(
					collection.toHex(),
					'64..6e,c8..d2',
					'collection.toHex() is "64..6e,c8..d2"'
				);
				t.equal(
					collection.toHex(4),
					'0064..006e,00c8..00d2',
					'collection.toHex() is "0064..006e,00c8..00d2"'
				);
				t.equal(
					collection.toHex(0, ':'),
					'64:6e,c8:d2',
					'collection.toHex() is "64:6e,c8:d2"'
				);
				t.equal(
					collection.toHex(4, ':'),
					'0064:006e,00c8:00d2',
					'collection.toHex() is "0064:006e,00c8:00d2"'
				);
				t.equal(
					collection.toHex(0, ':', '/'),
					'64:6e/c8:d2',
					'collection.toHex() is "64:6e/c8:d2"'
				);
				t.equal(
					collection.toHex(4, ':', '/'),
					'0064:006e/00c8:00d2',
					'collection.toHex() is "0064:006e/00c8:00d2"'
				);

				t.end();
			});

			t.test('toJSON', (t) => {
				const collection = new RangeCollection(
					new Range(100, 110),
					new Range(200, 210)
				);

				t.deepEqual(collection.toJSON(), [{ min: 100, max: 110 }, { min: 200, max: 210 }]);
				t.equal(JSON.stringify(collection), '[{"min":100,"max":110},{"min":200,"max":210}]');

				t.end();
			});

			t.test('[Symbol.iterator]', (t) => {
				const collection = new RangeCollection(
					new Range(0, 3),
					new Range(7, 10)
				);
				const expectation = [0, 1, 2, 3, 7, 8, 9, 10];
				let index = 0;

				for (const value of collection) {
					t.equal(value, expectation[index], `for..of index ${index} equals ${value}`);
					++index;
				}

				t.deepEqual([...collection], expectation, 'expanded equal [0,1,2,3,7,8,9,10]');

				t.throws(() => [...new RangeCollection()], /^Error: RangeCollection is infinite/, 'Prevents iteration over infinite range');

				t.end();
			});

			t.test('from', (t) => {
				const collection = RangeCollection.from(
					new Range(123, 345),
					400,
					500,
					new Range(789, 890)
				);

				t.equal(collection.min, 123, 'min equals 123');
				t.equal(collection.max, 890, 'max equals 890');
				t.equal(collection.size, 327, 'size equals 327');

				t.end();
			});

			t.test('Range.fromString("123..345,400,500,789..890")', (t) => {
				const collection = RangeCollection.fromString('123..345,400,500,789..890');

				t.equal(collection.min, 123, 'min equals 123');
				t.equal(collection.max, 890, 'max equals 890');
				t.equal(collection.size, 327, 'size equals 327');

				t.end();
			});

			t.test('Range.fromString("123:345,400,500,789:890", ":")', (t) => {
				const collection = RangeCollection.fromString('123:345,400,500,789:890', ':');

				t.equal(collection.min, 123, 'min equals 123');
				t.equal(collection.max, 890, 'max equals 890');
				t.equal(collection.size, 327, 'size equals 327');

				t.end();
			});

			t.test('Range.fromString("123:345/400/500/789:890", ":")', (t) => {
				const collection = RangeCollection.fromString('123:345/400/500/789:890', ':', '/');

				t.equal(collection.min, 123, 'min equals 123');
				t.equal(collection.max, 890, 'max equals 890');
				t.equal(collection.size, 327, 'size equals 327');

				t.end();
			});

			t.test('Range.fromHex("7b..159,190,1f4,315..37a")', (t) => {
				const collection = RangeCollection.fromHex('7b..159,190,1f4,315..37a');

				t.equal(collection.min, 123, 'min equals 123');
				t.equal(collection.max, 890, 'max equals 890');
				t.equal(collection.size, 327, 'size equals 327');

				t.end();
			});

			t.test('Range.fromHex("7b:159,190,1f4,315:37a", ":")', (t) => {
				const collection = RangeCollection.fromHex('7b:159,190,1f4,315:37a', ':');

				t.equal(collection.min, 123, 'min equals 123');
				t.equal(collection.max, 890, 'max equals 890');
				t.equal(collection.size, 327, 'size equals 327');

				t.end();
			});

			t.test('Range.fromHex("7b:159,190,1f4,315:37a", ":", "/")', (t) => {
				const collection = RangeCollection.fromHex('7b:159/190/1f4/315:37a', ':', '/');

				t.equal(collection.min, 123, 'min equals 123');
				t.equal(collection.max, 890, 'max equals 890');
				t.equal(collection.size, 327, 'size equals 327');

				t.end();
			});

			t.test('Range.fromJSON(\'[{"min":123,"max":345},{"min":400},{"min":500},{"min":789,"max":890}]\')', (t) => {
				const collection = RangeCollection.fromJSON('[{"min":123,"max":345},{"min":400},{"min":500},{"min":789,"max":890}]');

				t.equal(collection.min, 123, 'min equals 123');
				t.equal(collection.max, 890, 'max equals 890');
				t.equal(collection.size, 327, 'size equals 327');

				t.end();
			});

			t.end();
		});

		t.end();
	});
});
