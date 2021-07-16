import { PatchOptions } from '../../../patchers/types';
import LogicalOpCompoundAssignOpPatcher from './LogicalOpCompoundAssignOpPatcher';

/**
 * Patcher for ||= and &&= that translates to native ES2021 logical assignment.
 */
export default class LogicalAssignmentCompoundAssignOpPatcher extends LogicalOpCompoundAssignOpPatcher {
  patchAsExpression({ needsParens = false }: PatchOptions = {}): void {
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
    const translated = this.isOrOp() ? '||=' : '&&=';
    this.overwrite(operator.start, operator.end, translated);
  }
}
