import { Lexer } from "./lexer";
import { Parser } from "./parser";
import {
    BooleanObj,
    ErrorObj,
    FunctionObj,
    IntegerObj,
    NullObj,
    ValueObject,
} from "./object";
import { evalNode } from "./evaluator";
import { Environment } from "./environment";

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
        ["1 < 2", true],
        ["1 > 2", false],
        ["1 < 1", false],
        ["1 > 1", false],
        ["1 == 1", true],
        ["1 != 1", false],
        ["1 == 2", false],
        ["1 != 2", true],
        ["true == true", true],
        ["false == false", true],
        ["true == false", false],
        ["true != false", true],
        ["false != true", true],
        ["(1 < 2) == true", true],
        ["(1 < 2) == false", false],
        ["(1 > 2) == true", false],
        ["(1 > 2) == false", true],
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

test("test if else expressions", () => {
    const tests: [string, number | null][] = [
        ["if (true) { 10 }", 10],
        ["if (false) { 10 }", null],
        ["if (1) { 10 }", 10],
        ["if (1 < 2) { 10 }", 10],
        ["if (1 > 2) { 10 }", null],
        ["if (1 > 2) { 10 } else { 20 }", 20],
        ["if (1 < 2) { 10 } else { 20 }", 10],
    ];

    tests.forEach(([input, expected]) => {
        const evaluated = testEval(input);

        if (typeof expected === "number") {
            testIntegerObject(evaluated, expected);
        } else {
            testNullObject(evaluated);
        }
    });
});

test("test return statements", () => {
    const tests: [string, number][] = [
        ["return 10;", 10],
        ["return 10; 9;", 10],
        ["return 2 * 5; 9;", 10],
        ["9; return 2 * 5; 9;", 10],
        [
            `
if (10 > 1) {
  if (10 > 1) {
    return 10;
  }

  return 1;
}
`,
            10,
        ],
        [
            `
let f = fn(x) {
  return x;
  x + 10;
};

f(10);`,
            10,
        ],
        [
            `
let f = fn(x) {
   let result = x + 10;
   return result;
   return 10;
};

f(10);`,
            20,
        ],
    ];

    tests.forEach(([input, expected]) => {
        const evaluated = testEval(input);

        testIntegerObject(evaluated, expected);
    });
});

test("test error handling", () => {
    const tests: [string, string][] = [
        ["5 + true;", "type mismatch: INTEGER + BOOLEAN"],
        ["5 + true; 5;", "type mismatch: INTEGER + BOOLEAN"],
        ["-true", "unknown operator: -BOOLEAN"],
        ["true + false", "unknown operator: BOOLEAN + BOOLEAN"],
        ["5; true + false; 5", "unknown operator: BOOLEAN + BOOLEAN"],
        [
            "if (10 > 1) { true + false; }",
            "unknown operator: BOOLEAN + BOOLEAN",
        ],
        [
            `
if (10 > 1) {
  if (10 > 1) {
    return true + false;
  }

  return 1;
}
`,
            "unknown operator: BOOLEAN + BOOLEAN",
        ],
        ["foobar", "identifier not found: foobar"],
    ];

    tests.forEach(([input, expectedMessage]) => {
        const evaluated = testEval(input);

        expect(evaluated).toBeInstanceOf(ErrorObj);
        expect((evaluated as ErrorObj)?.message).toBe(expectedMessage);
    });
});

test("test let statements", () => {
    const tests: [string, number][] = [
        ["let a = 5; a;", 5],
        ["let a = 5 * 5; a;", 25],
        ["let a = 5; let b = a; b;", 5],
        ["let a = 5; let b = a; let c = a + b + 5; c;", 15],
    ];

    tests.forEach(([input, expected]) => {
        const evaluated = testEval(input);

        testIntegerObject(evaluated, expected);
    });
});

test("test function object", () => {
    const input = "fn(x) { x + 2; };";

    const evaluated = testEval(input);

    expect(evaluated).toBeInstanceOf(FunctionObj);

    if (evaluated instanceof FunctionObj) {
        expect(evaluated.parameters.length).toBe(1);
        expect(evaluated.parameters[0].string()).toBe("x");
        expect(evaluated.body?.string()).toBe("(x + 2)");
    }
});

test("test function application", () => {
    const tests: [string, number][] = [
        ["let identity = fn(x) { x; }; identity(5);", 5],
        ["let identity = fn(x) { return x; }; identity(5);", 5],
        ["let double = fn(x) { x * 2; }; double(5);", 10],
        ["let add = fn(x, y) { x + y; }; add(5, 5);", 10],
        ["let add = fn(x, y) { x + y; }; add(5 + 5, add(5, 5));", 20],
        ["fn(x) { x; }(5)", 5],
        ["fn() { 10; }()", 10],
    ];

    tests.forEach(([input, expected]) => {
        const evaluated = testEval(input);

        testIntegerObject(evaluated, expected);
    });
});

test("test closures", () => {
    const input = `
let newAdder = fn(x) {
  fn(y) { x + y };
};

let addTwo = newAdder(2);

addTwo(2);
`;

    const evaluated = testEval(input);

    testIntegerObject(evaluated, 4);
});

function testEval(input: string): ValueObject | null {
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);

    const program = parser.parseProgram();
    const environment = new Environment();

    return evalNode(program, environment);
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

function testNullObject(object: ValueObject | null) {
    expect(object).toBeInstanceOf(NullObj);
}
