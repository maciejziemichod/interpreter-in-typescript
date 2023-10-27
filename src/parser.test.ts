import {
    ExpressionStatement,
    LetStatement,
    ReturnStatement,
    Identifier,
    IntegerLiteral,
    Expression,
    PrefixExpression,
    InfixExpression,
    Statement,
    BooleanLiteral,
} from "./ast";
import { Lexer } from "./lexer";
import { Parser } from "./parser";

test("test let statement", () => {
    const tests: [string, string, number][] = [
        ["let x = 5;", "x", 5],
        ["let y = 10;", "y", 10],
        ["let foobar = 838383;", "foobar", 838383],
    ];

    tests.forEach(([input, expectedIdentifier, expectedValue]) => {
        const lexer = new Lexer(input);
        const parser = new Parser(lexer);

        const program = parser.parseProgram();

        checkParserErrors(parser);

        expect(program.statements.length).toBe(1);

        const statement = program.statements[0];

        testLetStatement(statement, expectedIdentifier);
        // TODO uncomment once handled
        // testLiteralExpression(statement.value, expectedValue);
    });
});

test("test return statement", () => {
    const tests: [string, number][] = [
        ["return 5;", 5],
        ["return 10;", 10],
        ["return 993322;", 993322],
    ];

    tests.forEach(([input, expectedValue]) => {
        const lexer = new Lexer(input);
        const parser = new Parser(lexer);

        const program = parser.parseProgram();

        checkParserErrors(parser);

        expect(program.statements.length).toBe(1);

        const returnStatement = program.statements[0];
        const isStatementReturnStatement =
            returnStatement instanceof ReturnStatement;

        expect(isStatementReturnStatement).toBe(true);
        expect(returnStatement.getTokenLiteral()).toBe("return");

        if (!isStatementReturnStatement) {
            return;
        }

        // TODO uncomment once handled
        // testLiteralExpression(returnStatement.returnValue, expectedValue);
    });
});

test("test identifier expressions", () => {
    const input = "foobar;";

    const lexer = new Lexer(input);
    const parser = new Parser(lexer);

    const program = parser.parseProgram();

    checkParserErrors(parser);

    expect(program.statements.length).toBe(1);

    const expression = program.statements[0];
    const isStatementExpression = expression instanceof ExpressionStatement;

    expect(isStatementExpression).toBe(true);

    if (!isStatementExpression) {
        return;
    }

    const identifier = expression.expression;
    const isExpressionIdentifier = identifier instanceof Identifier;

    expect(isExpressionIdentifier).toBe(true);

    if (!isExpressionIdentifier) {
        return;
    }

    expect(identifier.value).toBe("foobar");
    expect(identifier.getTokenLiteral()).toBe("foobar");
});

test("test integer literal expressions", () => {
    const input = "5;";

    const lexer = new Lexer(input);
    const parser = new Parser(lexer);

    const program = parser.parseProgram();

    checkParserErrors(parser);

    expect(program.statements.length).toBe(1);

    const expression = program.statements[0];
    const isStatementExpression = expression instanceof ExpressionStatement;

    expect(isStatementExpression).toBe(true);

    if (!isStatementExpression) {
        return;
    }

    const integerLiteral = expression.expression;
    const isExpressionIntegerLiteral = integerLiteral instanceof IntegerLiteral;

    expect(isExpressionIntegerLiteral).toBe(true);

    if (!isExpressionIntegerLiteral) {
        return;
    }

    expect(integerLiteral.value).toBe(5);
    expect(integerLiteral.getTokenLiteral()).toBe("5");
});

test("test parsing prefix expressions", () => {
    const tests: [string, string, number | boolean][] = [
        ["!5", "!", 5],
        ["-15", "-", 15],
        ["!true;", "!", true],
        ["!false;", "!", false],
    ];

    tests.forEach(([input, operator, integerValue]) => {
        const lexer = new Lexer(input);
        const parser = new Parser(lexer);

        const program = parser.parseProgram();

        checkParserErrors(parser);

        expect(program.statements.length).toBe(1);

        const expression = program.statements[0];
        const isStatementExpression = expression instanceof ExpressionStatement;

        expect(isStatementExpression).toBe(true);

        if (!isStatementExpression) {
            return;
        }

        const prefixExpression = expression.expression;
        const isExpressionPrefixExpression =
            prefixExpression instanceof PrefixExpression;

        expect(isExpressionPrefixExpression).toBe(true);

        if (!isExpressionPrefixExpression) {
            return;
        }

        expect(prefixExpression.operator).toBe(operator);
        testLiteralExpression(prefixExpression.right, integerValue);
    });
});

test("test parsing infix expressions", () => {
    const tests: [string, number | boolean, string, number | boolean][] = [
        ["5 + 5;", 5, "+", 5],
        ["5 - 5;", 5, "-", 5],
        ["5 * 5;", 5, "*", 5],
        ["5 / 5;", 5, "/", 5],
        ["5 > 5;", 5, ">", 5],
        ["5 < 5;", 5, "<", 5],
        ["5 == 5;", 5, "==", 5],
        ["5 != 5;", 5, "!=", 5],
        ["true == true", true, "==", true],
        ["true != false", true, "!=", false],
        ["false == false", false, "==", false],
    ];

    tests.forEach(([input, leftValue, operator, rightValue]) => {
        const lexer = new Lexer(input);
        const parser = new Parser(lexer);

        const program = parser.parseProgram();

        checkParserErrors(parser);

        expect(program.statements.length).toBe(1);

        const expression = program.statements[0];
        const isStatementExpression = expression instanceof ExpressionStatement;

        expect(isStatementExpression).toBe(true);

        if (!isStatementExpression) {
            return;
        }

        testInfixExpression(
            expression.expression,
            leftValue,
            operator,
            rightValue,
        );
    });
});

