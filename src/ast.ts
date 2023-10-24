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

    public getTokenLiteral(): string {
        return this.statements.length > 0
            ? this.statements[0].getTokenLiteral()
            : "";
    }
}

export class LetStatement implements Statement {
    public token: Token;
    public name: Identifier;
    public value: Expression;

    public statementNode(): void {}

    public getTokenLiteral(): string {
        return this.token.literal;
    }
}

export class Identifier implements Expression {
    public token: Token;
    public value: string;

    public expressionNode(): void {}

    public getTokenLiteral(): string {
        return this.token.literal;
    }
}
