import {
    AstNode,
    BlockStatement,
    BooleanLiteral,
    ExpressionStatement,
    IfExpression,
    InfixExpression,
    IntegerLiteral,
    PrefixExpression,
    Program,
    ReturnStatement,
    Statement,
} from "./ast";
import {
    BooleanObj,
    IntegerObj,
    NullObj,
    ObjectType,
    ReturnValue,
    ValueObject,
} from "./object";

const TRUE_OBJ = new BooleanObj(true);
const FALSE_OBJ = new BooleanObj(false);
const NULL_OBJ = new NullObj();

export function evalNode(node: AstNode | null): ValueObject | null {
    if (node instanceof Program) {
        return evalProgram(node);
    } else if (node instanceof ExpressionStatement) {
        return evalNode(node.expression);
    } else if (node instanceof BlockStatement) {
        return evalBlockStatement(node);
    } else if (node instanceof ReturnStatement) {
        const value = evalNode(node.returnValue);

        return new ReturnValue(value);
    } else if (node instanceof IfExpression) {
        return evalIfExpression(node);
    } else if (node instanceof IntegerLiteral) {
        return new IntegerObj(node.value);
    } else if (node instanceof BooleanLiteral) {
        return nativeBooleanToBooleanObject(node.value);
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

function evalProgram(program: Program): ValueObject | null {
    let result: ValueObject | null = null;

    for (const statement of program.statements) {
        result = evalNode(statement);

        if (result instanceof ReturnValue) {
            return result.value;
        }
    }

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
    return isTruthy(right) ? FALSE_OBJ : TRUE_OBJ;
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
    } else if (operator === "==") {
        return nativeBooleanToBooleanObject(left === right);
    } else if (operator === "!=") {
        return nativeBooleanToBooleanObject(left !== right);
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
        case ">":
            return nativeBooleanToBooleanObject(left.value > right.value);
        case "<":
            return nativeBooleanToBooleanObject(left.value < right.value);
        case "==":
            return nativeBooleanToBooleanObject(left.value === right.value);
        case "!=":
            return nativeBooleanToBooleanObject(left.value !== right.value);
        default:
            return NULL_OBJ;
    }
}

function evalIfExpression(expression: IfExpression): ValueObject | null {
    const condition = evalNode(expression.condition);

    if (isTruthy(condition)) {
        return evalNode(expression.consequence);
    } else if (expression.alternative !== null) {
        return evalNode(expression.alternative);
    } else {
        return NULL_OBJ;
    }
}

function evalBlockStatement(block: BlockStatement): ValueObject | null {
    let result: ValueObject | null = null;

    for (const statement of block.statements) {
        result = evalNode(statement);

        if (result?.type() === ObjectType.RETURN_VALUE_OBJ) {
            return result;
        }
    }

    return result;
}

function isTruthy(obj: ValueObject | null): boolean {
    switch (obj) {
        case TRUE_OBJ:
            return true;
        case FALSE_OBJ:
        case NULL_OBJ:
            return false;
        default:
            if (isIntegerObj(obj) && obj.value === 0) {
                return false;
            } else {
                return true;
            }
    }
}

function nativeBooleanToBooleanObject(value: boolean): BooleanObj {
    return value ? TRUE_OBJ : FALSE_OBJ;
}

function isIntegerObj(obj: ValueObject | null): obj is IntegerObj {
    return obj?.type() === ObjectType.INTEGER_OBJ;
}
