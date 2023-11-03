import { Lexer } from "./lexer";
import { Parser } from "./parser";
import {
    ArrayObj,
    BooleanObj,
    ErrorObj,
    FunctionObj,
    IntegerObj,
    MapObj,
    NullObj,
    StringObj,
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

test("test eval string literal", () => {
    const input = `"Hello World!"`;

    const evaluated = testEval(input);

    testStringObject(evaluated, "Hello World!");
});

test("test eval string expressions", () => {
    const tests = [
        [`"Hello" + " " + "World!"`, "Hello World!"],
        [`"" + ""`, ""],
        [`" " + ""`, " "],
        [`" " + " "`, "  "],
        [`"How do you do? " * 2`, "How do you do? How do you do? "],
        [`"" * 7`, ""],
        [`" " * 3`, "   "],
    ];

    tests.forEach(([input, expected]) => {
        const evaluated = testEval(input);

        testStringObject(evaluated, expected);
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
        [`"hello" == "world"`, false],
        [`"hello" != "world"`, true],
        [`"hello" == "hello"`, true],
        [`"hello" != "hello"`, false],
        [`"" == ""`, true],
        ["true == true", true],
        ["false == false", true],
        ["true == false", false],
        ["true != false", true],
        ["false != true", true],
        ["null == null", true],
        ["null != null", false],
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
        [`!"hello"`, false],
        [`!""`, true],
        ["!null", true],
        ["!!true", true],
        ["!!false", false],
        ["!!5", true],
        ["!!0", false],
        [`!!"hello"`, true],
        [`!!""`, false],
        ["!!null", false],
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
        [`5 + "hello";`, "unknown operator: INTEGER + STRING"],
        ["-true", "unknown operator: -BOOLEAN"],
        [`-"hello"`, "unknown operator: -STRING"],
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
        [`"Hello" - "World"`, "unknown operator: STRING - STRING"],
        [`"Hello" / "World"`, "unknown operator: STRING / STRING"],
        ["999[1]", "index operator not supported: INTEGER"],
        [`{"name": "Monkey"}[fn(x) { x }];`, "unusable as map key: FUNCTION"],
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

test("test builtin functions", () => {
    const tests: [string, any][] = [
        [`len("")`, 0],
        [`len("four")`, 4],
        [`len("hello world")`, 11],
        [`len(1)`, "argument to `len` not supported, got INTEGER"],
        [`len("one", "two")`, "wrong number of arguments. got=2, want=1"],
        [`len([])`, 0],
        [`len([1, 2])`, 2],
        [`first([1, 2, 3])`, 1],
        [`first([])`, null],
        [`first(1)`, "argument to `first` must be ARRAY, got INTEGER"],
        [`last([1, 2, 3])`, 3],
        [`last([])`, null],
        [`last(1)`, "argument to `last` must be ARRAY, got INTEGER"],
        [`rest([1, 2, 3])`, [2, 3]],
        [`rest([1])`, []],
        [`rest([])`, null],
        [`rest(1)`, "argument to `rest` must be ARRAY, got INTEGER"],
        [`push([], 1)`, [1]],
        [`push(1, 1)`, "first argument to `push` must be ARRAY, got INTEGER"],
    ];

    tests.forEach(([input, expected]) => {
        const evaluated = testEval(input);

        switch (typeof expected) {
            case "number":
                testIntegerObject(evaluated, expected);
                break;
            case "string":
                expect(evaluated).toBeInstanceOf(ErrorObj);
                expect((evaluated as ErrorObj).message).toBe(expected);
                break;

            default:
                if (Array.isArray(expected)) {
                    expect(evaluated).toBeInstanceOf(ArrayObj);

                    const array = evaluated as ArrayObj;

                    expect(array).toBeInstanceOf(ArrayObj);
                    expect(array.elements).toHaveLength(expected.length);

                    expected.forEach((element, index) => {
                        testIntegerObject(array.elements[index], element);
                    });
                } else {
                    testNullObject(evaluated);
                }
                break;
        }
    });
});

test("test array literal", () => {
    const input = "[1, 2 * 2, 3 + 3]";

    const evaluated = testEval(input);

    expect(evaluated).toBeInstanceOf(ArrayObj);

    const result = evaluated as ArrayObj;

    expect(result.elements).toHaveLength(3);
    testIntegerObject(result.elements[0], 1);
    testIntegerObject(result.elements[1], 4);
    testIntegerObject(result.elements[2], 6);
});

test("test array index expressions", () => {
    const tests: [string, number | null][] = [
        ["[1, 2, 3][0]", 1],
        ["[1, 2, 3][1]", 2],
        ["[1, 2, 3][2]", 3],
        ["let i = 0; [1][i]", 1],
        ["[1, 2, 3][1 + 1]", 3],
        ["let myArray = [1, 2, 3]; myArray[2];", 3],
        ["let myArray = [1, 2, 3]; myArray[0] + myArray[1] + myArray[2];", 6],
        ["let myArray = [1, 2, 3]; let i = myArray[0]; myArray[i]", 2],
        ["[1, 2, 3][3]", null],
        ["[1, 2, 3][-1]", null],
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

test("test null literal", () => {
    const input = "null";

    const evaluated = testEval(input);

    testNullObject(evaluated);
});

test("test map literals", () => {
    const input = `let two = "two";
{
    "one": 10 - 9,
    two: 1 + 1,
    "thr" + "ee": 6 / 2,
    4: 4,
    true: 5,
    false: 6
}`;

    const evaluated = testEval(input);
    expect(evaluated).toBeInstanceOf(MapObj);

    const map = evaluated as MapObj;
    const expected = new Map<string | number | boolean, number>([
        ["one", 1],
        ["two", 2],
        ["three", 3],
        [4, 4],
        [true, 5],
        [false, 6],
    ]);

    expect(map.pairs.size).toBe(expected.size);

    expected.forEach((value, key) => {
        expect(map.pairs.has(key)).toBe(true);
        testIntegerObject(map.pairs.get(key) as ValueObject, value);
    });
});

test("test map index expressions", () => {
    const tests: [string, number | null][] = [
        [`{"foo": 5}["foo"]`, 5],
        [`{"foo": 5}["bar"]`, null],
        [`let key = "foo"; {"foo": 5}[key]`, 5],
        [`{}["foo"]`, null],
        [`{5: 5}[5]`, 5],
        [`{true: 5}[true]`, 5],
        [`{false: 5}[false]`, 5],
    ];

    tests.forEach(([input, expected]) => {
        const evaluated = testEval(input);

        if (expected === null) {
            testNullObject(evaluated);
        } else {
            testIntegerObject(evaluated, expected);
        }
    });
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

function testStringObject(object: ValueObject | null, expected: string): void {
    const isObjectString = object instanceof StringObj;

    expect(isObjectString).toBe(true);

    if (!isObjectString) {
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
