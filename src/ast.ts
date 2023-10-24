import { Token } from "./token";

interface AstNode {
    getTokenLiteral(): string;
}

export interface Statement extends AstNode {
    statementNode(): void;
}

interface Expression extends AstNode {
    expressionNode(): void;
}

export class Program implements AstNode {
    public statements: Statement[];

    getTokenLiteral(): string {
        return this.statements.length > 0
            ? this.statements[0].getTokenLiteral()
            : "";
    }
}

export class LetStatement implements Statement {
    public token: Token;
    public name: Identifier;
    private value: Expression;

    statementNode(): void {}

    getTokenLiteral(): string {
        return this.token.literal;
    }
}

export class Identifier implements Expression {
    public token: Token;
    public value: string;

    expressionNode(): void {}

    getTokenLiteral(): string {
        return this.token.literal;
    }
}