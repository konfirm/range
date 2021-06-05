# Range

Define and work with number (integer) ranges easily. Instead of requiring the full ranges in memory it allows for easy checks on containment, size and can turn ranges (or collections of ranges) into short string notations.

## Installation

Range is a scoped package, the scope needs to be provided for both the installation and usage

```
$ npm install --save @konfirm/range
```

# Usage

The range package consists of two exported classes; `Range` and `RangeCollection`. A `Range` is created with zero or more numeric arguments, from which the minimum and maximum values are used to determine the full range. A `RangeCollection` is a wrapper for multiple `Range` instances providing the same API as `Range` so it can be used in the same places.

```js
const { Range, RangeCollection } = require('@konfirm/range');
const small = new Range(0, 100);
const large = new Range(10000, 99999);
const combi = new RangeCollection(small, large);

small.contains(50); //  true
large.contains(50); //  false
combi.contains(50); //  true

small.contains(500); //  false
large.contains(500); //  false
combi.contains(500); //  false

small.contains(12345); //  false
large.contains(12345); //  true
combi.contains(12345); //  true
```

## Range

A Range is the full sequence of integer values between the given minimum and maximum.

### `Inifity`

As `Infinity` is a recognized valid value (despite it not being an integer number) and it is not well represented in the JSON format, it will always be represented by the string `'INF'`. This is true for all of the string(able) formatters (`toString`, `toHex` and `toJSON`) as well as the Range creator methods (`fromString`, `fromHex` and `fromJSON`).

### `new Range(...<Number|String> mumeric values)`

Construct new Range instances by providing zero or more numeric values, the values will be processed using `parseInt(<value>, 10)` (ensuring decimal integers) and will contain every integer value from the minimum value up to and including the maximum value.

```js
const { Range } = require('@konfirm/range');
const range = new Range(0, 10);

range.contains(0); // true
range.contains(10); // true
range.contains(11); // false
```

If more than two values are provided, Range will use only the lowest and highest values, ignoring everything in between.

```js
const { Range } = require('@konfirm/range');
const range = new Range(0, 2, 3, 7, 8, 10);

range.contains(0); // true
range.contains(10); // true
range.contains(11); // false
```

If a single value is provided, the full range consists of that value

```js
const { Range } = require('@konfirm/range');
const range = new Range(10);

range.contains(9); // false
range.contains(10); // true
range.contains(11); // false
```

If no values are provided, the Range will be from `-Infinity` to `Infinity`, basically containing every possible integer value. _Be very careful not to use an iterator on it, as that will try to generate an infite number of values, which means a never ending loop._

```js
const { Range } = require('@konfirm/range');
const range = new Range();

range.contains(-Infinity); // true
range.contains(Infinity); // true
```

### properties

A Range has various properties indication the `min`, `max` values and the `size`.

| property | type             | description                                   |
| -------- | ---------------- | --------------------------------------------- |
| `min`    | Number (integer) | the lowest value (lower limit) of the Range   |
| `max`    | Number (integer) | the highest value (upper limit) of the Range  |
| `size`   | Number (integer) | the number of values represented by the Range |

```js
const { Range } = require('@konfirm/range');
const range = new Range(100, 199);

range.min; //  100
range.max; //  199
range.size; //  100
```

### contains

Verify whether one or more values are within the Range min and max values (inclusive).

| argument    | type     | default | description                                                       |
| ----------- | -------- | ------- | ----------------------------------------------------------------- |
| `...values` | `Number` |         | Zero or more number values to verify the containment in the Range |

```js
const { Range } = require('@konfirm/range');
const range = new Range(100, 199);

range.contains(100); //  true
range.contains(150); //  true
range.contains(200); //  false

range.contains(100, 150); //  true
range.contains(100, 200); //  false
```

### toString

Casts a Range instance into its string representation. The separator can be specified, the default is `'..'` (double full-stop).

| argument    | type     | default | description                                              |
| ----------- | -------- | ------- | -------------------------------------------------------- |
| `separator` | `String` | `'..'`  | The separator between the Ranges' `min` and `max` values |

```js
const { Range } = require('@konfirm/range');
const range = new Range(100, 199);

range.toString(); // '100..199'
String(range); // '100..199'
'range:' + range; // 'range:100..199'
`range:${range}`; // 'range:100..199'
```

Or with a different separator (note that specifying arguments only works when called manually)

```js
const { Range } = require('@konfirm/range');
const range = new Range(100, 199);

range.toString('/'); // '100/199'
```

