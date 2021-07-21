import { PatchOptions } from '../../../patchers/types';
import ExistsOpCompoundAssignOpPatcher from './ExistsOpCompoundAssignOpPatcher';

/**
 * Patcher for ?= that translates to native ES2021 ??= nullish coalescing
 * assignment.
 */
export default class NullishCoalescingCompoundAssignOpPatcher extends ExistsOpCompoundAssignOpPatcher {
  patchAsExpression({ needsParens = false }: PatchOptions = {}): void {
    if (this.negated) {
      this.insert(this.contentStart, '!');
    }

    const shouldAddParens = this.negated || (needsParens && !this.isSurroundedByParentheses());
    if (shouldAddParens) {
      this.insert(this.contentStart, '(');
    }

    this.assignee.patch();
    this.patchOperator();
    this.expression.patch();

    if (shouldAddParens) {
      this.insert(this.contentEnd, ')');
    }
  }

  patchAsStatement(options: PatchOptions = {}): void {
    this.patchAsExpression(options);
  }

  patchOperator(): void {
    const operator = this.getOperatorToken();
    this.overwrite(operator.start, operator.end, '??=');
  }
}
