import {
    Identifier,
    LetStatement,
    Program,
    ReturnStatement,
    Statement,
} from "./ast";
import { Lexer } from "./lexer";
import { Token, TokenItem, TokenType } from "./token";

export class Parser {
    private lexer: Lexer;
    private currentToken: Token;
    private peekToken: Token;
    private errors: string[] = [];

    constructor(lexer: Lexer) {
        this.lexer = lexer;

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
                return null;
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
}
