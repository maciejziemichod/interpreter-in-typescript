import {
    AstNode,
    BooleanLiteral,
    ExpressionStatement,
    InfixExpression,
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
    } else if (node instanceof InfixExpression) {
        const left = evalNode(node.left);
        const right = evalNode(node.right);

        return evalInfixExpression(node.operator, left, right);
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
            if (isIntegerObj(right) && right.value === 0) {
                return TRUE_OBJ;
            } else {
                return FALSE_OBJ;
            }
    }
}

function evalMinusPrefixOperatorExpression(
    right: ValueObject | null,
): ValueObject {
    if (!isIntegerObj(right)) {
        return NULL_OBJ;
    }

    const value = right.value;

    return new IntegerObj(-value);
}

function evalInfixExpression(
    operator: string,
    left: ValueObject | null,
    right: ValueObject | null,
): ValueObject {
    if (isIntegerObj(left) && isIntegerObj(right)) {
        return evalIntegerInfixExpression(operator, left, right);
    } else {
        return NULL_OBJ;
    }
}

function evalIntegerInfixExpression(
    operator: string,
    left: IntegerObj,
    right: IntegerObj,
): ValueObject {
    switch (operator) {
        case "+":
            return new IntegerObj(left.value + right.value);
        case "-":
            return new IntegerObj(left.value - right.value);
        case "*":
            return new IntegerObj(left.value * right.value);
        case "/":
            return new IntegerObj(left.value / right.value);
        default:
            return NULL_OBJ;
    }
}

function isIntegerObj(obj: ValueObject | null): obj is IntegerObj {
    return obj?.type() === ObjectType.INTEGER_OBJ;
}
