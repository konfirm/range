import * as test from 'tape';
import each from 'template-literal-each';
import { Range } from '../../../source/Entity/Range';

type Keyed<T = unknown> = { [key: string]: T };

const und = (() => { })();

test('Range', (t) => {
	t.test('new Range()', (t) => {
		const range = new Range();

		t.ok(range instanceof Range, 'is a Range');

		t.equal(range.min, -Infinity, 'min is -Infinity');
		t.equal(range.max, Infinity, 'max is Infinity');
		t.equal(range.size, Infinity, 'size is Infinity');

		t.end();
	});

	t.test('new Range(1000, 9999)', (t) => {
		const range = new Range(1000, 9999);

		t.ok(range instanceof Range, 'is a Range');

		t.equal(range.min, 1000, 'min is 1000');
		t.equal(range.max, 9999, 'max is 9999');
		t.equal(range.size, 9000, 'size is 9000');

		t.end();
	});

	t.test('properties', (t) => {
		each`
			inmin        | inmax       | min          | max         | size        | string
			-------------|-------------|--------------|-------------|-------------|--------
			${-1000}     | ${1000}     | ${-1000}     | ${1000}     | ${2001}     | -1000..1000
			${1000}      | ${-1000}    | ${-1000}     | ${1000}     | ${2001}     | -1000..1000
			${-1.4}      | ${1.4}      | ${-1}        | ${1}        | ${3}        | -1..1
			${-2.5}      | ${2.5}      | ${-2}        | ${2}        | ${5}        | -2..2
			${-3.9}      | ${3.9}      | ${-3}        | ${3}        | ${7}        | -3..3
			${4.4}       | ${-4.4}     | ${-4}        | ${4}        | ${9}        | -4..4
			${5.5}       | ${-5.5}     | ${-5}        | ${5}        | ${11}       | -5..5
			${7.9}       | ${-7.9}     | ${-7}        | ${7}        | ${15}       | -7..7
			${10}        | ${100}      | ${10}        | ${100}      | ${91}       | 10..100
			${-10}       | ${-100}     | ${-100}      | ${-10}      | ${91}       | -100..-10
			${0}         | ${Infinity} | ${0}         | ${Infinity} | ${Infinity} | 0..INF
			${-Infinity} | ${0}        | ${-Infinity} | ${0}        | ${Infinity} | -INF..0
		`((record) => {
			const { inmin, inmax, min, max, size, string } = record as { string: string } & Keyed<number>;
			t.test(`new Range(${inmin}, ${inmax})`, (t) => {
				const range = new Range(inmin, inmax);

				t.equal(range.min, min, `min is ${min}`);
				t.equal(range.max, max, `max is ${min}`);
				t.equal(range.size, size, `size is ${size}`);

				t.equal(String(range), string, `String(range) is "${string}"`);

				t.end();
			});
		});

		t.end();
	});

	t.test('methods', (t) => {
		t.test('contains', (t) => {
			each`
				seek           | min     | max    | verdict
				---------------|---------|--------|---------
				${0}           | ${0}    | ${100} | true
				${10}          | ${0}    | ${100} | true
				${100}         | ${0}    | ${100} | true
				${1000}        | ${0}    | ${100} | false
				${-1000}       | ${0}    | ${100} | false
				${-101}        | ${-100} | ${100} | false
				${-100}        | ${-100} | ${100} | true
				${-10}         | ${-100} | ${100} | true
				${0}           | ${-100} | ${100} | true
				${10}          | ${-100} | ${100} | true
				${100}         | ${-100} | ${100} | true
				${101}         | ${-100} | ${100} | false
				${[-100, 100]} | ${-100} | ${100} | true
				${[-101, 100]} | ${-100} | ${100} | false
				${[-100, 101]} | ${-100} | ${100} | false
				${1.23}        | ${0}    | ${100} | false
			`((record) => {
				const { min, max, seek, verdict } = record as { verdict: string } & { [key: string]: number };
				t.test(`new Range(${min}, ${max}) contains ${seek} is ${verdict}`, (t) => {
					const range = new Range(min, max);
					const bool = verdict === 'true';
					const contains = ([] as Array<number>).concat(seek);

					t.equal(range.contains(...contains), bool, `contains ${seek} ${verdict}`);

					t.end();
				});
			});

			t.end();
		});

		t.test('toString', (t) => {
			t.test('new Range(-12345, 12345)', (t) => {
				const range = new Range(-12345, 12345);

				t.equal(typeof range.toString, 'function', 'toString is a function');
				t.equal(String(range), '-12345..12345', 'String(range) is "-12345..12345"');
				t.equal(range.toString(), '-12345..12345', 'range.toString() is "-12345..12345"');
				t.equal(range.toString('/'), '-12345/12345', 'range.toString("/") is "-12345/12345"');

				t.end()
			});

			t.test('new Range(12345)', (t) => {
				const range = new Range(12345);

				t.equal(String(range), '12345', 'String(range) is "12345"');
				t.equal(range.toString(), '12345', 'range.toString() is "12345"');
				t.equal(range.toString('/'), '12345', 'range.toString("/") is "12345"');

				t.end()
			});

			t.test('new Range()', (t) => {
				const range = new Range();

				t.equal(String(range), '-INF..INF', 'String(range) is "-INF..INF"');
				t.equal(range.toString(), '-INF..INF', 'range.toString() is "-INF..INF"');
				t.equal(range.toString('/'), '-INF/INF', 'range.toString("/") is "-INF/INF"');

				t.end()
			});

			t.end()
		});

		t.test('toHex', (t) => {
			t.test('new Range(-12345, 12345)', (t) => {
				const range = new Range(-12345, 12345);

				t.equal(typeof range.toHex, 'function', 'toHex is a function');
				t.equal(range.toHex(), '-3039..3039', 'range.toHex() is "-3039..3039"');
				t.equal(range.toHex(0), '-3039..3039', 'range.toHex(0) is "-3039..3039"');
				t.equal(range.toHex(1), '-3039..3039', 'range.toHex(1) is "-3039..3039"');
				t.equal(range.toHex(2), '-3039..3039', 'range.toHex(2) is "-3039..3039"');
				t.equal(range.toHex(3), '-3039..3039', 'range.toHex(3) is "-3039..3039"');
				t.equal(range.toHex(4), '-3039..3039', 'range.toHex(4) is "-3039..3039"');
				t.equal(range.toHex(5), '-03039..03039', 'range.toHex(5) is "-03039..03039"');
				t.equal(range.toHex(7), '-0003039..0003039', 'range.toHex(7) is "-0003039..0003039"');

				t.equal(range.toHex(0, '/'), '-3039/3039', 'range.toHex(0, "/") is "-3039/3039"');
				t.equal(range.toHex(1, '/'), '-3039/3039', 'range.toHex(1, "/") is "-3039/3039"');
				t.equal(range.toHex(2, '/'), '-3039/3039', 'range.toHex(2, "/") is "-3039/3039"');
				t.equal(range.toHex(3, '/'), '-3039/3039', 'range.toHex(3, "/") is "-3039/3039"');
				t.equal(range.toHex(4, '/'), '-3039/3039', 'range.toHex(4, "/") is "-3039/3039"');
				t.equal(range.toHex(5, '/'), '-03039/03039', 'range.toHex(5, "/") is "-03039/03039"');
				t.equal(range.toHex(7, '/'), '-0003039/0003039', 'range.toHex(7, "/") is "-0003039/0003039"');

				t.end();
			});

			t.test('new Range(-12345, 12345)', (t) => {
				const range = new Range(12345);

				t.equal(range.toHex(), '3039', 'range.toHex(), "3039"');
				t.equal(range.toHex(0), '3039', 'range.toHex(0), "3039"');
				t.equal(range.toHex(1), '3039', 'range.toHex(1), "3039"');
				t.equal(range.toHex(2), '3039', 'range.toHex(2), "3039"');
				t.equal(range.toHex(3), '3039', 'range.toHex(3), "3039"');
				t.equal(range.toHex(4), '3039', 'range.toHex(4), "3039"');
				t.equal(range.toHex(5), '03039', 'range.toHex(5), "03039"');
				t.equal(range.toHex(7), '0003039', 'range.toHex(7), "0003039"');

				t.equal(range.toHex(0, '/'), '3039', 'range.toHex(0, "/"), "3039"');
				t.equal(range.toHex(1, '/'), '3039', 'range.toHex(1, "/"), "3039"');
				t.equal(range.toHex(2, '/'), '3039', 'range.toHex(2, "/"), "3039"');
				t.equal(range.toHex(3, '/'), '3039', 'range.toHex(3, "/"), "3039"');
				t.equal(range.toHex(4, '/'), '3039', 'range.toHex(4, "/"), "3039"');
				t.equal(range.toHex(5, '/'), '03039', 'range.toHex(5, "/"), "03039"');
				t.equal(range.toHex(7, '/'), '0003039', 'range.toHex(7, "/"), "0003039"');

				t.end()
			});

			t.test('inifity', (t) => {
				const range = new Range();

				t.equal(range.toHex(), '-INF..INF', 'new Range().toHex() is "-INF..INF"');
				t.equal(range.toHex(0, '/'), '-INF/INF', 'new Range().toHex() is "-INF/INF"');

				t.equal(new Range(-Infinity, 1000).toHex(7),
					'-INF..00003e8', 'new Range(-Infinity, 1000).toHex() is "-INF..00003e8"'
				);
				t.equal(new Range(1000, Infinity).toHex(7),
					'00003e8..INF', 'new Range(-Infinity, 1000).toHex() is "00003e8..INF"'
				);

				t.end()
			});
		});

		t.test('toJSON', (t) => {
			t.test('new Range(-12345, 12345)', (t) => {
				const range = new Range(-12345, 12345);

				t.equal(typeof range.toJSON, 'function');
				t.deepEqual(range.toJSON(), { min: -12345, max: 12345 }, 'range.toJSON() is { min: -12345, max: 12345 }');
				t.deepEqual(JSON.stringify(range), '{"min":-12345,"max":12345}', 'JSON.stringify(range) is \{"min":-12345,"max":12345}\'');


				t.end()
			});
			t.test('new Range(12345)', (t) => {
				const range = new Range(12345);

				t.deepEqual(range.toJSON(), { min: 12345 }, 'range.toJSON() is { min: 12345 }');
				t.deepEqual(JSON.stringify(range), '{"min":12345}', 'JSON.stringify(range) is \'{"min":12345}\'');

				t.end()
			});

			t.test('new Range()', (t) => {
				t.deepEqual(new Range().toJSON(), { min: '-INF', max: 'INF' }, 'new Range().toJSON() is {min: "-INF",max: "INF"}');
				t.deepEqual(new Range(-Infinity, 1000).toJSON(), { min: '-INF', max: 1000 }, 'new Range(-Infinity, 1000).toJSON(), {min: "-INF",max: 1000}');
				t.deepEqual(new Range(1000, Infinity).toJSON(), { min: 1000, max: 'INF' }, 'new Range(1000, Infinity).toJSON(), {min: 1000,max: "INF"}');

				t.end()
			});
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

		// t.test('static methods', (t) => {
		t.test('fromString', (t) => {
			each`
				from       | min          | max         | size        | separator
				-----------|--------------|-------------|-------------|-----------
				1000..9999 | ${1000}      | ${9999}     | ${9000}     | ${und}
				1000/9999  | ${1000}      | ${9999}     | ${9000}     | ${'/'}
				-INF..INF  | ${-Infinity} | ${Infinity} | ${Infinity} | ${und}
				-INF*INF   | ${-Infinity} | ${Infinity} | ${Infinity} | ${'*'}
				-INF..100  | ${-Infinity} | ${100}      | ${Infinity} | ${und}
				-INF#100   | ${-Infinity} | ${100}      | ${Infinity} | ${'#'}
				100..INF   | ${100}       | ${Infinity} | ${Infinity} | ${und}
				100!INF    | ${100}       | ${Infinity} | ${Infinity} | ${'!'}
			`((record) => {
				const { from, min, max, size, separator } = record as { from: string, separator?: string } & { [key: string]: number };
				t.test(`${from} has min ${min}, max ${max} and size ${size}`, (t) => {
					const range = Range.fromString(from, separator);

					t.equal(range.min, min, `min is ${min}`);
					t.equal(range.max, max, `max is ${max}`);
					t.equal(range.size, size, `size is ${size}`);

					t.end();
				});
			});

			t.end();
		});

		t.test('fromHex', (t) => {
			each`
				from      | min          | max         | size        | separator
				----------|--------------|-------------|-------------|-----------
				3e8..270f | ${1000}      | ${9999}     | ${9000}     | ${und}
				3e8/270f  | ${1000}      | ${9999}     | ${9000}     | ${'/'}
				-INF..INF | ${-Infinity} | ${Infinity} | ${Infinity} | ${und}
				-INF*INF  | ${-Infinity} | ${Infinity} | ${Infinity} | ${'*'}
				-INF..100 | ${-Infinity} | ${256}      | ${Infinity} | ${und}
				-INF#100  | ${-Infinity} | ${256}      | ${Infinity} | ${'#'}
				100..INF  | ${256}       | ${Infinity} | ${Infinity} | ${und}
				100!INF   | ${256}       | ${Infinity} | ${Infinity} | ${'!'}
			`((record) => {
				const { from, min, max, size, separator } = record as { from: string, separator?: string } & { [key: string]: number };
				t.test(`${from} has min ${min}, max ${max} and size ${size}`, (t) => {
					const range = Range.fromHex(from, separator);

					t.equal(range.min, min, `min is ${min}`);
					t.equal(range.max, max, `max is ${max}`);
					t.equal(range.size, size, `size is ${size}`);

					t.end();
				});
			});

			t.end();
		});

		t.test('fromJSON', (t) => {
			each`
				from                         | min          | max         | size
				-----------------------------|--------------|-------------|------
				{"min":1000, "max":9999}     | ${1000}      | ${9999}     | ${9000}
				{"min":"-INF", "max": "INF"} | ${-Infinity} | ${Infinity} | ${Infinity}
				{"min": "-INF", "max": 100}  | ${-Infinity} | ${100}      | ${Infinity}
				{"min": 100, "max": "INF" }  | ${100}       | ${Infinity} | ${Infinity}
				{"min": 100 }                | ${100}       | ${100} | ${1}
				{"max": 100 }                | ${100}       | ${100} | ${1}
				{}                           | ${-Infinity} | ${Infinity} | ${Infinity}
			`((record) => {
				const { from, min, max, size } = record as { from: string } & { [key: string]: number };
				t.test(`${from} has min ${min}, max ${max} and size ${size}`, (t) => {
					const range = Range.fromJSON(from);

					t.equal(range.min, min, `min is ${min}`);
					t.equal(range.max, max, `max is ${max}`);
					t.equal(range.size, size, `size is ${size}`);

					t.end();
				});
			});

			t.end();
		});
	});
});