### toHex

Like toString, but using a hexadecimal representation for the numbers. Optinally the length of the hexadecimal number and the separator can be specified.

| argument    | type     | default | description                                              |
| ----------- | -------- | ------- | -------------------------------------------------------- |
| `length`    | `Number` | `0`     | The minimum hexadecimal string length                    |
| `separator` | `String` | `'..'`  | The separator between the Ranges' `min` and `max` values |

Specifying the length of the hexadecimal representation does not take the minus (`-`) into consideration, nor does it pad the `INF` symbol which represents `Infinity`.

```js
const { Range } = require('@konfirm/range');
const range = new Range(100, 199);

range.toHex(); // '64..c7'
```

Or with a different length

```js
const { Range } = require('@konfirm/range');
const range = new Range(100, 199);

range.toHex(4); // '0064..00c7'
range.toHex(7); // '0000064..00000c7'
```

Or with a different separator

```js
const { Range } = require('@konfirm/range');
const range = new Range(100, 199);

range.toHex(0, '/'); // '64/c7'
range.toHex(4, '/'); // '0064/00c7'
range.toHex(7, '/'); // '00000064/00000c7'
```

### toJSON

Represent the Range in a JSON-able format.

```js
const { Range } = require('@konfirm/range');
const range = new Range(100, 199);

range.toJSON(); // {min:100,max:199}
JSON.stringify(range); // '{"min":100,"max":199}'
```

If the Range consists of a single value, only `min` will be specified

```js
const { Range } = require('@konfirm/range');
const range = new Range(100);

range.toJSON(); // {min:100}
JSON.stringify(range); // '{"min":100}'
```

### iterator

