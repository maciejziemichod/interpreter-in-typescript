import {
    AstNode,
    ExpressionStatement,
    IntegerLiteral,
    Program,
    Statement,
} from "./ast";
import { IntegerObj, ValueObject } from "./object";

export function evalNode(node: AstNode | null): ValueObject | null {
    if (node instanceof Program) {
        return evalStatements(node.statements);
    } else if (node instanceof ExpressionStatement) {
        return evalNode(node.expression);
    } else if (node instanceof IntegerLiteral) {
        return new IntegerObj(node.value);
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
