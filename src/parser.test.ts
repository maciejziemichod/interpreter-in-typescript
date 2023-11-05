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
    IfExpression,
    FunctionLiteral,
    CallExpression,
    StringLiteral,
    ArrayLiteral,
    IndexExpression,
    NullLiteral,
    MapLiteral,
} from "./ast";
import { Lexer } from "./lexer";
import { Parser } from "./parser";

describe("IntegerLiteral", () => {
    it("should parse integer literal expressions", () => {
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
        const isExpressionIntegerLiteral =
            integerLiteral instanceof IntegerLiteral;

        expect(isExpressionIntegerLiteral).toBe(true);

        if (!isExpressionIntegerLiteral) {
            return;
        }

        expect(integerLiteral.value).toBe(5);
        expect(integerLiteral.getTokenLiteral()).toBe("5");
    });
});

describe("StringLiteral", () => {
    it("should parse string literal expressions", () => {
        const input = `"hello world";`;

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

        const stringLiteral = expression.expression;
        const isExpressionStringLiteral =
            stringLiteral instanceof StringLiteral;

        expect(isExpressionStringLiteral).toBe(true);

        if (!isExpressionStringLiteral) {
            return;
        }

        expect(stringLiteral.value).toBe("hello world");
        expect(stringLiteral.getTokenLiteral()).toBe("hello world");
    });
});

