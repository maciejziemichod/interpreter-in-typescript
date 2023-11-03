import { TokenType, Token, TokenItem } from "./token";
import { Lexer } from "./lexer";

test("test getNextToken()", () => {
    const input = `let five = 5;
let ten = 10;

let add = fn(x, y) {
    x + y;
};

let result = add(five, ten);
!-/*5;
5 < 10 > 5;

if (5 < 10) {
    return true;
} else {
    return false;
}

5 == 5;
5 != 6;
"foobar"
"foo bar"
[1, 2];
null;
{"foo": "bar"};
`;

    const tests: [TokenItem, string][] = [
        [TokenType.LET, "let"],
        [TokenType.IDENTIFIER, "five"],
        [TokenType.ASSIGN, "="],
        [TokenType.INT, "5"],
        [TokenType.SEMICOLON, ";"],
        [TokenType.LET, "let"],
        [TokenType.IDENTIFIER, "ten"],
        [TokenType.ASSIGN, "="],
        [TokenType.INT, "10"],
        [TokenType.SEMICOLON, ";"],
        [TokenType.LET, "let"],
        [TokenType.IDENTIFIER, "add"],
        [TokenType.ASSIGN, "="],
        [TokenType.FUNCTION, "fn"],
        [TokenType.LEFT_PARENTHESIS, "("],
        [TokenType.IDENTIFIER, "x"],
        [TokenType.COMMA, ","],
        [TokenType.IDENTIFIER, "y"],
        [TokenType.RIGHT_PARENTHESIS, ")"],
        [TokenType.LEFT_BRACE, "{"],
        [TokenType.IDENTIFIER, "x"],
        [TokenType.PLUS, "+"],
        [TokenType.IDENTIFIER, "y"],
        [TokenType.SEMICOLON, ";"],
        [TokenType.RIGHT_BRACE, "}"],
        [TokenType.SEMICOLON, ";"],
        [TokenType.LET, "let"],
        [TokenType.IDENTIFIER, "result"],
        [TokenType.ASSIGN, "="],
        [TokenType.IDENTIFIER, "add"],
        [TokenType.LEFT_PARENTHESIS, "("],
        [TokenType.IDENTIFIER, "five"],
        [TokenType.COMMA, ","],
        [TokenType.IDENTIFIER, "ten"],
        [TokenType.RIGHT_PARENTHESIS, ")"],
        [TokenType.SEMICOLON, ";"],
        [TokenType.BANG, "!"],
        [TokenType.MINUS, "-"],
        [TokenType.SLASH, "/"],
        [TokenType.ASTERISK, "*"],
        [TokenType.INT, "5"],
        [TokenType.SEMICOLON, ";"],
        [TokenType.INT, "5"],
        [TokenType.LESS_THAN, "<"],
        [TokenType.INT, "10"],
        [TokenType.GREATER_THAN, ">"],
        [TokenType.INT, "5"],
        [TokenType.SEMICOLON, ";"],
        [TokenType.IF, "if"],
        [TokenType.LEFT_PARENTHESIS, "("],
        [TokenType.INT, "5"],
        [TokenType.LESS_THAN, "<"],
        [TokenType.INT, "10"],
        [TokenType.RIGHT_PARENTHESIS, ")"],
        [TokenType.LEFT_BRACE, "{"],
        [TokenType.RETURN, "return"],
        [TokenType.TRUE, "true"],
        [TokenType.SEMICOLON, ";"],
        [TokenType.RIGHT_BRACE, "}"],
        [TokenType.ELSE, "else"],
        [TokenType.LEFT_BRACE, "{"],
        [TokenType.RETURN, "return"],
        [TokenType.FALSE, "false"],
        [TokenType.SEMICOLON, ";"],
        [TokenType.RIGHT_BRACE, "}"],
        [TokenType.INT, "5"],
        [TokenType.EQUAL, "=="],
        [TokenType.INT, "5"],
        [TokenType.SEMICOLON, ";"],
        [TokenType.INT, "5"],
        [TokenType.NOT_EQUAL, "!="],
        [TokenType.INT, "6"],
        [TokenType.SEMICOLON, ";"],
        [TokenType.STRING, "foobar"],
        [TokenType.STRING, "foo bar"],
        [TokenType.LEFT_BRACKET, "["],
        [TokenType.INT, "1"],
        [TokenType.COMMA, ","],
        [TokenType.INT, "2"],
        [TokenType.RIGHT_BRACKET, "]"],
        [TokenType.SEMICOLON, ";"],
        [TokenType.NULL, "null"],
        [TokenType.SEMICOLON, ";"],
        [TokenType.LEFT_BRACE, "{"],
        [TokenType.STRING, "foo"],
        [TokenType.COLON, ":"],
        [TokenType.STRING, "bar"],
        [TokenType.RIGHT_BRACE, "}"],
        [TokenType.SEMICOLON, ";"],
        [TokenType.EOF, ""],
    ];

    const lexer = new Lexer(input);

    for (const [expectedType, expectedLiteral] of tests) {
        const token: Token = lexer.getNextToken();

        expect(token.type).toBe(expectedType);
        expect(token.literal).toBe(expectedLiteral);
    }
});
