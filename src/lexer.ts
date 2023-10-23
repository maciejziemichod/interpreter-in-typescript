import { Token, TokenItem, TokenType, lookupIdentifier } from "./token";

function newToken(tokenType: TokenItem, literal: string): Token {
    return { type: tokenType, literal };
}

const _a = "a".charCodeAt(0);
const _z = "z".charCodeAt(0);
const _A = "A".charCodeAt(0);
const _Z = "Z".charCodeAt(0);
const __ = "_".charCodeAt(0);
function isLetter(char: string): boolean {
    const charValue = char.charCodeAt(0);

    return (
        (_a <= charValue && charValue <= _z) ||
        (_A <= charValue && charValue <= _Z) ||
        charValue === __
    );
}

const _0 = "0".charCodeAt(0);
const _9 = "9".charCodeAt(0);
function isDigit(char: string): boolean {
    const charValue = char.charCodeAt(0);

    return _0 <= charValue && charValue <= _9;
}

const _space = " ".charCodeAt(0);
const _tab = "\t".charCodeAt(0);
const _lf = "\n".charCodeAt(0);
const _cr = "\r".charCodeAt(0);
function isWhitespace(char: string): boolean {
    const charValue = char.charCodeAt(0);

    return (
        charValue === _space ||
        charValue === _tab ||
        charValue === _lf ||
        charValue === _cr
    );
}

export class Lexer {
    private input: string;
    private position: number = 0;
    private readPosition: number = 0;
    private char!: string;

    constructor(input: string) {
        this.input = input;

        this.readChar();
    }

    public getNextToken(): Token {
        let token: Token;

        this.skipWhitespace();

        switch (this.char) {
            case "=":
                if (this.peekChar() === "=") {
                    const char = this.char;
                    this.readChar();
                    const literal = char + this.char;
                    token = newToken(TokenType.EQUAL, literal);
                } else {
                    token = newToken(TokenType.ASSIGN, this.char);
                }
                break;
            case "+":
                token = newToken(TokenType.PLUS, this.char);
                break;
            case "-":
                token = newToken(TokenType.MINUS, this.char);
                break;
            case "*":
                token = newToken(TokenType.ASTERISK, this.char);
                break;
            case "/":
                token = newToken(TokenType.SLASH, this.char);
                break;
            case "!":
                if (this.peekChar() === "=") {
                    const char = this.char;
                    this.readChar();
                    const literal = char + this.char;
                    token = newToken(TokenType.NOT_EQUAL, literal);
                } else {
                    token = newToken(TokenType.BANG, this.char);
                }
                break;
            case "<":
                token = newToken(TokenType.LESS_THAN, this.char);
                break;
            case ">":
                token = newToken(TokenType.GREATER_THAN, this.char);
                break;
            case ";":
                token = newToken(TokenType.SEMICOLON, this.char);
                break;
            case "(":
                token = newToken(TokenType.LEFT_PARENTHESIS, this.char);
                break;
            case ")":
                token = newToken(TokenType.RIGHT_PARENTHESIS, this.char);
                break;
            case ",":
                token = newToken(TokenType.COMMA, this.char);
                break;
            case "{":
                token = newToken(TokenType.LEFT_BRACE, this.char);
                break;
            case "}":
                token = newToken(TokenType.RIGHT_BRACE, this.char);
                break;
            case "\0":
                token = newToken(TokenType.EOF, "");
                break;
            default:
                if (isLetter(this.char)) {
                    const literal = this.readIdentifier();
                    const type = lookupIdentifier(literal);

                    return newToken(type, literal);
                } else if (isDigit(this.char)) {
                    const literal = this.readNumber();

                    return newToken(TokenType.INT, literal);
                } else {
                    token = newToken(TokenType.ILLEGAL, this.char);
                }
        }

        this.readChar();

        return token;
    }

    private readIdentifier(): string {
        const position = this.position;

        while (isLetter(this.char)) {
            this.readChar();
        }

        return this.input.slice(position, this.position);
    }

    private readNumber(): string {
        const position = this.position;

        while (isDigit(this.char)) {
            this.readChar();
        }

        return this.input.slice(position, this.position);
    }

    private skipWhitespace(): void {
        while (isWhitespace(this.char)) {
            this.readChar();
        }
    }

    private peekChar(): string {
        if (this.readPosition >= this.input.length) {
            return "\0";
        } else {
            return this.input[this.readPosition];
        }
    }

    private readChar(): void {
        if (this.readPosition >= this.input.length) {
            this.char = "\0";
        } else {
            this.char = this.input[this.readPosition];
        }

        this.position = this.readPosition;
        this.readPosition++;
    }
}
