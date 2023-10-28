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
        return this.statements.map((statement) => statement.string()).join("");
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

export class IntegerLiteral implements Expression {
    public token: Token;
    public value: number;

    public expressionNode(): void {}

    public getTokenLiteral(): string {
        return this.token.literal;
    }

    public string(): string {
        return this.token.literal;
    }
}

export class PrefixExpression implements Expression {
    public token: Token;
    public operator: string;
    public right: Expression | null;

    public expressionNode(): void {}

    public getTokenLiteral(): string {
        return this.token.literal;
    }

    public string(): string {
        return `(${this.operator}${this.right?.string()})`;
    }
}

export class InfixExpression implements Expression {
    public token: Token;
    public left: Expression | null;
    public operator: string;
    public right: Expression | null;

    public expressionNode(): void {}

    public getTokenLiteral(): string {
        return this.token.literal;
    }

    public string(): string {
        return `(${this.left?.string()} ${
            this.operator
        } ${this.right?.string()})`;
    }
}

export class BooleanLiteral implements Expression {
    public token: Token;
    public value: boolean;

    public expressionNode(): void {}

    public getTokenLiteral(): string {
        return this.token.literal;
    }

    public string(): string {
        return this.token.literal;
    }
}

export class IfExpression implements Expression {
    public token: Token;
    public condition: Expression;
    public consequence: BlockStatement;
    public alternative: BlockStatement | null;

    public expressionNode(): void {}

    public getTokenLiteral(): string {
        return this.token.literal;
    }

    public string(): string {
        let string = `if ${this.condition.string()} ${this.consequence.string()}`;

        if (this.alternative !== null) {
            string += ` else ${this.alternative.string()}`;
        }

        return string;
    }
}

export class BlockStatement implements Statement {
    public token: Token;
    public statements: Statement[];

    public statementNode(): void {}

    public getTokenLiteral(): string {
        return this.token.literal;
    }

    public string(): string {
        return this.statements.map((statement) => statement.string()).join("");
    }
}

export class FunctionLiteral implements Expression {
    public token: Token;
    public parameters: Identifier[] | null;
    public body: BlockStatement;

    public expressionNode(): void {}

    public getTokenLiteral(): string {
        return this.token.literal;
    }

    public string(): string {
        return `${this.token.literal}(${this.parameters
            ?.map((parameter) => parameter.string())
            .join(", ")}) ${this.body.string()}`;
    }
}
