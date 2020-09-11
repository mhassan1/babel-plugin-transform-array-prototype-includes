# babel-plugin-transform-array-prototype-includes

Transforms `arr.includes(value)` to ES5 without a polyfill

Inspired by [babel-plugin-array-includes](https://github.com/stoeffel/babel-plugin-array-includes).

## Example

**In**

```javascript
[1, 2, 3].includes(1);
[1, 2, 3]['includes'](1);
arr.includes(1);
arr['includes'](1);
```

**Out**

```javascript
[1, 2, 3].indexOf(1) !== -1;
[1, 2, 3].indexOf(1) !== -1;
Array.isArray(arr) ? arr.indexOf(1) !== -1 : arr.includes(1);
Array.isArray(arr) ? arr.indexOf(1) !== -1 : arr['includes'](1);
```

## Installation

```sh
$ npm install babel-plugin-transform-array-prototype-includes
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["transform-array-prototype-includes"]
}
```

### Via CLI

```sh
$ babel --plugins transform-array-prototype-includes script.js
```

### Via Node API

```javascript
require("@babel/core").transform("code", {
  plugins: ["transform-array-prototype-includes"]
});
```
