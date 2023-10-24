import { LetStatement } from "./ast";
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
