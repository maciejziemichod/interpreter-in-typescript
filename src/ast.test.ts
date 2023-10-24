import { Identifier, LetStatement, Program } from "./ast";
import { newToken } from "./lexer";
import { TokenType } from "./token";

test("test AstNode.string()", () => {
    const program = new Program();
    const letStatement = new LetStatement();
    const statementIdentifier = new Identifier();
    const expressionIdentifier = new Identifier();

    statementIdentifier.token = newToken(TokenType.IDENTIFIER, "myVar");
    statementIdentifier.value = "myVar";

    expressionIdentifier.token = newToken(TokenType.IDENTIFIER, "anotherVar");
    expressionIdentifier.value = "anotherVar";

    letStatement.token = newToken(TokenType.LET, "let");
    letStatement.name = statementIdentifier;
    letStatement.value = expressionIdentifier;

    program.statements = [letStatement];

    expect(program.string()).toBe("let myVar = anotherVar;");
});
