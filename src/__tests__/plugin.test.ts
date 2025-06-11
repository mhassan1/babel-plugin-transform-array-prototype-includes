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
      output: '(function (o, a0) {\n  return Array.isArray(o) ? o.indexOf(a0) !== -1 : o.includes(a0);\n})(a, 1);',
    },
    {
      code: "a['includes'](1);",
      output: '(function (o, a0) {\n  return Array.isArray(o) ? o.indexOf(a0) !== -1 : o.includes(a0);\n})(a, 1);',
    },
    {
      code: "'a'.includes(1);",
      output: "(function (o, a0) {\n  return Array.isArray(o) ? o.indexOf(a0) !== -1 : o.includes(a0);\n})('a', 1);",
    },
    {
      code: "'a'['includes'](1);",
      output: "(function (o, a0) {\n  return Array.isArray(o) ? o.indexOf(a0) !== -1 : o.includes(a0);\n})('a', 1);",
    },
    {
      code: 'a.includes();',
      output: '(function (o) {\n  return Array.isArray(o) ? o.indexOf() !== -1 : o.includes();\n})(a);',
    },
    {
      code: 'a.includes(1, t);',
      output:
        '(function (o, a0, a1) {\n  return Array.isArray(o) ? o.indexOf(a0, a1) !== -1 : o.includes(a0, a1);\n})(a, 1, t);',
    },
    {
      code: 'a.includes(1, t, x, y, z);',
      output:
        '(function (o, a0, a1, a2, a3, a4) {\n  return Array.isArray(o) ? o.indexOf(a0, a1, a2, a3, a4) !== -1 : o.includes(a0, a1, a2, a3, a4);\n})(a, 1, t, x, y, z);',
    },
    {
      code: 'a.includes(...b, ...c);',
      output:
        '(function (o, ...a) {\n  return Array.isArray(o) ? o.indexOf(...a) !== -1 : o.includes(...a);\n})(a, ...b, ...c);',
    },
    {
      code: 'class a extends b {\n  constructor() {\n    super.includes(1);\n  }\n}',
      output:
        'class a extends b {\n  constructor() {\n    ((o, a0) => {\n      return Array.isArray(this) ? super.indexOf(a0) !== -1 : super.includes(a0);\n    })(undefined, 1);\n  }\n}',
    },
    {
      code: 'a.b.includes(1);',
      output: '(function (o, a0) {\n  return Array.isArray(o) ? o.indexOf(a0) !== -1 : o.includes(a0);\n})(a.b, 1);',
    },
    {
      code: 'a?.b.includes(1);',
      output: '(function (o, a0) {\n  return Array.isArray(o) ? o?.indexOf(a0) !== -1 : o?.includes(a0);\n})(a?.b, 1);',
    },
    {
      code: 'a.b?.includes(1);',
      output: '(function (o, a0) {\n  return Array.isArray(o) ? o?.indexOf(a0) !== -1 : o?.includes(a0);\n})(a.b, 1);',
    },
    {
      code: 'a.b.includes?.(1);',
      output:
        '(function (o, a0) {\n  return Array.isArray(o) ? o.indexOf?.(a0) !== -1 : o.includes?.(a0);\n})(a.b, 1);',
    },
    {
      code: 'a?.b.includes?.(1);',
      output:
        '(function (o, a0) {\n  return Array.isArray(o) ? o?.indexOf?.(a0) !== -1 : o?.includes?.(a0);\n})(a?.b, 1);',
    },
    {
      code: 'a.b?.includes?.(1);',
      output:
        '(function (o, a0) {\n  return Array.isArray(o) ? o?.indexOf?.(a0) !== -1 : o?.includes?.(a0);\n})(a.b, 1);',
    },
    {
      code: '[]?.includes(1);',
      output: '[]?.indexOf(1) !== -1;',
    },
    {
      code: 'a().includes(b());',
      output: '(function (o, a0) {\n  return Array.isArray(o) ? o.indexOf(a0) !== -1 : o.includes(a0);\n})(a(), b());',
    },
  ],
});
