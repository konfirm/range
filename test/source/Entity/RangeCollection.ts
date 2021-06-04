import * as test from 'tape';
import each from 'template-literal-each';
import { RangeCollection } from '../../../source/Entity/RangeCollection';
import { Range } from '../../../source/Entity/Range';
const und = (() => { })();

test('RangeCollection', (t) => {
	t.test('new RangeCollection()', (t) => {
		const collection = new RangeCollection();

		t.ok(collection instanceof RangeCollection, 'is a RangeCollection');
		t.equal(collection.min, -Infinity, 'min is -Infinity');
		t.equal(collection.max, Infinity, 'max is Infinity');
		t.equal(collection.size, Infinity, 'size is Infinity');

		t.end();
	});

	t.test('new RangeCollection(new Range(0, 100), new Range(200, 300))', (t) => {
		const collection = new RangeCollection(new Range(0, 100), new Range(200, 300));

		t.equal(collection.min, 0, 'min is 0');
		t.equal(collection.max, 300, 'max is 300');
		t.equal(collection.size, 202, 'size is 202');

		each`
			seek               | verdict
			-------------------|---------
			-5                 | false
			0                  | true
			5                  | true
			50                 | true
			100                | true
			105                | false
			195                | false
			200                | true
			205                | true
			250                | true
			295                | true
			300                | true
			305                | false
			0, 50              | true
			0, 50, 150         | false
			0, 50, 100         | true
			0, 50, 100, 150    | false
			0, 50, 100, 200    | true
			0, 100, 200, 300   | true
			100, 150, 200, 300 | false
		`((record) => {
			const { seek, verdict } = record as { [key: string]: string };
			const contains = seek.split(/[, ]+/).map(Number);
			const bool = verdict === 'true';

			t.equal(collection.contains(...contains), bool, `contains ${seek}`);
		});

		t.end();
	});

	t.test('new RangeCollection(new Range(-100, -50), new Range(50, 100))', (t) => {
		const collection = new RangeCollection(new Range(-100, -50), new Range(50, 100));

		t.equal(collection.min, -100, 'min is -100');
		t.equal(collection.max, 100, 'max is 100');
		t.equal(collection.size, 102, 'size is 102');

		each`
			seek               | verdict
			-------------------|---------
			-200               | false
			-150               | false
			-105               | false
			-100               | true
			-50                | true
			-5                 | false
			0                  | false
			5                  | false
			50                 | true
			100                | true
			105                | false
			0, 50              | false
			0, 50, 150         | false
			-50, 50            | true
			-100, -50          | true
			100, 50            | true
			-100, 100          | true
			-50, 50            | true
			-100, -50, 50, 100 | true
		`((record) => {
			const { seek, verdict } = record as { [key: string]: string };
			const contains = seek.split(/[, ]+/).map(Number);
			const bool = verdict === 'true';

			t.equal(collection.contains(...contains), bool, `contains ${seek}`);
		});

		t.end();
	});

	t.test('methods', (t) => {
		const collection = new RangeCollection(
			new Range(-54321, -20000),
			new Range(-12345, 12345),
			new Range(20000, 54321)
		);

		t.test('toString', (t) => {
			each`
				join | separator | string
				-----|-----------|--------
				     |           | -54321..-20000,-12345..12345,20000..54321
				#    |           | -54321..-20000#-12345..12345#20000..54321
				     | /         | -54321/-20000,-12345/12345,20000/54321
				#    | /         | -54321/-20000#-12345/12345#20000/54321
				..   | ,         | -54321,-20000..-12345,12345..20000,54321
			`((record) => {
				const { join, separator, string } = record as { [key: string]: string };
				t.equal(collection.toString(separator, join), string, `toString(${join}, ${separator}) is "${string}"`);
			});

			t.end();
		});

		t.test('toHex', (t) => {
			each`
				length | join | separator | hex
				-------|------|-----------|--------
				       |      |           | -d431..-4e20,-3039..3039,4e20..d431
				       | #    |           | -d431..-4e20#-3039..3039#4e20..d431
				       |      | /         | -d431/-4e20,-3039/3039,4e20/d431
				       | #    | /         | -d431/-4e20#-3039/3039#4e20/d431
				       | ..   | ,         | -d431,-4e20..-3039,3039..4e20,d431
				0      |      |           | -d431..-4e20,-3039..3039,4e20..d431
				0      | #    |           | -d431..-4e20#-3039..3039#4e20..d431
				0      |      | /         | -d431/-4e20,-3039/3039,4e20/d431
				0      | #    | /         | -d431/-4e20#-3039/3039#4e20/d431
				0      | ..   | ,         | -d431,-4e20..-3039,3039..4e20,d431
				4      |      |           | -d431..-4e20,-3039..3039,4e20..d431
				4      | #    |           | -d431..-4e20#-3039..3039#4e20..d431
				4      |      | /         | -d431/-4e20,-3039/3039,4e20/d431
				4      | #    | /         | -d431/-4e20#-3039/3039#4e20/d431
				4      | ..   | ,         | -d431,-4e20..-3039,3039..4e20,d431
				5      |      |           | -0d431..-04e20,-03039..03039,04e20..0d431
				5      | #    |           | -0d431..-04e20#-03039..03039#04e20..0d431
				5      |      | /         | -0d431/-04e20,-03039/03039,04e20/0d431
				5      | #    | /         | -0d431/-04e20#-03039/03039#04e20/0d431
				5      | ..   | ,         | -0d431,-04e20..-03039,03039..04e20,0d431
				7      |      |           | -000d431..-0004e20,-0003039..0003039,0004e20..000d431
				7      | #    |           | -000d431..-0004e20#-0003039..0003039#0004e20..000d431
				7      |      | /         | -000d431/-0004e20,-0003039/0003039,0004e20/000d431
				7      | #    | /         | -000d431/-0004e20#-0003039/0003039#0004e20/000d431
				7      | ..   | ,         | -000d431,-0004e20..-0003039,0003039..0004e20,000d431
			`((record) => {
				const { length, join, separator, hex } = record as { [key: string]: string }
				const pad = (length && Number(length)) || undefined;

				t.equal(collection.toHex(pad, separator, join), hex, `toHex(${join}, ${separator}) is "${hex}"`);
			});

			t.end();
		});

		t.test('toJSON', (t) => {
			t.deepEqual(collection.toJSON(), [{ min: -54321, max: -20000 }, { min: -12345, max: 12345 }, { min: 20000, max: 54321 }]);
			t.equal(JSON.stringify(collection), '[{"min":-54321,"max":-20000},{"min":-12345,"max":12345},{"min":20000,"max":54321}]');

			t.end();
		});

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

	t.test('static', (t) => {
		const expectation = [0, 1, 2, 3, 4, 5, 10, 15, 20, 21, 22, 23, 24, 25];
		const min = Math.min(...expectation);
		const max = Math.max(...expectation);
		const { length: size } = expectation;

		t.test('from', (t) => {
			const collection = RangeCollection.from(
				new Range(0, 5),
				10,
				Range.fromHex('f'),
				Range.fromString('20..25')
			);

			t.ok(collection instanceof RangeCollection, 'is a RangeCollection');
			t.equal(collection.min, min, `min is ${min}`);
			t.equal(collection.max, max, `max is ${max}`);
			t.equal(collection.size, size, `size is ${size}`);

			t.deepEqual([...collection], expectation);

			t.end();
		});

		t.test('fromString', (t) => {
			each`
				input             | join   | separator
				------------------|--------|-----------
				0..5,10,15,20..25 |        |
				0..5$10$15$20..25 | $      |
				0/5$10$15$20/25   | $      | /
			`((record) => {
				const { input, join, separator } = record as { [key: string]: string };
				const collection = RangeCollection.fromString(input, separator, join);

				t.ok(collection instanceof RangeCollection, 'is a RangeCollection');
				t.equal(collection.min, min, `min is ${min}`);
				t.equal(collection.max, max, `max is ${max}`);
				t.equal(collection.size, size, `size is ${size}`);

				t.deepEqual([...collection], expectation);
			});

			t.end();
		});

		t.test('fromHex', (t) => {
			each`
				input           | join   | separator
				----------------|--------|-----------
				0..5,a,f,14..19 |        |
				0..5$a$f$14..19 | $      |
				0/5$a$f$14/19   | $      | /
			`((record) => {
				const { input, join, separator } = record as { [key: string]: string };
				const collection = RangeCollection.fromHex(input, separator, join);

				t.ok(collection instanceof RangeCollection, 'is a RangeCollection');
				t.equal(collection.min, min, `min is ${min}`);
				t.equal(collection.max, max, `max is ${max}`);
				t.equal(collection.size, size, `size is ${size}`);

				t.deepEqual([...collection], expectation);
			});

			t.end();
		});

		t.test('fromJSON', (t) => {
			const collection = RangeCollection.fromJSON('[{"min":0,"max":5},{"min":10},{"min":15},{"min":20,"max":25}]');

			t.ok(collection instanceof RangeCollection, 'is a RangeCollection');
			t.equal(collection.min, min, `min is ${min}`);
			t.equal(collection.max, max, `max is ${max}`);
			t.equal(collection.size, size, `size is ${size}`);

			t.deepEqual([...collection], expectation);

			t.end();
		});

		t.test('normalize', (t) => {
			each`
				count | string              | ranges
				------|---------------------|--------
				1     | 0..30               | ${[new Range(0, 10), new Range(20, 30), new Range(10, 20)]}
				2     | 0..20,25..30        | ${[new Range(0, 10), new Range(25, 30), new Range(10, 20)]}
				3     | 0..5,10..15,20..25  | ${[new Range(20, 25), new Range(0, 5), new Range(10, 15)]}
				1     | 0..30               | ${[new Range(0, 10), new Range(21, 30), new Range(11, 20)]}
				3     | 0..10,12..20,22..30 | ${[new Range(0, 10), new Range(22, 30), new Range(12, 20)]}
			`((record) => {
				const { ranges, string, count } = record as { ranges: Array<Range> } & { [key: string]: string };
				const normal = RangeCollection.normalize(ranges);
				const collection = RangeCollection.from(...normal);

				t.equal(normal.length, Number(count), `normalized to length ${count}`);
				t.equal(String(collection), string, `normalized string is ${string}`);
			});

			t.end();
		});

		t.end();
	});
});
