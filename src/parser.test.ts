import { LetStatement, ReturnStatement } from "./ast";
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
