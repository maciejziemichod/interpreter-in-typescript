import {
    ArrayLiteral,
    BlockStatement,
    BooleanLiteral,
    CallExpression,
    Expression,
    ExpressionStatement,
    FunctionLiteral,
    Identifier,
    IfExpression,
    IndexExpression,
    InfixExpression,
    IntegerLiteral,
    LetStatement,
    NullLiteral,
    PrefixExpression,
    Program,
    ReturnStatement,
    Statement,
    StringLiteral,
} from "./ast";
import { Lexer } from "./lexer";
import { Token, TokenItem, TokenType } from "./token";

type prefixParseFunction = () => Expression | null;
type infixParseFunction = (expression: Expression | null) => Expression | null;

const Precendence = {
    LOWEST: 1,
    EQUALS: 2, // ==
    LESS_GREATER: 3, // > or <
    SUM: 4, // +
    PRODUCT: 5, // *
    PREFIX: 6, // -X or !X
    CALL: 7, // myFunction(X)
    INDEX: 8,
} as const;
type PrecendenceValue = (typeof Precendence)[keyof typeof Precendence];

const precedences = {
    [TokenType.EQUAL]: Precendence.EQUALS,
    [TokenType.NOT_EQUAL]: Precendence.EQUALS,
    [TokenType.LESS_THAN]: Precendence.LESS_GREATER,
    [TokenType.GREATER_THAN]: Precendence.LESS_GREATER,
    [TokenType.PLUS]: Precendence.SUM,
    [TokenType.MINUS]: Precendence.SUM,
    [TokenType.SLASH]: Precendence.PRODUCT,
    [TokenType.ASTERISK]: Precendence.PRODUCT,
    [TokenType.LEFT_PARENTHESIS]: Precendence.CALL,
    [TokenType.LEFT_BRACKET]: Precendence.INDEX,
} as const;

export class Parser {
    private lexer: Lexer;
    private currentToken!: Token;
    private peekToken!: Token;
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
        this.parseIntegerLiteral = this.parseIntegerLiteral.bind(this);
        this.parseStringLiteral = this.parseStringLiteral.bind(this);
        this.parsePrefixExpression = this.parsePrefixExpression.bind(this);
        this.parseInfixExpression = this.parseInfixExpression.bind(this);
        this.parseBooleanLiteral = this.parseBooleanLiteral.bind(this);
        this.parseArrayLiteral = this.parseArrayLiteral.bind(this);
        this.parseGroupedExpression = this.parseGroupedExpression.bind(this);
        this.parseIfExpression = this.parseIfExpression.bind(this);
        this.parseFunctionLiteral = this.parseFunctionLiteral.bind(this);
        this.parseCallExpression = this.parseCallExpression.bind(this);
        this.parseIndexExpression = this.parseIndexExpression.bind(this);
        this.parseNullLiteral = this.parseNullLiteral.bind(this);

        this.registerPrefix(TokenType.IDENTIFIER, this.parseIdentifier);
        this.registerPrefix(TokenType.INT, this.parseIntegerLiteral);
        this.registerPrefix(TokenType.STRING, this.parseStringLiteral);
        this.registerPrefix(TokenType.LEFT_BRACKET, this.parseArrayLiteral);
        this.registerPrefix(TokenType.BANG, this.parsePrefixExpression);
        this.registerPrefix(TokenType.MINUS, this.parsePrefixExpression);
        this.registerPrefix(TokenType.TRUE, this.parseBooleanLiteral);
        this.registerPrefix(TokenType.FALSE, this.parseBooleanLiteral);
        this.registerPrefix(
            TokenType.LEFT_PARENTHESIS,
            this.parseGroupedExpression,
        );
        this.registerPrefix(TokenType.IF, this.parseIfExpression);
        this.registerPrefix(TokenType.FUNCTION, this.parseFunctionLiteral);
        this.registerPrefix(TokenType.NULL, this.parseNullLiteral);

        this.registerInfix(TokenType.PLUS, this.parseInfixExpression);
        this.registerInfix(TokenType.MINUS, this.parseInfixExpression);
        this.registerInfix(TokenType.ASTERISK, this.parseInfixExpression);
        this.registerInfix(TokenType.SLASH, this.parseInfixExpression);
        this.registerInfix(TokenType.EQUAL, this.parseInfixExpression);
        this.registerInfix(TokenType.NOT_EQUAL, this.parseInfixExpression);
        this.registerInfix(TokenType.LESS_THAN, this.parseInfixExpression);
        this.registerInfix(TokenType.GREATER_THAN, this.parseInfixExpression);
        this.registerInfix(
            TokenType.LEFT_PARENTHESIS,
            this.parseCallExpression,
        );
        this.registerInfix(TokenType.LEFT_BRACKET, this.parseIndexExpression);

