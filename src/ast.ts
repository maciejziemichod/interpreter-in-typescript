import { Token } from "./token";

interface AstNode {
    getTokenLiteral(): string;
    string(): string;
}

export interface Statement extends AstNode {
    statementNode(): void;
}

export interface Expression extends AstNode {
    expressionNode(): void;
}

export class Program implements AstNode {
    public statements: Statement[];

    public getTokenLiteral(): string {
        return this.statements.length > 0
            ? this.statements[0].getTokenLiteral()
            : "";
    }

    public string(): string {
        return this.statements
            .map((statement) => statement.string())
            .join("\n");
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

    public string(): string {
        const value = this.value ? this.value.string() : "";

        return `${this.getTokenLiteral()} ${this.name.string()} = ${value};`;
    }
}

export class ReturnStatement implements Statement {
    public token: Token;
    public returnValue: Expression;

    public statementNode(): void {}

    public getTokenLiteral(): string {
        return this.token.literal;
    }

    public string(): string {
        const value = this.returnValue ? this.returnValue.string() : "";

        return `${this.getTokenLiteral()} = ${value};`;
    }
}

export class ExpressionStatement implements Statement {
    public token: Token;
    public expression: Expression;

    public statementNode(): void {}

    public getTokenLiteral(): string {
        return this.token.literal;
    }

    public string(): string {
        return this.expression ? this.expression.string() : "";
    }
}

export class Identifier implements Expression {
    public token: Token;
    public value: string;

    public expressionNode(): void {}

    public getTokenLiteral(): string {
        return this.token.literal;
    }

    public string(): string {
        return this.value;
    }
}
