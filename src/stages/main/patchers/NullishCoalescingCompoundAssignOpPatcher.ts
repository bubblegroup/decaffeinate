import { PatchOptions } from '../../../patchers/types';
import ExistsOpCompoundAssignOpPatcher from './ExistsOpCompoundAssignOpPatcher';

/**
 * Patcher for ?= that translates to native ES2021 ??= nullish coalescing
 * assignment.
 */
export default class NullishCoalescingCompoundAssignOpPatcher extends ExistsOpCompoundAssignOpPatcher {
  patchAsExpression({ needsParens = false }: PatchOptions = {}): void {
    // Fall back to the non-fancy way if the LHS might be unbound.
    if (this.needsTypeofCheck()) {
      super.patchAsExpression({ needsParens });
      return;
    }

    if (this.negated) {
      this.insert(this.contentStart, '!');
    }

    const shouldAddParens = this.negated || (needsParens && !this.isSurroundedByParentheses());
    if (shouldAddParens) {
      this.insert(this.contentStart, '(');
    }

    this.patchOperator();

    if (shouldAddParens) {
      this.insert(this.contentEnd, ')');
    }
  }

  patchAsStatement(options: PatchOptions = {}): void {
    if (this.lhsHasSoakOperation()) {
      this.patchAsExpression(options);
      return;
    }

    this.patchOperator();
  }

  patchOperator(): void {
    const operator = this.getOperatorToken();
    this.overwrite(operator.start, operator.end, '??=');
  }
}