Range implements the [`Symbol.iterator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/iterator) method as generator, allowing it to be used in a `for..of` loop and for Array destructing

```js
const { Range } = require('@konfirm/range');
const range = new Range(0, 5);

for (const value of range) {
	console.log(value);
}
// expected output: 0
// expected output: 1
// expected output: 2
// expected output: 3
// expected output: 4
// expected output: 5

const array = [...range]; // [0, 1, 2, 3, 4, 5]
```

### Range.fromString

Create a Range instance from a string representation with decimal value format (e.g. created with the `toString` method)

| argument    | type     | default | description                                                     |
| ----------- | -------- | ------- | --------------------------------------------------------------- |
| `range`     | `String` |         | The string representing the Range with decimal formatted values |
| `separator` | `String` | `'..'`  | The separator between the Ranges' `min` and `max` values        |

```js
const { Range } = require('@konfirm/range');
const range = Range.fromString('123..789');

range.min; //  123
range.max; //  789
range.size; //  667
```

Using a separator

```js
const { Range } = require('@konfirm/range');
const range = Range.fromString('123/789', '/');

range.min; //  123
range.max; //  789
range.size; //  667
```

### Range.fromHex

Create a Range instance from a string representation with hexadecimal value format (e.g. created with the `toHex` method)

| argument    | type     | default | description                                                         |
| ----------- | -------- | ------- | ------------------------------------------------------------------- |
| `range`     | `String` |         | The string representing the Range with hexadecimal formatted values |
| `separator` | `String` | `'..'`  | The separator between the Ranges' `min` and `max` values            |

```js
const { Range } = require('@konfirm/range');
const range = Range.fromHex('7b..315');

range.min; //  123
range.max; //  789
range.size; //  667
```

Using a separator

```js
const { Range } = require('@konfirm/range');
const range = Range.fromHex('7b/315', '/');

range.min; //  123
range.max; //  789
range.size; //  667
```

### Range.fromJSON

Create a Range instance from a string representation in JSON format (e.g. created with the `toJSON` method)

| argument | type     | default | description                               |
| -------- | -------- | ------- | ----------------------------------------- |
| `range`  | `String` |         | The string representing the Range as JSON |

```js
const { Range } = require('@konfirm/range');
const range = Range.fromJSON('{"min":123,"max":789}');

range.min; //  123
range.max; //  789
range.size; //  667
```

## RangeCollection

A RangeCollection is a collection of zero or more `Range` instances, providing the same properties and methods as a `Range` instance.

### constructor

Create new RangeCollections by providing zero or more Range instances.

```js
const { Range, RangeCollection } = require('@konfirm/range');
const collection = new RangeCollection(new Range(0, 3), new Range(7, 10));

collection.contains(0); // true
collection.contains(3); // true
collection.contains(4); // false
collection.contains(7); // true
collection.contains(10); // true
collection.contains(11); // false
```

### properties

A RangeCollection has various properties indication the `min`, `max` values and the `size`. The

| property | type             | description                                                |
| -------- | ---------------- | ---------------------------------------------------------- |
| `min`    | Number (integer) | the lowest value (lower limit) within the RangeCollection  |
| `max`    | Number (integer) | the highest value (upper limit) within the RangeCollection |
| `size`   | Number (integer) | the number of values represented by the RangeCollection    |

```js
const { Range, RangeCollection } = require('@konfirm/range');
const collection = new RangeCollection(
	new Range(100, 110),
	new Range(200, 210)
);

collection.min; //  100
collection.max; //  210
collection.size; //  22
```

### contains

Verify whether one or more values are within the RangeCollection values.

| argument    | type     | default | description                                                                 |
| ----------- | -------- | ------- | --------------------------------------------------------------------------- |
| `...values` | `Number` |         | Zero or more number values to verify the containment in the RangeCollection |

```js
const { Range, RangeCollection } = require('@konfirm/range');
const collection = new RangeCollection(
	new Range(100, 110),
	new Range(200, 210)
);

collection.contains(100); //  true
collection.contains(150); //  false
collection.contains(200); //  true

collection.contains(100, 150); //  false
collection.contains(100, 200); //  true
```

### toString

Casts a RangeCollection instance into its string representation. The separator can be specified, the default is `'..'` (double full-stop).

| argument    | type     | default | description                                                           |
| ----------- | -------- | ------- | --------------------------------------------------------------------- |
| `separator` | `String` | `'..'`  | The separator between the Ranges' `min` and `max` values              |
| `join`      | `String` | `','`   | The separator between the Ranges contained within the RangeCollection |

```js
const { Range, RangeCollection } = require('@konfirm/range');
const collection = new RangeCollection(
	new Range(100, 110),
	new Range(200, 210)
);

collection.toString(); //  '100..110,200..210'
String(collection); //  '100..110,200..210'
```

Using a different separator

```js
const { Range, RangeCollection } = require('@konfirm/range');
const collection = new RangeCollection(
	new Range(100, 110),
	new Range(200, 210)
);

collection.toString('/'); //  '100/110,200/210'
```

Using a different join

```js
const { Range, RangeCollection } = require('@konfirm/range');
const collection = new RangeCollection(
	new Range(100, 110),
	new Range(200, 210)
);

collection.toString('..', '/'); //  '100..110/200..210'
collection.toString(':', '/'); //  '100:110/200:210'
```

### toHex

Casts a RangeCollection instance into its string representation. The separator can be specified, the default is `'..'` (double full-stop).

| argument    | type     | default | description                                                           |
| ----------- | -------- | ------- | --------------------------------------------------------------------- |
| `length`    | `Number` | `0`     | The minimum hexadecimal string length                                 |
| `separator` | `String` | `'..'`  | The separator between the Ranges' `min` and `max` values              |
| `join`      | `String` | `','`   | The separator between the Ranges contained within the RangeCollection |

```js
const { Range, RangeCollection } = require('@konfirm/range');
const collection = new RangeCollection(
	new Range(100, 110),
	new Range(200, 210)
);

collection.toHex(); //  '64..6e,c8..d2'
```

With a different length

```js
const { Range, RangeCollection } = require('@konfirm/range');
const collection = new RangeCollection(
	new Range(100, 110),
	new Range(200, 210)
);

collection.toString(4); //  '0064..006e,00c8..00d2'
```

With a different separator

```js
const { Range, RangeCollection } = require('@konfirm/range');
const collection = new RangeCollection(
	new Range(100, 110),
	new Range(200, 210)
);

collection.toString(0, ':'); //  '64:6e,c8:d2'
collection.toString(4, ':'); //  '0064:006e,00c8:00d2'
```

With a different join

```js
const { Range, RangeCollection } = require('@konfirm/range');
const collection = new RangeCollection(
	new Range(100, 110),
	new Range(200, 210)
);

collection.toString(0, ':', '/'); //  '64:6e/c8:d2'
collection.toString(4, ':', '/'); //  '0064:006e/00c8:00d2'
```

### toJSON

Represent the RangeCollection in a JSON-able format.

```js
const { Range, RangeCollection } = require('@konfirm/range');
const collection = new RangeCollection(
	new Range(100, 110),
	new Range(200, 210)
);

collection.toJSON(); // [{min:100,max:110},{min:200,max:210}]
JSON.stringify(collection); // '[{"min":100,"max":110},{"min":200,"max":210}]'
```

### iterator

RangeCollection implements the [`Symbol.iterator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/iterator) method as generator, allowing it to be used in a `for..of` loop and for Array destructing

