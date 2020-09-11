import * as BabelTypes from '@babel/types';
import { Visitor } from '@babel/traverse';

type CallExpressionVisited = BabelTypes.CallExpression & { visited?: boolean };

export default function pluginTransformArrayIncludes({
  types: t,
}: {
  types: typeof BabelTypes;
}): { name: string; visitor: Visitor } {
  return {
    name: 'transform array includes',
    visitor: {
      CallExpression(path) {
        const includesExpression: CallExpressionVisited = path.node;

        if (includesExpression.visited) return;

        const { callee, arguments: args } = includesExpression;

        if (!t.isMemberExpression(callee)) return;

        if (
          !t.isIdentifier(callee.property, { name: 'includes' }) &&
          !t.isStringLiteral(callee.property, { value: 'includes' })
        ) {
          return;
        }

        const indexOfExpression = t.binaryExpression(
          '!==',
          t.callExpression(t.memberExpression(callee.object, t.identifier('indexOf')), args),
          t.numericLiteral(-1),
        );

        if (t.isArrayExpression(callee.object)) {
          path.replaceWith(indexOfExpression);
        } else {
          const isArrayExpression = t.callExpression(
            t.memberExpression(t.identifier('Array'), t.identifier('isArray')),
            [callee.object],
          );

          includesExpression.visited = true;

          path.replaceWith(
            t.expressionStatement(t.conditionalExpression(isArrayExpression, indexOfExpression, includesExpression)),
          );
        }
      },
    },
  };
}
