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

    const indexOfMemberExpression = t.isMemberExpression(callee)
      ? t.memberExpression(callee.object, t.identifier('indexOf'))
      : t.optionalMemberExpression(callee.object, t.identifier('indexOf'), undefined, callee.optional);

    const indexOfCallExpression = t.isCallExpression(includesExpression)
      ? t.callExpression(indexOfMemberExpression, args)
      : t.optionalCallExpression(indexOfMemberExpression, args, includesExpression.optional);

    const indexOfExpression = t.binaryExpression(
      '!==',
      indexOfCallExpression,
      t.unaryExpression('-', t.numericLiteral(1)),
    );

    if (t.isArrayExpression(callee.object)) {
      path.replaceWith(indexOfExpression);
    } else {
      const isArrayExpression = t.callExpression(t.memberExpression(t.identifier('Array'), t.identifier('isArray')), [
        t.isSuper(callee.object) ? t.thisExpression() : callee.object,
      ]);

      includesExpression.visited = true;

      path.replaceWith(
        t.expressionStatement(t.conditionalExpression(isArrayExpression, indexOfExpression, includesExpression)),
      );
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
