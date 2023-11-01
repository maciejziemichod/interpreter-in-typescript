import {
    AstNode,
    BlockStatement,
    BooleanLiteral,
    CallExpression,
    Expression,
    ExpressionStatement,
    FunctionLiteral,
    Identifier,
    IfExpression,
    InfixExpression,
    IntegerLiteral,
    LetStatement,
    PrefixExpression,
    Program,
    ReturnStatement,
    StringLiteral,
} from "./ast";
import { builtins } from "./builtins";
import { Environment } from "./environment";
import {
    BooleanObj,
    Builtin,
    ErrorObj,
    FunctionObj,
    IntegerObj,
    NullObj,
    ReturnValue,
    StringObj,
    ValueObject,
} from "./object";

const TRUE_OBJ = new BooleanObj(true);
const FALSE_OBJ = new BooleanObj(false);
export const NULL_OBJ = new NullObj();

export function evalNode(
    node: AstNode | null,
    environment: Environment,
): ValueObject | null {
    if (node instanceof Program) {
        return evalProgram(node, environment);
    } else if (node instanceof ExpressionStatement) {
        return evalNode(node.expression, environment);
    } else if (node instanceof BlockStatement) {
        return evalBlockStatement(node, environment);
    } else if (node instanceof ReturnStatement) {
        const value = evalNode(node.returnValue, environment);

        if (value instanceof ErrorObj) {
            return value;
        }

        return new ReturnValue(value);
    } else if (node instanceof LetStatement) {
        const value = evalNode(node.value, environment);

        if (value instanceof ErrorObj) {
            return value;
        }

        if (node.name !== null) {
            environment.set(node.name.value, value);
        }
    } else if (node instanceof Identifier) {
        return evalIdentifier(node, environment);
    } else if (node instanceof IfExpression) {
        return evalIfExpression(node, environment);
    } else if (node instanceof IntegerLiteral) {
        return new IntegerObj(node.value);
    } else if (node instanceof StringLiteral) {
        return new StringObj(node.value);
    } else if (node instanceof BooleanLiteral) {
        return nativeBooleanToBooleanObject(node.value);
    } else if (node instanceof FunctionLiteral) {
        return new FunctionObj(node.parameters, node.body, environment);
    } else if (node instanceof CallExpression) {
        const fn = evalNode(node.expression, environment);

        if (fn instanceof ErrorObj) {
            return fn;
        }

        const args = evalExpressions(node.arguments ?? [], environment);

        if (args.length === 1 && args[0] instanceof ErrorObj) {
            return args[0];
        }

        return applyFunction(fn, args);
    } else if (node instanceof PrefixExpression) {
        const right = evalNode(node.right, environment);

        if (right instanceof ErrorObj) {
            return right;
        }

        return evalPrefixExpression(node.operator, right);
    } else if (node instanceof InfixExpression) {
        const left = evalNode(node.left, environment);

        if (left instanceof ErrorObj) {
            return left;
        }

        const right = evalNode(node.right, environment);

        if (right instanceof ErrorObj) {
            return right;
        }

        return evalInfixExpression(node.operator, left, right);
    }

    return null;
}

