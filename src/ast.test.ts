import { Identifier, LetStatement, Program } from "./ast";
import { newToken } from "./lexer";
import { TokenType } from "./token";

test("test AstNode.string()", () => {
    const program = new Program();
    const letStatement = new LetStatement(newToken(TokenType.LET, "let"));
    const statementIdentifier = new Identifier(
        newToken(TokenType.IDENTIFIER, "myVar"),
        "myVar",
    );
    const expressionIdentifier = new Identifier(
        newToken(TokenType.IDENTIFIER, "anotherVar"),
        "anotherVar",
    );

    letStatement.name = statementIdentifier;
    letStatement.value = expressionIdentifier;

    program.statements = [letStatement];

    expect(program.string()).toBe("let myVar = anotherVar;");
});
