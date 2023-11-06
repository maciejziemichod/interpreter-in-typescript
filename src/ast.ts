import { Token } from "./token";

export interface AstNode {
    getTokenLiteral(): string;
    string(): string;
}

export interface Statement extends AstNode {}

export interface Expression extends AstNode {}

export class Program implements AstNode {
    public statements: Statement[] = [];

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
    public name: Identifier | null = null;
    public value: Expression | null = null;

    constructor(token: Token) {
        this.token = token;
    }

    public getTokenLiteral(): string {
        return this.token.literal;
    }

    public string(): string {
        const value = this.value ? this.value.string() : "";

        return `${this.getTokenLiteral()} ${this.name?.string()} = ${value};`;
    }
}

export class ReturnStatement implements Statement {
    public token: Token;
    public returnValue: Expression | null = null;

    constructor(token: Token) {
        this.token = token;
    }

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
    public expression: Expression | null = null;

    constructor(token: Token) {
        this.token = token;
    }

    public getTokenLiteral(): string {
        return this.token.literal;
    }

    public string(): string {
        return this.expression ? this.expression.string() : "";
    }
}

export class BlockStatement implements Statement {
    public token: Token;
    public statements: Statement[] = [];

    constructor(token: Token) {
        this.token = token;
    }

    public getTokenLiteral(): string {
        return this.token.literal;
    }

    public string(): string {
        return this.statements.map((statement) => statement.string()).join("");
    }
}

export class IntegerLiteral implements Expression {
    public token: Token;
    public value: number = 0;

    constructor(token: Token) {
        this.token = token;
    }

    public getTokenLiteral(): string {
        return this.token.literal;
    }

    public string(): string {
        return this.token.literal;
    }
}

export class StringLiteral implements Expression {
    public token: Token;
    public value: string;

    constructor(token: Token, value: string) {
        this.token = token;
        this.value = value;
    }

    public getTokenLiteral(): string {
        return this.token.literal;
    }

    public string(): string {
        return this.token.literal;
    }
}

export class BooleanLiteral implements Expression {
    public token: Token;
    public value: boolean;

    constructor(token: Token, value: boolean) {
        this.token = token;
        this.value = value;
    }

    public getTokenLiteral(): string {
        return this.token.literal;
    }

    public string(): string {
        return this.token.literal;
    }
}

export class NullLiteral implements Expression {
    public token: Token;
    public value = null;

    constructor(token: Token) {
        this.token = token;
    }

    public getTokenLiteral(): string {
        return this.token.literal;
    }

    public string(): string {
        return this.token.literal;
    }
}

export class FunctionLiteral implements Expression {
    public token: Token;
    public parameters: Identifier[] | null = null;
    public body: BlockStatement | null = null;

    constructor(token: Token) {
        this.token = token;
    }

    public getTokenLiteral(): string {
        return this.token.literal;
    }

    public string(): string {
        return `${this.token.literal}(${this.parameters
            ?.map((parameter) => parameter.string())
            .join(", ")}) ${this.body?.string()}`;
    }
}

export class ArrayLiteral implements Expression {
    public token: Token;
    public elements: Expression[] = [];

    constructor(token: Token) {
        this.token = token;
    }

    public getTokenLiteral(): string {
        return this.token.literal;
    }

    public string(): string {
        return `[${this.elements
            .map((element) => element.string())
            .join(", ")}]`;
    }
}

export class MapLiteral implements Expression {
    public token: Token;
    public pairs = new Map<Expression, Expression>();

    constructor(token: Token) {
        this.token = token;
    }

    public getTokenLiteral(): string {
        return this.token.literal;
    }

    public string(): string {
        const pairs = [];

        for (const [key, value] of this.pairs) {
            pairs.push(`${key.string()}: ${value.string()}`);
        }

        return `{${pairs.join(", ")}}`;
    }
}

export class Identifier implements Expression {
    public token: Token;
    public value: string;

    constructor(token: Token, value: string) {
        this.token = token;
        this.value = value;
    }

    public getTokenLiteral(): string {
        return this.token.literal;
    }

    public string(): string {
        return this.value;
    }
}

export class PrefixExpression implements Expression {
    public token: Token;
    public operator: string;
    public right: Expression | null = null;

    constructor(token: Token, operator: string) {
        this.token = token;
        this.operator = operator;
    }

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
    public right: Expression | null = null;

    constructor(token: Token, operator: string, left: Expression | null) {
        this.token = token;
        this.operator = operator;
        this.left = left;
    }

    public getTokenLiteral(): string {
        return this.token.literal;
    }

    public string(): string {
        return `(${this.left?.string()} ${
            this.operator
        } ${this.right?.string()})`;
    }
}

export class IfExpression implements Expression {
    public token: Token;
    public condition: Expression | null = null;
    public consequence: BlockStatement | null = null;
    public alternative: BlockStatement | null = null;

    constructor(token: Token) {
        this.token = token;
    }

    public getTokenLiteral(): string {
        return this.token.literal;
    }

    public string(): string {
        let string = `if ${this.condition?.string()} ${this.consequence?.string()}`;

        if (this.alternative !== null) {
            string += ` else ${this.alternative.string()}`;
        }

        return string;
    }
}

export class CallExpression implements Expression {
    public token: Token; // '(' token
    public expression: Expression | null; // identifier or function literal
    public arguments: Expression[] | null;

    constructor(
        token: Token,
        expression: Expression | null,
        callArguments: Expression[] | null,
    ) {
        this.token = token;
        this.expression = expression;
        this.arguments = callArguments;
    }

    public getTokenLiteral(): string {
        return this.token.literal;
    }

    public string(): string {
        return `${this.expression?.string()}(${this.arguments
            ?.map((argument) => argument.string())
            .join(", ")})`;
    }
}

export class IndexExpression implements Expression {
    public token: Token; // '[' token
    public left: Expression;
    public index: Expression;

    constructor(token: Token, left: Expression, index: Expression) {
        this.token = token;
        this.left = left;
        this.index = index;
    }

    public getTokenLiteral(): string {
        return this.token.literal;
    }

    public string(): string {
        return `(${this.left.string()}}[${this.index.string()}])`;
    }
}