function evalProgram(
    program: Program,
    environment: Environment,
): ValueObject | null {
    let result: ValueObject | null = null;

    for (const statement of program.statements) {
        result = evalNode(statement, environment);

        if (result instanceof ReturnValue) {
            return result.value;
        } else if (result instanceof ErrorObj) {
            return result;
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
            return new ErrorObj(
                `unknown operator: ${operator}${right?.type()}`,
            );
    }
}

function evalBangOperatorExpression(right: ValueObject | null): ValueObject {
    return isTruthy(right) ? FALSE_OBJ : TRUE_OBJ;
}

function evalMinusPrefixOperatorExpression(
    right: ValueObject | null,
): ValueObject {
    if (!(right instanceof IntegerObj)) {
        return new ErrorObj(`unknown operator: -${right?.type()}`);
    }

    const value = right.value;

    return new IntegerObj(-value);
}

function evalInfixExpression(
    operator: string,
    left: ValueObject | null,
    right: ValueObject | null,
): ValueObject {
    if (left instanceof IntegerObj && right instanceof IntegerObj) {
        return evalIntegerInfixExpression(operator, left, right);
    } else if (left instanceof StringObj || right instanceof StringObj) {
        return evalStringInfixExpression(operator, left, right);
    } else if (operator === "==") {
        return nativeBooleanToBooleanObject(left === right);
    } else if (operator === "!=") {
        return nativeBooleanToBooleanObject(left !== right);
    } else if (left?.type() !== right?.type()) {
        return new ErrorObj(
            `type mismatch: ${left?.type()} ${operator} ${right?.type()}`,
        );
    } else {
        return new ErrorObj(
            `unknown operator: ${left?.type()} ${operator} ${right?.type()}`,
        );
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
            return new ErrorObj(
                `unknown operator: ${left.type()} ${operator} ${right.type()}`,
            );
    }
}

function evalStringInfixExpression(
    operator: string,
    left: ValueObject | null,
    right: ValueObject | null,
): ValueObject {
    const isLeftString = left instanceof StringObj;
    const isRightString = right instanceof StringObj;

    if (operator === "+" && isLeftString && isRightString) {
        return new StringObj(left.value + right.value);
    } else if (operator === "==" && isLeftString && isRightString) {
        return nativeBooleanToBooleanObject(left.value === right.value);
    } else if (operator === "!=" && isLeftString && isRightString) {
        return nativeBooleanToBooleanObject(left.value !== right.value);
    } else if (
        operator === "*" &&
        isLeftString &&
        right instanceof IntegerObj
    ) {
        return new StringObj(left.value.repeat(right.value));
    } else {
        return new ErrorObj(
            `unknown operator: ${left?.type()} ${operator} ${right?.type()}`,
        );
    }
}

function evalIfExpression(
    expression: IfExpression,
    environment: Environment,
): ValueObject | null {
    const condition = evalNode(expression.condition, environment);

    if (condition instanceof ErrorObj) {
        return condition;
    }

    if (isTruthy(condition)) {
        return evalNode(expression.consequence, environment);
    } else if (expression.alternative !== null) {
        return evalNode(expression.alternative, environment);
    } else {
        return NULL_OBJ;
    }
}

function evalBlockStatement(
    block: BlockStatement,
    environment: Environment,
): ValueObject | null {
    let result: ValueObject | null = null;

    for (const statement of block.statements) {
        result = evalNode(statement, environment);

        if (result instanceof ReturnValue || result instanceof ErrorObj) {
            return result;
        }
    }

    return result;
}

function evalIdentifier(
    node: Identifier,
    environment: Environment,
): ValueObject | null {
    const value = environment.get(node.value);

    if (value !== undefined) {
        return value;
    }

    if (node.value in builtins) {
        return builtins[node.value as keyof typeof builtins];
    }

    return new ErrorObj(`identifier not found: ${node.value}`);
}

function evalExpressions(
    expressions: Expression[],
    environment: Environment,
): Array<ValueObject | null> {
    const result: Array<ValueObject | null> = [];

    for (const expression of expressions) {
        const evaluated = evalNode(expression, environment);

        if (evaluated instanceof ErrorObj) {
            return [evaluated];
        }

        result.push(evaluated);
    }

    return result;
}

function applyFunction(
    fn: ValueObject | null,
    args: Array<ValueObject | null>,
): ValueObject | null {
    if (fn instanceof FunctionObj) {
        const extendedEnvironment = extendFunctionEnvironment(fn, args);
        const evaluated = evalNode(fn.body, extendedEnvironment);

        return unwrapReturnValue(evaluated);
    } else if (fn instanceof Builtin) {
        return fn.fn(...args);
    } else {
        return new ErrorObj(`not a function: ${fn?.type()}`);
    }
}

function extendFunctionEnvironment(
    fn: FunctionObj,
    args: Array<ValueObject | null>,
): Environment {
    const environment = new Environment(fn.environment);

    fn.parameters.forEach((parameter, parameterIndex) => {
        environment.set(parameter.value, args[parameterIndex]);
    });

    return environment;
}

function unwrapReturnValue(obj: ValueObject | null): ValueObject | null {
    if (obj instanceof ReturnValue) {
        return obj.value;
    }

    return obj;
}

function isTruthy(obj: ValueObject | null): boolean {
    switch (obj) {
        case TRUE_OBJ:
            return true;
        case FALSE_OBJ:
        case NULL_OBJ:
            return false;
        default:
            if (
                (obj instanceof IntegerObj && obj.value === 0) ||
                (obj instanceof StringObj && obj.value === "")
            ) {
                return false;
            } else {
                return true;
            }
    }
}

function nativeBooleanToBooleanObject(value: boolean): BooleanObj {
    return value ? TRUE_OBJ : FALSE_OBJ;
}
