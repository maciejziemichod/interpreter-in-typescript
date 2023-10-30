import { Lexer } from "./lexer";
import { Parser } from "./parser";
import { BooleanObj, IntegerObj, ValueObject } from "./object";
import { evalNode } from "./evaluator";

test("test eval integer expressions", () => {
    const tests: [string, number][] = [
        ["5", 5],
        ["10", 10],
        ["-5", -5],
        ["-10", -10],
        ["5 + 5 + 5 + 5 - 10", 10],
        ["2 * 2 * 2 * 2 * 2", 32],
        ["-50 + 100 + -50", 0],
        ["5 * 2 + 10", 20],
        ["5 + 2 * 10", 25],
        ["20 + 2 * -10", 0],
        ["50 / 2 * 2 + 10", 60],
        ["2 * (5 + 10)", 30],
        ["3 * 3 * 3 + 10", 37],
        ["3 * (3 * 3) + 10", 37],
        ["(5 + 10 * 2 + 15 / 3) * 2 + -10", 50],
    ];

    tests.forEach(([input, expected]) => {
        const evaluated = testEval(input);

        testIntegerObject(evaluated, expected);
    });
});

test("test eval boolean expressions", () => {
    const tests: [string, boolean][] = [
        ["true", true],
        ["false", false],
    ];

    tests.forEach(([input, expected]) => {
        const evaluated = testEval(input);

        testBooleanObject(evaluated, expected);
    });
});

test("test bang operator", () => {
    const tests: [string, boolean][] = [
        ["!true", false],
        ["!false", true],
        ["!5", false],
        ["!0", true],
        ["!!true", true],
        ["!!false", false],
        ["!!5", true],
        ["!!0", false],
    ];

    tests.forEach(([input, expected]) => {
        const evaluated = testEval(input);

        testBooleanObject(evaluated, expected);
    });
});

function testEval(input: string): ValueObject | null {
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);

    const program = parser.parseProgram();

    return evalNode(program);
}

function testIntegerObject(object: ValueObject | null, expected: number): void {
    const isObjectInteger = object instanceof IntegerObj;

    expect(isObjectInteger).toBe(true);

    if (!isObjectInteger) {
        return;
    }

    expect(object.value).toBe(expected);
}

function testBooleanObject(
    object: ValueObject | null,
    expected: boolean,
): void {
    const isObjectBoolean = object instanceof BooleanObj;

    expect(isObjectBoolean).toBe(true);

    if (!isObjectBoolean) {
        return;
    }

    expect(object.value).toBe(expected);
}
