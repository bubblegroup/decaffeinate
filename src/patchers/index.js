import ArrayInitialiserPatcher from './ArrayInitialiserPatcher';
import AssignOpPatcher from './AssignOpPatcher';
import BinaryOpPassthroughPatcher from './BinaryOpPatcher';
import BlockPatcher from './BlockPatcher';
import BoolPatcher from './BoolPatcher';
import ConditionalPatcher from './ConditionalPatcher';
import DeleteOpPatcher from './DeleteOpPatcher';
import DynamicMemberAccessOpPatcher from './DynamicMemberAccessOpPatcher';
import EQOpPatcher from './EQOpPatcher';
import FunctionApplicationPatcher from './FunctionApplicationPatcher';
import FunctionPatcher from './FunctionPatcher';
import HerestringPatcher from './HerestringPatcher';
import IdentifierPatcher from './IdentifierPatcher';
import LogicalAndOpPatcher from './LogicalOpPatcher';
import MemberAccessOpPatcher from './MemberAccessOpPatcher';
import NewOpPatcher from './NewOpPatcher';
import ObjectInitialiserMemberPatcher from './ObjectInitialiserMemberPatcher';
import ObjectInitialiserPatcher from './ObjectInitialiserPatcher';
import PassthroughPatcher from './PassthroughPatcher';
import ProgramPatcher from './ProgramPatcher';
import ReturnPatcher from './ReturnPatcher';
import TemplateLiteralPatcher from './TemplateLiteralPatcher';
import ThisPatcher from './ThisPatcher';
import ThrowPatcher from './ThrowPatcher';
import { childPropertyNames } from '../utils/traverse';

export function makePatcher(node, context, editor, allPatchers=[]) {
  let constructor;
  let props = childPropertyNames(node);

  switch (node.type) {
    case 'Identifier':
      constructor = IdentifierPatcher;
      break;

    case 'String':
    case 'Int':
      constructor = PassthroughPatcher;
      break;

    case 'FunctionApplication':
      constructor = FunctionApplicationPatcher;
      break;

    case 'MemberAccessOp':
      constructor = MemberAccessOpPatcher;
      break;

    case 'DynamicMemberAccessOp':
      constructor = DynamicMemberAccessOpPatcher;
      break;

    case 'EQOp':
      constructor = EQOpPatcher;
      break;

    case 'ObjectInitialiserMember':
      constructor = ObjectInitialiserMemberPatcher;
      break;

    case 'ObjectInitialiser':
      constructor = ObjectInitialiserPatcher;
      break;

    case 'This':
      constructor = ThisPatcher;
      break;

    case 'Function':
      constructor = FunctionPatcher;
      break;

    case 'Bool':
      constructor = BoolPatcher;
      break;

    case 'Conditional':
      constructor = ConditionalPatcher;
      break;

    case 'ArrayInitialiser':
      constructor = ArrayInitialiserPatcher;
      break;

    case 'Block':
      constructor = BlockPatcher;
      break;

    case 'AssignOp':
      constructor = AssignOpPatcher;
      break;

    case 'Return':
      constructor = ReturnPatcher;
      break;

    case 'PlusOp':
    case 'SubtractOp':
      constructor = BinaryOpPassthroughPatcher;
      break;

    case 'LogicalAndOp':
    case 'LogicalOrOp':
      constructor = LogicalAndOpPatcher;
      break;

    case 'TemplateLiteral':
      constructor = TemplateLiteralPatcher;
      break;

    case 'Herestring':
      constructor = HerestringPatcher;
      break;

    case 'NewOp':
      constructor = NewOpPatcher;
      break;

    case 'Throw':
      constructor = ThrowPatcher;
      break;

    case 'DeleteOp':
      constructor = DeleteOpPatcher;
      break;

    case 'Program':
      constructor = ProgramPatcher;
      break;

    default:
      throw new Error(
        `no patcher available for node type: ${node.type}` +
        `${props.length ? ` (props: ${props.join(', ')})` : ''}`
      );
  }

  let children = props.map(name => {
    let child = node[name];
    if (!child) {
      return null;
    } else if (Array.isArray(child)) {
      return child.map(item => makePatcher(item, context, editor, allPatchers));
    } else {
      return makePatcher(child, context, editor, allPatchers);
    }
  });

  let patcher = new constructor(node, context, editor, ...children);
  allPatchers.push(patcher);
  associateParent(patcher, children);

  if (node.type === 'Program') {
    allPatchers.forEach(patcher => patcher.initialize());
  }

  return patcher;
}

function associateParent(parent, child) {
  if (Array.isArray(child)) {
    child.forEach(item => associateParent(parent, item));
  } else if (child) {
    child.parent = parent;
  }
}