describe("BooleanLiteral", () => {
    it("should parse boolean literal expressions", () => {
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
            const isStatementExpression =
                expression instanceof ExpressionStatement;

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
});

describe("NullLiteral", () => {
    it("should parse null literal expressions", () => {
        const input = "null;";

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

        const nullLiteral = expression.expression;
        const isExpressionNullLiteral = nullLiteral instanceof NullLiteral;

        expect(isExpressionNullLiteral).toBe(true);

        if (!isExpressionNullLiteral) {
            return;
        }

        expect(nullLiteral.value).toBeNull();
    });
});

describe("ArrayLiteral", () => {
    it("should parse array literal expressions", () => {
        const input = "[1, 2 * 3, 4 + 5]";

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

        const arrayLiteral = expression.expression;
        const isExpressionArrayLiteral = arrayLiteral instanceof ArrayLiteral;

        expect(isExpressionArrayLiteral).toBe(true);

        if (!isExpressionArrayLiteral) {
            return;
        }

        expect(arrayLiteral.elements.length).toBe(3);
        testIntegerLiteral(arrayLiteral.elements[0], 1);
        testInfixExpression(arrayLiteral.elements[1], 2, "*", 3);
        testInfixExpression(arrayLiteral.elements[2], 4, "+", 5);
    });
});

describe("MapLiteral", () => {
    it("should parse map literal expressions", () => {
        const input = `{"one": 1, "two": 2, "three": 3}`;

        const lexer = new Lexer(input);
        const parser = new Parser(lexer);

        const program = parser.parseProgram();

        checkParserErrors(parser);

        expect(program.statements.length).toBe(1);

        const statement = program.statements[0];

        expect(statement).toBeInstanceOf(ExpressionStatement);

        const map = (statement as ExpressionStatement).expression as MapLiteral;

        expect(map).toBeInstanceOf(MapLiteral);
        expect(map.pairs.size).toBe(3);

        const expected = {
            one: 1,
            two: 2,
            three: 3,
        };

        map.pairs.forEach((value, key) => {
            expect(key).toBeInstanceOf(StringLiteral);

            const expectedValue =
                expected[
                    (key as StringLiteral).string() as keyof typeof expected
                ];

            expect(expectedValue).toBeTruthy();
            testIntegerLiteral(value, expectedValue);
        });
    });

    it("should parse map literal boolean keys", () => {
        const input = `{true: 1, false: 2}`;

        const lexer = new Lexer(input);
        const parser = new Parser(lexer);

        const program = parser.parseProgram();

        checkParserErrors(parser);

        expect(program.statements.length).toBe(1);

        const statement = program.statements[0];

        expect(statement).toBeInstanceOf(ExpressionStatement);

        const map = (statement as ExpressionStatement).expression as MapLiteral;

        expect(map).toBeInstanceOf(MapLiteral);
        expect(map.pairs.size).toBe(2);

        map.pairs.forEach((value, key) => {
            expect(key).toBeInstanceOf(BooleanLiteral);
            testIntegerLiteral(value, (key as BooleanLiteral).value ? 1 : 2);
        });
    });

    it("should parse map literal integer keys", () => {
        const input = `{1: 1, 2: 2, 3: 3}`;

        const lexer = new Lexer(input);
        const parser = new Parser(lexer);

        const program = parser.parseProgram();

        checkParserErrors(parser);

        expect(program.statements.length).toBe(1);

        const statement = program.statements[0];

        expect(statement).toBeInstanceOf(ExpressionStatement);

        const map = (statement as ExpressionStatement).expression as MapLiteral;

        expect(map).toBeInstanceOf(MapLiteral);
        expect(map.pairs.size).toBe(3);

        map.pairs.forEach((value, key) => {
            expect(key).toBeInstanceOf(IntegerLiteral);
            // in this test key is equal to value
            testIntegerLiteral(value, (key as IntegerLiteral).value);
        });
    });

    it("should parse empty map literal expressions", () => {
        const input = `{}`;

        const lexer = new Lexer(input);
        const parser = new Parser(lexer);

        const program = parser.parseProgram();

        checkParserErrors(parser);

        expect(program.statements.length).toBe(1);

        const statement = program.statements[0];

        expect(statement).toBeInstanceOf(ExpressionStatement);

        const map = (statement as ExpressionStatement).expression as MapLiteral;

        expect(map).toBeInstanceOf(MapLiteral);
        expect(map.pairs.size).toBe(0);
    });

    it("should parse map literal with expressions", () => {
        const input = `{"one": 0 + 1, "two": 10 - 8, "three": 15 / 5}`;

        const lexer = new Lexer(input);
        const parser = new Parser(lexer);

        const program = parser.parseProgram();

        checkParserErrors(parser);

        expect(program.statements.length).toBe(1);

        const statement = program.statements[0];

        expect(statement).toBeInstanceOf(ExpressionStatement);

        const map = (statement as ExpressionStatement).expression as MapLiteral;

        expect(map).toBeInstanceOf(MapLiteral);
        expect(map.pairs.size).toBe(3);

        const tests = {
            one: (e: Expression) => testInfixExpression(e, 0, "+", 1),
            two: (e: Expression) => testInfixExpression(e, 10, "-", 8),
            three: (e: Expression) => testInfixExpression(e, 15, "/", 5),
        };

        map.pairs.forEach((value, key) => {
            expect(key).toBeInstanceOf(StringLiteral);

            const testFunction =
                tests[(key as StringLiteral).string() as keyof typeof tests];

            expect(testFunction).toBeDefined();
            testFunction(value);
        });
    });
});

describe("FunctionLiteral", () => {
    it("should parse function literal expressions", () => {
        const input = "fn(x, y) { x + y; }";

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

        const functionLiteral = expression.expression;
        const isExpressionFunctionLiteral =
            functionLiteral instanceof FunctionLiteral;

        expect(isExpressionFunctionLiteral).toBe(true);

        if (!isExpressionFunctionLiteral) {
            return;
        }

        const parameters = functionLiteral.parameters;

        expect(parameters).not.toBeNull();

        if (parameters === null) {
            return;
        }

        expect(parameters.length).toBe(2);
        testLiteralExpression(parameters[0], "x");
        testLiteralExpression(parameters[1], "y");
        expect(functionLiteral.body?.statements.length).toBe(1);

        const bodyStatement = functionLiteral.body?.statements[0];
        const isBodyStatementExpressionStatement =
            bodyStatement instanceof ExpressionStatement;

        expect(isBodyStatementExpressionStatement).toBe(true);

        if (isBodyStatementExpressionStatement) {
            testInfixExpression(bodyStatement.expression, "x", "+", "y");
        }
    });

    it("should parse function parameters", () => {
        const tests: [string, string[]][] = [
            ["fn() {};", []],
            ["fn(x) {};", ["x"]],
            ["fn(x, y, z) {};", ["x", "y", "z"]],
        ];

        tests.forEach(([input, expectedParameters]) => {
            const lexer = new Lexer(input);
            const parser = new Parser(lexer);

            const program = parser.parseProgram();

            checkParserErrors(parser);

            const expression = program.statements[0] as ExpressionStatement;
            const functionLiteral = expression.expression as FunctionLiteral;
            const parameters = functionLiteral.parameters as Identifier[];

            expect(parameters.length).toBe(expectedParameters.length);

            expectedParameters.forEach((identifier, index) => {
                testLiteralExpression(parameters[index], identifier);
            });
        });
    });
});

describe("LetStatement", () => {
    it("should parse let statements", () => {
        const tests: [string, string, any][] = [
            ["let x = 5;", "x", 5],
            ["let y = true;", "y", true],
            ["let foobar = y;", "foobar", "y"],
            ["let z = null;", "z", null],
        ];

        tests.forEach(([input, expectedIdentifier, expectedValue]) => {
            const lexer = new Lexer(input);
            const parser = new Parser(lexer);

            const program = parser.parseProgram();

            checkParserErrors(parser);

            expect(program.statements.length).toBe(1);

            const statement = program.statements[0];

            testLetStatement(statement, expectedIdentifier);
            testLiteralExpression(
                (statement as LetStatement).value,
                expectedValue,
            );
        });
    });
});

describe("ReturnStatement", () => {
    it("should parse return statement", () => {
        const tests: [string, any][] = [
            ["return 5;", 5],
            ["return true;", true],
            ["return foobar;", "foobar"],
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

            testLiteralExpression(returnStatement.returnValue, expectedValue);
        });
    });
});

describe("Identifier", () => {
    it("should parse identifier expression", () => {
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
});

describe("PrefixExpression", () => {
    it("should parse prefix expressions", () => {
        const tests: [string, string, number | boolean | null][] = [
            ["!5", "!", 5],
            ["-15", "-", 15],
            ["!true;", "!", true],
            ["!false;", "!", false],
            ["!null;", "!", null],
        ];

        tests.forEach(([input, operator, integerValue]) => {
            const lexer = new Lexer(input);
            const parser = new Parser(lexer);

            const program = parser.parseProgram();

            checkParserErrors(parser);

            expect(program.statements.length).toBe(1);

            const expression = program.statements[0];
            const isStatementExpression =
                expression instanceof ExpressionStatement;

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
});

describe("InfixExpression", () => {
    it("should parse infix expressions", () => {
        const tests: [
            string,
            number | boolean | null,
            string,
            number | boolean | null,
        ][] = [
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
            ["null == null", null, "==", null],
        ];

        tests.forEach(([input, leftValue, operator, rightValue]) => {
            const lexer = new Lexer(input);
            const parser = new Parser(lexer);

            const program = parser.parseProgram();

            checkParserErrors(parser);

            expect(program.statements.length).toBe(1);

            const expression = program.statements[0];
            const isStatementExpression =
                expression instanceof ExpressionStatement;

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
});

describe("IfExpression", () => {
    it("should parse if expressions", () => {
        const input = "if (x < y) { x }";

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

        const ifExpression = expression.expression;
        const isExpressionIfExpression = ifExpression instanceof IfExpression;

        expect(isExpressionIfExpression).toBe(true);

        if (!isExpressionIfExpression) {
            return;
        }

        testInfixExpression(ifExpression.condition, "x", "<", "y");
        expect(ifExpression.consequence?.statements.length).toBe(1);

        const consequence = ifExpression.consequence?.statements[0];
        const isConsequenceExpression =
            consequence instanceof ExpressionStatement;

        expect(isConsequenceExpression).toBe(true);

        if (!isConsequenceExpression) {
            return;
        }

        testIdentifier(consequence.expression, "x");
        expect(ifExpression.alternative).toBeNull();
    });

    it("should parse if else expressions", () => {
        const input = "if (x < y) { x } else { y }";

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

        const ifExpression = expression.expression;
        const isExpressionIfExpression = ifExpression instanceof IfExpression;

        expect(isExpressionIfExpression).toBe(true);

        if (!isExpressionIfExpression) {
            return;
        }

        testInfixExpression(ifExpression.condition, "x", "<", "y");
        expect(ifExpression.consequence?.statements.length).toBe(1);

        const consequence = ifExpression.consequence?.statements[0];
        const isConsequenceExpression =
            consequence instanceof ExpressionStatement;

        expect(isConsequenceExpression).toBe(true);

        if (!isConsequenceExpression) {
            return;
        }

        testIdentifier(consequence.expression, "x");
        expect(ifExpression.alternative?.statements.length).toBe(1);

        if (ifExpression.alternative === null) {
            return;
        }

        const alternative = ifExpression.alternative.statements[0];
        const isAlternativeExpression =
            alternative instanceof ExpressionStatement;

        expect(isAlternativeExpression).toBe(true);

        if (!isAlternativeExpression) {
            return;
        }

        testIdentifier(alternative.expression, "y");
    });
});

describe("IndexExpression", () => {
    it("should parse index expressions", () => {
        const input = "myArray[1 + 1]";

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

        const indexExpression = expression.expression;
        const isExpressionIndexExpression =
            indexExpression instanceof IndexExpression;

        expect(isExpressionIndexExpression).toBe(true);

        if (!isExpressionIndexExpression) {
            return;
        }

        testIdentifier(indexExpression.left, "myArray");
        testInfixExpression(indexExpression.index, 1, "+", 1);
    });
});

describe("CallExpression", () => {
    it("should parse call expressions", () => {
        const input = "add(1, 2 * 3, 4 + 5);";

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

        const callExpression = expression.expression;
        const isExpressionCallExpression =
            callExpression instanceof CallExpression;

        expect(isExpressionCallExpression).toBe(true);

        if (!isExpressionCallExpression) {
            return;
        }

        testIdentifier(callExpression.expression, "add");

        const callArguments = callExpression.arguments;

        expect(callArguments).not.toBeNull();

        if (callArguments === null) {
            return;
        }

        expect(callArguments.length).toBe(3);
        testLiteralExpression(callArguments[0], 1);
        testInfixExpression(callArguments[1], 2, "*", 3);
        testInfixExpression(callArguments[2], 4, "+", 5);
    });

    it("should parse call expression parameters", () => {
        const tests: [string, string, string[]][] = [
            ["add();", "add", []],
            ["add(1);", "add", ["1"]],
            ["add(1, 2 * 3, 4 + 5);", "add", ["1", "(2 * 3)", "(4 + 5)"]],
        ];

        tests.forEach(([input, expectedIdentifier, expectedArguments]) => {
            const lexer = new Lexer(input);
            const parser = new Parser(lexer);

            const program = parser.parseProgram();

            checkParserErrors(parser);

            const expression = program.statements[0] as ExpressionStatement;
            const callExpression = expression.expression;
            const isExpressionCallExpression =
                callExpression instanceof CallExpression;

            expect(isExpressionCallExpression).toBe(true);

            if (!isExpressionCallExpression) {
                return;
            }

            testIdentifier(callExpression.expression, expectedIdentifier);
            expect(callExpression.arguments?.length).toBe(
                expectedArguments.length,
            );

            expectedArguments.forEach((expectedArgument, index) => {
                expect(callExpression.arguments?.[index].string()).toBe(
                    expectedArgument,
                );
            });
        });
    });
});

describe("operator precedence", () => {
    it("should parse expressions with valid precedence", () => {
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
            ["a + add(b * c) + d", "((a + add((b * c))) + d)"],
            [
                "add(a, b, 1, 2 * 3, 4 + 5, add(6, 7 * 8))",
                "add(a, b, 1, (2 * 3), (4 + 5), add(6, (7 * 8)))",
            ],
            [
                "add(a + b + c * d / f + g)",
                "add((((a + b) + ((c * d) / f)) + g))",
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
            if (expected === null) {
                expect(expression).toBeInstanceOf(NullLiteral);
            } else {
                throw new Error(
                    `type of expression not handled, got ${typeof expected}`,
                );
            }
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

    expect(statement.name?.value).toBe(name);
    expect(statement.name?.getTokenLiteral()).toBe(name);
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
