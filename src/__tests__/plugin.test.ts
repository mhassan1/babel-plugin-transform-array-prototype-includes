import { describe, it } from 'vitest';
globalThis.describe = describe;
globalThis.it = it;
import pluginTester from 'babel-plugin-tester';
import plugin from '../index';

pluginTester({
  plugin,
  tests: [
    {
      code: '[1, 2, 3];',
    },
    {
      code: 'f();',
    },
    {
      code: '[1, 2, 3].includes(1);',
      output: '[1, 2, 3].indexOf(1) !== -1;',
    },
    {
      code: "[1, 2, 3]['includes'](1);",
      output: '[1, 2, 3].indexOf(1) !== -1;',
    },
    {
      code: 'a.includes(1);',
      output: 'Array.isArray(a) ? a.indexOf(1) !== -1 : a.includes(1);',
    },
    {
      code: "a['includes'](1);",
      output: "Array.isArray(a) ? a.indexOf(1) !== -1 : a['includes'](1);",
    },
    {
      code: "'a'.includes(1);",
      output: "Array.isArray('a') ? 'a'.indexOf(1) !== -1 : 'a'.includes(1);",
    },
    {
      code: "'a'['includes'](1);",
      output: "Array.isArray('a') ? 'a'.indexOf(1) !== -1 : 'a'['includes'](1);",
    },
    {
      code: 'class a extends b {\n  constructor() {\n    super.includes(1);\n  }\n}',
      output:
        'class a extends b {\n  constructor() {\n    Array.isArray(this) ? super.indexOf(1) !== -1 : super.includes(1);\n  }\n}',
    },
  ],
});
