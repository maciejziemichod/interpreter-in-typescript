import {
    AstNode,
    BooleanLiteral,
    ExpressionStatement,
    IntegerLiteral,
    Program,
    Statement,
} from "./ast";
import { BooleanObj, IntegerObj, NullObj, ValueObject } from "./object";

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