```js
const { Range, RangeCollection } = require('@konfirm/range');
const collection = new RangeCollection(new Range(0, 3), new Range(7, 10));

for (const value of collection) {
	console.log(value);
}
// expected output: 0
// expected output: 1
// expected output: 2
// expected output: 3
// expected output: 7
// expected output: 8
// expected output: 9
// expected output: 10

const array = [...collection]; // [0, 1, 2, 3, 7, 8, 9, 10]
```

### RangeCollection.from

Create a RangeCollection instance from zero or more Range instances and/or numbers

| argument    | type           | default | description                                 |
| ----------- | -------------- | ------- | ------------------------------------------- |
| `...values` | `Range|Number` |         | Zero or more Range instances and/or numbers |

```js
const { Range, RangeCollection } = require('@konfirm/range');
const collection = RangeCollection.from(
	new Range(123, 345),
	400,
	500,
	new Range(789, 890)
);

collection.min; //  123
collection.max; //  890
collection.size; //  327
```

### RangeCollection.fromString

Create a RangeCollection instance from a string representation with decimal value format (e.g. created with the `toString` method)

| argument    | type     | default | description                                                               |
| ----------- | -------- | ------- | ------------------------------------------------------------------------- |
| `range`     | `String` |         | The string representing the RangeCollection with decimal formatted values |
| `separator` | `String` | `'..'`  | The separator between the Ranges' `min` and `max` values                  |
| `join`      | `String` | `','`   | The join between the Ranges                                               |

```js
const { RangeCollection } = require('@konfirm/range');
const collection = RangeCollection.fromString('123..345,400,500,789..890');

collection.min; //  123
collection.max; //  890
collection.size; //  327
```

Using a separator

```js
const { RangeCollection } = require('@konfirm/range');
const collection = RangeCollection.fromString('123:345,400,500,789:890', ':');

collection.min; //  123
collection.max; //  890
collection.size; //  327
```

Using a join

```js
const { RangeCollection } = require('@konfirm/range');
const collection = RangeCollection.fromString(
	'123:345/400/500/789:890',
	':',
	'/'
);

collection.min; //  123
collection.max; //  890
collection.size; //  327
```

### RangeCollection.fromHex

Create a RangeCollection instance from a string representation with hexadecimal value format (e.g. created with the `toHex` method)

| argument    | type     | default | description                                                                   |
| ----------- | -------- | ------- | ----------------------------------------------------------------------------- |
| `range`     | `String` |         | The string representing the RangeCollection with hexadecimal formatted values |
| `separator` | `String` | `'..'`  | The separator between the Ranges' `min` and `max` values                      |
| `join`      | `String` | `','`   | The join between the Ranges                                                   |

```js
const { RangeCollection } = require('@konfirm/range');
const collection = RangeCollection.fromHex('7b..159,190,1f4,315..37a');

collection.min; //  123
collection.max; //  890
collection.size; //  327
```

Using a separator

```js
const { RangeCollection } = require('@konfirm/range');
const collection = RangeCollection.fromHex('7b:159,190,1f4,315:37a', ':');

collection.min; //  123
collection.max; //  890
collection.size; //  327
```

Using a join

```js
const { RangeCollection } = require('@konfirm/range');
const collection = RangeCollection.fromHex('7b:159/190/1f4/315:37a', ':', '/');

collection.min; //  123
collection.max; //  890
collection.size; //  327
```

### RangeCollection.fromJSON

Create a RangeCollection instance from a string representation in JSON format (e.g. created with the `toJSON` method)

| argument | type     | default | description                                         |
| -------- | -------- | ------- | --------------------------------------------------- |
| `range`  | `String` |         | The string representing the RangeCollection as JSON |

```js
const { RangeCollection } = require('@konfirm/range');
const collection = RangeCollection.fromJSON('[{"min":123,"max":345},{"min":400},{"min":500},{"min":789,"max":890}]');

collection.min; //  123
collection.max; //  890
collection.size; //  327
```

# License

MIT License Copyright (c) 2019-2021 Rogier Spieker (Konfirm)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