        this.nextToken();
        this.nextToken();
    }

    public parseProgram(): Program {
        const program = new Program();

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
        const statement = new LetStatement(this.currentToken);

        if (!this.expectPeek(TokenType.IDENTIFIER)) {
            return null;
        }

        const name = new Identifier(
            this.currentToken,
            this.currentToken.literal,
        );
        statement.name = name;

        if (!this.expectPeek(TokenType.ASSIGN)) {
            return null;
        }

        this.nextToken();

        statement.value = this.parseExpression(Precendence.LOWEST);

        if (this.peekTokenIs(TokenType.SEMICOLON)) {
            this.nextToken();
        }

        return statement;
    }

    private parseReturnStatement(): ReturnStatement | null {
        const statement = new ReturnStatement(this.currentToken);

        this.nextToken();

        statement.returnValue = this.parseExpression(Precendence.LOWEST);

        if (this.peekTokenIs(TokenType.SEMICOLON)) {
            this.nextToken();
        }

        return statement;
    }

    private parseExpressionStatement(): ExpressionStatement | null {
        const statement = new ExpressionStatement(this.currentToken);
        statement.expression = this.parseExpression(Precendence.LOWEST);

        if (this.peekTokenIs(TokenType.SEMICOLON)) {
            this.nextToken();
        }

        return statement;
    }

    private noPrefixParseFunctions(type: TokenItem): void {
        this.errors.push(`no prefix parse function for ${type} found`);
    }

    private parseExpression(precendence: PrecendenceValue): Expression | null {
        const prefix = this.prefixParseFunctions[this.currentToken.type];

        if (prefix === undefined) {
            this.noPrefixParseFunctions(this.currentToken.type);
            return null;
        }

        let leftExpression = prefix();

        while (
            !this.peekTokenIs(TokenType.SEMICOLON) &&
            precendence < this.getPeekPrecedence()
        ) {
            const infix = this.infixParseFunctions[this.peekToken.type];

            if (infix === undefined) {
                return leftExpression;
            }

            this.nextToken();

            leftExpression = infix(leftExpression);
        }

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
        const identifier = new Identifier(
            this.currentToken,
            this.currentToken.literal,
        );

        return identifier;
    }

    private parseIntegerLiteral(): Expression | null {
        const integerLiteral = new IntegerLiteral(this.currentToken);

        const value = parseInt(this.currentToken.literal, 10);

        if (Number.isNaN(value)) {
            this.errors.push(
                `could not parse ${this.currentToken.literal} as integer`,
            );
            return null;
        }

        integerLiteral.value = value;

        return integerLiteral;
    }

    private parseStringLiteral(): Expression {
        return new StringLiteral(this.currentToken, this.currentToken.literal);
    }

    private parseArrayLiteral(): Expression | null {
        const arrayLiteral = new ArrayLiteral(this.currentToken);
        const elements = this.parseExpressionList(TokenType.RIGHT_BRACKET);

        arrayLiteral.elements = elements ?? [];

        return arrayLiteral;
    }

    private parseNullLiteral(): Expression {
        return new NullLiteral(this.currentToken);
    }

    private parsePrefixExpression(): Expression | null {
        const expression = new PrefixExpression(
            this.currentToken,
            this.currentToken.literal,
        );

        this.nextToken();

        expression.right = this.parseExpression(Precendence.PREFIX);

        return expression;
    }

    private parseInfixExpression(left: Expression | null): Expression | null {
        const expression = new InfixExpression(
            this.currentToken,
            this.currentToken.literal,
            left,
        );
        const precedence = this.getCurrentPrecedence();

        this.nextToken();

        expression.right = this.parseExpression(precedence);

        return expression;
    }

    private parseBooleanLiteral(): Expression {
        const booleanLiteral = new BooleanLiteral(
            this.currentToken,
            this.currentTokenIs(TokenType.TRUE),
        );

        return booleanLiteral;
    }

    private parseGroupedExpression(): Expression | null {
        this.nextToken();

        const expression = this.parseExpression(Precendence.LOWEST);

        if (!this.expectPeek(TokenType.RIGHT_PARENTHESIS)) {
            return null;
        }

        return expression;
    }

    private parseIfExpression(): Expression | null {
        const expression = new IfExpression(this.currentToken);

        if (!this.expectPeek(TokenType.LEFT_PARENTHESIS)) {
            return null;
        }

        this.nextToken();

        const condition = this.parseExpression(Precendence.LOWEST);

        if (condition === null) {
            return null;
        }

        expression.condition = condition;

        if (!this.expectPeek(TokenType.RIGHT_PARENTHESIS)) {
            return null;
        }

        if (!this.expectPeek(TokenType.LEFT_BRACE)) {
            return null;
        }

        expression.consequence = this.parseBlockStatement();

        if (this.peekTokenIs(TokenType.ELSE)) {
            this.nextToken();

            if (!this.expectPeek(TokenType.LEFT_BRACE)) {
                return null;
            }

            expression.alternative = this.parseBlockStatement();
        }

        return expression;
    }

    private parseFunctionLiteral(): Expression | null {
        const functionLiteral = new FunctionLiteral(this.currentToken);

        if (!this.expectPeek(TokenType.LEFT_PARENTHESIS)) {
            return null;
        }

        functionLiteral.parameters = this.parseFunctionParameters();

        if (!this.expectPeek(TokenType.LEFT_BRACE)) {
            return null;
        }

        functionLiteral.body = this.parseBlockStatement();

        return functionLiteral;
    }

    private parseCallExpression(
        expression: Expression | null,
    ): Expression | null {
        const callExpression = new CallExpression(
            this.currentToken,
            expression,
            this.parseExpressionList(TokenType.RIGHT_PARENTHESIS),
        );

        return callExpression;
    }

    private parseFunctionParameters(): Identifier[] | null {
        const identifiers: Identifier[] = [];

        if (this.peekTokenIs(TokenType.RIGHT_PARENTHESIS)) {
            this.nextToken();
            return identifiers;
        }

        this.nextToken();

        const identifier = new Identifier(
            this.currentToken,
            this.currentToken.literal,
        );

        identifiers.push(identifier);

        while (this.peekTokenIs(TokenType.COMMA)) {
            this.nextToken();
            this.nextToken();

            const identifier = new Identifier(
                this.currentToken,
                this.currentToken.literal,
            );

            identifiers.push(identifier);
        }

        if (!this.expectPeek(TokenType.RIGHT_PARENTHESIS)) {
            return null;
        }

        return identifiers;
    }

    private parseBlockStatement(): BlockStatement {
        const blockStatement = new BlockStatement(this.currentToken);

        this.nextToken();

        while (
            !this.currentTokenIs(TokenType.RIGHT_BRACE) &&
            !this.currentTokenIs(TokenType.EOF)
        ) {
            const statement = this.parseStatement();

            if (statement !== null) {
                blockStatement.statements.push(statement);
            }

            this.nextToken();
        }

        return blockStatement;
    }

    private parseExpressionList(endToken: TokenItem): Expression[] | null {
        const list: Expression[] = [];

        if (this.peekTokenIs(endToken)) {
            this.nextToken();
            return list;
        }

        this.nextToken();

        const expression = this.parseExpression(Precendence.LOWEST);
        if (expression !== null) {
            list.push(expression);
        }

        while (this.peekTokenIs(TokenType.COMMA)) {
            this.nextToken();
            this.nextToken();

            const expression = this.parseExpression(Precendence.LOWEST);
            if (expression !== null) {
                list.push(expression);
            }
        }

        if (!this.expectPeek(endToken)) {
            return null;
        }

        return list;
    }

    private parseIndexExpression(left: Expression | null): Expression | null {
        const token = this.currentToken;

        this.nextToken();

        const right = this.parseExpression(Precendence.LOWEST);

        if (
            !this.expectPeek(TokenType.RIGHT_BRACKET) ||
            left === null ||
            right === null
        ) {
            return null;
        }

        return new IndexExpression(token, left, right);
    }

    private getPeekPrecedence(): PrecendenceValue {
        if (this.peekToken.type in precedences) {
            return precedences[this.peekToken.type as keyof typeof precedences];
        }

        return Precendence.LOWEST;
    }

    private getCurrentPrecedence(): PrecendenceValue {
        if (this.currentToken.type in precedences) {
            return precedences[
                this.currentToken.type as keyof typeof precedences
            ];
        }

        return Precendence.LOWEST;
    }
}
