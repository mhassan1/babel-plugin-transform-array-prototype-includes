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
  ],
});
