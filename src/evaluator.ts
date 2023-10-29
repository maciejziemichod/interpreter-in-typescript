import {
    AstNode,
    BooleanLiteral,
    ExpressionStatement,
    IntegerLiteral,
    PrefixExpression,
    Program,
    Statement,
} from "./ast";
import {
    BooleanObj,
    IntegerObj,
    NullObj,
    ObjectType,
    ValueObject,
} from "./object";

const TRUE_OBJ = new BooleanObj(true);
const FALSE_OBJ = new BooleanObj(false);
const NULL_OBJ = new NullObj();

export function evalNode(node: AstNode | null): ValueObject | null {
    if (node instanceof Program) {
        return evalStatements(node.statements);
    } else if (node instanceof ExpressionStatement) {
        return evalNode(node.expression);
    } else if (node instanceof IntegerLiteral) {
        return new IntegerObj(node.value);
    } else if (node instanceof BooleanLiteral) {
        return node.value ? TRUE_OBJ : FALSE_OBJ;
    } else if (node instanceof PrefixExpression) {
        const right = evalNode(node.right);

        return evalPrefixExpression(node.operator, right);
    }

    return null;
}

function evalStatements(statements: Statement[]): ValueObject | null {
    let result: ValueObject | null = null;

    statements.forEach((statement) => {
        result = evalNode(statement);
    });

    return result;
}

function evalPrefixExpression(
    operator: string,
    right: ValueObject | null,
): ValueObject {
    switch (operator) {
        case "!":
            return evalBangOperatorExpression(right);
        case "-":
            return evalMinusPrefixOperatorExpression(right);
        default:
            return NULL_OBJ;
    }
}

function evalBangOperatorExpression(right: ValueObject | null): ValueObject {
    switch (right) {
        case TRUE_OBJ:
            return FALSE_OBJ;
        case FALSE_OBJ:
            return TRUE_OBJ;
        case NULL_OBJ:
            return TRUE_OBJ;
        default:
            if (right instanceof IntegerObj && right.value === 0) {
                return TRUE_OBJ;
            } else {
                return FALSE_OBJ;
            }
    }
}

function evalMinusPrefixOperatorExpression(
    right: ValueObject | null,
): ValueObject {
    if (right?.type() !== ObjectType.INTEGER_OBJ) {
        return NULL_OBJ;
    }

    const value = (right as IntegerObj).value;

    return new IntegerObj(-value);
}