test("test operator precedence parsing", () => {
    const tests = [
        ["-a * b", "((-a) * b)"],
        ["!-a", "(!(-a))"],
        ["a + b + c", "((a + b) + c)"],
        ["a + b - c", "((a + b) - c)"],
        ["a * b * c", "((a * b) * c)"],
        ["a * b / c", "((a * b) / c)"],
        ["a + b / c", "(a + (b / c))"],
        ["a + b * c + d / e - f", "(((a + (b * c)) + (d / e)) - f)"],
        ["3 + 4; -5 * 5", "(3 + 4)((-5) * 5)"],
        ["5 > 4 == 3 < 4", "((5 > 4) == (3 < 4))"],
        ["5 < 4 != 3 > 4", "((5 < 4) != (3 > 4))"],
        [
            "3 + 4 * 5 == 3 * 1 + 4 * 5",
            "((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))",
        ],
        ["true", "true"],
        ["false", "false"],
        ["3 > 5 == false", "((3 > 5) == false)"],
        ["3 < 5 == true", "((3 < 5) == true)"],
        ["1 + (2 + 3) + 4", "((1 + (2 + 3)) + 4)"],
        ["(5 + 5) * 2", "((5 + 5) * 2)"],
        ["2 / (5 + 5)", "(2 / (5 + 5))"],
        ["-(5 + 5)", "(-(5 + 5))"],
        ["!(true == true)", "(!(true == true))"],
    ];

    tests.forEach(([input, expected]) => {
        const lexer = new Lexer(input);
        const parser = new Parser(lexer);

        const program = parser.parseProgram();

        checkParserErrors(parser);

        expect(program.string()).toBe(expected);
    });
});

test("test boolean literal expressions", () => {
    const tests: [string, boolean][] = [
        ["true;", true],
        ["false;", false],
    ];

    tests.forEach(([input, expectedBoolean]) => {
        const lexer = new Lexer(input);
        const parser = new Parser(lexer);

        const program = parser.parseProgram();

        checkParserErrors(parser);
        expect(program.statements.length).toBe(1);

        const expression = program.statements[0];
        const isStatementExpression = expression instanceof ExpressionStatement;

        expect(isStatementExpression).toBe(true);

        if (!isStatementExpression) {
            return;
        }

        const booleanLiteral = expression.expression;
        const isExpressionBooleanLiteral =
            booleanLiteral instanceof BooleanLiteral;

        expect(isExpressionBooleanLiteral).toBe(true);

        if (!isExpressionBooleanLiteral) {
            return;
        }

        expect(booleanLiteral.value).toBe(expectedBoolean);
    });
});

function checkParserErrors(parser: Parser): void {
    const errors = parser.getErrors();

    try {
        expect(errors.length).toBe(0);
    } catch (_) {
        throw new Error(
            `Expected 0 errors during parsing, got ${
                errors.length
            } instead:\n${errors.join("\n")}`,
        );
    }
}

function testIntegerLiteral(
    integerLiteral: Expression | null,
    value: number,
): void {
    const isExpressionIntegerLiteral = integerLiteral instanceof IntegerLiteral;

    expect(isExpressionIntegerLiteral).toBe(true);

    if (!isExpressionIntegerLiteral) {
        return;
    }

    expect(integerLiteral.value).toBe(value);
    expect(integerLiteral.getTokenLiteral()).toBe(value.toString());
}

function testIdentifier(identifier: Expression | null, value: string): void {
    const isExpressionIdentifier = identifier instanceof Identifier;

    expect(isExpressionIdentifier).toBe(true);

    if (!isExpressionIdentifier) {
        return;
    }

    expect(identifier.value).toBe(value);
    expect(identifier.getTokenLiteral()).toBe(value);
}

function testLiteralExpression(
    expression: Expression | null,
    expected: any,
): void {
    switch (typeof expected) {
        case "string":
            testIdentifier(expression, expected);
            break;
        case "number":
            testIntegerLiteral(expression, expected);
            break;
        case "boolean":
            testBooleanLiteral(expression, expected);
            break;
        default:
            throw new Error(
                `type of expression not handled, got ${typeof expected}`,
            );
    }
}

function testInfixExpression(
    expression: Expression | null,
    left: any,
    operator: string,
    right: any,
): void {
    const isExpressionInfixExpression = expression instanceof InfixExpression;

    expect(isExpressionInfixExpression).toBe(true);

    if (!isExpressionInfixExpression) {
        return;
    }

    testLiteralExpression(expression.left, left);
    expect(expression.operator).toBe(operator);
    testLiteralExpression(expression.right, right);
}

function testLetStatement(statement: Statement, name: string): void {
    expect(statement.getTokenLiteral()).toBe("let");

    const isLetStatement = statement instanceof LetStatement;

    expect(isLetStatement).toBe(true);

    if (!isLetStatement) {
        return;
    }

    expect(statement.name.value).toBe(name);
    expect(statement.name.getTokenLiteral()).toBe(name);
}

function testBooleanLiteral(
    expression: Expression | null,
    value: boolean,
): void {
    const isExpressionBooleanLiteral = expression instanceof BooleanLiteral;

    expect(isExpressionBooleanLiteral).toBe(true);

    if (!isExpressionBooleanLiteral) {
        return;
    }

    expect(expression.value).toBe(value);
    expect(expression.getTokenLiteral()).toBe(String(value));
}
