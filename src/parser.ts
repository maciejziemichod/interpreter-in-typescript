import {
    Expression,
    ExpressionStatement,
    Identifier,
    LetStatement,
    Program,
    ReturnStatement,
    Statement,
} from "./ast";
import { Lexer } from "./lexer";
import { Token, TokenItem, TokenType } from "./token";

type prefixParseFunction = () => Expression;
type infixParseFunction = (expression: Expression) => Expression;

const Precendence = {
    LOWEST: 1,
    EQUALS: 2, // ==
    LESS_GREATER: 3, // > or <
    SUM: 4, // +
    PRODUCT: 5, // *
    PREFIX: 6, // -X or !X
    CALL: 7, // myFunction(X)
} as const;
type PrecendenceValue = (typeof Precendence)[keyof typeof Precendence];

export class Parser {
    private lexer: Lexer;
    private currentToken: Token;
    private peekToken: Token;
    private errors: string[] = [];
    private prefixParseFunctions: Partial<{
        [key in TokenItem]: prefixParseFunction;
    }> = {};
    private infixParseFunctions: Partial<{
        [key in TokenItem]: infixParseFunction;
    }> = {};

    constructor(lexer: Lexer) {
        this.lexer = lexer;

        this.parseIdentifier = this.parseIdentifier.bind(this);

        this.registerPrefix(TokenType.IDENTIFIER, this.parseIdentifier);

        this.nextToken();
        this.nextToken();
    }

    public parseProgram(): Program {
        const program = new Program();
        program.statements = [];

        while (this.currentToken.type !== TokenType.EOF) {
            const statement = this.parseStatement();

            if (statement !== null) {
                program.statements.push(statement);
            }

            this.nextToken();
        }

        return program;
    }

    public getErrors(): string[] {
        return this.errors;
    }

    private peekError(type: TokenItem): void {
        this.errors.push(
            `expected next token to be ${type}, got ${this.peekToken.type} instead`,
        );
    }

    private nextToken(): void {
        this.currentToken = this.peekToken;
        this.peekToken = this.lexer.getNextToken();
    }

    private parseStatement(): Statement | null {
        switch (this.currentToken.type) {
            case TokenType.LET:
                return this.parseLetStatement();
            case TokenType.RETURN:
                return this.parseReturnStatement();
            default:
                return this.parseExpressionStatement();
        }
    }

    private parseLetStatement(): LetStatement | null {
        const statement = new LetStatement();
        statement.token = this.currentToken;

        if (!this.expectPeek(TokenType.IDENTIFIER)) {
            return null;
        }

        const name = new Identifier();
        name.value = this.currentToken.literal;
        name.token = this.currentToken;
        statement.name = name;

        if (!this.expectPeek(TokenType.ASSIGN)) {
            return null;
        }

        // TODO expression
        while (!this.currentTokenIs(TokenType.SEMICOLON)) {
            this.nextToken();
        }

        return statement;
    }

    private parseReturnStatement(): ReturnStatement | null {
        const statement = new ReturnStatement();
        statement.token = this.currentToken;

        this.nextToken();

        // TODO expression
        while (!this.currentTokenIs(TokenType.SEMICOLON)) {
            this.nextToken();
        }

        return statement;
    }

    private parseExpressionStatement(): ExpressionStatement | null {
        const statement = new ExpressionStatement();
        statement.token = this.currentToken;

        const expression = this.parseExpression(Precendence.LOWEST);

        // TODO or maybe make expression field allow null
        if (expression === null) {
            return null;
        }

        statement.expression = expression;

        if (this.peekTokenIs(TokenType.SEMICOLON)) {
            this.nextToken();
        }

        return statement;
    }

    private parseExpression(precendence: PrecendenceValue): Expression | null {
        const prefix = this.prefixParseFunctions[this.currentToken.type];

        if (prefix === undefined) {
            return null;
        }

        const leftExpression = prefix();

        return leftExpression;
    }

    private currentTokenIs(type: TokenItem): boolean {
        return this.currentToken.type === type;
    }

    private peekTokenIs(type: TokenItem): boolean {
        return this.peekToken.type === type;
    }

    private expectPeek(type: TokenItem): boolean {
        if (this.peekTokenIs(type)) {
            this.nextToken();
            return true;
        } else {
            this.peekError(type);
            return false;
        }
    }

    private registerPrefix(
        tokenType: TokenItem,
        fn: prefixParseFunction,
    ): void {
        this.prefixParseFunctions[tokenType] = fn;
    }

    private registerInfix(tokenType: TokenItem, fn: infixParseFunction): void {
        this.infixParseFunctions[tokenType] = fn;
    }

    private parseIdentifier(): Expression {
        const identifier = new Identifier();
        identifier.token = this.currentToken;
        identifier.value = this.currentToken.literal;

        return identifier;
    }
}
