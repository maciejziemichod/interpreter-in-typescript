import exp from "constants";
import {
    ExpressionStatement,
    LetStatement,
    ReturnStatement,
    Identifier,
    IntegerLiteral,
    Expression,
    PrefixExpression,
    InfixExpression,
} from "./ast";
import { Lexer } from "./lexer";
import { Parser } from "./parser";

test("test LetStatement", () => {
    const input = `
let x = 5;
let y = 10;
let foobar = 838383;
`;

    const lexer = new Lexer(input);
    const parser = new Parser(lexer);

    const program = parser.parseProgram();

    checkParserErrors(parser);

    expect(program).toBeDefined();
    expect(program.statements.length).toBe(3);

    const tests = ["x", "y", "foobar"];

    tests.forEach((expectedIdentifier, index) => {
        const statement = program.statements[index];

        expect(statement.getTokenLiteral()).toBe("let");

        const isLetStatement = statement instanceof LetStatement;

        expect(isLetStatement).toBe(true);

        if (!isLetStatement) {
            return;
        }

        expect(statement.name.value).toBe(expectedIdentifier);
        expect(statement.name.getTokenLiteral()).toBe(expectedIdentifier);
    });
});

test("test ReturnStatement", () => {
    const input = `
return 5;
return 10;
return 993322;
`;
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);

    const program = parser.parseProgram();

    checkParserErrors(parser);

    expect(program).toBeDefined();
    expect(program.statements.length).toBe(3);

    program.statements.forEach((statement) => {
        expect(statement.getTokenLiteral()).toBe("return");

        const isReturnStatement = statement instanceof ReturnStatement;

        expect(isReturnStatement).toBe(true);
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
    const tests: [string, string, number][] = [
        ["!5", "!", 5],
        ["-15", "-", 15],
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

        testIntegerLiteral(prefixExpression.right, integerValue);
    });
});

test("test parsing infix expressions", () => {
    const tests: [string, number, string, number][] = [
        ["5 + 5;", 5, "+", 5],
        ["5 - 5;", 5, "-", 5],
        ["5 * 5;", 5, "*", 5],
        ["5 / 5;", 5, "/", 5],
        ["5 > 5;", 5, ">", 5],
        ["5 < 5;", 5, "<", 5],
        ["5 == 5;", 5, "==", 5],
        ["5 != 5;", 5, "!=", 5],
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

        const infixExpression = expression.expression;
        const isExpressionInfixExpression =
            infixExpression instanceof InfixExpression;

        expect(isExpressionInfixExpression).toBe(true);

        if (!isExpressionInfixExpression) {
            return;
        }

        testIntegerLiteral(infixExpression.left, leftValue);
        testIntegerLiteral(infixExpression.right, rightValue);
        expect(infixExpression.operator).toBe(operator);
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
    ];

    tests.forEach(([input, expected]) => {
        const lexer = new Lexer(input);
        const parser = new Parser(lexer);

        const program = parser.parseProgram();

        checkParserErrors(parser);

        expect(program.string()).toBe(expected);
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
