import { Program } from "./ast";
import { Lexer } from "./lexer";
import { Token } from "./token";

export class Parser {
    private lexer: Lexer;
    private currentToken: Token;
    private peekToken: Token;

    constructor(lexer: Lexer) {
        this.lexer = lexer;

        this.nextToken();
        this.nextToken();
    }

    nextToken(): void {
        this.currentToken = this.peekToken;
        this.peekToken = this.lexer.getNextToken();
    }

    parseProgram(): Program {
        return new Program();
    }
}
