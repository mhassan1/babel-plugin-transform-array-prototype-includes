import * as BabelTypes from '@babel/types';
import { Visitor } from '@babel/traverse';

type CallExpressionVisited = BabelTypes.CallExpression & { visited?: boolean };
type OptionalCallExpressionVisited = BabelTypes.OptionalCallExpression & { visited?: boolean };
type VisitorMethodParameters =
  // @ts-expect-error Type 'undefined' is not assignable to type '(...args: any) => any'.ts(2344)
  | Parameters<Visitor['CallExpression']>[0]
  // @ts-expect-error Type 'undefined' is not assignable to type '(...args: any) => any'.ts(2344)
  | Parameters<Visitor['OptionalCallExpression']>[0];

export default function pluginTransformArrayIncludes({ types: t }: { types: typeof BabelTypes }): {
  name: string;
  visitor: Visitor;
} {
  const CallExpressionOrOptionalCallExpression = (path: VisitorMethodParameters) => {
    const includesExpression: CallExpressionVisited | OptionalCallExpressionVisited = path.node;

    if (includesExpression.visited) return;

    const { callee, arguments: args } = includesExpression;

    if (!t.isMemberExpression(callee) && !t.isOptionalMemberExpression(callee)) return;

    if (
      !t.isIdentifier(callee.property, { name: 'includes' }) &&
      !t.isStringLiteral(callee.property, { value: 'includes' })
    ) {
      return;
    }

    const argsHaveSpreadElement = args.some((arg) => t.isSpreadElement(arg));
    const innerArgs = Array(args.length)
      .fill(undefined)
      .map(function (_, i) {
        return t.identifier('a' + i);
      });

    const makeCallExpression = (fnName: string): CallExpressionVisited | OptionalCallExpressionVisited => {
      const memberExpression = t.isMemberExpression(callee)
        ? t.memberExpression(
            t.isArrayExpression(callee.object) || t.isSuper(callee.object) ? callee.object : t.identifier('o'),
            t.identifier(fnName),
          )
        : t.optionalMemberExpression(
            t.isArrayExpression(callee.object) || t.isSuper(callee.object) ? callee.object : t.identifier('o'),
            t.identifier(fnName),
            undefined,
            true,
          );
      const callExpressionArgs = t.isArrayExpression(callee.object)
        ? args
        : argsHaveSpreadElement
        ? [t.spreadElement(t.identifier('a'))]
        : innerArgs;
      const callExpression = t.isCallExpression(includesExpression)
        ? t.callExpression(memberExpression, callExpressionArgs)
        : t.optionalCallExpression(memberExpression, callExpressionArgs, includesExpression.optional);
      return callExpression;
    };

    const indexOfCallExpression = makeCallExpression('indexOf');
    const indexOfExpression = t.binaryExpression(
      '!==',
      indexOfCallExpression,
      t.unaryExpression('-', t.numericLiteral(1)),
    );

    if (t.isArrayExpression(callee.object)) {
      path.replaceWith(indexOfExpression);
    } else {
      const isArrayExpression = t.callExpression(t.memberExpression(t.identifier('Array'), t.identifier('isArray')), [
        t.isSuper(callee.object) ? t.thisExpression() : t.identifier('o'),
      ]);

      const newIncludesExpression = makeCallExpression('includes');
      newIncludesExpression.visited = true;

      const functionBlockStatement = t.blockStatement([
        t.returnStatement(t.conditionalExpression(isArrayExpression, indexOfExpression, newIncludesExpression)),
      ]);

      const functionArgs = argsHaveSpreadElement
        ? [t.identifier('o'), t.restElement(t.identifier('a'))]
        : [t.identifier('o')].concat(innerArgs);

      const functionDeclaration = t.isSuper(callee.object)
        ? t.arrowFunctionExpression(functionArgs, functionBlockStatement)
        : t.functionExpression(undefined, functionArgs, functionBlockStatement);

      const functionCallArgs = [t.isSuper(callee.object) ? t.identifier('undefined') : callee.object];
      Array.prototype.push.apply(functionCallArgs, args);

      const functionCallExpression = t.callExpression(functionDeclaration, functionCallArgs);

      path.replaceWith(functionCallExpression);
    }
  };
  return {
    name: 'transform array includes',
    visitor: {
      CallExpression(path) {
        CallExpressionOrOptionalCallExpression(path);
      },
      OptionalCallExpression(path) {
        CallExpressionOrOptionalCallExpression(path);
      },
    },
  };
}
